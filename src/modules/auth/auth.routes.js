const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');

// @desc    Register a new user (Student or Professor)
// @route   POST /api/auth/register
router.post('/register', authController.register);

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
router.post('/login', authController.login);

module.exports = router;