import Leave from '../Models/leave.js';

export const createLeave = async (req, res) => {
  const { email, from, to, reason, oneDay } = req.body;

  if (!email || !from || !reason) {
    return res.status(400).json({ message: 'Email, from date, and reason are required' });
  }

  try {
    const leave = new Leave({ email, from, to, reason, oneDay, status: 'Pending' });
    await leave.save();
    res.status(201).json({ message: 'Leave created successfully', leave });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create leave' });
  }
};

export const getLeavesByEmail = async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const leaves = await Leave.find({ email, status: 'Approved' }).sort({ createdAt: -1 });
    res.status(200).json(leaves);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch leaves' });
  }
};

export const getAllPendingLeaves = async (req, res) => {
  try {
    const pendingLeaves = await Leave.find({ status: 'Pending' }).sort({ createdAt: -1 });
    res.status(200).json(pendingLeaves);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch pending leaves' });
  }
};

export const approveLeave = async (req, res) => {
  const { id } = req.params;

  try {
    const updatedLeave = await Leave.findByIdAndUpdate(
      id,
      { status: 'Approved', declineReason: "" },
      { new: true }
    );

    if (!updatedLeave) {
      return res.status(404).json({ message: 'Leave not found' });
    }

    res.status(200).json(updatedLeave);
  } catch (error) {
    res.status(500).json({ message: 'Failed to approve leave' });
  }
};

export const declineLeave = async (req, res) => {
  const { id } = req.params;
  const { declineReason } = req.body;

  if (!declineReason) {
    return res.status(400).json({ message: 'Decline reason is required' });
  }

  try {
    const updatedLeave = await Leave.findByIdAndUpdate(
      id,
      { status: 'Declined', declineReason },
      { new: true }
    );

    if (!updatedLeave) {
      return res.status(404).json({ message: 'Leave not found' });
    }

    res.status(200).json(updatedLeave);
  } catch (error) {
    res.status(500).json({ message: 'Failed to decline leave' });
  }
};
