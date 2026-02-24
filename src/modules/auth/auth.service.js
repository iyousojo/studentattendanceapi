const User = require('../../models/User');
const jwt = require('jsonwebtoken');

// @desc    Logic for registering a user
exports.registerUser = async (userData) => {
    const userExists = await User.findOne({ email: userData.email });
    if (userExists) throw new Error('User already exists');

    return await User.create(userData);
};

// @desc    Logic for authenticating a user
exports.loginUser = async (email, password) => {
    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    if (!user) throw new Error('Invalid credentials');

    // Check password using the method we defined in the User model
    const isMatch = await user.matchPassword(password);
    if (!isMatch) throw new Error('Invalid credentials');

    // Generate JWT
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
            role: user.role
        }
    };
};