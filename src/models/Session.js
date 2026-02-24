const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
    professorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courseCode: { type: String, required: true },
    location: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    },
    qrToken: { type: String, required: true, unique: true },
    radius: { type: Number, default: 50 }, // Geofence radius in meters
    expiresAt: { type: Date, required: true }, // Time-lock constraint
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Session', SessionSchema);