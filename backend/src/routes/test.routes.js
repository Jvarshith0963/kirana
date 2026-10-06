const express = require('express');

const {
  authenticate,
  authorize,
} = require('../middleware/auth.middleware');

const router = express.Router();

// Any authenticated user
router.get('/profile', authenticate, (req, res) => {
  res.json({
    message: 'Authenticated successfully',
    user: req.user,
  });
});

// Customer only
router.get(
  '/customer',
  authenticate,
  authorize('customer'),
  (req, res) => {
    res.json({
      message: 'Customer route accessed successfully',
      user: req.user,
    });
  }
);

// Vendor only
router.get(
  '/vendor',
  authenticate,
  authorize('vendor'),
  (req, res) => {
    res.json({
      message: 'Vendor route accessed successfully',
      user: req.user,
    });
  }
);

// Admin only
router.get(
  '/admin',
  authenticate,
  authorize('admin'),
  (req, res) => {
    res.json({
      message: 'Admin route accessed successfully',
      user: req.user,
    });
  }
);

module.exports = router;