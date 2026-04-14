import express from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import Student from '../models/Student.js';
import Registration from '../models/Registration.js';

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
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Update user profile
router.put('/', authenticate, [
  body('name').optional().trim().notEmpty(),
  body('department').optional().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, department } = req.body;
    const userId = req.userId;

    // Find student
    const student = await Student.findById(userId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Update fields
    if (name !== undefined) {
      student.name = name;
    }
    if (department !== undefined) {
      student.department = department;
    }

    await student.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: student._id.toString(),
        name: student.name,
        email: student.email,
        rollNumber: student.rollNumber,
        department: student.department,
        role: 'student',
      },
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get current profile + preferences
router.get('/', authenticate, async (req, res) => {
  try {
    const student = await Student.findById(req.userId).select('-password -__v');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json({ user: student });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user preferences
router.put('/preferences', authenticate, async (req, res) => {
  try {
    const student = await Student.findById(req.userId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    student.preferences = {
      ...student.preferences?.toObject?.(),
      ...req.body,
    };
    await student.save();

    res.json({
      message: 'Preferences updated successfully',
      preferences: student.preferences,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get notification feed from registrations/attendance updates
router.get('/notifications', authenticate, async (req, res) => {
  try {
    const regs = await Registration.find({ userId: req.userId })
      .populate('eventId', 'title')
      .sort({ registeredAt: -1, markedAt: -1 })
      .limit(50)
      .select('-__v');

    const notifications = regs.map((r) => {
      const eventTitle = r.eventId?.title || 'an event';
      const hasAttendance = r.attendanceStatus === 'present' || r.attendanceStatus === 'absent';
      return {
        id: r._id.toString(),
        title: hasAttendance ? 'Attendance updated' : 'Registration confirmed',
        message: hasAttendance
          ? `Your attendance for ${eventTitle} is marked as ${r.attendanceStatus}.`
          : `You are registered for ${eventTitle}.`,
        createdAt: r.markedAt || r.registeredAt,
        read: false,
      };
    });

    res.json({ notifications });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
