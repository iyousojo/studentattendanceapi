const express = require('express');
const router = express.Router();
const attendanceController = require('./attendance.controller');
// Double check: is it 'middleware' or 'middlewares'? 
const { protect, isProfessor } = require('../../middleware/auth.middleware');

// Routes
router.post('/session', protect, isProfessor, attendanceController.startSession);
router.post('/scan', protect, attendanceController.markAttendance);
router.get('/list', protect, attendanceController.getAttendanceList);

module.exports = router;