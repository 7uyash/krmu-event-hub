import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: String, // ISO date string
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  venue: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['workshop', 'cultural', 'sports', 'academic', 'club', 'seminar'],
  },
  poster: {
    type: String,
  },
  organizer: {
    type: String,
    required: true,
    trim: true,
  },
  organizerDepartment: {
    type: String,
    trim: true,
  },
  convenorEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  coordinatorEmail: {
    type: String,
    lowercase: true,
    trim: true,
  },
  totalSeats: {
    type: Number,
    min: 0,
  },
  registeredCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  attendedCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  status: {
    type: String,
    required: true,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming',
  },
  isOpen: {
    type: Boolean,
    default: true,
  },
  isClubOnly: {
    type: Boolean,
    default: false,
  },
  clubId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
eventSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Event', eventSchema);
