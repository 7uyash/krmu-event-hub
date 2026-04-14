import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  actorUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
  },
  actorEmail: {
    type: String,
    trim: true,
  },
  action: {
    type: String,
    required: true,
    trim: true,
  },
  detail: {
    type: String,
    required: true,
    trim: true,
  },
  meta: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('AuditLog', auditLogSchema);

