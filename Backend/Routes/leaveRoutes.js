import express from 'express';
import {
  createLeave,
  getLeavesByEmail,
  getAllPendingLeaves,
  getAllApprovedLeaves,
  getAllLeaves,
  approveLeave,
  declineLeave,
  getEmployeeStats,
  getLeaveRecommendations,
  getLeavePatterns,
} from '../Controllers/leaveController.js';

const router = express.Router();

const validateEmailQuery = (req, res, next) => {
  const { email } = req.query;
  if ((req.path === '/email' || req.path === '/recommendations' || req.path === '/patterns') && !email) {
    return res.status(400).json({ message: 'Email query parameter is required' });
  }
  next();
};

router.post('/', createLeave);
router.get('/email', validateEmailQuery, getLeavesByEmail);
router.get('/', getAllLeaves);
router.get('/pending', getAllPendingLeaves);
router.get('/approved', getAllApprovedLeaves);
router.put('/approve/:id', approveLeave);
router.put('/decline/:id', declineLeave);
router.get('/employee-stats', getEmployeeStats);
router.get('/recommendations', validateEmailQuery, getLeaveRecommendations);
router.get('/patterns', validateEmailQuery, getLeavePatterns);

export default router;