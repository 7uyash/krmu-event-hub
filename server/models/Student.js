import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  rollNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: false, // Not required for Microsoft OAuth users
    minlength: 6,
  },
  department: {
    type: String,
    trim: true,
  },
  school: {
    type: String,
    trim: true,
  },
  role: {
    type: String,
    default: 'student',
    enum: ['student', 'coordinator', 'convenor', 'club', 'admin'],
  },
  status: {
    type: String,
    enum: ['active', 'disabled'],
    default: 'active',
  },
  avatar: {
    type: String,
  },
  microsoftId: {
    type: String,
    unique: true,
    sparse: true,
  },
  preferences: {
    emailDigest: { type: Boolean, default: true },
    eventReminders: { type: Boolean, default: true },
    attendanceUpdates: { type: Boolean, default: true },
    shareProfile: { type: Boolean, default: false },
    sessionLock: { type: Boolean, default: true },
  },
  joinedClubIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
    },
  ],
  readNotificationIds: [
    {
      type: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
studentSchema.pre('save', async function (next) {
  // Skip password hashing if using Microsoft OAuth and password is not modified
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  // Only hash if password exists and is not already hashed
  if (this.password && this.password.length < 60) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Compare password method
studentSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('Student', studentSchema);

