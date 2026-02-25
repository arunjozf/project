# Frontend-Backend Integration Guide

## Overview
The frontend and backend are now fully connected using Django REST Framework (DRF) and React. This guide explains the integration and how to use it.

## Architecture

### Backend (Django)
- **Framework**: Django 4.2.7 with Django REST Framework
- **Authentication**: Token-based authentication
- **Database**: MySQL (configured in settings.py)
- **CORS**: Enabled for localhost development
- **API Base URL**: `http://localhost:8000/api`

### Frontend (React)
- **Framework**: React 19.2.0 with Vite
- **State Management**: React Context API (AuthContext)
- **API Communication**: Centralized API service (api.js)
- **Environment**: .env.local for configuration

## Setup Instructions

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies (if not already done)
pip install -r requirements.txt

# Create .env file with database credentials
# Add to .env:
# SECRET_KEY=your-secret-key
# DEBUG=True
# ALLOWED_HOSTS=localhost,127.0.0.1

# Run migrations
python manage.py migrate

# Create superuser (for admin access)
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

**Default Backend URL**: `http://localhost:8000`

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# The .env.local file is already configured with:
# VITE_API_URL=http://localhost:8000/api

# Start development server
npm run dev
```

**Default Frontend URL**: `http://localhost:5173`

## API Endpoints

### Authentication Endpoints

#### 1. **User Signup**
```
POST /api/users/signup/
Content-Type: application/json

Request:
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "role": "customer"  // or "manager"
}

Response (201):
{
  "status": "success",
  "message": "Account created successfully!",
  "data": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "customer",
    "token": "abc123def456..."
  }
}
```

#### 2. **User Login**
```
POST /api/users/login/
Content-Type: application/json

Request:
{
  "email": "john@example.com",
  "password": "password123"
}

Response (200):
{
  "status": "success",
  "message": "Login successful!",
  "data": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "customer",
    "token": "abc123def456..."
  }
}
```

#### 3. **User Logout**
```
POST /api/users/logout/
Authorization: Token {token}

Response (200):
{
  "status": "success",
  "message": "Logout successful!"
}
```

#### 4. **Get Current User**
```
GET /api/users/me/
Authorization: Token {token}

Response (200):
{
  "status": "success",
  "data": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "customer",
    ...
  }
}
```

### Booking Endpoints

#### 1. **Create Booking**
```
POST /api/bookings/
Authorization: Token {token}
Content-Type: application/json

Request:
{
  "booking_type": "premium",  // "premium", "local", or "taxi"
  "number_of_days": 3,
  "driver_option": "with-driver",  // "with-driver" or "without-driver"
  "pickup_location": "Central Station",
  "dropoff_location": "Airport",
  "pickup_date": "2026-02-15",
  "pickup_time": "10:00",
  "phone": "+91-9876543210",
  "agree_to_terms": true,
  "payment_method": "credit-card",
  "total_amount": "15000.00"
}

Response (201):
{
  "status": "success",
  "message": "Booking created successfully",
  "data": {
    "id": 1,
    "booking_type": "premium",
    "number_of_days": 3,
    "status": "pending",
    "total_amount": "15000.00",
    ...
  }
}
```

#### 2. **Get User Bookings**
```
GET /api/bookings/my_bookings/
Authorization: Token {token}

Response (200):
{
  "status": "success",
  "count": 2,
  "data": [
    { ... booking 1 ... },
    { ... booking 2 ... }
  ]
}
```

#### 3. **Get Specific Booking**
```
GET /api/bookings/{id}/
Authorization: Token {token}

Response (200):
{
  "status": "success",
  "data": { ... booking details ... }
}
```

#### 4. **Update Booking**
```
PATCH /api/bookings/{id}/
Authorization: Token {token}
Content-Type: application/json

Request:
{
  "status": "confirmed"  // Can update various fields
}

Response (200):
{
  "status": "success",
  "data": { ... updated booking ... }
}
```

#### 5. **Cancel Booking**
```
PATCH /api/bookings/{id}/
Authorization: Token {token}
Content-Type: application/json

Request:
{
  "status": "cancelled"
}

Response (200):
{
  "status": "success",
  "data": { ... booking with cancelled status ... }
}
```

#### 6. **Get All Bookings (Admin/Manager Only)**
```
GET /api/bookings/
Authorization: Token {token}

Response (200):
{
  "status": "success",
  "data": [ ... all bookings ... ]
}
```

## Frontend API Service (`src/utils/api.js`)

The API service provides a centralized location for all backend API calls.

### Authentication APIs

```javascript
import { authAPI, saveToken, getToken, removeToken, isAuthenticated } from '../utils/api';

// Signup
const result = await authAPI.signup({
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  password: "password123",
  confirmPassword: "password123",
  role: "customer"
});
saveToken(result.data.token);

// Login
const loginResult = await authAPI.login({
  email: "john@example.com",
  password: "password123"
});
saveToken(loginResult.data.token);

// Logout
await authAPI.logout(getToken());
removeToken();

// Get current user
const user = await authAPI.getCurrentUser(getToken());
```

### Booking APIs

```javascript
import { bookingAPI, getToken } from '../utils/api';

const token = getToken();

// Create booking
const booking = await bookingAPI.createBooking({
  booking_type: "premium",
  number_of_days: 3,
  driver_option: "with-driver",
  pickup_location: "Station A",
  dropoff_location: "Station B",
  pickup_date: "2026-02-15",
  pickup_time: "10:00",
  phone: "9876543210",
  agree_to_terms: true,
  payment_method: "credit-card",
  total_amount: 15000
}, token);

// Get user's bookings
const bookings = await bookingAPI.getUserBookings(token);

// Get specific booking
const specificBooking = await bookingAPI.getBooking(bookingId, token);

// Update booking
const updated = await bookingAPI.updateBooking(bookingId, { status: "confirmed" }, token);

// Cancel booking
const cancelled = await bookingAPI.cancelBooking(bookingId, token);
```

## Authentication Context (`src/utils/AuthContext.jsx`)

The AuthContext provides global authentication state management.

```javascript
import { AuthProvider, useAuth } from '../utils/AuthContext';

// Wrap your app with AuthProvider in main.jsx
function App() {
  return (
    <AuthProvider>
      <YourApp />
    </AuthProvider>
  );
}

// Use in any component
function MyComponent() {
  const { user, token, isAuthenticated, login, signup, logout } = useAuth();
  
  const handleLogin = async () => {
    try {
      await login("email@example.com", "password");
      // User is now logged in
    } catch (error) {
      console.error("Login failed:", error);
    }
  };
}
```

## Environment Configuration

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:8000/api
```

### Backend (.env)
```
SECRET_KEY=django-insecure-your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_NAME=autonexus_db
DB_USER=django_user
DB_PASSWORD=Arun@5432
DB_HOST=localhost
DB_PORT=3306
```

## Error Handling

All API errors follow this pattern:

```javascript
try {
  const result = await authAPI.login({...});
} catch (error) {
  // error object contains:
  // - status: HTTP status code
  // - statusText: HTTP status text
  // - message: Error message
  // - errors: Validation errors (if any)
}
```

## Data Storage

- **Authentication Token**: Stored in localStorage as `authToken`
- **User Data**: Stored in localStorage as `userData`
- **Remember Me**: Flag stored as `rememberMe` when checked

## CORS Configuration

The backend CORS is configured to accept requests from:
- `http://localhost:*` (any port on localhost)

For production, update `CORS_ALLOWED_ORIGIN_REGEXES` in `backend/config/settings.py`.

## Database Schema

### Users Table
- id (Primary Key)
- first_name
- last_name
- email (Unique)
- username (Unique)
- password (Hashed)
- phone_number
- date_of_birth
- address
- city
- country
- role (customer, driver, manager, admin)
- is_driver
- is_verified
- created_at
- updated_at

### Bookings Table
- id (Primary Key)
- user_id (Foreign Key to Users)
- booking_type (premium, local, taxi)
- number_of_days
- driver_option (with-driver, without-driver)
- pickup_location
- dropoff_location
- pickup_date
- pickup_time
- phone
- agree_to_terms
- payment_method
- total_amount
- status (pending, confirmed, completed, cancelled)
- created_at
- updated_at

## Testing the Integration

### 1. Test Signup
- Navigate to the frontend
- Click "Sign Up"
- Fill in the form with test data
- Check localStorage for saved token and user data
- Check backend database for new user

### 2. Test Login
- Use created account credentials
- Verify token is saved
- Verify user is redirected to dashboard

### 3. Test Booking
- Log in as customer
- Create a booking
- Check database for booking record
- Verify booking appears in user's dashboard

### 4. Test Manager/Admin
- Create an account with "manager" role
- Verify role-based access to manager/admin dashboards
- Check that managers can view all bookings

## Troubleshooting

### CORS Issues
If you get CORS errors:
1. Ensure backend is running on `http://localhost:8000`
2. Check `CORS_ALLOWED_ORIGINS` in backend settings.py
3. Verify request includes proper headers

### Authentication Issues
If getting 401 Unauthorized:
1. Ensure token is included in Authorization header
2. Check token hasn't expired
3. Verify user exists in database

### Database Connection Issues
If database connection fails:
1. Ensure MySQL is running
2. Verify database credentials in .env
3. Check database `autonexus_db` exists
4. Run migrations: `python manage.py migrate`

## Next Steps

1. **Implement real payment processing** (Stripe/PayPal integration)
2. **Add email notifications** for booking confirmations
3. **Implement driver matching** for bookings
4. **Add vehicle management** endpoints
5. **Add maintenance tracking** endpoints
6. **Implement user ratings/reviews**
7. **Add analytics and reporting** for managers/admins
8. **Deploy to production** with proper SSL/HTTPS
