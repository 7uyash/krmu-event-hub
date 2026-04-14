import express from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import Student from '../models/Student.js';
import Registration from '../models/Registration.js';
import ClubMembership from '../models/ClubMembership.js';

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

const SCHOOL_OPTIONS = [
  'School of Engineering and Technology',
  'School of Management and Commerce',
  'School of Law',
  'School of Medical and Allied Sciences',
  'School of Humanities and Social Sciences',
  'School of Agricultural Sciences',
];

// Get school/club selection options and current selections
router.get('/options', authenticate, async (req, res) => {
  try {
    const user = await Student.findById(req.userId).select('school department joinedClubIds');
    if (!user) return res.status(404).json({ message: 'Student not found' });

    const clubs = await Student.find({ role: 'club' }).select('name email department');
    const memberships = await ClubMembership.find({ studentId: req.userId }).select('clubUserId status');
    const membershipMap = new Map(memberships.map((m) => [m.clubUserId.toString(), m.status]));

    res.json({
      schools: SCHOOL_OPTIONS,
      clubs: clubs.map((c) => ({
        id: c._id.toString(),
        name: c.name,
        email: c.email,
        description: c.department ? `${c.department} club` : 'Club',
        status: membershipMap.get(c._id.toString()) || null,
      })),
      selected: {
        school: user.school || '',
        department: user.department || '',
        clubIds: (user.joinedClubIds || []).map((id) => id.toString()),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update school/department selection
router.put('/academic', authenticate, async (req, res) => {
  try {
    const { school, department } = req.body;
    const user = await Student.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'Student not found' });

    user.school = school || '';
    user.department = department || '';
    await user.save();

    res.json({ message: 'Academic profile updated', school: user.school, department: user.department });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update selected clubs (creates pending memberships when needed)
router.put('/clubs', authenticate, async (req, res) => {
  try {
    const clubIds = Array.isArray(req.body.clubIds) ? req.body.clubIds : [];
    const user = await Student.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'Student not found' });

    const validClubs = await Student.find({ _id: { $in: clubIds }, role: 'club' }).select('_id');
    const validClubIds = validClubs.map((c) => c._id.toString());

    user.joinedClubIds = validClubIds;
    await user.save();

    // Upsert memberships as pending by default if not already present
    for (const clubId of validClubIds) {
      await ClubMembership.updateOne(
        { clubUserId: clubId, studentId: req.userId },
        { $setOnInsert: { status: 'pending', createdAt: new Date() } },
        { upsert: true }
      );
    }

    res.json({ message: 'Club preferences updated', clubIds: validClubIds });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get notification feed from registrations/attendance updates
router.get('/notifications', authenticate, async (req, res) => {
  try {
    const student = await Student.findById(req.userId).select('readNotificationIds');
    if (!student) return res.status(404).json({ message: 'Student not found' });

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
        read: (student?.readNotificationIds || []).includes(r._id.toString()),
      };
    });

    res.json({ notifications });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.patch('/notifications/:id/read', authenticate, async (req, res) => {
  try {
    const student = await Student.findById(req.userId);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    const id = req.params.id;
    if (!student.readNotificationIds?.includes(id)) {
      student.readNotificationIds = [...(student.readNotificationIds || []), id];
      await student.save();
    }
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.patch('/notifications/read-all', authenticate, async (req, res) => {
  try {
    const student = await Student.findById(req.userId);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    const regs = await Registration.find({ userId: req.userId }).select('_id');
    student.readNotificationIds = regs.map((r) => r._id.toString());
    await student.save();
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
