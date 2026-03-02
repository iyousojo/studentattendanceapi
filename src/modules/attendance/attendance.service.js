// services/attendance.service.js
const Session = require('../../models/Session');
const Attendance = require('../../models/Attendance');
const crypto = require('crypto');
const { calculateDistance } = require('../../utils/geo.util');

const generateQrToken = () => crypto.randomBytes(16).toString('hex');
const generateBackupCode = () => Math.floor(100000 + Math.random() * 900000).toString();

exports.createClassSession = async (professorId, data) => {
  const qrToken = generateQrToken();
  const duration = Number(data.durationMins) || 60;
  const lateLimit = Number(data.lateAfterMins) || 15;
  
  const now = new Date();
  // Session expiration Date
  const sessionExpiresAt = new Date(now.getTime() + (duration * 60 * 1000));

  const session = {
    professorId,
    courseCode: data.courseCode,
    qrToken,
    location: {
        lat: Number(data.lat || data.location?.lat),
        lng: Number(data.lng || data.location?.lng)
    },
    radius: Number(data.radius) || 100,
    durationMins: duration,
    lateAfterMins: lateLimit,
    startAt: now,
    expiresAt: sessionExpiresAt,
    isActive: true,
  };

  if (data.generateBackup !== false) {
    session.backupCode = generateBackupCode();
    // Expiration: Duration + 30 extra minutes
    session.backupExpiresAt = new Date(now.getTime() + ((duration + 30) * 60 * 1000)); 
  }

  return await Session.create(session);
};

exports.processManualCode = async (studentId, code) => {
  if (!code) throw new Error('No backup code provided.');

  // 10-SECOND GRACE PERIOD: Subtracts 10s from "now" to handle clock drift
  const graceTime = new Date(Date.now() - 10000); 

  const session = await Session.findOne({
    backupCode: String(code).trim(),
    isActive: true,
    backupExpiresAt: { $gt: graceTime } 
  });

  if (!session) {
    // Check if it exists but is actually expired for better error messaging
    const expiredCheck = await Session.findOne({ backupCode: String(code).trim() });
    if (expiredCheck) {
      throw new Error(`This code expired at ${expiredCheck.backupExpiresAt.toLocaleTimeString()}`);
    }
    throw new Error('Invalid backup code.');
  }

  const already = await Attendance.exists({ studentId, sessionId: session._id });
  if (already) throw new Error('You have already marked attendance for this session.');

  const diffMins = Math.floor((Date.now() - session.startAt.getTime()) / 60000);
  const status = diffMins > (session.lateAfterMins || 15) ? 'late' : 'present';

  return await Attendance.create({
    studentId,
    sessionId: session._id,
    status,
    method: 'manual',
  });
};

// ... keep other helper exports (getAttendeesBySession, etc.)
exports.getAttendeesBySession = async (sessionId) => {
  return await Attendance.find({ sessionId })
    .populate('studentId', 'name email profileImage')
    .sort({ createdAt: -1 });
};

exports.getProfessorSessions = async (professorId) => {
  return await Session.find({ professorId }).sort({ createdAt: -1 });
};

exports.findSessionByToken = async (token) => await Session.findOne({ qrToken: token, isActive: true });
exports.hasStudentMarked = async (sid, sessid) => await Attendance.exists({ studentId: sid, sessionId: sessid });