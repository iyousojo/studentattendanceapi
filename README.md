.

🛠️ Faculty Terminal API | Documentation
This is the core engine for the Student Attendance System. It handles secure faculty authentication, student record management, geofencing validation

🔗 Base URL
https://studentattendanceapi-v4hq.onrender.com/api

📡 System Architecture
The API follows a RESTful architecture with middleware layers for authentication and role-based access control.

Auth Layer: JWT-based stateless authentication.

Storage: MongoDB (NoSQL) for flexible student/faculty schemas.

Cache/Limit Layer: Upstash Redis for handling session synchronization and rate limiting.



🔐 Security Protocols
Terminal Fingerprinting: The API validates the deviceId header to ensure requests originate from a registered hardware node.

RBAC (Role-Based Access Control): Specific endpoints (e.g., /students, /geofence) are restricted to users with the professor or admin role.

Password Hashing: Implemented using Argon2 or BCrypt to ensure data-at-rest security.

🚀 API Endpoints
Authentication
Method	Endpoint	Description
POST	/auth/register	Initializes a new Faculty Registry Node.
POST	/auth/login	Validates credentials and returns a JWT.
Attendance & Sessions
Method	Endpoint	Description
GET	/sessions	Fetches all past and active broadcast logs.
POST	/sessions/start	Generates a new secure QR/Geofence session.
PATCH	/sessions/:id	Updates session status (Active/Closed).
Student Management
Method	Endpoint	Description
GET	/students	Retrieves the full student directory.
POST	/students/verify	Validates a student's check-in via GPS + QR.

🛠️ Environment Configuration
To run this API locally, create a .env file in the root directory:

Code snippet
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_cipher
UPSTASH_REDIS_URL=your_redis_url

📦 Local Deployment
Install dependencies:

Bash
npm install
Start development server:

Bash
npm run dev
Production build:

Bash
npm start
⚠️ Important Notes
Render Cold Starts: This API is hosted on a Render free instance. If inactive, the service will "sleep." The first request may take up to 50 seconds to wake the server.

CORS Policy: The API is configured to accept requests only from authorized Vercel domains. Update your cors middleware when adding new frontend deployments.

📜 Error Code Registry
401 Unauthorized: Missing or invalid JWT.

403 Forbidden: Role mismatch (Student attempting to access Faculty data).

429 Too Many Requests: Redis rate limit triggered.

503 Service Unavailable: Database or Redis connection failure.

Developed by solomon johnbull iyoubhebhe