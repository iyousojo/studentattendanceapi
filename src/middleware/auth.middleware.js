const jwt = require('jsonwebtoken');

exports.protect = async (req, res, next) => {
    let token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: "Not authorized, no token" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Contains { id, role }
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: "Token is invalid" });
    }
};

exports.isProfessor = (req, res, next) => {
    if (req.user && req.user.role === 'professor') {
        next();
    } else {
        res.status(403).json({ success: false, message: "Access denied: Professors only" });
    }
};