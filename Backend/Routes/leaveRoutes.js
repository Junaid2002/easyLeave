import express from 'express';
import {
  createLeave,
  getLeavesByEmail,
  getAllPendingLeaves,
  approveLeave,
  declineLeave
} from '../Controllers/leaveController.js';

const router = express.Router();
router.post('/', createLeave);
router.get('/', getLeavesByEmail);
router.get('/pending', getAllPendingLeaves);
router.put('/approve/:id', approveLeave);
router.put('/decline/:id', declineLeave);

export default router;
