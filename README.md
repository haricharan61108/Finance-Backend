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

### Quick Reference - All Endpoints

#### Authentication
- `GET /` - Health check
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get JWT token

#### Financial Records
- `POST /records` - Create financial record
- `GET /records` - Get records with filters (type, category, date range)
- `PUT /records/:id` - Update record
- `DELETE /records/:id` - Delete record

#### Dashboard Analytics
- `GET /analytics/summary` - Get total income, expenses, net balance
- `GET /analytics/category` - Get category-wise totals
- `GET /analytics/recent` - Get 5 most recent transactions
- `GET /analytics/trends` - Get monthly income/expense trends

#### User Management (Admin Only)
- `PATCH /users/:id/role` - Update user role
- `PATCH /users/:id/status` - Enable/disable user account

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
│   │   └── db.ts                          # Prisma client
│   ├── middleware/
│   │   ├── authenticate.ts                # JWT authentication
│   │   ├── authorize.ts                   # Role-based authorization
│   │   └── validate.ts                    # Zod validation
│   ├── modules/
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts         # Auth logic
│   │   │   ├── finance.controller.ts      # Financial records CRUD
│   │   │   ├── user.controller.ts         # User management
│   │   │   └── analytics.controller.ts    # Dashboard analytics
│   │   └── routes/
│   │       ├── auth.routes.ts             # Auth routes
│   │       ├── finance.routes.ts          # Financial records routes
│   │       ├── user.routes.ts             # User management routes
│   │       └── analytics.routes.ts        # Analytics routes
│   ├── types/
│   │   └── user.types.ts                  # TypeScript types
│   ├── utils/
│   │   └── jwt.ts                         # JWT utilities
│   └── index.ts                           # App entry point
├── prisma/
│   ├── schema.prisma                      # Database schema
│   └── migrations/                        # DB migrations
├── .env                                   # Environment variables
├── package.json
└── tsconfig.json
```

---

## Financial Records Management

### 1. Create Financial Record

**Endpoint**: `POST /records`

**Description**: Create a new financial record (income or expense)

**Required Role**: Any authenticated user

**Headers**:
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body**:
```json
{
  "amount": 5000.00,
  "type": "INCOME",
  "category": "Salary",
  "date": "2026-04-01T00:00:00.000Z",
  "note": "Monthly salary payment"
}
```

**Field Details**:
- `amount` (required): Numeric value
- `type` (required): Either "INCOME" or "EXPENSE"
- `category` (required): String (e.g., "Salary", "Rent", "Food")
- `date` (required): ISO 8601 date string
- `note` (optional): Additional description

**Success Response** (201 Created):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "amount": 5000.00,
  "type": "INCOME",
  "category": "Salary",
  "date": "2026-04-01T00:00:00.000Z",
  "note": "Monthly salary payment",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "createdAt": "2026-04-05T10:30:00.000Z"
}
```

**Demo Data - Income Record**:
```json
{
  "amount": 5000.00,
  "type": "INCOME",
  "category": "Salary",
  "date": "2026-04-01T00:00:00.000Z",
  "note": "Monthly salary payment"
}
```

**Demo Data - Expense Record**:
```json
{
  "amount": 1200.00,
  "type": "EXPENSE",
  "category": "Rent",
  "date": "2026-04-02T00:00:00.000Z",
  "note": "Monthly rent payment"
}
```

**Demo Data - Food Expense**:
```json
{
  "amount": 45.50,
  "type": "EXPENSE",
  "category": "Food",
  "date": "2026-04-03T00:00:00.000Z",
  "note": "Grocery shopping"
}
```

**Postman Setup**:
- Method: POST
- URL: `http://localhost:3000/records`
- Headers:
  - `Authorization`: `Bearer {{authToken}}`
  - `Content-Type`: `application/json`

---

### 2. Get Financial Records with Filters

**Endpoint**: `GET /records`

**Description**: Retrieve financial records with optional filtering

**Required Role**: Any authenticated user (returns only user's own records)

**Headers**:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query Parameters** (all optional):
- `type`: Filter by type ("INCOME" or "EXPENSE")
- `category`: Filter by category (e.g., "Salary", "Rent")
- `startDate`: Filter records from this date (ISO 8601)
- `endDate`: Filter records up to this date (ISO 8601)

**Example URLs**:

Get all records:
```
GET http://localhost:3000/records
```

Get only income records:
```
GET http://localhost:3000/records?type=INCOME
```

Get expenses in a specific category:
```
GET http://localhost:3000/records?type=EXPENSE&category=Food
```

Get records in a date range:
```
GET http://localhost:3000/records?startDate=2026-04-01&endDate=2026-04-30
```

Get income records in April 2026:
```
GET http://localhost:3000/records?type=INCOME&startDate=2026-04-01&endDate=2026-04-30
```

**Success Response** (200 OK):
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "amount": 5000.00,
    "type": "INCOME",
    "category": "Salary",
    "date": "2026-04-01T00:00:00.000Z",
    "note": "Monthly salary payment",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2026-04-05T10:30:00.000Z"
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "amount": 1200.00,
    "type": "EXPENSE",
    "category": "Rent",
    "date": "2026-04-02T00:00:00.000Z",
    "note": "Monthly rent payment",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2026-04-05T11:00:00.000Z"
  }
]
```

**Postman Setup**:
- Method: GET
- URL: `http://localhost:3000/records` (add query params as needed)
- Headers:
  - `Authorization`: `Bearer {{authToken}}`

---

### 3. Update Financial Record

**Endpoint**: `PUT /records/:id`

**Description**: Update an existing financial record (users can only update their own records)

**Required Role**: Any authenticated user

**Headers**:
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**URL Parameter**:
- `id`: Record ID to update

**Request Body** (all fields optional):
```json
{
  "amount": 5500.00,
  "type": "INCOME",
  "category": "Salary",
  "date": "2026-04-01T00:00:00.000Z",
  "note": "Updated salary with bonus"
}
```

**Success Response** (200 OK):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "amount": 5500.00,
  "type": "INCOME",
  "category": "Salary",
  "date": "2026-04-01T00:00:00.000Z",
  "note": "Updated salary with bonus",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "createdAt": "2026-04-05T10:30:00.000Z"
}
```

**Error Responses**:

Record not found (404):
```json
{
  "message": "Record not found"
}
```

Not authorized to update (403):
```json
{
  "message": "Not allowed"
}
```

**Demo Data - Update Amount**:
```json
{
  "amount": 5500.00
}
```

**Demo Data - Update Category and Note**:
```json
{
  "category": "Freelance",
  "note": "Freelance project payment"
}
```

**Postman Setup**:
- Method: PUT
- URL: `http://localhost:3000/records/550e8400-e29b-41d4-a716-446655440001`
- Headers:
  - `Authorization`: `Bearer {{authToken}}`
  - `Content-Type`: `application/json`

---

### 4. Delete Financial Record

**Endpoint**: `DELETE /records/:id`

**Description**: Delete a financial record (users can only delete their own records)

**Required Role**: Any authenticated user

**Headers**:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**URL Parameter**:
- `id`: Record ID to delete

**Success Response** (200 OK):
```json
{
  "message": "Deleted successfully"
}
```

**Error Responses**:

Record not found (404):
```json
{
  "message": "Record not found"
}
```

Not authorized to delete (403):
```json
{
  "message": "Not allowed"
}
```

**Postman Setup**:
- Method: DELETE
- URL: `http://localhost:3000/records/550e8400-e29b-41d4-a716-446655440001`
- Headers:
  - `Authorization`: `Bearer {{authToken}}`

---

## Dashboard Analytics

Analytics endpoints provide aggregated data for dashboard visualizations. ADMIN and ANALYST roles can see system-wide analytics, while regular users see only their own data.

### 1. Get Summary Statistics

**Endpoint**: `GET /analytics/summary`

**Description**: Get total income, total expenses, and net balance

**Required Role**: Any authenticated user

**Headers**:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Success Response** (200 OK):
```json
{
  "totalIncome": 15000.00,
  "totalExpense": 8500.00,
  "netBalance": 6500.00
}
```

**Use Cases**:
- Dashboard summary cards
- Financial overview widgets
- Balance display

**Postman Setup**:
- Method: GET
- URL: `http://localhost:3000/analytics/summary`
- Headers:
  - `Authorization`: `Bearer {{authToken}}`

**Role-Based Behavior**:
- **Regular Users**: See their own total income/expenses
- **ADMIN/ANALYST**: See system-wide totals across all users

---

### 2. Get Category-Wise Totals

**Endpoint**: `GET /analytics/category`

**Description**: Get spending/income breakdown by category

**Required Role**: Any authenticated user

**Headers**:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Success Response** (200 OK):
```json
[
  {
    "category": "Salary",
    "_sum": {
      "amount": 5000.00
    }
  },
  {
    "category": "Rent",
    "_sum": {
      "amount": 1200.00
    }
  },
  {
    "category": "Food",
    "_sum": {
      "amount": 450.50
    }
  },
  {
    "category": "Transportation",
    "_sum": {
      "amount": 200.00
    }
  }
]
```

**Use Cases**:
- Pie charts showing spending distribution
- Category budget analysis
- Top spending categories widget
- Expense categorization reports

**Postman Setup**:
- Method: GET
- URL: `http://localhost:3000/analytics/category`
- Headers:
  - `Authorization`: `Bearer {{authToken}}`

**Role-Based Behavior**:
- **Regular Users**: Category breakdown of their own records
- **ADMIN/ANALYST**: Category breakdown across all users

---

### 3. Get Recent Activity

**Endpoint**: `GET /analytics/recent`

**Description**: Get the 5 most recent financial transactions

**Required Role**: Any authenticated user

**Headers**:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Success Response** (200 OK):
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440005",
    "amount": 45.50,
    "type": "EXPENSE",
    "category": "Food",
    "date": "2026-04-05T00:00:00.000Z",
    "note": "Grocery shopping",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2026-04-05T14:30:00.000Z"
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440004",
    "amount": 1200.00,
    "type": "EXPENSE",
    "category": "Rent",
    "date": "2026-04-02T00:00:00.000Z",
    "note": "Monthly rent payment",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2026-04-04T10:00:00.000Z"
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440003",
    "amount": 5000.00,
    "type": "INCOME",
    "category": "Salary",
    "date": "2026-04-01T00:00:00.000Z",
    "note": "Monthly salary",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2026-04-03T09:00:00.000Z"
  }
]
```

**Use Cases**:
- Activity feed/timeline
- Recent transactions list
- Quick overview of latest activity
- Transaction history preview

**Postman Setup**:
- Method: GET
- URL: `http://localhost:3000/analytics/recent`
- Headers:
  - `Authorization`: `Bearer {{authToken}}`

**Role-Based Behavior**:
- **Regular Users**: 5 most recent transactions from their own records
- **ADMIN/ANALYST**: 5 most recent transactions across all users

---

### 4. Get Monthly Trends

**Endpoint**: `GET /analytics/trends`

**Description**: Get month-by-month income and expense breakdown

**Required Role**: Any authenticated user

**Headers**:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Success Response** (200 OK):
```json
{
  "2026-04": {
    "income": 5000.00,
    "expense": 2850.50
  },
  "2026-03": {
    "income": 5000.00,
    "expense": 3200.00
  },
  "2026-02": {
    "income": 5500.00,
    "expense": 2900.00
  },
  "2026-01": {
    "income": 5000.00,
    "expense": 3100.00
  }
}
```

**Response Format**:
- Keys are in `YYYY-MM` format
- Each month contains `income` and `expense` totals
- Months with no activity are not included

**Use Cases**:
- Line charts showing income/expense over time
- Trend analysis
- Month-over-month comparison
- Financial forecasting
- Spending pattern identification

**Postman Setup**:
- Method: GET
- URL: `http://localhost:3000/analytics/trends`
- Headers:
  - `Authorization`: `Bearer {{authToken}}`

**Role-Based Behavior**:
- **Regular Users**: Monthly trends from their own records
- **ADMIN/ANALYST**: Monthly trends across all users

---

## Dashboard Implementation Example

Here's how you would use these endpoints in a dashboard:

### Sample Dashboard Layout

```javascript
// Fetch all analytics data for dashboard
const token = "YOUR_JWT_TOKEN";

// 1. Summary Cards at the top
const summary = await fetch('http://localhost:3000/analytics/summary', {
  headers: { 'Authorization': `Bearer ${token}` }
});
// Display: Total Income | Total Expenses | Net Balance

// 2. Category Breakdown (Pie Chart)
const categories = await fetch('http://localhost:3000/analytics/category', {
  headers: { 'Authorization': `Bearer ${token}` }
});
// Render pie chart with category distribution

// 3. Monthly Trends (Line Chart)
const trends = await fetch('http://localhost:3000/analytics/trends', {
  headers: { 'Authorization': `Bearer ${token}` }
});
// Render line chart showing income vs expenses over time

// 4. Recent Activity (List)
const recent = await fetch('http://localhost:3000/analytics/recent', {
  headers: { 'Authorization': `Bearer ${token}` }
});
// Display list of 5 most recent transactions
```

### Testing Analytics Workflow

1. **Login and create sample data**:
```bash
# Login as admin
POST /auth/login
{
  "email": "admin@example.com",
  "password": "admin123"
}

# Create multiple records across different months
POST /records
{ "amount": 5000, "type": "INCOME", "category": "Salary", "date": "2026-01-01" }

POST /records
{ "amount": 5000, "type": "INCOME", "category": "Salary", "date": "2026-02-01" }

POST /records
{ "amount": 5000, "type": "INCOME", "category": "Salary", "date": "2026-03-01" }

POST /records
{ "amount": 1200, "type": "EXPENSE", "category": "Rent", "date": "2026-01-02" }

POST /records
{ "amount": 300, "type": "EXPENSE", "category": "Food", "date": "2026-01-15" }

POST /records
{ "amount": 150, "type": "EXPENSE", "category": "Transportation", "date": "2026-01-20" }
```

2. **Check Summary**:
```bash
GET /analytics/summary
# Should show: income: 15000, expense: 1650, net: 13350
```

3. **Check Category Breakdown**:
```bash
GET /analytics/category
# Should show totals for: Salary, Rent, Food, Transportation
```

4. **Check Trends**:
```bash
GET /analytics/trends
# Should show monthly breakdown for Jan, Feb, Mar 2026
```

5. **Check Recent Activity**:
```bash
GET /analytics/recent
# Should show last 5 transactions (most recent first)
```

---

## User Management (Admin Only)

### 1. Update User Role

**Endpoint**: `PATCH /users/:id/role`

**Description**: Update a user's role (Admin only)

**Required Role**: ADMIN

**Headers**:
```
Authorization: Bearer ADMIN_JWT_TOKEN
Content-Type: application/json
```

**URL Parameter**:
- `id`: User ID to update

**Request Body**:
```json
{
  "role": "ANALYST"
}
```

**Available Roles**:
- `VIEWER` - Can only view dashboard data
- `ANALYST` - Can view records and access insights
- `ADMIN` - Full access to manage records and users

**Success Response** (200 OK):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440003",
  "email": "user@example.com",
  "name": "User Name",
  "role": "ANALYST",
  "isActive": true,
  "createdAt": "2026-04-05T10:00:00.000Z"
}
```

**Demo Data - Promote to Admin**:
```json
{
  "role": "ADMIN"
}
```

**Demo Data - Change to Analyst**:
```json
{
  "role": "ANALYST"
}
```

**Demo Data - Demote to Viewer**:
```json
{
  "role": "VIEWER"
}
```

**Postman Setup**:
- Method: PATCH
- URL: `http://localhost:3000/users/550e8400-e29b-41d4-a716-446655440003/role`
- Headers:
  - `Authorization`: `Bearer {{authToken}}` (must be admin token)
  - `Content-Type`: `application/json`

---

### 2. Update User Status

**Endpoint**: `PATCH /users/:id/status`

**Description**: Enable or disable a user account (Admin only)

**Required Role**: ADMIN

**Headers**:
```
Authorization: Bearer ADMIN_JWT_TOKEN
Content-Type: application/json
```

**URL Parameter**:
- `id`: User ID to update

**Request Body**:
```json
{
  "isActive": false
}
```

**Success Response** (200 OK):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440003",
  "email": "user@example.com",
  "name": "User Name",
  "role": "ANALYST",
  "isActive": false,
  "createdAt": "2026-04-05T10:00:00.000Z"
}
```

**Demo Data - Disable User**:
```json
{
  "isActive": false
}
```

**Demo Data - Enable User**:
```json
{
  "isActive": true
}
```

**Postman Setup**:
- Method: PATCH
- URL: `http://localhost:3000/users/550e8400-e29b-41d4-a716-446655440003/status`
- Headers:
  - `Authorization`: `Bearer {{authToken}}` (must be admin token)
  - `Content-Type`: `application/json`

---

## Complete Testing Workflow

### Setup Phase

1. **Register Admin User**:
```json
POST /auth/register
{
  "email": "admin@example.com",
  "password": "admin123",
  "name": "Admin User",
  "role": "ADMIN"
}
```

2. **Register Analyst User**:
```json
POST /auth/register
{
  "email": "analyst@example.com",
  "password": "analyst123",
  "name": "Analyst User",
  "role": "ANALYST"
}
```

3. **Register Viewer User**:
```json
POST /auth/register
{
  "email": "viewer@example.com",
  "password": "viewer123",
  "name": "Viewer User",
  "role": "VIEWER"
}
```

### Testing Financial Records

4. **Login as Admin**:
```json
POST /auth/login
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

5. **Create Income Record**:
```json
POST /records
{
  "amount": 5000.00,
  "type": "INCOME",
  "category": "Salary",
  "date": "2026-04-01T00:00:00.000Z",
  "note": "Monthly salary"
}
```

6. **Create Multiple Expenses**:
```json
POST /records
{
  "amount": 1200.00,
  "type": "EXPENSE",
  "category": "Rent",
  "date": "2026-04-02T00:00:00.000Z"
}

POST /records
{
  "amount": 300.00,
  "type": "EXPENSE",
  "category": "Food",
  "date": "2026-04-03T00:00:00.000Z"
}
```

7. **Get All Records**:
```
GET /records
```

8. **Get Only Expenses**:
```
GET /records?type=EXPENSE
```

9. **Update a Record** (use actual ID from response):
```json
PUT /records/{record-id}
{
  "amount": 1250.00,
  "note": "Updated rent amount"
}
```

10. **Delete a Record**:
```
DELETE /records/{record-id}
```

### Testing User Management (Admin Only)

11. **Change User Role**:
```json
PATCH /users/{analyst-user-id}/role
{
  "role": "ADMIN"
}
```

12. **Disable User Account**:
```json
PATCH /users/{viewer-user-id}/status
{
  "isActive": false
}
```

13. **Re-enable User Account**:
```json
PATCH /users/{viewer-user-id}/status
{
  "isActive": true
}
```

### Testing Authorization

14. **Login as Viewer**:
```json
POST /auth/login
{
  "email": "viewer@example.com",
  "password": "viewer123"
}
```

15. **Try to Update User Role** (should fail with 403):
```json
PATCH /users/{some-user-id}/role
{
  "role": "ADMIN"
}
```

---

## License

ISC

---

## Author

Haricharan
