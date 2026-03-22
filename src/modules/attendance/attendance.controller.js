const attendanceService = require('./attendance.service');
const Attendance = require('../../models/Attendance');
const Session = require('../../models/Session');

// 1. Start Session
exports.startSession = async (req, res) => {
  try {
    const session = await attendanceService.createClassSession(req.user.id, req.body);
    res.status(201).json({ success: true, data: session });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// 2. Mark Attendance (QR)
exports.markAttendance = async (req, res) => {
  try {
    const record = await attendanceService.processStudentScan(req.user.id, {
      ...req.body,
      deviceId: req.headers['x-device-id'] 
    });
    res.status(200).json({ success: true, data: record });
  } catch (err) {
    res.status(403).json({ success: false, message: err.message });
  }
};

// 3. Mark Attendance (Manual Code)
exports.markAttendanceManual = async (req, res) => {
  try {
    const record = await attendanceService.processManualCode(req.user.id, req.body);
    res.status(200).json({ success: true, message: 'Success', data: record });
  } catch (err) {
    res.status(403).json({ success: false, message: err.message });
  }
};

// 4. Get List (Filtered for the owner)
exports.getAttendanceList = async (req, res) => {
  try {
    const mySessions = await Session.find({ professorId: req.user.id }).select('_id');
    const sessionIds = mySessions.map(s => s._id);
    const list = await Attendance.find({ sessionId: { $in: sessionIds } })
      .populate('studentId', 'name email')
      .populate('sessionId', 'courseCode');
    res.status(200).json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 5. Professor History
exports.getProfessorHistory = async (req, res) => {
  try {
    const sessions = await attendanceService.getProfessorSessions(req.user.id);
    res.status(200).json({ success: true, sessions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 6. Session Details
exports.getSessionDetails = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await Session.findById(sessionId);
    if (!session || session.professorId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const attendees = await attendanceService.getAttendeesBySession(sessionId);
    res.status(200).json({ success: true, session, attendees });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 7. Student Stats
exports.getStudentStats = async (req, res) => {
  try {
    const attendedCount = await Attendance.countDocuments({ studentId: req.user.id, status: 'present' });
    const lateCount = await Attendance.countDocuments({ studentId: req.user.id, status: 'late' });
    res.status(200).json({ success: true, attendedCount, lateCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 8. Active Deployments (THE ONE THAT WAS LIKELY MISSING)
exports.getActiveSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ 
      isActive: true, 
      professorId: req.user.id 
    });
    res.status(200).json({ success: true, sessions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};