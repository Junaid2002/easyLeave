import mongoose from 'mongoose';

const leaveSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  from: { type: String, required: true },
  to: { type: String, required: false },
  reason: { type: String, required: true },
  oneDay: { type: Boolean, default: false },

  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Declined'],
    default: 'Pending'
  },

  declineReason: {
    type: String,
    default: ""
  }
}, {
  timestamps: true
});

leaveSchema.index({ email: 1 });

const Leave = mongoose.model('Leave', leaveSchema);

export default Leave;
