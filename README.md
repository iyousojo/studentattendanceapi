# Student Attendance API 📋

[![Node.js](https://img.shields.io/badge/Node.js-v20-green)](https://nodejs.org) [![MongoDB](https://img.shields.io/badge/MongoDB-4.4+-47A248)](https://mongodb.com) [![Express](https://img.shields.io/badge/Express-4.x-blue)](https://expressjs.com)

## 🚀 Overview
Modern classroom attendance system using **QR Codes**, **Geofencing**, **Device Binding**, and **Manual fallback**.
- **Professors**: Create sessions → Generate QR/backup code → Set geofence radius and timing.
- **Students**: Scan QR (auto geo-verify) or use a backup code/manual entry.
- **JWT Auth**, role-based access (student/professor/admin), device-bound login, and attendance history.
- Real-time tracking, stats, session history, and active attendance deployment views.

## ✨ Features
- 🔐 Secure JWT authentication (register/login/profile)
- 📱 Device binding/terminal verification during login and QR attendance scans
- 📱 QR-based attendance with location verification
- 🌍 Geofence radius for campus validation
- 🔢 Backup code/manual fallback for situations where QR scanning is unavailable
- ⏱️ Late vs present status based on session timing thresholds
- 👨‍🏫 Professor dashboard: active sessions, history, details
- 📊 Student stats & personal attendance
- 💾 MongoDB with Mongoose ODM
- 🛡️ Middleware: auth protection, professor role check, and admin role support
- 📚 Swagger documentation and health check endpoint

## 🛠️ Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- QR scanner app (e.g. phone camera)
- Optional: frontend/client that can send a device identifier for the device-binding flow

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
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/attendance
   JWT_SECRET=your-super-secret-jwt-key-here-min32chars
   ```

3. **Run Server**
   ```bash
   npm run dev  # or npm start
   ```
   Server: `http://localhost:3000`

4. **Swagger Docs**
   Visit: `http://localhost:3000/api-docs`

5. **Health Check**
   ```bash
   curl http://localhost:3000/
   ```

## 🌐 API Endpoints

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/api/auth/register` | Create account | No | - |
| POST | `/api/auth/login` | Get JWT token and bind device | No | - |
| GET | `/api/auth/profile` | User profile | Yes | Any |
| POST | `/api/attendance/session` | Start session (QR + geofence + backup code) | Yes | Professor |
| POST | `/api/attendance/scan` | Mark via QR scan | Yes | Student |
| POST | `/api/attendance/manual` | Manual mark using backup code | Yes | Student |
| GET | `/api/attendance/list` | Session attendance | Yes | Any |
| GET | `/api/attendance/professor/sessions` | Prof history | Yes | Professor |
| GET | `/api/attendance/session-details/:sessionId` | Session details | Yes | Professor |
| GET | `/api/attendance/student/stats` | Personal stats | Yes | Student |
| GET | `/api/attendance/active-deployments` | Active sessions | Yes | Any |

> Notes:
> - Login requests can include a `deviceId` field to bind the current device to the account.
> - QR scan requests should include the `x-device-id` header when a device is already bound.
> - Manual attendance still requires proximity validation when coordinates are provided.

## 💾 Database Models

### User
```js
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: ['student', 'professor', 'admin'],
  deviceId: String | null,
  faculty: String,
  department: String
}
```

### Session
```js
{
  professorId: ObjectId,
  courseCode: String,
  location: { lat: Number, lng: Number },
  qrToken: String,
  radius: Number, // meters
  durationMins: Number,
  lateAfterMins: Number,
  startAt: Date,
  expiresAt: Date,
  isActive: Boolean,
  backupCode: String,
  backupExpiresAt: Date
}
```

### Attendance
```js
{
  studentId: ObjectId,
  sessionId: ObjectId,
  status: ['present', 'late'],
  method: ['scan', 'manual'],
  location: { lat: Number, lng: Number },
  distance: Number,
  recordedAccuracy: Number
}
```

## 💻 Usage Examples

### 1. Professor starts session
```bash
curl -X POST http://localhost:3000/api/attendance/session \
  -H "Authorization: Bearer <prof_jwt>" \
  -H "Content-Type: application/json" \
  -d '{"courseCode":"CS101","lat":37.7749,"lng":-122.4194,"radius":50,"durationMins":60,"lateAfterMins":15}'
```
Response: `{ "qrToken": "<generated-token>", "backupCode": "<6-digit-code>", ... }` → Display QR/backup code to class.

### 2. Student logs in with a device
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@example.com","password":"password123","deviceId":"device-001"}'
```

### 3. Student scans QR
```bash
curl -X POST http://localhost:3000/api/attendance/scan \
  -H "Authorization: Bearer <student_jwt>" \
  -H "x-device-id: device-001" \
  -H "Content-Type: application/json" \
  -d '{"qrToken": "<session-token>", "lat": 37.775, "lng": -122.42}'
```

### 4. Student uses manual backup code
```bash
curl -X POST http://localhost:3000/api/attendance/manual \
  -H "Authorization: Bearer <student_jwt>" \
  -H "Content-Type: application/json" \
  -d '{"code":"123456","lat":37.775,"lng":-122.42}'
```

### 5. Check attendance
```bash
curl -X GET "http://localhost:3000/api/attendance/list" \
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
- Device-based auth should be handled securely from the client
- Cloudinary for profile pics (if added)

## 🤝 Contributing
1. Fork & PR
2. Follow ESLint/Prettier
3. Update tests & docs

## 📄 License
MIT

