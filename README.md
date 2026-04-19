# Student Attendance API 📋

[![Node.js](https://img.shields.io/badge/Node.js-v20-green)](https://nodejs.org) [![MongoDB](https://img.shields.io/badge/MongoDB-4.4+-47A248)](https://mongodb.com) [![Express](https://img.shields.io/badge/Express-4.x-blue)](https://expressjs.com)

## 🚀 Overview
Modern classroom attendance system using **QR Codes**, **Geofencing**, and **Manual fallback**. 
- **Professors**: Create sessions → Generate QR → Set geofence radius.
- **Students**: Scan QR (auto geo-verify) or manual entry.
- **JWT Auth**, Role-based access (professor/student).
- Real-time tracking, stats, history.

## ✨ Features
- 🔐 Secure JWT authentication (register/login/profile)
- 📱 QR-based attendance with location verification
- 🌍 Geofence radius for campus validation
- 👨‍🏫 Professor dashboard: active sessions, history, details
- 📊 Student stats & personal attendance
- 💾 MongoDB with Mongoose ODM
- 🛡️ Middleware: auth protection, professor role check

## 🛠️ Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- QR scanner app (e.g. phone camera)

## 📦 Quick Start

1. **Clone & Install**
   ```bash
   git clone <repo>
   cd studentattendanceapi
   npm install
   ```

2. **Environment Setup** (.env file)
   ```
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/attendance
   JWT_SECRET=your-super-secret-jwt-key-here-min32chars
   ```

3. **Run Server**
   ```bash
   npm run dev  # or node server.js
   ```
   Server: `http://localhost:5000`

4. **Swagger Docs**
   Visit: `http://localhost:5000/api-docs` (if swagger-ui-express configured)

## 🌐 API Endpoints

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/api/auth/register` | Create account | No | - |
| POST | `/api/auth/login` | Get JWT token | No | - |
| GET | `/api/auth/profile` | User profile | Yes | Any |
| POST | `/api/attendance/session` | Start session (QR+geofence) | Yes | Professor |
| POST | `/api/attendance/scan` | Mark via QR scan | Yes | Student |
| POST | `/api/attendance/manual` | Manual mark | Yes | Student |
| GET | `/api/attendance/list` | Session attendance | Yes | Any |
| GET | `/api/attendance/professor/sessions` | Prof history | Yes | Professor |
| GET | `/api/attendance/session-details/:id` | Session details | Yes | Professor |
| GET | `/api/attendance/student/stats` | Personal stats | Yes | Student |
| GET | `/api/attendance/active-deployments` | Active sessions | Yes | Any |

## 💾 Database Models

### User
```js
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: ['student', 'professor'],
  faculty: String,
  department: String
}
```

### Session
```js
{
  professorId: ObjectId,
  qrCode: String,
  geofence: { lat: Number, lng: Number, radius: Number }, // meters
  startTime: Date,
  endTime: Date,
  status: ['active', 'closed'],
  attendanceCount: Number
}
```

### Attendance
```js
{
  studentId: ObjectId,
  sessionId: ObjectId,
  timestamp: Date,
  method: ['qr_scan', 'manual', 'geofence'],
  location: { lat: Number, lng: Number },
  verified: Boolean
}
```

## 💻 Usage Examples

### 1. Professor starts session
```bash
curl -X POST http://localhost:5000/api/attendance/session \
  -H "Authorization: Bearer <prof_jwt>" \
  -H "Content-Type: application/json" \
  -d '{"geofence": {"lat": 37.7749, "lng": -122.4194, "radius": 50}, "durationMinutes": 60}'
```
Response: `{ "qrCode": "QR_SESSION_ABC123", ... }` → Display QR to class.

### 2. Student scans QR
```bash
curl -X POST http://localhost:5000/api/attendance/scan \
  -H "Authorization: Bearer <student_jwt>" \
  -H "Content-Type: application/json" \
  -d '{"qrCode": "QR_SESSION_ABC123", "location": {"lat": 37.775, "lng": -122.42}}'
```

### 3. Check attendance
```bash
curl -X GET "http://localhost:5000/api/attendance/list?sessionId=..." \
  -H "Authorization: Bearer <jwt>"
```

## 🧪 Testing
```bash
npm test  # Add tests for controllers/services
```

## 🚀 Production
- PM2: `pm2 start ecosystem.config.js`
- Dockerize MongoDB
- HTTPS + Rate limiting
- Cloudinary for profile pics (if added)

## 🤝 Contributing
1. Fork & PR
2. Follow ESLint/Prettier
3. Update tests & docs

## 📄 License
MIT

