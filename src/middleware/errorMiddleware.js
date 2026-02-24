// const express = require('express');
// const { errorHandler } = require('./middleware/errorMiddleware');
// const connectDB = require('./config/db');
// require('dotenv').config();

// const app = express();

// // 1. Connect to DB
// connectDB();

// // 2. Body Parser Middleware (Built-in)
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));

// // 3. Routes (Example)
// app.get('/api/test', (req, res) => {
//     res.json({ message: 'API is working!' });
// });

// // 4. Error Handler Middleware (Must be last)
// app.use(errorHandler);

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));