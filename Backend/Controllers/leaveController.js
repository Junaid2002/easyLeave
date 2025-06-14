const Leave = require('../models/Leave');
const User = require('../models/User');
const EmployeeStats = require('../models/EmployeeStats');
const { recommendLeaveDays, analyzeLeavePatterns } = require('../utils/notificationUtils');

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

exports.createLeave = async (req, res) => {
  const { email, from, to, reason, oneDay } = req.body;

  if (!email || !from || !reason) {
    return res.status(400).json({ message: 'Email, from date, and reason are required' });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }
  if (!oneDay && !to) {
    return res.status(400).json({ message: 'To date is required for multi-day leaves' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const fromDate = new Date(from);
    const toDate = oneDay ? fromDate : new Date(to);
    if (isNaN(fromDate.getTime()) || (!oneDay && isNaN(toDate.getTime()))) {
      return res.status(400).json({ message: 'Invalid date format. Expected format: YYYY-MM-DD' });
    }
    if (!oneDay && toDate < fromDate) {
      return res.status(400).json({ message: 'To date must be on or after from date' });
    }

    const days = oneDay ? 1 : Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24)) + 1;
    if (isNaN(days)) {
      return res.status(400).json({ message: 'Invalid date range calculation' });
    }

    const leave = new Leave({
      email,
      from: fromDate,
      to: oneDay ? fromDate : toDate,
      reason,
      oneDay,
      status: 'Pending',
    });

    const autoApproveCriteria = { maxDays: 2, reason: 'casual' };
    if (days <= autoApproveCriteria.maxDays && reason.toLowerCase() === autoApproveCriteria.reason) {
      leave.status = 'Approved';
    }

    await leave.save();

    await EmployeeStats.findOneAndUpdate(
      { email },
      {
        email,
        name: user.name || email.split('@')[0],
        $inc: { [leave.status === 'Approved' ? 'approved' : 'pending']: 1 },
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    res.status(201).json({ message: 'Leave created successfully', leave });
  } catch (error) {
    console.error(`Error creating leave for ${email}:`, error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message).join(', ');
      return res.status(400).json({ message: `Validation failed: ${messages}`, error: error.message });
    }
    if (error.name === 'MongoServerError' && error.code === 11000) {
      return res.status(400).json({ message: 'Duplicate entry detected', error: error.message });
    }
    res.status(500).json({ message: 'Failed to create leave due to server error', error: error.message });
  }
};

exports.getLeavesByEmail = async (req, res) => {
  const { email } = req.query;

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ message: 'Valid email is required' });
  }

  try {
    const leaves = await Leave.find({ email }).sort({ createdAt: -1 }).lean();
    res.status(200).json(leaves);
  } catch (error) {
    console.error(`Error fetching leaves for ${email}:`, error);
    res.status(500).json({ message: 'Failed to fetch leaves', error: error.message });
  }
};

exports.getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find().sort({ createdAt: -1 }).lean();
    res.status(200).json(leaves);
  } catch (error) {
    console.error('Error fetching all leaves:', error);
    res.status(500).json({ message: 'Failed to fetch all leaves', error: error.message });
  }
};

exports.getAllPendingLeaves = async (req, res) => {
  try {
    const pendingLeaves = await Leave.find({ status: 'Pending' }).sort({ createdAt: -1 }).lean();
    res.status(200).json(pendingLeaves);
  } catch (error) {
    console.error('Error fetching pending leaves:', error);
    res.status(500).json({ message: 'Failed to fetch pending leaves', error: error.message });
  }
};

exports.getAllApprovedLeaves = async (req, res) => {
  try {
    const approvedLeaves = await Leave.find({ status: 'Approved' }).sort({ createdAt: -1 }).lean();
    res.status(200).json(approvedLeaves);
  } catch (error) {
    console.error('Error fetching approved leaves:', error);
    res.status(500).json({ message: 'Failed to fetch approved leaves', error: error.message });
  }
};

exports.approveLeave = async (req, res) => {
  const { id } = req.params;

  try {
    const leave = await Leave.findById(id);
    if (!leave) {
      return res.status(404).json({ message: 'Leave not found' });
    }

    if (leave.status === 'Approved') {
      return res.status(400).json({ message: 'Leave is already approved' });
    }

    leave.status = 'Approved';
    leave.declineReason = '';
    await leave.save();

    const user = await User.findOne({ email: leave.email });
    if (user) {
      await EmployeeStats.findOneAndUpdate(
        { email: leave.email },
        {
          email: leave.email,
          name: user.name || leave.email.split('@')[0],
          $inc: { approved: 1, pending: -1 },
          updatedAt: new Date(),
        },
        { upsert: true, new: true }
      );
    }

    res.status(200).json({ message: 'Leave approved successfully', leave });
  } catch (error) {
    console.error(`Error approving leave ${id}:`, error);
    res.status(500).json({ message: 'Failed to approve leave', error: error.message });
  }
};

exports.declineLeave = async (req, res) => {
  const { id } = req.params;
  const { declineReason } = req.body;

  if (!declineReason) {
    return res.status(400).json({ message: 'Decline reason is required' });
  }

  try {
    const leave = await Leave.findById(id);
    if (!leave) {
      return res.status(404).json({ message: 'Leave not found' });
    }

    if (leave.status === 'Declined') {
      return res.status(400).json({ message: 'Leave is already declined' });
    }

    leave.status = 'Declined';
    leave.declineReason = declineReason;
    await leave.save();

    const user = await User.findOne({ email: leave.email });
    if (user) {
      await EmployeeStats.findOneAndUpdate(
        { email: leave.email },
        {
          email: leave.email,
          name: user.name || leave.email.split('@')[0],
          $inc: { declined: 1, pending: -1 },
          updatedAt: new Date(),
        },
        { upsert: true, new: true }
      );
    }

    res.status(200).json({ message: 'Leave declined successfully', leave });
  } catch (error) {
    console.error(`Error declining leave ${id}:`, error);
    res.status(500).json({ message: 'Failed to decline leave', error: error.message });
  }
};

exports.getEmployeeStats = async (req, res) => {
  try {
    const stats = await EmployeeStats.find().sort({ updatedAt: -1 }).lean();
    res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching employee stats:', error);
    res.status(500).json({ message: 'Failed to fetch employee stats', error: error.message });
  }
};

exports.getLeaveRecommendations = async (req, res) => {
  const { email } = req.query;
  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ message: 'Valid email is required' });
  }
  try {
    const recommendations = await recommendLeaveDays(email);
    res.status(200).json(recommendations);
  } catch (error) {
    console.error(`Error fetching recommendations for ${email}:`, error);
    res.status(500).json({ message: 'Failed to fetch recommendations', error: error.message });
  }
};

exports.getLeavePatterns = async (req, res) => {
  const { email } = req.query;
  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ message: 'Valid email is required' });
  }
  try {
    const patterns = await analyzeLeavePatterns(email);
    res.status(200).json(patterns);
  } catch (error) {
    console.error(`Error fetching leave patterns for ${email}:`, error);
    res.status(500).json({ message: 'Failed to fetch leave patterns', error: error.message });
  }
};
