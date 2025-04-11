import Leave from '../Models/leave.js';

export const submitLeave = async (req, res) => {
  const { from, to, reason, oneDay } = req.body;
  try {
    const leave = new Leave({ from, to, reason, oneDay });
    await leave.save();
    res.status(201).json({ message: 'Leave submitted successfully', leave });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find().sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
