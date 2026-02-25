const Session = require('../../models/Session');
const Attendance = require('../../models/Attendance');

exports.saveSession = async (data) => await Session.create(data);
exports.findSessionByToken = async (token) => await Session.findOne({ qrToken: token, isActive: true });
exports.saveAttendance = async (data) => await Attendance.create(data);
exports.hasStudentMarked = async (sid, sessid) => await Attendance.exists({ studentId: sid, sessionId: sessid });

exports.getAttendeesBySession = async (sessionId) => {
    return await Attendance.find({ sessionId })
        .populate('studentId', 'name email profileImage')
        .sort({ createdAt: -1 });
};

exports.getProfessorSessions = async (professorId) => {
    return await Session.find({ professorId }).sort({ createdAt: -1 });
};