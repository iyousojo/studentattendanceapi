// services/attendance.service.js
const Session = require('../../models/Session');
const Attendance = require('../../models/Attendance');
const crypto = require('crypto');
const { calculateDistance } = require('../../utils/geo.util');

// helpers
const generateQrToken = () => crypto.randomBytes(16).toString('hex');
const generateBackupCode = () => Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit

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

/**
 * Create a class session and optionally generate a backup code.
 */
exports.createClassSession = async (professorId, data) => {
  const qrToken = generateQrToken();
  
  // 1. Force durations to be numbers
  const duration = Number(data.durationMins) || 60;
  const lateLimit = Number(data.lateAfterMins) || 15;
  
  // 2. Use millisecond math for bulletproof Date creation
  const now = Date.now();
  const sessionExpiresAt = new Date(now + (duration * 60 * 1000)); // Current time + duration in mins

  const session = {
    professorId,
    courseCode: data.courseCode,
    qrToken,
    // 3. Strictly adhere to your schema's location object format
    location: {
        lat: Number(data.lat || data.location?.lat),
        lng: Number(data.lng || data.location?.lng)
    },
    radius: Number(data.radius) || 100,
    durationMins: duration,
    lateAfterMins: lateLimit,
    startAt: new Date(now),
    expiresAt: sessionExpiresAt, // 🔥 Required by your Mongoose Schema
    isActive: true,
  };

  if (data.generateBackup !== false) {
    session.backupCode = generateBackupCode();
    // 4. Backup code expires 30 minutes AFTER the session ends
    session.backupExpiresAt = new Date(now + ((duration + 30) * 60 * 1000)); 
  }

  const created = await Session.create(session);
  return created;
};

/**
 * Process a QR scan
 */
exports.processStudentScan = async (studentId, payload) => {
  const session = await this.findSessionByToken(payload.qrToken);
  if (!session) throw new Error('Session not found or inactive.');

  // prevent duplicates
  const already = await this.hasStudentMarked(studentId, session._id);
  if (already) throw new Error('You have already marked attendance for this session.');

  // Pull safely from the schema's location object
  const sessionLat = session.location?.lat;
  const sessionLng = session.location?.lng;

  if (typeof payload.lat === 'number' && typeof payload.lng === 'number') {
    if (sessionLat === undefined || sessionLng === undefined) {
      throw new Error('Session location is not defined on server.');
    }

    const dist = calculateDistance(sessionLat, sessionLng, payload.lat, payload.lng);

    if (dist > (session.radius || 100)) {
      const err = new Error(`Too far from session location (${Math.round(dist)}m).`);
      err.distance = Math.round(dist);
      err.radius = session.radius;
      throw err;
    }
  }

  // determine late/present
  const now = new Date();
  const diffMins = Math.floor((now.getTime() - new Date(session.startAt).getTime()) / 60000);
  const status = diffMins > (session.lateAfterMins || 15) ? 'late' : 'present';

  const record = await Attendance.create({
    studentId,
    sessionId: session._id,
    status,
    method: 'qr',
    recordedLat: payload.lat,
    recordedLng: payload.lng,
    recordedAccuracy: payload.accuracy,
  });

  return record;
};

/**
 * Process manual code from a student.
 */
exports.processManualCode = async (studentId, code) => {
  if (!code) throw new Error('No backup code provided.');

  const now = new Date();
  const session = await Session.findOne({
    backupCode: String(code).trim(), 
    isActive: true,
    backupExpiresAt: { $gt: now } // 🔥 This will now correctly find codes in the future
  });

  if (!session) throw new Error('Invalid or expired backup code.');

  const already = await this.hasStudentMarked(studentId, session._id);
  if (already) throw new Error('You have already marked attendance for this session.');

  const diffMins = Math.floor((now.getTime() - new Date(session.startAt).getTime()) / 60000);
  const status = diffMins > (session.lateAfterMins || 15) ? 'late' : 'present';

  const record = await Attendance.create({
    studentId,
    sessionId: session._id,
    status,
    method: 'manual',
  });

  return { record, sessionId: session._id };
};