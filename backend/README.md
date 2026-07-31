# Campus Help Desk — Backend

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file (copy `.env.example`) and fill in:
   ```
   MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/campus-helpdesk
   PORT=5000
   JWT_SECRET=some_long_random_string_at_least_32_characters
   NODE_ENV=development
   ```
   Generate a strong `JWT_SECRET` with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

3. Run the server:
   ```
   npm run dev
   ```
   If required env vars are missing, the server will refuse to start and tell you exactly which ones — check the terminal output.

## Auth Endpoints

| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| POST | /api/auth/register | Create a student or admin account | Public |
| POST | /api/auth/login | Log in, returns a JWT | Public |
| GET | /api/auth/me | Get current user from token | Requires token |

Register body example (student):
```json
{ "name": "Zuwairiya", "email": "zuwairiya@svecw.ac.in", "password": "yourpassword", "role": "student", "studentId": "24A91A0512" }
```

Register body example (admin — create this once manually, don't expose signup for admins in the UI):
```json
{ "name": "Warden Office", "email": "admin@svecw.ac.in", "password": "yourpassword", "role": "admin" }
```

Login returns:
```json
{ "token": "eyJ...", "user": { "id": "...", "name": "...", "role": "student", "studentId": "..." } }
```
Send this token on protected requests as: `Authorization: Bearer <token>`

## Complaint Endpoints

| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| POST | /api/complaints | Submit a new complaint | Student (token) |
| GET | /api/complaints | List all complaints, filterable | Admin (token) |
| GET | /api/complaints/mine | Your own complaint history | Student (token) |
| GET | /api/complaints/:complaintId | Track a complaint by ID | Public (tracking-number style, like a courier) |
| PATCH | /api/complaints/:complaintId | Update status/remarks | Admin (token) |
| GET | /api/complaints/stats/summary | Analytics: totals by status/category | Admin (token) |

## What changed in this pass

- **JWT authentication** — `models/User.js`, `routes/auth.js`. Passwords hashed with bcrypt, never stored or returned in plaintext.
- **Role-based authorization** — `middleware/auth.js`. Students can only submit/view their own complaints; only admins can list all complaints, view analytics, or change a status.
- **Input validation** — `middleware/validate.js` (express-validator). Rejects bad category values, short descriptions, invalid emails, weak passwords — server-side, so it can't be bypassed by skipping the frontend form.
- **Centralized error handling** — `middleware/errorHandler.js`. Every route now calls `next(error)` instead of repeating try/catch response logic; one place formats all error responses.
- **Security middleware** — `helmet` (safe HTTP headers), `express-rate-limit` (300 req/15min general, 20 req/15min on auth routes specifically to slow down credential-guessing), `express-mongo-sanitize` (strips `$` / `.` operators from user input to block NoSQL injection).
- **Env validation** — `config/validateEnv.js`. Server refuses to start with a clear message if `MONGO_URI` or `JWT_SECRET` is missing, instead of failing confusingly mid-request.

## Test it (before building frontend auth UI)

```bash
# Register a student
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Student","email":"test@svecw.ac.in","password":"test1234","role":"student","studentId":"24A91A0512"}'

# Log in (copy the returned token)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@svecw.ac.in","password":"test1234"}'

# Submit a complaint using that token
curl -X POST http://localhost:5000/api/complaints \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PASTE_TOKEN_HERE" \
  -d '{"category":"Hostel","description":"Leaking tap in room 204, third floor."}'
```

## Still on the roadmap (not in this pass)

- File/photo upload for complaints
- Email notifications on status change
- Search + pagination on the admin table
- Complaint priority levels (Low/Medium/High)
- Department assignment/routing
- Dashboard charts
- Real-time updates via Socket.IO
- Deployment (Render + Vercel + Atlas)

## Deployment
Deploy the same way you deployed ResumeAI's backend: push to GitHub, deploy on Render, add `MONGO_URI` and `JWT_SECRET` as environment variables in Render's dashboard (never commit `.env`).
