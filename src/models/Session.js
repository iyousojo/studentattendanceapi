// models/Session.js
const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
    professorId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },

    courseCode: { 
        type: String, 
        required: true 
    },

    location: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    },

    qrToken: { 
        type: String, 
        required: true, 
        unique: true 
    },

    radius: { 
        type: Number, 
        default: 50 // meters
    },

    // 🔥 Better session timing control
    durationMins: { 
        type: Number, 
        default: 60 
    },

    lateAfterMins: { 
        type: Number, 
        default: 15 
    },

    startAt: { 
        type: Date, 
        default: Date.now 
    },

    expiresAt: { 
        type: Date, 
        required: true 
    },

    isActive: { 
        type: Boolean, 
        default: true 
    },

    // 🔥 Manual backup code support
    backupCode: { 
        type: String 
    },

    backupExpiresAt: { 
        type: Date 
    }

}, { timestamps: true });

module.exports = mongoose.model('Session', SessionSchema);