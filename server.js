require('dotenv').config();
const express = require('express');
const cors = require('cors');
// FIXED PATH: jumping into src/config
const { connectDB } = require('./src/config/db'); 
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');
const app = express();

// Connect to Local MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Strict Route Imports
const authRoutes = require('./src/modules/auth/auth.routes');
const attendanceRoutes = require('./src/modules/attendance/attendance.routes');

// Route Mounting
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Basic Health Check
app.get('/', (req, res) => {
    res.send(`Attendance API is running in ${process.env.NODE_ENV || 'development'} mode.`);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running strictly on port ${PORT}`);
});