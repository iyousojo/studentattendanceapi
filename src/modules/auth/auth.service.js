const User = require('../../models/User');
const jwt = require('jsonwebtoken');

// @desc    Logic for registering a user
exports.registerUser = async (userData) => {
    const userExists = await User.findOne({ email: userData.email });
    if (userExists) throw new Error('User already exists');

    return await User.create(userData);
};

// @desc    Logic for authenticating a user with Hardware Binding
exports.loginUser = async (email, password, incomingDeviceId) => {
    // 1. Find user and include password and deviceId
    const user = await User.findOne({ email }).select('+password');
    if (!user) throw new Error('Invalid credentials');

    // 2. Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) throw new Error('Invalid credentials');

    // 3. HARDWARE BINDING LOGIC
    // If the account has NO device linked yet, bind this device
    if (!user.deviceId && incomingDeviceId) {
        user.deviceId = incomingDeviceId;
        await user.save();
    } 
    // If account IS bound, check if the incoming ID matches the one in DB
    else if (user.deviceId && user.deviceId !== incomingDeviceId) {
        throw new Error('Access Denied: Account is bound to a different terminal. Contact Admin to reset.');
    }

    // 4. Generate JWT
    const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );

    return {
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            deviceId: user.deviceId // Returning this to the frontend
        }
    };
};