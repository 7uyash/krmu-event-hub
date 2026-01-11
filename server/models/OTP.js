import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  codeHash: {
    type: String,
    required: true,
    minlength: 64, // sha256 hex
    maxlength: 64,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 }, // Auto-delete expired OTPs
  },
  purpose: {
    type: String,
    enum: ['login', 'register', 'reset-password'],
    default: 'login',
  },
  verified: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster lookups and recent OTP retrievals
otpSchema.index({ email: 1, purpose: 1, createdAt: -1 });

export default mongoose.model('OTP', otpSchema);


