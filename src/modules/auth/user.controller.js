// Ensure these paths point EXACTLY to where your models are
const User = require('../../models/User'); 
const Attendance = require('../../models/Attendance');

exports.getUserProfile = async (req, res) => {
    try {
        // Validation: Check if req.user exists (from protect middleware)
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Not authorized" });
        }

        const user = await User.findById(req.user.id).select('-password');
        
        // Count Present & Late status separately
        const attendedCount = await Attendance.countDocuments({ 
            studentId: req.user.id, 
            status: 'present' 
        });

        const lateCount = await Attendance.countDocuments({ 
            studentId: req.user.id, 
            status: 'late' 
        });
        
        // Get recent history
        const recentHistory = await Attendance.find({ studentId: req.user.id })
            .populate('sessionId', 'courseCode') // Make sure Session model has 'courseCode'
            .sort({ createdAt: -1 })
            .limit(5);

        res.status(200).json({
            success: true,
            user,
            attendedCount,
            lateCount,
            attendanceHistory: recentHistory
        });
    } catch (err) {
        console.error("Profile Logic Error:", err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};