import mongoose from 'mongoose';

const clubMembershipSchema = new mongoose.Schema({
  clubUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'pending'],
    default: 'active',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

clubMembershipSchema.index({ clubUserId: 1, studentId: 1 }, { unique: true });

export default mongoose.model('ClubMembership', clubMembershipSchema);

