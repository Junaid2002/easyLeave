import mongoose from 'mongoose';

const salaryRequestSchema = new mongoose.Schema({
  employeeEmail: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'declined'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const SalaryRequest = mongoose.model('SalaryRequest', salaryRequestSchema);

export default SalaryRequest;
