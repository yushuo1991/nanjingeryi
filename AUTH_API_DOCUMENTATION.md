# JWT Authentication API Documentation

## Overview

The backend now includes JWT-based authentication and role-based authorization. All patient-related endpoints require authentication, and some require specific roles.

## Default Users (Development/Testing)

The system automatically creates three default users on first run:

| Username | Password | Role | Name | Permissions |
|----------|----------|------|------|-------------|
| `doctor` | `doctor123` | doctor | 张医生 | Full access (create, read, update, delete patients) |
| `therapist` | `therapist123` | therapist | 李治疗师 | Read and update patients |
| `admin` | `admin123` | admin | 管理员 | Full system access |

**IMPORTANT**: Change these passwords in production!

## Authentication Endpoints

### 1. Register User (POST /api/auth/register)

Create a new user account.

**Request:**
```bash
curl -X POST http://localhost:3201/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "password": "password123",
    "name": "新用户",
    "role": "therapist"
  }'
```

**Request Body:**
- `username` (required): 3-20 characters, alphanumeric and underscore only
- `password` (required): Minimum 6 characters
- `name` (required): Display name
- `role` (optional): One of `therapist`, `doctor`, `admin` (defaults to `therapist`)

**Response (201 Created):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 4,
    "username": "newuser",
    "name": "新用户",
    "role": "therapist"
  }
}
```

**Error Responses:**
- `400`: Invalid input (username format, password length, etc.)
- `409`: Username already exists
- `500`: Server error

---

### 2. Login (POST /api/auth/login)

Authenticate and receive a JWT token.

**Request:**
```bash
curl -X POST http://localhost:3201/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "doctor",
    "password": "doctor123"
  }'
```

**Request Body:**
- `username` (required): Username
- `password` (required): Password

**Response (200 OK):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "doctor",
    "name": "张医生",
    "role": "doctor"
  }
}
```

**Error Responses:**
- `400`: Missing username or password
- `401`: Invalid credentials
- `500`: Server error

**Token Details:**
- Expires in 7 days
- Must be included in `Authorization` header for protected endpoints
- Format: `Bearer <token>`

---

### 3. Get Current User (GET /api/auth/me)

Get information about the currently authenticated user.

**Request:**
```bash
curl -X GET http://localhost:3201/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "doctor",
    "name": "张医生",
    "role": "doctor",
    "createdAt": "2026-02-06 10:30:00"
  }
}
```

**Error Responses:**
- `401`: No token provided or invalid token
- `404`: User not found
- `500`: Server error

---

## Protected Patient Endpoints

All patient endpoints now require authentication. Include the JWT token in the `Authorization` header.

### Authorization Header Format
```
Authorization: Bearer <your-jwt-token>
```

### Endpoint Permissions

| Endpoint | Method | Required Role | Description |
|----------|--------|---------------|-------------|
| `/api/patients` | GET | Any authenticated user | List all patients |
| `/api/patients` | POST | `doctor` | Create new patient |
| `/api/patients/:id` | PUT | Any authenticated user | Update patient |
| `/api/patients/:id` | DELETE | `doctor` | Delete patient |
| `/api/patients/:id/report.pdf` | GET | Any authenticated user | Generate PDF report |
| `/api/patients/:id/generate-log` | POST | Any authenticated user | Generate treatment log |

### Example: List Patients (Authenticated)

```bash
# First, login to get token
TOKEN=$(curl -s -X POST http://localhost:3201/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"doctor","password":"doctor123"}' \
  | jq -r '.token')

# Then use token to access protected endpoint
curl -X GET http://localhost:3201/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### Example: Create Patient (Doctor Only)

```bash
# Login as doctor
TOKEN=$(curl -s -X POST http://localhost:3201/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"doctor","password":"doctor123"}' \
  | jq -r '.token')

# Create patient
curl -X POST http://localhost:3201/api/patients \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patient": {
      "name": "测试患者",
      "age": "5岁",
      "gender": "男",
      "bedNo": "101",
      "department": "康复科",
      "diagnosis": "脑瘫"
    }
  }'
```

### Example: Try to Create Patient as Therapist (Should Fail)

```bash
# Login as therapist
TOKEN=$(curl -s -X POST http://localhost:3201/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"therapist","password":"therapist123"}' \
  | jq -r '.token')

# Try to create patient (will fail with 403)
curl -X POST http://localhost:3201/api/patients \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patient": {
      "name": "测试患者",
      "age": "5岁",
      "gender": "男"
    }
  }'
```

**Expected Response (403 Forbidden):**
```json
{
  "success": false,
  "error": "Insufficient permissions",
  "required": ["doctor"],
  "current": "therapist"
}
```

---

## Public Endpoints (No Authentication Required)

These endpoints remain publicly accessible:

- `GET /api/health` - Health check
- `GET /api/cache/stats` - Cache statistics
- `POST /api/cases` - Upload medical records for AI processing
- `GET /api/cases/:id` - Get case details
- `GET /api/cases/:id/files` - Get case files
- `GET /api/cases/:id/files/:fileId` - Download case file
- `POST /api/cases/:id/extract` - AI extract patient info
- `POST /api/cases/:id/analyze` - AI analyze and generate plan
- `POST /api/cases/:id/plan` - AI generate treatment plan

---

## Error Responses

### Authentication Errors

**401 Unauthorized - No Token:**
```json
{
  "success": false,
  "error": "No authorization token provided"
}
```

**401 Unauthorized - Invalid Token:**
```json
{
  "success": false,
  "error": "Invalid token"
}
```

**401 Unauthorized - Expired Token:**
```json
{
  "success": false,
  "error": "Token expired"
}
```

### Authorization Errors

**403 Forbidden - Insufficient Permissions:**
```json
{
  "success": false,
  "error": "Insufficient permissions",
  "required": ["doctor"],
  "current": "therapist"
}
```

---

## Environment Variables

Add to `server/.env`:

```bash
# JWT Authentication
JWT_SECRET=your_secure_random_string_here
```

**Generate a secure secret:**
```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Using OpenSSL
openssl rand -base64 32
```

---

## Security Best Practices

1. **Change Default Passwords**: The default users are for development only. Change passwords in production.

2. **Secure JWT_SECRET**: Use a strong, random secret in production. Never commit it to version control.

3. **HTTPS Only**: In production, always use HTTPS to prevent token interception.

4. **Token Storage**:
   - Frontend should store tokens in memory or httpOnly cookies
   - Never store tokens in localStorage if XSS is a concern

5. **Token Expiration**: Tokens expire in 7 days. Implement token refresh if needed.

6. **Disable Registration**: In production, consider disabling the `/api/auth/register` endpoint or adding admin-only access.

---

## Testing the Authentication System

### Test Script

Save as `test-auth.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:3201"

echo "=== Testing Authentication System ==="
echo ""

# Test 1: Health check (public)
echo "1. Testing public health endpoint..."
curl -s "$BASE_URL/api/health" | jq
echo ""

# Test 2: Login as doctor
echo "2. Login as doctor..."
DOCTOR_TOKEN=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"doctor","password":"doctor123"}' \
  | jq -r '.token')
echo "Doctor token: ${DOCTOR_TOKEN:0:50}..."
echo ""

# Test 3: Get current user
echo "3. Get current user info..."
curl -s "$BASE_URL/api/auth/me" \
  -H "Authorization: Bearer $DOCTOR_TOKEN" | jq
echo ""

# Test 4: List patients (authenticated)
echo "4. List patients (as doctor)..."
curl -s "$BASE_URL/api/patients" \
  -H "Authorization: Bearer $DOCTOR_TOKEN" | jq '.items | length'
echo ""

# Test 5: Login as therapist
echo "5. Login as therapist..."
THERAPIST_TOKEN=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"therapist","password":"therapist123"}' \
  | jq -r '.token')
echo "Therapist token: ${THERAPIST_TOKEN:0:50}..."
echo ""

# Test 6: Try to create patient as therapist (should fail)
echo "6. Try to create patient as therapist (should fail with 403)..."
curl -s -X POST "$BASE_URL/api/patients" \
  -H "Authorization: Bearer $THERAPIST_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"patient":{"name":"测试","age":"5岁","gender":"男"}}' | jq
echo ""

# Test 7: Try to access without token (should fail)
echo "7. Try to access patients without token (should fail with 401)..."
curl -s "$BASE_URL/api/patients" | jq
echo ""

echo "=== Tests Complete ==="
```

Run with:
```bash
chmod +x test-auth.sh
./test-auth.sh
```

---

## Migration Guide for Frontend

The frontend will need to be updated to:

1. **Add Login Page**: Create a login form to collect username/password
2. **Store Token**: Save JWT token after successful login
3. **Add Authorization Header**: Include token in all API requests
4. **Handle 401 Errors**: Redirect to login when token expires
5. **Show User Info**: Display current user's name and role
6. **Role-Based UI**: Hide/disable features based on user role

Example frontend code:

```javascript
// Login
async function login(username, password) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await response.json();
  if (data.success) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  }
  return data;
}

// Make authenticated request
async function fetchPatients() {
  const token = localStorage.getItem('token');
  const response = await fetch('/api/patients', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (response.status === 401) {
    // Token expired, redirect to login
    window.location.href = '/login';
    return;
  }
  return response.json();
}
```

---

## Database Schema

### Users Table

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,  -- bcrypt hashed
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'therapist',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

**Roles:**
- `therapist`: Can view and update patients
- `doctor`: Can create, view, update, and delete patients
- `admin`: Full system access (future use)

---

## Troubleshooting

### "JWT_SECRET not configured"
- Add `JWT_SECRET` to `server/.env`
- Restart the server

### "Invalid token"
- Token may be malformed or corrupted
- Try logging in again to get a new token

### "Token expired"
- Tokens expire after 7 days
- Login again to get a new token

### "Insufficient permissions"
- Your user role doesn't have access to this endpoint
- Login with a user that has the required role (e.g., doctor for creating patients)

### Default users not created
- Check server logs for errors during startup
- Manually run: `node -e "require('./server/seed').seedIfEmpty()"`
