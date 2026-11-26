
const express = require('express');

const { registerUser,loginUser,getProfile,logout } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', authMiddleware, getProfile);
router.post('/logout', logout);
module.exports = router;
