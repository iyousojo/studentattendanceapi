const repo = require('./attendance.repo');
const geoUtil = require('../../utils/geo.util');
const crypto = require('crypto');

exports.createClassSession = async (professorId, data) => {
    const { courseCode, lat, lng, durationMins, radius, lateAfterMins } = data;
    const duration = parseInt(durationMins) || 60;
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + duration);

    const qrToken = crypto.randomBytes(16).toString('hex');

    return await repo.saveSession({
        professorId,
        courseCode: courseCode.toUpperCase(),
        location: { lat, lng },
        qrToken,
        radius: radius || 50,
        lateAfterMins: parseInt(lateAfterMins) || 15, // Store the manual late limit
        expiresAt,
        isActive: true
    });
};

exports.getProfessorSessions = async (id) => await repo.getProfessorSessions(id);
exports.getAttendeesBySession = async (id) => await repo.getAttendeesBySession(id);

exports.processStudentScan = async (studentId, data) => {
    const { qrToken, lat, lng } = data;
    const session = await repo.findSessionByToken(qrToken);
    
    if (!session || !session.isActive) throw new Error("Invalid or inactive session.");
    if (new Date() > session.expiresAt) throw new Error("Session has expired.");

    const distance = geoUtil.calculateDistance(lat, lng, session.location.lat, session.location.lng);
    if (distance > session.radius) throw new Error(`Too far. Distance: ${Math.round(distance)}m`);

    const alreadyMarked = await repo.hasStudentMarked(studentId, session._id);
    if (alreadyMarked) throw new Error("Attendance already recorded.");

    // Dynamic Late Calculation based on the manual session setup
    const minutesElapsed = (new Date() - new Date(session.createdAt)) / 60000;
    const attendanceStatus = minutesElapsed > (session.lateAfterMins || 15) ? 'late' : 'present';

    return await repo.saveAttendance({
        studentId,
        sessionId: session._id,
        locationAtScan: { lat, lng },
        status: attendanceStatus,
        distanceFromCenter: distance
    });
};