const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
    scannedAt: { type: Date, default: Date.now },
    locationAtScan: {
        lat: Number,
        lng: Number
    }
}, { timestamps: true });

// Strict Rule: One student can only have one attendance record per session
AttendanceSchema.index({ studentId: 1, sessionId: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);