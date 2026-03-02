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
      enum: ['scan', 'manual'], // Changed 'qr' to 'scan' to match service logic
      default: 'scan',
    },

    // Matching the service logic: { lat, lng }
    location: {
      lat: { type: Number },
      lng: { type: Number },
    },
    
    // Store the distance for professor audit/disputes
    distance: { type: Number },
    
    recordedAccuracy: { type: Number },
  },
  { timestamps: true }
);

// Prevent duplicate attendance for same student + session
attendanceSchema.index({ studentId: 1, sessionId: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);