import express from 'express';
import { createLeave, getLeavesByEmail } from '../Controllers/leaveController.js';

const router = express.Router();

router.post('/', createLeave);
router.get('/', getLeavesByEmail);

export default router;