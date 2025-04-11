import mongoose from 'mongoose';

const leaveSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  reason: { type: String, required: true },
  oneDay: { type: Boolean, default: false }
}, {
  timestamps: true
});

const Leave = mongoose.model('Leave', leaveSchema);
export default Leave;
