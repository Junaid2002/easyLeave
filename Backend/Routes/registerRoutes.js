import express from 'express';
import { registerUser, loginUser, getUserByEmail } from '../controllers/registerController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/users', getUserByEmail);

export default router;