# Finance Backend API

A robust backend system for a finance dashboard with JWT authentication, role-based authorization, and financial record management.

## Tech Stack

- **Runtime**: Node.js with Bun
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT + bcryptjs
- **Validation**: Zod
- **Rate Limiting**: express-rate-limit

## Prerequisites

- Node.js (v18+)
- PostgreSQL database
- Bun runtime (optional, can use npm)

## Installation

```bash
bun install
```

Or with npm:

```bash
npm install
```

## Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/finance-backend"
JWT_SECRET="your-secret-key-here"
PORT=3000
```

## Database Setup

Run Prisma migrations:

```bash
npx prisma migrate dev
```

Generate Prisma Client:

```bash
npx prisma generate
```

## Running the Application

Development mode:

```bash
npm run dev
```

Or with Bun:

```bash
bun run dev
```

Server will start on `http://localhost:3000`

---

## API Documentation

### Base URL
```
http://localhost:3000
```

---

## Authentication Endpoints

### 1. Health Check

**Endpoint**: `GET /`

**Description**: Check if server is running

**Headers**: None

**Request Body**: None

**Response**:
```
Finance Backend Running 🚀
```

**Postman Setup**:
- Method: GET
- URL: `http://localhost:3000/`

---

### 2. User Registration

**Endpoint**: `POST /auth/register`

**Description**: Create a new user account with specified role

**Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "email": "admin@example.com",
  "password": "securepassword123",
  "name": "John Doe",
  "role": "ADMIN"
}
```

**Available Roles**:
- `VIEWER` - Can only view dashboard data
- `ANALYST` - Can view records and access insights
- `ADMIN` - Full access to manage records and users

**Success Response** (201 Created):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "admin@example.com",
  "name": "John Doe",
  "role": "ADMIN",
  "isActive": true,
  "createdAt": "2026-04-03T10:30:00.000Z"
}
```

**Error Response** (409 Conflict):
```json
{
  "message": "User already exists"
}
```

**Postman Setup**:
- Method: POST
- URL: `http://localhost:3000/auth/register`
- Headers:
  - Key: `Content-Type`
  - Value: `application/json`
- Body (raw, JSON):
```json
{
  "email": "admin@example.com",
  "password": "admin123",
  "name": "Admin User",
  "role": "ADMIN"
}
```

**Example: Register VIEWER**:
```json
{
  "email": "viewer@example.com",
  "password": "viewer123",
  "name": "Viewer User",
  "role": "VIEWER"
}
```

**Example: Register ANALYST**:
```json
{
  "email": "analyst@example.com",
  "password": "analyst123",
  "name": "Analyst User",
  "role": "ANALYST"
}
```

---

### 3. User Login

**Endpoint**: `POST /auth/login`

**Description**: Authenticate user and receive JWT token

**Rate Limit**: 5 requests per 15 minutes

**Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Success Response** (200 OK):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJyb2xlIjoiQURNSU4iLCJuYW1lIjoiQWRtaW4gVXNlciIsImlhdCI6MTcxMjE0MTQwMCwiZXhwIjoxNzEyMTQ1MDAwfQ.signature"
}
```

**Error Responses**:

Invalid credentials (400 Bad Request):
```json
{
  "message": "Invalid credentials"
}
```

User disabled (403 Forbidden):
```json
{
  "message": "User disabled"
}
```

Rate limit exceeded (429 Too Many Requests):
```json
{
  "message": "Too many login attempts"
}
```

**Postman Setup**:
- Method: POST
- URL: `http://localhost:3000/auth/login`
- Headers:
  - Key: `Content-Type`
  - Value: `application/json`
- Body (raw, JSON):
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Save Token in Postman**:
1. Go to the "Tests" tab in the request
2. Add this script:
```javascript
pm.environment.set("authToken", pm.response.json().token);
```
3. Now you can use `{{authToken}}` in other requests

---

## Protected Routes (Examples)

These routes require authentication. Add the JWT token in the Authorization header.

### Authentication Required

**Headers**:
```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**Postman Setup for Protected Routes**:
- Headers tab:
  - Key: `Authorization`
  - Value: `Bearer {{authToken}}`

### Example Protected Route

**Endpoint**: `GET /protected`

**Description**: Access protected resource (requires valid JWT)

**Headers**:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Success Response** (200 OK):
```json
{
  "message": "Protected route accessed!",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "role": "ADMIN",
    "name": "Admin User"
  }
}
```

**Error Response - No Token** (401 Unauthorized):
```json
{
  "message": "Unauthorized"
}
```

**Error Response - Invalid Token** (401 Unauthorized):
```json
{
  "message": "Invalid token provided"
}
```

---

## Authorization (Role-Based Access)

### Admin-Only Route Example

**Endpoint**: `GET /admin-only`

**Description**: Access admin-only resource

**Required Role**: `ADMIN`

**Headers**:
```
Authorization: Bearer ADMIN_JWT_TOKEN
```

**Success Response** (200 OK):
```json
{
  "message": "Admin access granted!",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "role": "ADMIN",
    "name": "Admin User"
  }
}
```

**Error Response - Insufficient Permissions** (403 Forbidden):
```json
{
  "message": "Forbidden"
}
```

---

## Postman Collection Setup Guide

### Step 1: Create Environment

1. Click "Environments" in Postman
2. Create new environment: "Finance Backend - Local"
3. Add variables:
   - `baseUrl`: `http://localhost:3000`
   - `authToken`: (leave empty, will be auto-filled on login)
   - `adminToken`: (optional, for storing admin token)
   - `analystToken`: (optional, for storing analyst token)
   - `viewerToken`: (optional, for storing viewer token)

### Step 2: Create Collection

1. Create new collection: "Finance Backend API"
2. Add Authorization at collection level:
   - Type: Bearer Token
   - Token: `{{authToken}}`

### Step 3: Add Requests

Create folders:
- **Authentication** (No auth required)
  - Health Check
  - Register Admin
  - Register Analyst
  - Register Viewer
  - Login
- **Protected Routes** (Auth required)
  - Access Protected Route
  - Admin Only Route

### Step 4: Auto-Save Tokens

For Login request, add to Tests tab:
```javascript
if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    pm.environment.set("authToken", jsonData.token);
    console.log("Token saved:", jsonData.token);
}
```

---

## Testing Workflow in Postman

### Test Authentication Flow

1. **Register three users** (Admin, Analyst, Viewer):
   - Use `/auth/register` with different roles
   - Save emails for login

2. **Login as Admin**:
   - POST `/auth/login`
   - Token auto-saved to `{{authToken}}`

3. **Test Protected Route**:
   - GET `/protected`
   - Should return user details

4. **Login as Viewer**:
   - POST `/auth/login` with viewer credentials
   - Token overwrites `{{authToken}}`

5. **Test Authorization**:
   - GET `/admin-only` with viewer token
   - Should return 403 Forbidden

6. **Test Rate Limiting**:
   - Try login 6 times rapidly
   - 6th attempt should return 429 error

---

## Database Schema

### User Model
```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  password  String
  role      Role
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  records   FinancialRecord[]
}
```

### FinancialRecord Model
```prisma
model FinancialRecord {
  id        String     @id @default(uuid())
  amount    Float
  type      RecordType
  category  String
  date      DateTime
  note      String?
  userId    String
  user      User       @relation(fields: [userId], references: [id])
  createdAt DateTime   @default(now())
}
```

### Enums
```prisma
enum Role {
  VIEWER
  ANALYST
  ADMIN
}

enum RecordType {
  INCOME
  EXPENSE
}
```

---

## Error Codes Reference

| Status Code | Meaning | Example |
|-------------|---------|---------|
| 200 | Success | Login successful |
| 201 | Created | User registered |
| 400 | Bad Request | Invalid credentials, validation error |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Insufficient permissions or disabled user |
| 409 | Conflict | Email already exists |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Internal server error |

---

## JWT Token Structure

**Token Expiry**: 1 hour

**Payload**:
```json
{
  "sub": "user-id",
  "role": "ADMIN",
  "name": "Admin User",
  "iat": 1712141400,
  "exp": 1712145000
}
```

---

## Security Features

- Password hashing with bcryptjs (10 salt rounds)
- JWT-based stateless authentication
- Role-based access control (RBAC)
- Rate limiting on sensitive endpoints
- Input validation with Zod
- Environment variable protection

---

## Development Tools

**Prisma Studio** (Database GUI):
```bash
npx prisma studio
```

**View Database**:
- Opens at `http://localhost:5555`
- View and edit database records

---

## Common Issues & Solutions

### Issue: JWT_SECRET is not set
**Solution**: Ensure `.env` file exists with `JWT_SECRET="your-secret"`

### Issue: Database connection failed
**Solution**: Check PostgreSQL is running and `DATABASE_URL` is correct

### Issue: Port already in use
**Solution**: Change `PORT` in `.env` or kill process using port 3000

### Issue: Token expired
**Solution**: Login again to get new token (tokens expire after 1 hour)

---

## Project Structure

```
finance-backend/
├── src/
│   ├── config/
│   │   └── db.ts                    # Prisma client
│   ├── middleware/
│   │   ├── authenticate.ts          # JWT authentication
│   │   ├── authorize.ts             # Role-based authorization
│   │   └── validate.ts              # Zod validation
│   ├── modules/
│   │   ├── controllers/
│   │   │   └── auth.controller.ts   # Auth logic
│   │   └── routes/
│   │       └── auth.routes.ts       # Auth routes
│   ├── types/
│   │   └── user.types.ts            # TypeScript types
│   ├── utils/
│   │   └── jwt.ts                   # JWT utilities
│   └── index.ts                     # App entry point
├── prisma/
│   ├── schema.prisma                # Database schema
│   └── migrations/                  # DB migrations
├── .env                             # Environment variables
├── package.json
└── tsconfig.json
```

---

## License

ISC

---

## Author

Haricharan
