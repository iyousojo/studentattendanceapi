const express = require('express');
const cors = require('cors');
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Strict Route Mapping
const authRoutes = require('./src/modules/auth/auth.routes');
const attendanceRoutes = require('./src/modules/attendance/attendance.routes');

app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);

// Health Check
app.get('/', (req, res) => res.send('Attendance API Active'));

module.exports = app;