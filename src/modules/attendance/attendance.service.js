// services/attendance.service.js
const Session = require('../../models/Session');
const Attendance = require('../../models/Attendance');
const crypto = require('crypto');

// <-- import the util you created
// adjust the relative path if your services folder is in a different location.
// This path assumes services file is two folders below src (e.g. src/modules/.../services)
// If attendance.service.js is at src/services/attendance.service.js, change to '../utils/geo.util'
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
 * data: { courseCode, lat, lng, durationMins, lateAfterMins, radius, generateBackup (bool) }
 */
exports.createClassSession = async (professorId, data) => {
  const qrToken = generateQrToken();
  const session = {
    professorId,
    courseCode: data.courseCode,
    qrToken,
    // keep backwards-compatible properties if callers use them
    lat: data.lat,
    lng: data.lng,
    // also allow 'location' object if you prefer that in other parts of code
    location: data.location ?? (data.lat && data.lng ? { lat: data.lat, lng: data.lng } : undefined),
    radius: data.radius ?? 100,
    durationMins: data.durationMins ?? 60,
    lateAfterMins: data.lateAfterMins ?? 15,
    startAt: new Date(),
    isActive: true,
  };

  if (data.generateBackup !== false) {
    const code = generateBackupCode();
    session.backupCode = code;
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + (session.durationMins || 60) + 30);
    session.backupExpiresAt = expiry;
  }

  const created = await Session.create(session);
  return created;
};

/**
 * Process a QR scan
 * studentId: ObjectId, payload: { qrToken, lat, lng, accuracy }
 */
exports.processStudentScan = async (studentId, payload) => {
  const session = await this.findSessionByToken(payload.qrToken);
  if (!session) throw new Error('Session not found or inactive.');

  // prevent duplicates
  const already = await this.hasStudentMarked(studentId, session._id);
  if (already) throw new Error('You have already marked attendance for this session.');

  // Resolve session coords (support both legacy {lat,lng} and {location: {lat,lng}})
  const sessionLat = (typeof session.lat === 'number') ? session.lat : session.location?.lat;
  const sessionLng = (typeof session.lng === 'number') ? session.lng : session.location?.lng;

  if (typeof payload.lat === 'number' && typeof payload.lng === 'number') {
    if (sessionLat === undefined || sessionLng === undefined) {
      throw new Error('Session location is not defined on server.');
    }

    // use the shared util
    const dist = calculateDistance(sessionLat, sessionLng, payload.lat, payload.lng);

    if (dist > (session.radius || 100)) {
      const err = new Error(`Too far from session location (${Math.round(dist)}m).`);
      err.distance = Math.round(dist);
      err.radius = session.radius;
      throw err;
    }
  }

  // determine late/present using session.startAt and lateAfterMins
  const now = new Date();
  const diffMins = Math.floor((now - new Date(session.startAt)) / 60000);
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
 * studentId: ObjectId, code: string
 */
exports.processManualCode = async (studentId, code) => {
  if (!code) throw new Error('No backup code provided.');

  const now = new Date();
  const session = await Session.findOne({
    backupCode: code,
    isActive: true,
    backupExpiresAt: { $gt: now }
  });

  if (!session) throw new Error('Invalid or expired backup code.');

  const already = await this.hasStudentMarked(studentId, session._id);
  if (already) throw new Error('You have already marked attendance for this session.');

  const diffMins = Math.floor((now - new Date(session.startAt)) / 60000);
  const status = diffMins > (session.lateAfterMins || 15) ? 'late' : 'present';

  const record = await Attendance.create({
    studentId,
    sessionId: session._id,
    status,
    method: 'manual',
  });

  return { record, sessionId: session._id };
};