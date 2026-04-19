## 📋 Database Models

### User
- Fields: name, email, password (hashed), role (student/professor).
- Auth: JWT issued on login.

### Session
- Professor-created: QR code, geofence radius/location, start/end time, active status.

### Attendance
- Links student, session, timestamp, method (scan/manual/geo), location data.

