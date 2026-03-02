const Session = require('../../models/Session');
const Attendance = require('../../models/Attendance');
const crypto = require('crypto');
const { calculateDistance } = require('../../utils/geo.util');

const generateQrToken = () => crypto.randomBytes(16).toString('hex');
const generateBackupCode = () => Math.floor(100000 + Math.random() * 900000).toString();

/**
 * Creates a new class session with QR and Backup Code
 */
exports.createClassSession = async (professorId, data) => {
  const qrToken = generateQrToken();
  const duration = Number(data.durationMins) || 60;
  const lateLimit = Number(data.lateAfterMins) || 15;
  const now = new Date();
  const sessionExpiresAt = new Date(now.getTime() + (duration * 60 * 1000));

  const session = {
    professorId,
    courseCode: data.courseCode,
    qrToken,
    location: {
      lat: Number(data.lat),
      lng: Number(data.lng)
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
    session.backupExpiresAt = new Date(now.getTime() + ((duration + 30) * 60 * 1000)); 
  }

  return await Session.create(session);
};

/**
 * Validates a QR scan and marks attendance
 */
exports.processStudentScan = async (studentId, data) => {
  const { qrToken, lat, lng } = data;

  const session = await Session.findOne({ qrToken, isActive: true });
  if (!session) throw new Error('Invalid or expired QR code.');

  // GEO-FENCING CHECK
  const distance = calculateDistance(lat, lng, session.location.lat, session.location.lng);
  
  if (distance > session.radius) {
    const geoErr = new Error(`Too far from class: ${Math.round(distance)}m away.`);
    geoErr.distance = distance;
    geoErr.radius = session.radius;
    throw geoErr;
  }

  const already = await Attendance.exists({ studentId, sessionId: session._id });
  if (already) throw new Error('Attendance already marked.');

  const diffMins = Math.floor((Date.now() - session.startAt.getTime()) / 60000);
  const status = diffMins > session.lateAfterMins ? 'late' : 'present';

  return await Attendance.create({
    studentId,
    sessionId: session._id,
    status,
    method: 'scan',
    location: { lat, lng },
    distance
  });
};

/**
 * Validates a manual backup code + student location
 */
exports.processManualCode = async (studentId, data) => {
  const { code, lat, lng } = data;
  if (!code) throw new Error('No backup code provided.');

  const session = await Session.findOne({
    backupCode: String(code).trim(),
    isActive: true,
    backupExpiresAt: { $gt: new Date() } 
  });

  if (!session) throw new Error('Invalid or expired backup code.');

  // Validate location for manual entry
  if (lat && lng) {
    const distance = calculateDistance(lat, lng, session.location.lat, session.location.lng);
    if (distance > session.radius) {
      throw new Error(`Location verification failed. You are ${Math.round(distance)}m away.`);
    }
  }

  const already = await Attendance.exists({ studentId, sessionId: session._id });
  if (already) throw new Error('Attendance already marked.');

  const diffMins = Math.floor((Date.now() - session.startAt.getTime()) / 60000);
  const status = diffMins > (session.lateAfterMins || 15) ? 'late' : 'present';

  return await Attendance.create({
    studentId,
    sessionId: session._id,
    status,
    method: 'manual',
    location: { lat, lng }
  });
};

// --- Helper Functions ---
exports.getAttendeesBySession = async (sessionId) => {
  return await Attendance.find({ sessionId })
    .populate('studentId', 'name email profileImage')
    .sort({ createdAt: -1 });
};

exports.getProfessorSessions = async (professorId) => {
  return await Session.find({ professorId }).sort({ createdAt: -1 });
};