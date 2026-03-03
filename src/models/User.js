// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, 'Please add a name'] 
    },
    email: { 
        type: String, 
        required: [true, 'Please add an email'], 
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    password: { 
        type: String, 
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false
    },
    role: { 
        type: String, 
        enum: ['student', 'professor', 'admin'], 
        default: 'student' 
    },
    deviceId: { 
        type: String, 
        default: null 
    }
}, { timestamps: true });

userSchema.pre('save', async function() {
    if (!this.isModified('password')) {
        return; // Exit early if password isn't changed
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);