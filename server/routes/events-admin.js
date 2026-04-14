import express from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import Event from '../models/Event.js';
import Registration from '../models/Registration.js';
import Student from '../models/Student.js';
import { logAudit } from '../lib/audit.js';

const router = express.Router();

// Middleware to authenticate user
const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Create event (Convenor only)
router.post('/', authenticate, [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('time').trim().notEmpty().withMessage('Time is required'),
  body('venue').trim().notEmpty().withMessage('Venue is required'),
  body('category').isIn(['workshop', 'cultural', 'sports', 'academic', 'club', 'seminar']).withMessage('Valid category is required'),
  body('convenorEmail').isEmail().normalizeEmail(),
  body('totalSeats').optional().isInt({ min: 0 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      description,
      date,
      time,
      venue,
      category,
      organizer,
      organizerDepartment,
      convenorEmail,
      coordinatorEmail,
      totalSeats,
      isOpen,
      isClubOnly,
      clubId,
    } = req.body;

    // Get current user
    const user = await Student.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create event
    const event = new Event({
      title,
      description,
      date,
      time,
      venue,
      category,
      organizer: organizer || user.name,
      organizerDepartment: organizerDepartment || user.department,
      convenorEmail: convenorEmail || user.email,
      coordinatorEmail,
      totalSeats: totalSeats ? parseInt(totalSeats) : undefined,
      registeredCount: 0,
      attendedCount: 0,
      status: 'upcoming',
      isOpen: isOpen !== false,
      isClubOnly: isClubOnly || false,
      clubId,
      createdBy: req.userId,
    });

    await event.save();
    await logAudit({
      actorUserId: req.userId,
      actorEmail: user.email,
      action: 'EVENT_CREATE',
      detail: `Created event: ${event.title}`,
      meta: { eventId: event._id.toString(), category: event.category },
    });

    res.status(201).json({
      message: 'Event created successfully',
      event: {
        id: event._id.toString(),
        ...event.toObject(),
      },
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get events by convenor
router.get('/convenor/my-events', authenticate, async (req, res) => {
  try {
    const user = await Student.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const events = await Event.find({ convenorEmail: user.email })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email')
      .select('-__v');

    res.json({ events });
  } catch (error) {
    console.error('Get convenor events error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get events assigned to coordinator (by coordinatorEmail)
router.get('/coordinator/my-events', authenticate, async (req, res) => {
  try {
    const user = await Student.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const events = await Event.find({ coordinatorEmail: user.email })
      .sort({ date: 1, time: 1 })
      .populate('createdBy', 'name email')
      .select('-__v');

    res.json({ events });
  } catch (error) {
    console.error('Get coordinator events error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update event status (convenor/coordinator/admin)
router.patch('/:eventId/status', authenticate, async (req, res) => {
  try {
    const { eventId } = req.params;
    const { status, isOpen } = req.body;

    if (!['upcoming', 'ongoing', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    event.status = status;
    if (typeof isOpen === 'boolean') event.isOpen = isOpen;
    await event.save();
    const actor = await Student.findById(req.userId).select('email');
    await logAudit({
      actorUserId: req.userId,
      actorEmail: actor?.email,
      action: 'EVENT_STATUS_UPDATE',
      detail: `Updated event status to ${status} for ${event.title}`,
      meta: { eventId: event._id.toString(), status, isOpen: event.isOpen },
    });

    res.json({
      message: 'Event status updated',
      event: {
        id: event._id.toString(),
        ...event.toObject(),
      },
    });
  } catch (error) {
    console.error('Update event status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get event registrations (for coordinators/convenors)
router.get('/:eventId/registrations', authenticate, async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const registrations = await Registration.find({ eventId })
      .populate('userId', 'name email rollNumber')
      .sort({ registeredAt: -1 })
      .select('-__v');

    res.json({ registrations });
  } catch (error) {
    console.error('Get registrations error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark attendance manually (Coordinator)
router.post('/:eventId/attendance', authenticate, [
  body('rollNumber').trim().notEmpty().withMessage('Roll number is required'),
  body('status').isIn(['present', 'absent']).withMessage('Status must be present or absent'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { eventId } = req.params;
    const { rollNumber, status } = req.body;

    // Find student by roll number
    const student = await Student.findOne({ rollNumber });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Find registration
    const registration = await Registration.findOne({
      eventId,
      userId: student._id,
    });

    if (!registration) {
      return res.status(400).json({ message: 'Student is not registered for this event' });
    }

    // Update attendance
    registration.attendanceStatus = status;
    registration.markedAt = new Date();
    registration.markedBy = req.userId;
    await registration.save();

    // Update event attended count
    if (status === 'present') {
      event.attendedCount = (event.attendedCount || 0) + 1;
      await event.save();
    }

    res.json({
      message: `Attendance marked as ${status}`,
      registration: {
        id: registration._id.toString(),
        student: {
          name: student.name,
          rollNumber: student.rollNumber,
          email: student.email,
        },
        attendanceStatus: registration.attendanceStatus,
        markedAt: registration.markedAt,
      },
    });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Search student by roll number for attendance
router.get('/:eventId/search-student/:rollNumber', authenticate, async (req, res) => {
  try {
    const { eventId, rollNumber } = req.params;

    // Find student
    const student = await Student.findOne({ rollNumber });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check registration
    const registration = await Registration.findOne({
      eventId,
      userId: student._id,
    });

    if (!registration) {
      return res.status(400).json({ 
        message: 'Student is not registered for this event',
        found: false,
      });
    }

    res.json({
      found: true,
      student: {
        id: student._id.toString(),
        name: student.name,
        rollNumber: student.rollNumber,
        email: student.email,
        department: student.department,
      },
      registration: {
        id: registration._id.toString(),
        attendanceStatus: registration.attendanceStatus,
        registeredAt: registration.registeredAt,
      },
    });
  } catch (error) {
    console.error('Search student error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark attendance via QR code/roll number (for scanning)
router.post('/:eventId/scan-attendance', authenticate, [
  body('rollNumber').trim().notEmpty().withMessage('Roll number is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { eventId } = req.params;
    const { rollNumber } = req.body;

    // Find student by roll number
    const student = await Student.findOne({ rollNumber });
    if (!student) {
      return res.status(404).json({ message: 'Student not found', found: false });
    }

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Find registration
    const registration = await Registration.findOne({
      eventId,
      userId: student._id,
    });

    if (!registration) {
      return res.status(400).json({ 
        message: 'Student is not registered for this event',
        found: false,
      });
    }

    // Check if already marked
    if (registration.attendanceStatus === 'present') {
      return res.status(400).json({ 
        message: 'Attendance already marked',
        alreadyMarked: true,
        registration: {
          id: registration._id.toString(),
          attendanceStatus: registration.attendanceStatus,
          markedAt: registration.markedAt,
        },
      });
    }

    // Mark as present
    registration.attendanceStatus = 'present';
    registration.markedAt = new Date();
    registration.markedBy = req.userId;
    await registration.save();

    // Update event attended count
    event.attendedCount = (event.attendedCount || 0) + 1;
    await event.save();

    res.json({
      message: 'Attendance marked successfully',
      found: true,
      student: {
        name: student.name,
        rollNumber: student.rollNumber,
        email: student.email,
      },
      registration: {
        id: registration._id.toString(),
        attendanceStatus: registration.attendanceStatus,
        markedAt: registration.markedAt,
      },
    });
  } catch (error) {
    console.error('Scan attendance error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get QR code data for event
router.get('/:eventId/qr-code', authenticate, async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Generate QR code data (just the event ID for now)
    // In production, you might want to use a library like qrcode
    const qrData = {
      eventId: event._id.toString(),
      eventTitle: event.title,
      date: event.date,
      time: event.time,
    };

    res.json({
      qrData: JSON.stringify(qrData),
      event: {
        id: event._id.toString(),
        title: event.title,
        date: event.date,
        time: event.time,
        venue: event.venue,
      },
    });
  } catch (error) {
    console.error('Get QR code error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
