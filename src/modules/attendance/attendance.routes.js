const express = require('express');
const router = express.Router();
const attendanceController = require('./attendance.controller');
const { protect, isProfessor } = require('../../middleware/auth.middleware');

// Match the controller function names strictly
router.post('/session', protect, isProfessor, attendanceController.startSession);
router.post('/scan', protect, attendanceController.markAttendance);
router.get('/list', protect, attendanceController.getAttendanceList);

module.exports = router;