import express from 'express';
import jwt from 'jsonwebtoken';
import Event from '../models/Event.js';
import Student from '../models/Student.js';
import SystemSetting from '../models/SystemSetting.js';

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
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
};

// Admin: list all events (basic filters)
router.get('/events', authenticate, requireAdmin, async (req, res) => {
  try {
    const { q, status, category } = req.query;

    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (category && category !== 'all') filter.category = category;
    if (q) {
      const s = String(q).trim();
      if (s) {
        filter.$or = [
          { title: { $regex: s, $options: 'i' } },
          { organizer: { $regex: s, $options: 'i' } },
          { venue: { $regex: s, $options: 'i' } },
        ];
      }
    }

    const events = await Event.find(filter)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email role department')
      .select('-__v');

    res.json({ events });
  } catch (error) {
    console.error('Admin list events error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin: list users
router.get('/users', authenticate, requireAdmin, async (req, res) => {
  try {
    const { q } = req.query;
    const filter = {};
    if (q) {
      const s = String(q).trim();
      if (s) {
        filter.$or = [
          { name: { $regex: s, $options: 'i' } },
          { email: { $regex: s, $options: 'i' } },
          { department: { $regex: s, $options: 'i' } },
          { role: { $regex: s, $options: 'i' } },
        ];
      }
    }

    const users = await Student.find(filter).sort({ createdAt: -1 }).select('-__v');
    res.json({ users });
  } catch (error) {
    console.error('Admin list users error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin: departments overview (derived from Event.organizerDepartment)
router.get('/departments', authenticate, requireAdmin, async (req, res) => {
  try {
    const deptAgg = await Event.aggregate([
      {
        $group: {
          _id: { $ifNull: ['$organizerDepartment', 'Unknown'] },
          events: { $sum: 1 },
          registrations: { $sum: { $ifNull: ['$registeredCount', 0] } },
          attendance: { $sum: { $ifNull: ['$attendedCount', 0] } },
        },
      },
      { $sort: { events: -1 } },
    ]);

    const departments = deptAgg.map((d) => {
      const registrations = d.registrations || 0;
      const attendance = d.attendance || 0;
      const attendanceRate = registrations ? Math.round((attendance / registrations) * 100) : 0;
      return {
        name: d._id,
        events: d.events,
        registrations,
        attendanceRate,
      };
    });

    res.json({ departments });
  } catch (error) {
    console.error('Admin departments error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin: audit logs (stub for now)
router.get('/audit-logs', authenticate, requireAdmin, async (req, res) => {
  res.json({ logs: [] });
});

router.get('/system-settings', authenticate, requireAdmin, async (_req, res) => {
  try {
    let settings = await SystemSetting.findOne();
    if (!settings) settings = await SystemSetting.create({});
    res.json({ settings });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/system-settings', authenticate, requireAdmin, async (req, res) => {
  try {
    let settings = await SystemSetting.findOne();
    if (!settings) settings = await SystemSetting.create({});

    settings.maintenanceMode = !!req.body.maintenanceMode;
    settings.lockRegistrations = !!req.body.lockRegistrations;
    settings.require2FA = !!req.body.require2FA;
    settings.defaultAttendancePolicy = req.body.defaultAttendancePolicy === 'strict' ? 'strict' : 'normal';
    settings.updatedAt = new Date();
    await settings.save();

    res.json({ message: 'Settings updated', settings });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

