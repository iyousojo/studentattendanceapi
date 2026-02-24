const authService = require('./auth.service');

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

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await authService.loginUser(email, password);
        res.status(200).json({
            success: true,
            ...result
        });
    } catch (err) {
        res.status(401).json({ success: false, message: err.message });
    }
};
exports.getUserProfile = async (req, res) => {
    try {
        // req.user.id comes from your 'protect' middleware
        const user = await User.findById(req.user.id).select('-password');
        
        // Get Attendance Stats for this specific student
        const attendedCount = await Attendance.countDocuments({ studentId: req.user.id });
        
        // Get Recent History (last 5 records)
        const recentHistory = await Attendance.find({ studentId: req.user.id })
            .populate('sessionId', 'courseCode')
            .sort({ createdAt: -1 })
            .limit(5);

        res.status(200).json({
            success: true,
            user,
            attendanceCount: attendedCount,
            lateCount: 0, // You can add logic for 'late' based on session start time later
            attendanceHistory: recentHistory
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};