import express from 'express';
import { submitLeave, getLeaves } from '../Controllers/leaveController.js';

const router = express.Router();

router.post('/', submitLeave);
router.get('/', getLeaves);

export default router;
