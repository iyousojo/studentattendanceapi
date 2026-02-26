// controllers/attendance.controller.js
const attendanceService = require('./attendance.service');
const Attendance = require('../../models/Attendance');

exports.startSession = async (req, res) => {
  try {
    // allow professor to pass generateBackup: true/false in body
    const session = await attendanceService.createClassSession(req.user.id, req.body);
    res.status(201).json({ success: true, data: session });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.markAttendance = async (req, res) => {
  try {
    const record = await attendanceService.processStudentScan(req.user.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Attendance marked successfully!',
      data: record
    });
  } catch (err) {
    const debug = { message: err.message };
    if (err.distance !== undefined) debug.distance = err.distance;
    if (err.radius !== undefined) debug.radius = err.radius;
    res.status(403).json({ success: false, ...debug });
  }
};

exports.markAttendanceManual = async (req, res) => {
  try {
    const { code } = req.body;
    const result = await attendanceService.processManualCode(req.user.id, code);
    res.status(200).json({
      success: true,
      message: 'Attendance marked (manual) successfully!',
      data: result.record
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

    const Session = require('../../models/Session');
    const session = await Session.findById(sessionId);

    res.status(200).json({
      success: true,
      session,
      attendees
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};