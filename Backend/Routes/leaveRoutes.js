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
  if (!email && ['/by-email', '/recommendations', '/patterns'].includes(req.path)) {
    return res.status(400).json({ message: 'Email query parameter is required' });
  }
  next();
};

router.post('/', createLeave); 
router.get('/by-email', validateEmailQuery, getLeavesByEmail); 
router.get('/', getAllLeaves); 
router.get('/pending', getAllPendingLeaves); 
router.get('/approved', getAllApprovedLeaves); 
router.put('/approve/:id', approveLeave); 
router.put('/decline/:id', declineLeave); 
router.get('/employee-stats', getEmployeeStats); 
router.get('/recommendations', validateEmailQuery, getLeaveRecommendations); 
router.get('/patterns', validateEmailQuery, getLeavePatterns); 

router.use((err, req, res, next) => {
  console.error(`Route error: ${req.method} ${req.originalUrl}`, err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

export default router;