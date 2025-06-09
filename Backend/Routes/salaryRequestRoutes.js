const express = require('express');
const jwt = require('jsonwebtoken');
const {
  createSalaryRequest,
  getSalaryStatus,
  getPendingSalaryRequests,
  approveSalaryRequest,
} = require('../Controllers/salaryRequestController');

const router = express.Router();

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Unauthorized', success: false });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized', success: false });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token', success: false });
  }
};

const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: Admin access required', success: false });
  }
  next();
};

router.post('/', authMiddleware, createSalaryRequest);

router.get('/status', authMiddleware, getSalaryStatus);

router.get('/pending', authMiddleware, adminMiddleware, getPendingSalaryRequests);

router.put('/approve/:id', authMiddleware, adminMiddleware, approveSalaryRequest);

module.exports = router;
