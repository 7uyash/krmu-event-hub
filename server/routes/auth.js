import express from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import Student from '../models/Student.js';
import OTP from '../models/OTP.js';
import { sendOtpEmail, initEmailTransporter } from '../lib/email.js';

const router = express.Router();

// Initialize email transporter once
initEmailTransporter();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId, role: 'student' }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

const hashOtp = (code) => crypto.createHash('sha256').update(code).digest('hex');

const OTP_EXPIRY_MINUTES = 10;
const OTP_RESEND_COOLDOWN_SECONDS = 60;

// Student Registration
router.post(
  '/register/student',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('name').trim().notEmpty(),
    body('rollNumber').trim().notEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, name, rollNumber, department } = req.body;

      // Check if student already exists
      const existingStudent = await Student.findOne({
        $or: [{ email }, { rollNumber }],
      });

      if (existingStudent) {
        return res.status(400).json({
          message: 'Student with this email or roll number already exists',
        });
      }

      // Create new student
      const student = new Student({
        email,
        password,
        name,
        rollNumber,
        department,
      });

      await student.save();

      // Generate token
      const token = generateToken(student._id);

      res.status(201).json({
        message: 'Student registered successfully',
        token,
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
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Student Login
router.post(
  '/login/student',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Find student
      const student = await Student.findOne({ email });
      if (!student) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check password
      const isMatch = await student.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate token
      const token = generateToken(student._id);

      res.json({
        message: 'Login successful',
        token,
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
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Generate OTP (email delivery, hashed at rest)
router.post(
  '/otp/generate',
  [body('email').isEmail().normalizeEmail()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email } = req.body;

      // Cooldown: prevent spamming within OTP_RESEND_COOLDOWN_SECONDS
      const recentOtp = await OTP.findOne({ email, purpose: 'login' }).sort({ createdAt: -1 });
      if (recentOtp) {
        const secondsSince = (Date.now() - recentOtp.createdAt.getTime()) / 1000;
        if (secondsSince < OTP_RESEND_COOLDOWN_SECONDS) {
          return res.status(429).json({
            message: `Please wait ${Math.ceil(
              OTP_RESEND_COOLDOWN_SECONDS - secondsSince
            )}s before requesting another OTP`,
          });
        }
      }

      // Generate 6-digit OTP
      const code = crypto.randomInt(100000, 999999).toString();
      const codeHash = hashOtp(code);

      // Set expiration to OTP_EXPIRY_MINUTES from now
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + OTP_EXPIRY_MINUTES);

      // Delete any existing OTPs for this email/purpose
      await OTP.deleteMany({ email, purpose: 'login' });

      // Create new OTP (hashed at rest)
      const otp = new OTP({
        email,
        codeHash,
        expiresAt,
        purpose: 'login',
      });

      await otp.save();

      // Send OTP via email
      await sendOtpEmail({ to: email, code });

      res.json({
        message: 'OTP sent to email',
        expiresInMinutes: OTP_EXPIRY_MINUTES,
      });
    } catch (error) {
      console.error('OTP generation error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Verify OTP
router.post(
  '/otp/verify',
  [
    body('email').isEmail().normalizeEmail(),
    body('code').isLength({ min: 6, max: 6 }).isNumeric(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, code } = req.body;
      const codeHash = hashOtp(code);

      // Find OTP
      const otp = await OTP.findOne({ email, codeHash, purpose: 'login' });

      if (!otp) {
        return res.status(400).json({ message: 'Invalid OTP' });
      }

      // Check if OTP is expired
      if (otp.expiresAt < new Date()) {
        await OTP.deleteOne({ _id: otp._id });
        return res.status(400).json({ message: 'OTP has expired' });
      }

      // Check if already verified
      if (otp.verified) {
        return res.status(400).json({ message: 'OTP already used' });
      }

      // Mark as verified
      otp.verified = true;
      await otp.save();

      res.json({
        message: 'OTP verified successfully',
        verified: true,
      });
    } catch (error) {
      console.error('OTP verification error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Login with OTP
router.post(
  '/login/student/otp',
  [
    body('email').isEmail().normalizeEmail(),
    body('code').isLength({ min: 6, max: 6 }).isNumeric(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, code } = req.body;
      const codeHash = hashOtp(code);

      // Verify OTP
      const otp = await OTP.findOne({ email, codeHash, purpose: 'login' });

      if (!otp) {
        return res.status(400).json({ message: 'Invalid OTP' });
      }

      if (otp.expiresAt < new Date()) {
        await OTP.deleteOne({ _id: otp._id });
        return res.status(400).json({ message: 'OTP has expired' });
      }

      if (otp.verified) {
        return res.status(400).json({ message: 'OTP already used' });
      }

      // Find student
      const student = await Student.findOne({ email });

      if (!student) {
        return res.status(404).json({
          message: 'Student not found. Please register first.',
        });
      }

      // Mark OTP as verified and delete others for this purpose
      otp.verified = true;
      await otp.save();
      await OTP.deleteMany({ email, purpose: 'login', _id: { $ne: otp._id } });

      // Generate token
      const token = generateToken(student._id);

      res.json({
        message: 'Login successful',
        token,
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
      console.error('OTP login error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const student = await Student.findById(decoded.userId).select('-password');
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({
      user: {
        id: student._id.toString(),
        name: student.name,
        email: student.email,
        rollNumber: student.rollNumber,
        department: student.department,
        role: student.role || 'student',
      },
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

export default router;

