import express from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
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

export default router;
