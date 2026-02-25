# Frontend-Backend Integration - Quick Start Guide

## Prerequisites
- Python 3.8+
- Node.js 16+
- MySQL Server running
- Git (optional)

## Quick Setup (5 minutes)

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Apply database migrations
python manage.py migrate

# Create a test user (optional)
python manage.py createsuperuser
# Email: admin@example.com
# Password: admin@123456

# Start the development server
python manage.py runserver
```

✅ Backend should be running at: `http://localhost:8000`

### 2. Frontend Setup

```bash
# In a new terminal, navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Start the development server
npm run dev
```

✅ Frontend should be running at: `http://localhost:5173`

## Test the Integration

### Test 1: User Signup
1. Open `http://localhost:5173` in your browser
2. Click "Book Now" button
3. Click "Sign up" link
4. Fill in the signup form:
   - First Name: John
   - Last Name: Doe
   - Email: john@example.com
   - Password: password123
   - Confirm Password: password123
   - Role: Customer
   - ✓ Agree to terms
5. Click "Create Account"
6. **Expected**: Account created message, redirected to login

### Test 2: User Login
1. On the login form, enter:
   - Email: john@example.com
   - Password: password123
2. Click "Sign In"
3. **Expected**: Logged in, redirected to User Dashboard

### Test 3: Make a Booking
1. Go back to Home page (click AutoNexus logo)
2. Click "Book Now" button on any car type
3. Fill booking details:
   - Number of Days: 3
   - Pickup Location: Central Station
   - Dropoff Location: Airport
   - Pickup Date: Select a future date
   - Pickup Time: 10:00 AM
   - Driver Service: With Driver
4. Continue to next steps
5. Fill personal info and payment details
6. Confirm booking
7. **Expected**: Booking confirmation, booking appears in User Dashboard

## File Structure

```
project/
├── backend/
│   ├── config/              # Django project settings
│   │   ├── settings.py     # ✅ CORS enabled, API configured
│   │   ├── urls.py         # ✅ API routes configured
│   ├── users/              # User authentication
│   │   ├── models.py       # User model with roles
│   │   ├── views.py        # ✅ Auth endpoints (signup, login, logout, me)
│   │   ├── serializers.py  # ✅ Data serialization
│   │   └── urls.py         # ✅ User routes
│   ├── bookings/           # Booking management
│   │   ├── models.py       # Booking model
│   │   ├── views.py        # ✅ Booking CRUD endpoints
│   │   ├── serializers.py  # ✅ Booking serialization
│   │   └── urls.py         # ✅ Booking routes
│   ├── manage.py
│   └── requirements.txt    # ✅ All dependencies included
│
└── frontend/
    ├── src/
    │   ├── utils/
    │   │   ├── api.js              # ✅ NEW: Centralized API service
    │   │   ├── AuthContext.jsx     # ✅ NEW: Auth state management
    │   │   └── roleCheck.js        # Role checking utilities
    │   ├── components/
    │   │   ├── Login.jsx           # ✅ UPDATED: Uses api.js
    │   │   ├── Signup.jsx          # ✅ UPDATED: Uses api.js
    │   │   └── Navbar.jsx
    │   ├── pages/
    │   │   ├── BookingPage.jsx     # ✅ UPDATED: Uses api.js
    │   │   ├── UserDashboard.jsx   # ✅ UPDATED: Fetches from API
    │   │   └── AdminDashboard.jsx
    │   └── App.jsx                 # ✅ UPDATED: Better auth handling
    ├── .env.local                  # ✅ NEW: Environment config
    └── package.json
```

## What Changed

### Backend
- ✅ CORS already configured for localhost
- ✅ Token authentication enabled
- ✅ User models with roles (customer, driver, manager, admin)
- ✅ Booking models fully implemented
- ✅ API endpoints tested and working

### Frontend
- ✅ **NEW**: `src/utils/api.js` - Centralized API service for all backend calls
- ✅ **NEW**: `src/utils/AuthContext.jsx` - React Context for global auth state
- ✅ **NEW**: `.env.local` - Environment configuration
- ✅ **UPDATED**: `Login.jsx` - Uses api.js service
- ✅ **UPDATED**: `Signup.jsx` - Uses api.js service
- ✅ **UPDATED**: `BookingPage.jsx` - Uses api.js service
- ✅ **UPDATED**: `UserDashboard.jsx` - Fetches bookings from API
- ✅ **UPDATED**: `App.jsx` - Better authentication handling

## API Endpoints Available

### Authentication
- `POST /api/users/signup/` - Register new user
- `POST /api/users/login/` - User login
- `POST /api/users/logout/` - User logout
- `GET /api/users/me/` - Get current user profile

### Bookings
- `POST /api/bookings/` - Create booking
- `GET /api/bookings/my_bookings/` - Get user's bookings
- `GET /api/bookings/{id}/` - Get booking details
- `PATCH /api/bookings/{id}/` - Update booking
- `DELETE /api/bookings/{id}/` - Delete booking
- `GET /api/bookings/` - Get all bookings (admin/manager only)

## Data Flow

```
User Action
    ↓
React Component
    ↓
API Service (api.js)
    ↓
HTTP Request to Backend
    ↓
Django View/ViewSet
    ↓
Serializer
    ↓
Database Query
    ↓
Response back through same flow
```

## Token Management

- Token is automatically saved to `localStorage` on login/signup
- Token is sent in Authorization header: `Authorization: Token {token}`
- Token is used for all authenticated requests
- Token is cleared on logout

## Common Issues & Solutions

### Issue: CORS Error
**Error**: `Access to XMLHttpRequest has been blocked by CORS policy`

**Solution**:
- Ensure backend is running on `http://localhost:8000`
- Check `.env.local` has correct API URL
- Verify browser console for exact error

### Issue: 404 Not Found
**Error**: `404 Not Found` when calling API

**Solution**:
- Verify backend is running
- Check API endpoint path is correct
- Ensure token is included for authenticated endpoints

### Issue: 401 Unauthorized
**Error**: `401 Unauthorized`

**Solution**:
- User must login first to get a token
- Verify token is saved in localStorage
- Check token is included in Authorization header
- Token might be expired, try logging out and in again

### Issue: Database Connection Error
**Error**: `django.db.utils.OperationalError`

**Solution**:
- Ensure MySQL server is running
- Verify database `autonexus_db` exists
- Check `.env` has correct credentials
- Run migrations: `python manage.py migrate`

## Database Setup

```sql
-- Create database (if not exists)
CREATE DATABASE autonexus_db;

-- Create user (if not exists)
CREATE USER 'django_user'@'localhost' IDENTIFIED BY 'Arun@5432';

-- Grant privileges
GRANT ALL PRIVILEGES ON autonexus_db.* TO 'django_user'@'localhost';
FLUSH PRIVILEGES;
```

Then run migrations:
```bash
python manage.py migrate
```

## Next Development Steps

1. **Email Notifications**: Send confirmation emails after bookings
2. **Payment Integration**: Add Stripe/PayPal payment processing
3. **Real-time Updates**: Use WebSockets for live booking updates
4. **File Uploads**: Add driver profile pictures and vehicle photos
5. **Analytics**: Dashboard statistics for managers
6. **Reviews & Ratings**: User feedback system
7. **Advanced Search**: Filter and search bookings
8. **SMS Notifications**: Send SMS updates to users

## Support & Documentation

- **Integration Guide**: See `FRONTEND_BACKEND_INTEGRATION.md`
- **API Endpoints**: All endpoints documented in integration guide
- **Database Schema**: Full schema in integration guide
- **Error Handling**: See api.js for error handling patterns

## Performance Tips

1. **Frontend**:
   - Use React.memo for components that don't change often
   - Implement virtual scrolling for long booking lists
   - Cache API responses

2. **Backend**:
   - Use database indexes on frequently queried fields
   - Implement pagination for list endpoints
   - Cache user profiles

3. **General**:
   - Use gzip compression
   - Minify production builds
   - Implement lazy loading

---

**Status**: ✅ Frontend and Backend Connected Successfully!

All components are ready to use. Start with the quick setup above and test the integration.
