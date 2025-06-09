const mongoose = require('mongoose');

const employeeStatsSchema = new mongoose.Schema(
  {
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
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    approved: {
      type: Number,
      default: 0,
      min: [0, 'Approved count cannot be negative'],
    },
    declined: {
      type: Number,
      default: 0,
      min: [0, 'Declined count cannot be negative'],
    },
    pending: {
      type: Number,
      default: 0,
      min: [0, 'Pending count cannot be negative'],
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
    toJSON: { virtuals: false, versionKey: false },
  }
);

employeeStatsSchema.index({ email: 1 });

module.exports = mongoose.model('EmployeeStats', employeeStatsSchema);
