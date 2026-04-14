import express from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import SupportTicket from '../models/SupportTicket.js';

const router = express.Router();

const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

router.post(
  '/tickets',
  authenticate,
  [
    body('category').isIn(['attendance', 'registration', 'account', 'other']),
    body('subject').trim().notEmpty(),
    body('message').trim().notEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const ticket = await SupportTicket.create({
        userId: req.userId,
        category: req.body.category,
        subject: req.body.subject,
        message: req.body.message,
      });

      res.status(201).json({ message: 'Ticket created', ticket });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

router.get('/tickets/me', authenticate, async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ userId: req.userId }).sort({ createdAt: -1 }).select('-__v');
    res.json({ tickets });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

