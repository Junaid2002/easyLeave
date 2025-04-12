import Leave from '../Models/leave.js';

export const createLeave = async (req, res) => {
  const { email, from, to, reason, oneDay } = req.body;

  if (!email || !from || !reason) {
    return res.status(400).json({ message: 'Email, from date, and reason are required' });
  }

  try {
    const leave = new Leave({ email, from, to, reason, oneDay });
    await leave.save();
    res.status(201).json({ message: 'Leave created successfully', leave });
  } catch (error) {
    console.error('Error creating leave:', error);
    res.status(500).json({ message: 'Failed to create leave' });
  }
};

export const getLeavesByEmail = async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const leaves = await Leave.find({ email }).sort({ createdAt: -1 });
    res.status(200).json(leaves);
  } catch (error) {
    console.error('Error fetching leaves:', error);
    res.status(500).json({ message: 'Failed to fetch leaves' });
  }
};