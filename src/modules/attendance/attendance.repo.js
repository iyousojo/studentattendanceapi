const Session = require('../../models/Session');
const Attendance = require('../../models/Attendance');

// Save a new session created by a Professor
exports.saveSession = async (sessionData) => {
    return await Session.create(sessionData);
};

// Check if a session exists by token
exports.findSessionByToken = async (qrToken) => {
    return await Session.findOne({ qrToken, isActive: true });
};

// Save student attendance record
exports.saveAttendance = async (attendanceData) => {
    return await Attendance.create(attendanceData);
};

// Find if student already marked attendance for this session
exports.hasStudentMarked = async (studentId, sessionId) => {
    // .exists() is even faster than .findOne() if you only care if it exists
    return await Attendance.exists({ studentId, sessionId });
};