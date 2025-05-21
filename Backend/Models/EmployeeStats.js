import mongoose from 'mongoose';

const employeeStatsSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  approved: {
    type: Number,
    default: 0,
  },
  declined: {
    type: Number,
    default: 0,
  },
  pending: {
    type: Number,
    default: 0,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

employeeStatsSchema.index({ email: 1 });

export default mongoose.model('EmployeeStats', employeeStatsSchema);