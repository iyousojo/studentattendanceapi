const repo = require('./attendance.repo');
const geoUtil = require('../../utils/geo.util');
const crypto = require('crypto');

exports.createClassSession = async (professorId, data) => {
    const { courseCode, lat, lng, durationMins, radius } = data;

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + (durationMins || 15));

    const qrToken = crypto.randomBytes(16).toString('hex');

    return await repo.saveSession({
        professorId,
        courseCode,
        location: { lat, lng },
        qrToken,
        radius: radius || 50,
        expiresAt
    });
};

exports.processStudentScan = async (studentId, data) => {
    const { qrToken, lat, lng } = data;

    const session = await repo.findSessionByToken(qrToken);
    if (!session) throw new Error("Invalid or inactive session.");

    if (new Date() > session.expiresAt) throw new Error("Session expired.");

    const distance = geoUtil.calculateDistance(lat, lng, session.location.lat, session.location.lng);
    if (distance > session.radius) throw new Error("Too far from classroom.");

    const alreadyMarked = await repo.hasStudentMarked(studentId, session._id);
    if (alreadyMarked) throw new Error("Already marked present.");

    return await repo.saveAttendance({
        studentId,
        sessionId: session._id,
        locationAtScan: { lat, lng }
    });
};