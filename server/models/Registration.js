import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
    index: true,
  },
  registeredAt: {
    type: Date,
    default: Date.now,
  },
  attendanceStatus: {
    type: String,
    enum: ['present', 'absent', 'pending'],
    default: 'pending',
  },
  markedAt: {
    type: Date,
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
  },
});

// Prevent duplicate registrations
registrationSchema.index({ eventId: 1, userId: 1 }, { unique: true });

export default mongoose.model('Registration', registrationSchema);
