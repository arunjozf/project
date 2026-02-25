# Architecture & System Design

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTONEXUS SYSTEM ARCHITECTURE                │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │         React Frontend (localhost:5173)                │   │
│   ├─────────────────────────────────────────────────────────┤   │
│   │                                                          │   │
│   │  ┌──────────────────────────────────────────────────┐  │   │
│   │  │              React Components                    │  │   │
│   │  │  ┌──────────┐  ┌─────────┐  ┌──────────────┐  │  │   │
│   │  │  │  Login   │  │ Signup  │  │  BookingPage │  │  │   │
│   │  │  └──────────┘  └─────────┘  └──────────────┘  │  │   │
│   │  │      │              │              │           │  │   │
│   │  │      └──────────────┴──────────────┘           │  │   │
│   │  │              │                                  │  │   │
│   │  └──────────────┼──────────────────────────────────┘  │   │
│   │                 ▼                                      │   │
│   │  ┌──────────────────────────────────────────────────┐  │   │
│   │  │         API Service Layer (api.js)              │  │   │
│   │  │  ┌──────────────┐  ┌──────────────────────┐   │  │   │
│   │  │  │  authAPI     │  │   bookingAPI         │   │  │   │
│   │  │  │  - signup()  │  │  - createBooking()   │   │  │   │
│   │  │  │  - login()   │  │  - getUserBookings() │   │  │   │
│   │  │  │  - logout()  │  │  - updateBooking()   │   │  │   │
│   │  │  │  - me()      │  │  - cancelBooking()   │   │  │   │
│   │  │  └──────────────┘  └──────────────────────┘   │  │   │
│   │  └──────────────────────────────────────────────────┘  │   │
│   │                 │                                      │   │
│   │                 ▼                                      │   │
│   │  ┌──────────────────────────────────────────────────┐  │   │
│   │  │     Auth Context (AuthContext.jsx)              │  │   │
│   │  │  ┌──────────────────────────────────────────┐  │  │   │
│   │  │  │   Global Auth State                      │  │  │   │
│   │  │  │   - user                                 │  │  │   │
│   │  │  │   - token                                │  │  │   │
│   │  │  │   - isAuthenticated                      │  │  │   │
│   │  │  └──────────────────────────────────────────┘  │  │   │
│   │  └──────────────────────────────────────────────────┘  │   │
│   │                 │                                      │   │
│   └─────────────────┼──────────────────────────────────────┘   │
│                     │                                           │
│                     │ HTTP/HTTPS Requests                      │
│                     │ Authorization: Token {token}             │
└──────────────────────────────────────────────────────────────────┘
                      │
                      │
        ┌─────────────▼──────────────┐
        │   Network / Internet        │
        │  (localhost for dev)        │
        └─────────────┬──────────────┘
                      │
┌─────────────────────▼──────────────────────────────────────────┐
│                    API LAYER (Backend)                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│   ┌────────────────────────────────────────────────────────┐    │
│   │     Django REST Framework (localhost:8000)            │    │
│   ├────────────────────────────────────────────────────────┤    │
│   │                                                         │    │
│   │  CORS Middleware (localhost:*)                        │    │
│   │         │                                              │    │
│   │         ▼                                              │    │
│   │  ┌──────────────────────────────────────────────┐    │    │
│   │  │        URL Router                           │    │    │
│   │  ├──────────────────────────────────────────────┤    │    │
│   │  │  /api/users/                                │    │    │
│   │  │    - signup/     (POST)                      │    │    │
│   │  │    - login/      (POST)                      │    │    │
│   │  │    - logout/     (POST)                      │    │    │
│   │  │    - me/         (GET)                       │    │    │
│   │  │                                              │    │    │
│   │  │  /api/bookings/                             │    │    │
│   │  │    - (GET/POST)  - List/Create              │    │    │
│   │  │    - {id}/ (GET/PATCH) - Details/Update     │    │    │
│   │  │    - my_bookings/ (GET) - User bookings     │    │    │
│   │  └──────────────────────────────────────────────┘    │    │
│   │         │                                             │    │
│   │         ▼                                             │    │
│   │  ┌──────────────────────────────────────────────┐    │    │
│   │  │     ViewSets / Views                         │    │    │
│   │  ├──────────────────────────────────────────────┤    │    │
│   │  │  ┌────────────────────────────────────────┐ │    │    │
│   │  │  │  UserViewSet                          │ │    │    │
│   │  │  │  - signup(request)                    │ │    │    │
│   │  │  │  - login(request)                     │ │    │    │
│   │  │  │  - logout(request)                    │ │    │    │
│   │  │  │  - me(request)                        │ │    │    │
│   │  │  └────────────────────────────────────────┘ │    │    │
│   │  │  ┌────────────────────────────────────────┐ │    │    │
│   │  │  │  BookingViewSet                       │ │    │    │
│   │  │  │  - create(request)                    │ │    │    │
│   │  │  │  - list(request)                      │ │    │    │
│   │  │  │  - retrieve(request, pk)              │ │    │    │
│   │  │  │  - update(request, pk)                │ │    │    │
│   │  │  │  - destroy(request, pk)               │ │    │    │
│   │  │  │  - my_bookings(request)               │ │    │    │
│   │  │  └────────────────────────────────────────┘ │    │    │
│   │  └──────────────────────────────────────────────┘    │    │
│   │         │                                             │    │
│   │         ▼                                             │    │
│   │  ┌──────────────────────────────────────────────┐    │    │
│   │  │     Serializers                             │    │    │
│   │  ├──────────────────────────────────────────────┤    │    │
│   │  │  - UserRegistrationSerializer               │    │    │
│   │  │  - UserLoginSerializer                      │    │    │
│   │  │  - UserDetailSerializer                     │    │    │
│   │  │  - BookingSerializer                        │    │    │
│   │  │  - BookingCreateSerializer                  │    │    │
│   │  │                                              │    │    │
│   │  │  (Validation, Transformation)               │    │    │
│   │  └──────────────────────────────────────────────┘    │    │
│   │         │                                             │    │
│   │         ▼                                             │    │
│   │  ┌──────────────────────────────────────────────┐    │    │
│   │  │     Authentication Layer                     │    │    │
│   │  ├──────────────────────────────────────────────┤    │    │
│   │  │  TokenAuthentication                         │    │    │
│   │  │  - Validates token in Authorization header  │    │    │
│   │  │  - Matches token to user in database        │    │    │
│   │  │  - Sets request.user for authorized calls   │    │    │
│   │  └──────────────────────────────────────────────┘    │    │
│   │         │                                             │    │
│   └─────────┼──────────────────────────────────────────────┘    │
└──────────────┼──────────────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER                                │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│   ┌──────────────────────────────────────────────────────┐      │
│   │        MySQL Database (autonexus_db)               │      │
│   ├──────────────────────────────────────────────────────┤      │
│   │                                                       │      │
│   │  ┌────────────────────────────────────────────┐     │      │
│   │  │  users_user Table                         │     │      │
│   │  ├────────────────────────────────────────────┤     │      │
│   │  │ - id (PK)                                  │     │      │
│   │  │ - email (UNIQUE)                           │     │      │
│   │  │ - password (HASHED)                        │     │      │
│   │  │ - first_name, last_name                    │     │      │
│   │  │ - role (customer|driver|manager|admin)     │     │      │
│   │  │ - phone, address, city, country            │     │      │
│   │  │ - is_verified, is_driver                   │     │      │
│   │  │ - created_at, updated_at                   │     │      │
│   │  └────────────────────────────────────────────┘     │      │
│   │  ┌────────────────────────────────────────────┐     │      │
│   │  │  bookings_booking Table                    │     │      │
│   │  ├────────────────────────────────────────────┤     │      │
│   │  │ - id (PK)                                  │     │      │
│   │  │ - user_id (FK → users_user)                │     │      │
│   │  │ - booking_type (premium|local|taxi)        │     │      │
│   │  │ - number_of_days, driver_option            │     │      │
│   │  │ - pickup_location, dropoff_location        │     │      │
│   │  │ - pickup_date, pickup_time                 │     │      │
│   │  │ - phone, agree_to_terms                    │     │      │
│   │  │ - payment_method, total_amount             │     │      │
│   │  │ - status (pending|confirmed|completed...) │     │      │
│   │  │ - created_at, updated_at                   │     │      │
│   │  └────────────────────────────────────────────┘     │      │
│   │  ┌────────────────────────────────────────────┐     │      │
│   │  │  authtoken_token Table                     │     │      │
│   │  ├────────────────────────────────────────────┤     │      │
│   │  │ - key (PK)                                 │     │      │
│   │  │ - user_id (FK → users_user UNIQUE)         │     │      │
│   │  │ - created_at                               │     │      │
│   │  └────────────────────────────────────────────┘     │      │
│   │                                                       │      │
│   └──────────────────────────────────────────────────────┘      │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

## Data Models

### User Model
```javascript
{
  id: Integer,
  firstName: String,
  lastName: String,
  email: String,        // Unique
  password: String,     // Hashed
  phoneNumber: String,
  dateOfBirth: Date,
  address: String,
  city: String,
  country: String,
  role: Enum,           // customer, driver, manager, admin
  isDriver: Boolean,
  isVerified: Boolean,
  createdAt: DateTime,
  updatedAt: DateTime,
  
  // Relations
  bookings: [Booking],
  token: Token
}
```

### Booking Model
```javascript
{
  id: Integer,
  user: User,           // Foreign Key
  bookingType: Enum,    // premium, local, taxi
  numberOfDays: Integer,
  driverOption: Enum,   // with-driver, without-driver
  pickupLocation: String,
  dropoffLocation: String,
  pickupDate: Date,
  pickupTime: Time,
  phone: String,
  agreeToTerms: Boolean,
  paymentMethod: String,
  totalAmount: Decimal,
  status: Enum,         // pending, confirmed, completed, cancelled
  createdAt: DateTime,
  updatedAt: DateTime
}
```

### Token Model
```javascript
{
  key: String,          // Unique token
  userId: Integer,      // Foreign Key (Unique)
  createdAt: DateTime
}
```

## API Request/Response Flow

### Authentication Flow

#### 1. Signup Request
```
Client Request:
POST /api/users/signup/
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "role": "customer"
}

Server Response (201):
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

Database Changes:
- INSERT INTO users_user (...)
- INSERT INTO authtoken_token (...)
```

#### 2. Login Request
```
Client Request:
POST /api/users/login/
{
  "email": "john@example.com",
  "password": "password123"
}

Server Response (200):
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

Database Query:
- SELECT * FROM users_user WHERE email = 'john@example.com'
- SELECT * FROM authtoken_token WHERE user_id = 1
```

#### 3. Protected Request (with Token)
```
Client Request:
GET /api/users/me/
Headers: {
  "Authorization": "Token abc123def456..."
}

Server Processing:
1. Extract token from Authorization header
2. Query: SELECT * FROM authtoken_token WHERE key = 'abc123def456...'
3. Get user_id from token
4. Query: SELECT * FROM users_user WHERE id = user_id
5. Set request.user = user
6. Process request as that user

Server Response (200):
{
  "status": "success",
  "data": {
    "id": 1,
    "firstName": "John",
    ...
  }
}
```

## Component Interaction Diagram

```
┌─────────────────────────────────────┐
│          Login Component            │
└──────────────┬──────────────────────┘
               │
               │ calls
               ▼
         authAPI.login()
               │
               │ HTTP POST
               ▼
        /api/users/login/
               │
               │ response
               ▼
     ┌────────────────────────┐
     │  Save Token & User     │
     │  to localStorage       │
     └────────────┬───────────┘
                  │
                  ▼
          ┌──────────────────┐
          │  Call onSuccess  │
          │  Update App State│
          └──────────────────┘
                  │
                  ▼
          ┌──────────────────┐
          │ Redirect to      │
          │ Dashboard        │
          └──────────────────┘
```

## Authentication Token Flow

```
┌─────────────────────────────────────────────────┐
│           User Signup/Login                     │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │  Backend validates   │
        │  credentials         │
        └──────────┬───────────┘
                   │
        ┌──────────▼───────────┐
        │ Yes   │    │   No    │
        ▼       │    │         ▼
      Creates   │    │      Returns
      Token     │    │      Error
        │       │    │         │
        └───────┼────┘         │
                ▼              │
        ┌──────────────────┐   │
        │ Stores token in  │   │
        │ authtoken_token  │   │
        └────────┬─────────┘   │
                 │             │
                 ▼             │
        ┌──────────────────┐   │
        │  Sends token to  │   │
        │  frontend        │   │
        └────────┬─────────┘   │
                 │             │
                 └──────┬──────┘
                        ▼
                ┌──────────────────┐
                │  Frontend saves  │
                │  token to        │
                │  localStorage    │
                └────────┬─────────┘
                         │
                         ▼
                ┌──────────────────┐
                │ Future requests  │
                │ include token in │
                │ Authorization    │
                │ header           │
                └────────┬─────────┘
                         │
                         ▼
                ┌──────────────────┐
                │ Backend validates│
                │ token and allows │
                │ access to user   │
                │ data             │
                └──────────────────┘
```

## Error Handling Flow

```
┌──────────────────────────────────┐
│   API Request Failed             │
└──────────────────┬───────────────┘
                   │
        ┌──────────▼──────────┐
        │  Catch Error Block  │
        └──────────┬──────────┘
                   │
        ┌──────────▼──────────────────┐
        │  Check error.status        │
        └──────────┬──────────────────┘
                   │
         ┌─────────┼─────────┐
         │         │         │
         ▼         ▼         ▼
       400       401       500
    (Bad Req)  (Unauth)  (Server)
         │         │         │
         ▼         ▼         ▼
    Show field  Clear auth  Show
    validation  Redirect to Generic
    errors      login      error
```

## Security Architecture

```
┌──────────────────────────────────────────────────┐
│              SECURITY LAYERS                     │
├──────────────────────────────────────────────────┤
│                                                   │
│ Layer 1: Transport Security                     │
│ ├─ HTTPS/TLS (production only)                  │
│ └─ Secure token transmission                    │
│                                                   │
│ Layer 2: Authentication                         │
│ ├─ Token-based authentication                   │
│ ├─ Unique tokens per user                       │
│ └─ Token expiration (if needed)                │
│                                                   │
│ Layer 3: Authorization                          │
│ ├─ Role-based access control                    │
│ ├─ Permission checks in views                   │
│ └─ User-specific data filtering                 │
│                                                   │
│ Layer 4: Password Security                      │
│ ├─ PBKDF2 hashing (Django default)              │
│ ├─ Minimum password length (8 chars)            │
│ └─ Password complexity validation               │
│                                                   │
│ Layer 5: Data Validation                        │
│ ├─ Input validation in serializers              │
│ ├─ Email format validation                      │
│ ├─ Required field checks                        │
│ └─ Unique constraint enforcement                │
│                                                   │
│ Layer 6: CORS Protection                        │
│ ├─ Whitelist allowed origins                    │
│ ├─ Request/response headers validation          │
│ └─ Prevent unauthorized cross-origin requests   │
│                                                   │
└──────────────────────────────────────────────────┘
```

---

This architecture ensures:
- ✅ Separation of concerns (frontend, backend, database)
- ✅ Scalability (stateless token auth)
- ✅ Security (multiple layers)
- ✅ Maintainability (clear data flow)
- ✅ Testability (isolated components)
