const authService = require('./auth.service');

// @desc    Register a new user
exports.register = async (req, res) => {
    try {
        const user = await authService.registerUser(req.body);
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            userId: user._id
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Authenticate user & Bind/Verify Hardware Device
exports.login = async (req, res) => {
    try {
        // 1. Capture the email, password, and the system-generated deviceId from the frontend
        const { email, password, deviceId } = req.body;

        // 2. Pass the deviceId to the service logic we created earlier
        const result = await authService.loginUser(email, password, deviceId);

        // 3. Return the success response including the user data and JWT token
        res.status(200).json({
            success: true,
            ...result
        });
    } catch (err) {
        // 4. If the hardware binding fails (Unauthorized Terminal), 
        // the service throws an error which we catch here.
        res.status(401).json({ 
            success: false, 
            message: err.message 
        });
    }
};