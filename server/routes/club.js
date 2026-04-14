import express from 'express';
import jwt from 'jsonwebtoken';
import Student from '../models/Student.js';
import Event from '../models/Event.js';
import ClubMembership from '../models/ClubMembership.js';
import ClubProfile from '../models/ClubProfile.js';
import { logAudit } from '../lib/audit.js';

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

const requireClub = (req, res, next) => {
  if (req.userRole !== 'club') return res.status(403).json({ message: 'Forbidden' });
  next();
};

router.get('/profile', authenticate, requireClub, async (req, res) => {
  try {
    const user = await Student.findById(req.userId).select('-password -__v');
    if (!user) return res.status(404).json({ message: 'Club user not found' });

    const [eventsCount, membersCount] = await Promise.all([
      Event.countDocuments({ createdBy: req.userId, isClubOnly: true }),
      ClubMembership.countDocuments({ clubUserId: req.userId, status: 'active' }),
    ]);
    let profile = await ClubProfile.findOne({ clubUserId: req.userId });
    if (!profile) {
      profile = await ClubProfile.create({
        clubUserId: req.userId,
        name: user.name,
        description: user.department ? `${user.department} Club` : 'Club profile',
        contactEmail: user.email,
      });
    }

    res.json({
      club: {
        id: user._id.toString(),
        name: profile.name || user.name,
        description: profile.description || '',
        adminEmail: profile.contactEmail || user.email,
        logoUrl: profile.logoUrl || '',
        socialLinks: profile.socialLinks || {},
        memberCount: membersCount,
        events: eventsCount,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/profile', authenticate, requireClub, async (req, res) => {
  try {
    const { name, description } = req.body;
    const user = await Student.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'Club user not found' });
    if (name) user.name = name;
    await user.save();
    const profile = await ClubProfile.findOneAndUpdate(
      { clubUserId: req.userId },
      {
        $set: {
          name: name || user.name,
          description: description || '',
          contactEmail: user.email,
          updatedAt: new Date(),
        },
      },
      { upsert: true, new: true }
    );
    await logAudit({
      actorUserId: req.userId,
      actorEmail: user.email,
      action: 'CLUB_PROFILE_UPDATE',
      detail: `Updated club profile for ${profile.name || user.name}`,
      meta: { clubUserId: req.userId.toString() },
    });
    res.json({ message: 'Club profile updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/members', authenticate, requireClub, async (req, res) => {
  try {
    const s = String(req.query.q || '').trim();
    const memberships = await ClubMembership.find({ clubUserId: req.userId })
      .populate('studentId', 'name email rollNumber department')
      .sort({ createdAt: -1 });

    const rows = memberships
      .map((m) => ({
        id: m._id.toString(),
        rollNumber: m.studentId?.rollNumber || '',
        name: m.studentId?.name || 'Unknown',
        department: m.studentId?.department || '—',
        status: m.status,
      }))
      .filter((m) =>
        !s
          ? true
          : m.rollNumber.toLowerCase().includes(s.toLowerCase()) ||
            m.name.toLowerCase().includes(s.toLowerCase()) ||
            m.department.toLowerCase().includes(s.toLowerCase())
      );

    res.json({ members: rows });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/members/import', authenticate, requireClub, async (req, res) => {
  try {
    const rollNumbers = Array.isArray(req.body.rollNumbers) ? req.body.rollNumbers : [];
    if (!rollNumbers.length) {
      return res.status(400).json({ message: 'No roll numbers provided' });
    }

    const students = await Student.find({ rollNumber: { $in: rollNumbers } }).select('_id rollNumber');
    let imported = 0;
    for (const student of students) {
      try {
        await ClubMembership.updateOne(
          { clubUserId: req.userId, studentId: student._id },
          { $setOnInsert: { status: 'active', createdAt: new Date() } },
          { upsert: true }
        );
        imported += 1;
      } catch {
        // ignore duplicates/errors for individual records
      }
    }
    const user = await Student.findById(req.userId).select('email');
    await logAudit({
      actorUserId: req.userId,
      actorEmail: user?.email,
      action: 'CLUB_MEMBER_IMPORT',
      detail: `Imported ${imported} members via roll list`,
      meta: { imported, matched: students.length },
    });

    res.json({ message: 'Import completed', imported, matched: students.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.patch('/members/:memberId', authenticate, requireClub, async (req, res) => {
  try {
    const member = await ClubMembership.findOne({
      _id: req.params.memberId,
      clubUserId: req.userId,
    });
    if (!member) return res.status(404).json({ message: 'Member not found' });

    if (req.body.action === 'remove') {
      await ClubMembership.deleteOne({ _id: member._id });
      await logAudit({
        actorUserId: req.userId,
        action: 'CLUB_MEMBER_REMOVE',
        detail: `Removed member ${member.studentId?.toString?.() || ''}`,
      });
      return res.json({ message: 'Member removed' });
    }

    if (req.body.status && ['active', 'pending'].includes(req.body.status)) {
      member.status = req.body.status;
      await member.save();
      await logAudit({
        actorUserId: req.userId,
        action: 'CLUB_MEMBER_STATUS',
        detail: `Updated membership status to ${member.status}`,
      });
      return res.json({ message: 'Member updated' });
    }

    return res.status(400).json({ message: 'Invalid action' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

