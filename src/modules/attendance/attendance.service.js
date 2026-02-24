const repo = require('./attendance.repo');
const geoUtil = require('../../utils/geo.util');
const crypto = require('crypto');

exports.createClassSession = async (professorId, data) => {
    const { courseCode, lat, lng, durationMins, radius } = data;

    // Default to 60 mins if not provided
    const duration = durationMins || 60;
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + duration);

    // Using a shorter hex for easier QR scanning if needed, 16 bytes is plenty
    const qrToken = crypto.randomBytes(16).toString('hex');

    return await repo.saveSession({
        professorId,
        courseCode: courseCode.toUpperCase(),
        location: { lat, lng },
        qrToken,
        radius: radius || 50,
        expiresAt,
        isActive: true // Ensure this is explicitly set
    });
};

exports.processStudentScan = async (studentId, data) => {
    const { qrToken, lat, lng } = data;

    // 1. Find Session
    const session = await repo.findSessionByToken(qrToken);
    if (!session || !session.isActive) {
        throw new Error("Invalid or inactive session.");
    }

    // 2. Lock 1: Time Verification (Expiration)
    if (new Date() > session.expiresAt) {
        throw new Error("Session has expired.");
    }

    // 3. Lock 2: Location Verification (Geofencing)
    const distance = geoUtil.calculateDistance(
        lat, lng, 
        session.location.lat, session.location.lng
    );

    if (distance > session.radius) {
        throw new Error(`Too far from classroom. Distance: ${Math.round(distance)}m`);
    }

    // 4. Check for duplicates
    const alreadyMarked = await repo.hasStudentMarked(studentId, session._id);
    if (alreadyMarked) {
        throw new Error("Attendance already recorded for this session.");
    }

    // 5. Lock 3: Late Detection (Customizable)
    const sessionStartTime = new Date(session.createdAt).getTime();
    const currentTime = new Date().getTime();
    const minutesElapsed = (currentTime - sessionStartTime) / 60000;

    let attendanceStatus = 'present';
    if (minutesElapsed > 15) { // Adjusted to 15 mins for a standard grace period
        attendanceStatus = 'late';
    }

    // 6. Final Save
    return await repo.saveAttendance({
        studentId,
        sessionId: session._id,
        locationAtScan: { lat, lng },
        status: attendanceStatus,
        distanceFromCenter: distance // Good for debugging professor's radius
    });
};