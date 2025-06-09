const SalaryRequest = require('../models/SalaryRequest');
const User = require('../models/User');

// Create a new salary request
const createSalaryRequest = async (req, res) => {
  const { employeeEmail } = req.body;

  try {
    const user = await User.findOne({ email: employeeEmail });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const existingRequest = await SalaryRequest.findOne({
      employeeEmail,
      status: 'pending',
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'A pending salary request already exists' });
    }

    const salaryRequest = new SalaryRequest({ employeeEmail });
    await salaryRequest.save();

    res.status(201).json({ message: 'Salary request created successfully', salaryRequest });
  } catch (error) {
    console.error('Error creating salary request:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get salary status for an employee
const getSalaryStatus = async (req, res) => {
  const { email } = req.query;

  try {
    const user = await User.findOne({ email });
    const isSalarySet = user && user.salary && user.salary.total > 0;

    const salaryRequest = await SalaryRequest.findOne({
      employeeEmail: email,
      status: 'pending',
    });

    res.status(200).json({
      isSalarySet,
      requestStatus: salaryRequest ? 'pending' : null,
    });
  } catch (error) {
    console.error('Error fetching salary status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all pending salary requests
const getPendingSalaryRequests = async (req, res) => {
  try {
    const pendingRequests = await SalaryRequest.find({ status: 'pending' });
    res.status(200).json(pendingRequests);
  } catch (error) {
    console.error('Error fetching pending salary requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Approve a salary request
const approveSalaryRequest = async (req, res) => {
  try {
    const request = await SalaryRequest.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ message: 'Salary request not found' });
    }

    res.status(200).json({ message: 'Salary request approved', request });
  } catch (error) {
    console.error('Error approving salary request:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createSalaryRequest,
  getSalaryStatus,
  getPendingSalaryRequests,
  approveSalaryRequest
};
