# 🛠️ Student Attendance API

[![Node.js](https://img.shields.io/badge/Node.js-v20-green)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-blue)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.x-green)](https://mongodb.com/)

**Backend API for secure faculty-led student attendance tracking using QR codes, geofencing (via geo.util.js), and manual fallback. Version 1.0.0**

## 🚀 Quick Start (Local)

1. **Clone & Install**
   ```bash
   git clone <repo>
   cd studentattendanceapi
   npm install
   ```

2. **Environment Setup** (`.env`)
   ```
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/attendance_db
   JWT_SECRET=your-super-secret-jwt-key-min32chars
   ```

3. **Run Server**
   ```bash
   npm run dev  # Development with nodemon
   # or
   npm start    # Production
   ```

   Server runs at `http://localhost:3000`

## 📡 Base URL
`http://localhost:3000`

## 🏗️ Architecture
- **Framework**: Express.js with modular routes/services/repo pattern.
- **Database**: MongoDB (Mongoose ODM) - Models: `User` (faculty/student), `Session`, `Attendance`.
- **Auth**: JWT tokens, bcrypt hashing, RBAC middleware (`protect`, `isProfessor`).
- **Features**: Geofencing (`geo.util.js`), QR/session scanning, dashboard stats.

## 🔐 Security
- JWT stateless authentication.
- Role-Based Access Control (RBAC): Professor-only for session management.
- Password hashing with bcryptjs.
- CORS enabled.

## 📋 API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Register new faculty/student | None |
| POST | `/login` | Login & receive JWT | None |
| GET | `/profile` | User profile & stats | Required |

### Attendance (`/api/attendance`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/session` | Start new session (QR/geofence) | Professor |
| POST | `/scan` | Mark attendance via scan | User |
| POST | `/manual` | Manual attendance entry | User |
| GET | `/list` | Attendance records list | User |
| GET | `/professor/sessions` | Professor session history | Professor |
| GET | `/session-details/:sessionId` | Session details | Professor |
| GET | `/student/stats` | Student stats | User |
| GET | `/active-deployments` | Active sessions | User |

**Health Check**: `GET /` - Server status.

**API Documentation**: Interactive Swagger UI available (see swagger.yaml).

## 📦 Scripts
- `npm run dev` - Dev server with nodemon (server.js).
- `npm start` - Prod server.

## 🛠️ Deployment
- **Heroku/Render**: Set env vars, `npm start`.
- **Docker**: Add Dockerfile for containerization.

## 🤝 Contributing
1. Fork & PR.
2. Follow existing code style.

## 📄 License
ISC

**Developed with ❤️ for efficient classroom attendance.**

