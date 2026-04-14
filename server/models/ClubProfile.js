import mongoose from 'mongoose';

const clubProfileSchema = new mongoose.Schema({
  clubUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
    unique: true,
  },
  name: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  contactEmail: {
    type: String,
    trim: true,
  },
  logoUrl: {
    type: String,
    trim: true,
  },
  socialLinks: {
    instagram: { type: String, trim: true },
    linkedin: { type: String, trim: true },
    website: { type: String, trim: true },
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('ClubProfile', clubProfileSchema);

