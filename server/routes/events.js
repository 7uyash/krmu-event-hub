import express from 'express';
import { body, query, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import Event from '../models/Event.js';
import Registration from '../models/Registration.js';
import Student from '../models/Student.js';

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

// Get all events (public - for students)
router.get('/', authenticate, async (req, res) => {
  try {
    const { category, status, search } = req.query;

    const filter = {};
    
    // Filter by category
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    // Filter by status
    if (status) {
      filter.status = status;
    } else {
      // Default: show upcoming and ongoing events
      filter.status = { $in: ['upcoming', 'ongoing'] };
    }
    
    // Only show open events for students
    filter.isOpen = true;

    // Search filter
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { organizer: { $regex: search, $options: 'i' } },
      ];
    }

    const events = await Event.find(filter)
      .sort({ date: 1, time: 1 })
      .populate('createdBy', 'name email')
      .select('-__v');

    res.json({ events });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single event by ID
router.get('/:eventId', authenticate, async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const event = await Event.findById(eventId)
      .populate('createdBy', 'name email')
      .select('-__v');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is registered
    const registration = await Registration.findOne({
      eventId,
      userId: req.userId,
    });

    res.json({
      event,
      isRegistered: !!registration,
      registrationId: registration?._id,
    });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Register for an event
router.post('/:eventId/register', authenticate, async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.userId;

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if event is open for registration
    if (!event.isOpen) {
      return res.status(400).json({ message: 'Event is not open for registration' });
    }

    // Check if event is full
    if (event.totalSeats && event.registeredCount >= event.totalSeats) {
      return res.status(400).json({ message: 'Event is full' });
    }

    // Check if already registered
    const existingRegistration = await Registration.findOne({
      eventId,
      userId,
    });

    if (existingRegistration) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }

    // Create registration
    const registration = new Registration({
      eventId,
      userId,
      attendanceStatus: 'pending',
    });

    await registration.save();

    // Update event registered count
    event.registeredCount += 1;
    await event.save();

    res.status(201).json({
      message: 'Successfully registered for the event',
      registration: {
        id: registration._id.toString(),
        eventId: registration.eventId.toString(),
        userId: registration.userId.toString(),
        registeredAt: registration.registeredAt,
        attendanceStatus: registration.attendanceStatus,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Cancel registration
router.delete('/:eventId/register', authenticate, async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.userId;

    // Find registration
    const registration = await Registration.findOne({
      eventId,
      userId,
    });

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    // Delete registration
    await Registration.deleteOne({ _id: registration._id });

    // Update event registered count
    const event = await Event.findById(eventId);
    if (event) {
      event.registeredCount = Math.max(0, event.registeredCount - 1);
      await event.save();
    }

    res.json({ message: 'Registration cancelled successfully' });
  } catch (error) {
    console.error('Cancel registration error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's registrations
router.get('/user/registrations', authenticate, async (req, res) => {
  try {
    const userId = req.userId;

    const registrations = await Registration.find({ userId })
      .populate('eventId')
      .sort({ registeredAt: -1 })
      .select('-__v');

    res.json({ registrations });
  } catch (error) {
    console.error('Get registrations error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's attendance history
router.get('/user/attendance', authenticate, async (req, res) => {
  try {
    const userId = req.userId;

    const registrations = await Registration.find({
      userId,
      attendanceStatus: { $in: ['present', 'absent'] },
    })
      .populate('eventId')
      .sort({ markedAt: -1 })
      .select('-__v');

    res.json({ registrations });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
