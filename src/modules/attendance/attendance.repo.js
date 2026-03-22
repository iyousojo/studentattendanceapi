const Session = require('../../models/Session');
const Attendance = require('../../models/Attendance');

/**
 * Creates a new session in the registry
 */
exports.saveSession = async (data) => await Session.create(data);

/**
 * SECURE TOKEN CHECK
 * Prevents attendance marking if the QR token is found 
 * but the session's physical time has expired.
 */
exports.findSessionByToken = async (token) => {
    return await Session.findOne({ 
        qrToken: token, 
        isActive: true,
        expiresAt: { $gt: new Date() } // Must be Greater Than Now
    });
};

/**
 * SECURE BACKUP CODE CHECK
 * Validates the 6-digit code against its own specific expiry.
 */
exports.findSessionByBackupCode = async (code) => {
    return await Session.findOne({
        backupCode: String(code).trim(),
        isActive: true,
        backupExpiresAt: { $gt: new Date() }
    });
};

/**
 * ATTENDANCE OPS
 */
exports.saveAttendance = async (data) => await Attendance.create(data);

exports.hasStudentMarked = async (sid, sessid) => {
    return await Attendance.exists({ studentId: sid, sessionId: sessid });
};

/**
 * REGISTRY RETRIEVAL
 */
exports.getAttendeesBySession = async (sessionId) => {
    return await Attendance.find({ sessionId })
        .populate('studentId', 'name email profileImage')
        .sort({ createdAt: -1 });
};

exports.getProfessorSessions = async (professorId) => {
    // We return all sessions so the professor can see history, 
    // but the UI will use the date comparison to show 'Expired' status.
    return await Session.find({ professorId }).sort({ createdAt: -1 });
};