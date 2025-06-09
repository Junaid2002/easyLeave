const express = require('express');
const { registerUser, loginUser, getUserByEmail } = require('../Controllers/registerController');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/users', getUserByEmail);

module.exports = router;
