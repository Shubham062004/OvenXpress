# Customer Authentication & Identity Documentation

## 1. Boundary & Roles
The Oven Xpress Customer Application operates strictly within the `CUSTOMER` authorization boundary.
- **Allowed Role**: `customer`.
- **Prohibited Roles**: `staff`, `manager`, `founder`, `admin`, `owner`.
- The customer registration endpoint explicitly forces `role: 'customer'`, neutralizing privilege escalation via mass assignment.

## 2. API Endpoints

### 2.1 Customer Registration
- **Route**: `POST /api/auth/register`
- **Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "SecurePassword123!",
    "phone": "+919876543210"
  }
  ```
- **Response**: `201 Created`
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "_id": "67...a1",
        "name": "Jane Doe",
        "email": "jane@example.com",
        "role": "customer"
      },
      "token": "eyJhbGciOi..."
    }
  }
  ```

### 2.2 Customer Login
- **Route**: `POST /api/auth/login`
- **Body**: `{ "email": "jane@example.com", "password": "SecurePassword123!" }`
- **Response**: `200 OK` with user details and signed JWT.

### 2.3 Current User & Session
- **Route**: `GET /api/auth/me`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Safe public profile excluding hashed password.

### 2.4 Profile Update
- **Route**: `PUT /api/auth/profile`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ "name", "phone", "birthday", "preferences", "password" }`
- **Security**: IDOR protected via `req.user.id`. Password changes re-trigger bcrypt hashing.

### 2.5 Password Recovery
- **Request Link**: `POST /api/auth/forgot-password` with `{ "email": "..." }`.
  - Neutralizes user enumeration by always returning generic message.
  - Generates a single-use crypto token with 1-hour expiry.
- **Reset Password**: `POST /api/auth/reset-password` with `{ "token": "...", "newPassword": "..." }`.
  - Validates token hash and expiry, clears reset token, updates password.
