const express = require('express');
const router = express.Router();
const attendanceController = require('./attendance.controller');
const { protect, isProfessor } = require('../../middleware/auth.middleware');

router.post('/session', protect, isProfessor, attendanceController.startSession);
router.post('/scan', protect, attendanceController.markAttendance);
router.get('/list', protect, attendanceController.getAttendanceList);

// New Dashboard Routes
router.get('/professor/sessions', protect, isProfessor, attendanceController.getProfessorHistory);
router.get('/session-details/:sessionId', protect, isProfessor, attendanceController.getSessionDetails);

module.exports = router;