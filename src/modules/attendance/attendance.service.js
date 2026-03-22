const Session = require('../../models/Session');
const Attendance = require('../../models/Attendance');
const User = require('../../models/User'); // Ensure User model is imported
const crypto = require('crypto');
const { calculateDistance } = require('../../utils/geo.util');
const repo = require('./attendance.repo'); // Import your updated repository

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

  const sessionData = {
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
    sessionData.backupCode = generateBackupCode();
    // Backup code lasts slightly longer (30 mins) than the QR session
    sessionData.backupExpiresAt = new Date(now.getTime() + ((duration + 30) * 60 * 1000)); 
  }

  return await repo.saveSession(sessionData);
};

/**
 * Validates a QR scan and marks attendance
 */
exports.processStudentScan = async (userId, data) => {
  const { qrToken, lat, lng, deviceId } = data;

  // 1. Validate User & Device Identity
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found.');
  if (user.deviceId && user.deviceId !== deviceId) {
    throw new Error('Device mismatch. Use your registered device.');
  }

  // 2. Find Active Session (Using strict time-check from repo)
  const session = await repo.findSessionByToken(qrToken);
  if (!session) {
    throw new Error('This session is either invalid or has expired.');
  }

  // 3. Geo-Fencing Verification
  const distance = calculateDistance(lat, lng, session.location.lat, session.location.lng);
  if (distance > session.radius) {
    const geoErr = new Error(`Spatial verification failed: ${Math.round(distance)}m away.`);
    geoErr.distance = distance;
    geoErr.radius = session.radius;
    throw geoErr;
  }

  // 4. Duplicate Check
  const alreadyMarked = await repo.hasStudentMarked(userId, session._id);
  if (alreadyMarked) throw new Error('Attendance already recorded for this session.');

  // 5. Determine Lateness Status
  const diffMins = Math.floor((Date.now() - session.startAt.getTime()) / 60000);
  const status = diffMins > session.lateAfterMins ? 'late' : 'present';

  return await repo.saveAttendance({
    studentId: userId,
    sessionId: session._id,
    status,
    method: 'scan',
    location: { lat, lng },
    distance
  });
};

/**
 * Validates a manual 6-digit backup code
 */
exports.processManualCode = async (studentId, data) => {
  const { code, lat, lng } = data;
  if (!code) throw new Error('No backup code provided.');

  // 1. Find Session via Backup Code (Using strict time-check from repo)
  const session = await repo.findSessionByBackupCode(code);
  if (!session) throw new Error('Invalid or expired backup code.');

  // 2. Location validation (Manual codes still require proximity check)
  if (lat && lng) {
    const distance = calculateDistance(lat, lng, session.location.lat, session.location.lng);
    if (distance > session.radius) {
      throw new Error(`Location verification failed. You are ${Math.round(distance)}m away.`);
    }
  }

  // 3. Duplicate Check
  const already = await repo.hasStudentMarked(studentId, session._id);
  if (already) throw new Error('Attendance already marked.');

  // 4. Determine Lateness
  const diffMins = Math.floor((Date.now() - session.startAt.getTime()) / 60000);
  const status = diffMins > (session.lateAfterMins || 15) ? 'late' : 'present';

  return await repo.saveAttendance({
    studentId,
    sessionId: session._id,
    status,
    method: 'manual',
    location: { lat, lng }
  });
};

/**
 * Registry Retrieval Helpers
 */
exports.getAttendeesBySession = async (sessionId) => {
  return await repo.getAttendeesBySession(sessionId);
};

exports.getProfessorSessions = async (professorId) => {
  return await repo.getProfessorSessions(professorId);
};