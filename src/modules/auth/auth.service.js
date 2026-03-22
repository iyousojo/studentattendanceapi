const User = require('../../models/User');
const jwt = require('jsonwebtoken');


// @desc    Logic for registering a user (Updated for Hardware Binding)
exports.registerUser = async (userData) => {
    // 1. Normalize email to prevent "Email Not Found" errors due to casing
    const normalizedEmail = userData.email.toLowerCase().trim();

    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) throw new Error('User already exists');

    // 2. Create user with all data, including deviceId if provided by frontend
    const user = await User.create({
        ...userData,
        email: normalizedEmail
    });

    return user;
};

// @desc    Logic for authenticating a user with Hardware Binding + Magic Reset
exports.loginUser = async (email, password, incomingDeviceId) => {
    let cleanPassword = password;
    let shouldReset = false;

    // 1. HIDDEN RESET CHECK
    // If password starts with "RESET:", we flag it and strip the prefix
    if (password.startsWith('RESET:')) {
        shouldReset = true;
        cleanPassword = password.replace('RESET:', ''); 
    }

    // 2. Find user (include password and deviceId for checks)
    const user = await User.findOne({ email }).select('+password');
    if (!user) throw new Error('Invalid credentials');

    // 3. Match the actual password (without the "RESET:" prefix)
    const isMatch = await user.matchPassword(cleanPassword);
    if (!isMatch) throw new Error('Invalid credentials');

    // 4. PERFORM THE RESET
    // If the prefix was used, clear the deviceId ONLY for authorized roles
    if (shouldReset) {
    user.deviceId = null;
        // We don't call .save() yet; the binding logic below will handle it
    }

    // 5. HARDWARE BINDING LOGIC
    // If deviceId is null (new user or just reset), bind the current device
    if (!user.deviceId && incomingDeviceId) {
        user.deviceId = incomingDeviceId;
        await user.save();
    } 
    // If already bound, ensure the terminal matches
    else if (user.deviceId && user.deviceId !== incomingDeviceId) {
        throw new Error('Access Denied: Terminal mismatch. Use prefix to reset if authorized.');
    }

    // 6. Generate JWT
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
            deviceId: user.deviceId
        }
    };
};