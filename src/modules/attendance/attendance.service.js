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

    // 1. Triple-Lock: Location Verification
    const distance = geoUtil.calculateDistance(lat, lng, session.location.lat, session.location.lng);
    if (distance > session.radius) throw new Error("Too far from classroom.");

    const alreadyMarked = await repo.hasStudentMarked(studentId, session._id);
    if (alreadyMarked) throw new Error("Already marked present.");

    // 2. Triple-Lock: Time Verification (Late Detection)
    // If student scans 10 mins after session was created, they are 'late'
    const sessionStartTime = new Date(session.createdAt).getTime();
    const currentTime = new Date().getTime();
    const minutesElapsed = (currentTime - sessionStartTime) / 60000;

    let attendanceStatus = 'present';
    if (minutesElapsed > 10) {
        attendanceStatus = 'late';
    }

    // 3. Save with Status
    return await repo.saveAttendance({
        studentId,
        sessionId: session._id,
        locationAtScan: { lat, lng },
        status: attendanceStatus // Save as 'present' or 'late'
    });
};