import mongoose from 'mongoose';

const systemSettingSchema = new mongoose.Schema({
  maintenanceMode: { type: Boolean, default: false },
  lockRegistrations: { type: Boolean, default: false },
  require2FA: { type: Boolean, default: false },
  defaultAttendancePolicy: {
    type: String,
    enum: ['strict', 'normal'],
    default: 'normal',
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('SystemSetting', systemSettingSchema);

