const express = require('express');
const { errorHandler } = require('./middleware/errorMiddleware');
const connectDB = require('./config/db');
// Import your routes
const authRoutes = require('./src/modules/auth/auth.routes'); 
require('dotenv').config();

const app = express();

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// MOUNT YOUR ROUTES HERE
app.use('/api/auth', authRoutes);

app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working!' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));
// REMOVED THE EXTRA }; THAT WAS CAUSING THE ERROR