// controllers/attendance.controller.js
const attendanceService = require('./attendance.service');
const Attendance = require('../../models/Attendance');
const Session = require('../../models/Session'); // Move this to top for cleaner code

exports.startSession = async (req, res) => {
  try {
    const session = await attendanceService.createClassSession(req.user.id, req.body);
    res.status(201).json({ success: true, data: session });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * Handles QR Code Scans
 */
exports.markAttendance = async (req, res) => {
  try {
    // Add deviceId from headers or body for security
    const record = await attendanceService.processStudentScan(req.user.id, {
      ...req.body,
      deviceId: req.headers['x-device-id'] 
    });

    res.status(200).json({ success: true, data: record });
  } catch (err) {
    res.status(403).json({ 
      success: false, 
      message: err.message,
      distance: err.distance, // Sent back for the UI "Error" state
      radius: err.radius 
    });
  }
};

/**
 * Handles 6-Digit Manual Backup Codes
 */
exports.markAttendanceManual = async (req, res) => {
  try {
    // req.body contains { code, lat, lng }
    const record = await attendanceService.processManualCode(req.user.id, req.body);
    
    res.status(200).json({
      success: true,
      message: 'Attendance marked (manual) successfully!',
      data: record
    });
  } catch (err) {
    res.status(403).json({ success: false, message: err.message });
  }
};

exports.getAttendanceList = async (req, res) => {
  try {
    const list = await Attendance.find()
      .populate('studentId', 'name email')
      .populate('sessionId', 'courseCode');
    res.status(200).json({ success: true, count: list.length, data: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getProfessorHistory = async (req, res) => {
  try {
    const sessions = await attendanceService.getProfessorSessions(req.user.id);
    res.status(200).json({ success: true, sessions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getSessionDetails = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const attendees = await attendanceService.getAttendeesBySession(sessionId);
    const session = await Session.findById(sessionId);

    if (!session) {
        return res.status(404).json({ success: false, message: 'Session not found' });
    }

    res.status(200).json({
      success: true,
      session,
      attendees
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};// Add this function to your controller
exports.getActiveSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ isActive: true });
    res.status(200).json({ success: true, sessions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};// controllers/attendance.controller.js

exports.getStudentStats = async (req, res) => {
  try {
    const studentId = req.user.id;
    
    // Count records based on the 'status' field defined in your service
    const attendedCount = await Attendance.countDocuments({ 
      studentId, 
      status: 'present' 
    });
    
    const lateCount = await Attendance.countDocuments({ 
      studentId, 
      status: 'late' 
    });

    res.status(200).json({
      success: true,
      attendedCount,
      lateCount,
      user: req.user // Keep for hardware sync
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};