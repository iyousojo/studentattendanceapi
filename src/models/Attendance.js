// models/Attendance.js
const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      required: true,
    },
    status: {
      type: String,
      enum: ['present', 'late'],
      default: 'present',
    },
    method: {
      type: String,
      enum: ['qr', 'manual'],
      default: 'qr',
    },

    // GPS debug fields (only used for QR)
    recordedLat: { type: Number },
    recordedLng: { type: Number },
    recordedAccuracy: { type: Number },
  },
  { timestamps: true }
);

// 🔥 Prevent duplicate attendance for same student + session
attendanceSchema.index({ studentId: 1, sessionId: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);