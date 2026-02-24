const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');


// IMPORT THE MIDDLEWARE HERE
const { protect } = require('../../middleware/auth.middleware'); 

// @desc    Register a new user
router.post('/register', authController.register);

// @desc    Authenticate user & get token
router.post('/login', authController.login);

// @desc    Get User Profile & Dashboard Stats
// Now 'protect' is defined and will work
router.get('/profile', protect, authController.getUserProfile);

module.exports = router;