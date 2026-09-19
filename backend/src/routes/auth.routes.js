// src/routes/auth.routes.js
const express = require('express');
const rateLimit = require('express-rate-limit');
const {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  requestOTP,
  verifyOTP,
  googleLogin,
} = require('../controllers/auth.controller');
const router = express.Router();

// Throttle brute-force attempts on the sensitive endpoints.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { message: 'Too many attempts, please try again later' },
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', logout);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);

router.post('/otp/request', authLimiter, requestOTP);
router.post('/otp/verify', authLimiter, verifyOTP);
router.post('/google', authLimiter, googleLogin);


module.exports = router;