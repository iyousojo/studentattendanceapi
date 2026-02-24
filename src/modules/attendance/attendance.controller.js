const attendanceService = require('./attendance.service');

exports.startSession = async (req, res) => {
    try {
        // req.user.id comes from the 'protect' middleware
        const session = await attendanceService.createClassSession(req.user.id, req.body);
        res.status(201).json({ success: true, data: session });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.markAttendance = async (req, res) => {
    try {
        const record = await attendanceService.processStudentScan(req.user.id, req.body);
        res.status(200).json({ 
            success: true, 
            message: "Attendance marked successfully!",
            data: record 
        });
    } catch (err) {
        res.status(403).json({ success: false, message: err.message });
    }
};
// @desc    Get all attendance records (with student names)
// @route   GET /api/attendance/list
exports.getAttendanceList = async (req, res) => {
    try {
        const Attendance = require('../../models/Attendance');
        // This 'populates' the ID with the actual name/email from the User model
        const list = await Attendance.find()
            .populate('studentId', 'name email')
            .populate('sessionId', 'courseCode');

        res.status(200).json({
            success: true,
            count: list.length,
            data: list
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};