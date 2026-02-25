# Integration Troubleshooting & Debugging Guide

## Debugging Tools & Techniques

### 1. Browser Developer Tools

#### Network Tab
- Open DevTools (`F12` or `Ctrl+Shift+I`)
- Go to **Network** tab
- Perform an action (login, booking, etc.)
- Click on API requests to see:
  - **Headers**: Request headers and authorization tokens
  - **Payload**: Request body being sent
  - **Response**: Response from backend
  - **Status**: HTTP status code (200, 401, 400, etc.)

#### Console Tab
- Look for JavaScript errors in red
- Check for console warnings in yellow
- Use `console.log()` to debug React components
- Check localStorage: Open Console and type:
  ```javascript
  // View all auth data
  localStorage.getItem('authToken')
  localStorage.getItem('userData')
  JSON.parse(localStorage.getItem('userData'))
  ```

#### Application Tab
- Go to **Storage** → **Local Storage**
- Check `authToken` and `userData` are saved after login
- Clear localStorage if needed: Right-click → Clear

### 2. Backend Debugging

#### Django Shell
```bash
# Start Django shell
python manage.py shell

# Check users
from users.models import User
User.objects.all().values('id', 'email', 'role')

# Check bookings
from bookings.models import Booking
Booking.objects.filter(user_id=1).values('id', 'status', 'total_amount')

# Check tokens
from rest_framework.authtoken.models import Token
Token.objects.all().values('user_id', 'key')
```

#### Django Logs
- Backend console shows all requests
- Look for errors in traceback format
- 400 errors: Check request payload
- 401 errors: Check authorization header
- 500 errors: Check Django error traceback

#### Django Admin Panel
- Visit `http://localhost:8000/admin`
- Login with superuser credentials
- View and manage:
  - Users
  - Bookings
  - Tokens

## Common Errors & Solutions

### Frontend Errors

#### Error 1: "Network Error"
```
Network error: TypeError: Failed to fetch
```
**Causes**: Backend not running, CORS issue, wrong URL

**Debug**:
```javascript
// Check API URL
console.log(import.meta.env.VITE_API_URL)

// Check browser network tab for failed request
// Look at CORS error in console
```

**Solution**:
1. Verify backend is running: `http://localhost:8000`
2. Check `.env.local` has correct URL
3. Clear browser cache (Ctrl+Shift+Del)
4. Restart both servers

#### Error 2: "401 Unauthorized"
```
Error: {status: 401, message: "Invalid token"}
```
**Causes**: Token missing, expired, or invalid

**Debug**:
```javascript
// In browser console
const token = localStorage.getItem('authToken')
console.log('Token:', token)

// Check if token exists and is not empty
if (!token) console.log('No token found!')
```

**Solution**:
1. Logout completely: Clear localStorage
2. Login again to get new token
3. Check Network tab shows token in Authorization header
4. Verify backend token table has the user's token

#### Error 3: "400 Bad Request"
```
Error: {status: 400, errors: {email: ["Email already registered"]}}
```
**Causes**: Validation errors, missing required fields

**Debug**:
```javascript
// Check what data is being sent
console.log('Request data:', JSON.stringify(formData, null, 2))

// Check response errors
catch (error) {
  console.log('Full error:', JSON.stringify(error, null, 2))
}
```

**Solution**:
1. Check all required fields are filled
2. Validate email format
3. Check password meets requirements (8+ chars)
4. Check email not already registered

#### Error 4: "CORS Policy Error"
```
Access to XMLHttpRequest at 'http://localhost:8000/api/...' from origin 
'http://localhost:5173' has been blocked by CORS policy
```
**Causes**: Backend CORS not configured correctly

**Debug**:
1. Check Network tab → Response headers
2. Look for `Access-Control-Allow-Origin`

**Solution**:
1. Verify backend settings.py has CORS configuration:
   ```python
   CORS_ALLOWED_ORIGIN_REGEXES = [
       r"^http://localhost:\d+$",
   ]
   ```
2. Make sure CorsMiddleware is in MIDDLEWARE
3. Restart backend server

### Backend Errors

#### Error 1: "ModuleNotFoundError"
```
ModuleNotFoundError: No module named 'rest_framework'
```
**Solution**:
```bash
pip install -r requirements.txt
```

#### Error 2: "OperationalError: no such table"
```
OperationalError: no such table: users_user
```
**Solution**:
```bash
python manage.py migrate
```

#### Error 3: "1054 Unknown column"
```
1054 Unknown column 'users_user.role' in 'field list'
```
**Solution**:
1. Check migration files are created:
   ```bash
   python manage.py makemigrations
   ```
2. Run migrations:
   ```bash
   python manage.py migrate
   ```

#### Error 4: "ConnectionRefusedError"
```
ConnectionRefusedError: [Errno 111] Connection refused
```
**Causes**: MySQL server not running

**Solution**:
1. On Windows:
   ```bash
   mysql -u root -p
   ```
2. On Mac:
   ```bash
   /usr/local/mysql/bin/mysql -u root -p
   ```
3. On Linux:
   ```bash
   sudo systemctl start mysql
   ```

## Advanced Debugging

### 1. Enable Detailed Logging

#### Backend (settings.py)
```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'DEBUG',
    },
}
```

#### Frontend (api.js)
```javascript
// Add logging to API service
export async function handleResponse(response) {
    let data;
    console.log('Response Status:', response.status);
    console.log('Response Headers:', response.headers);
    
    try {
        data = await response.json();
        console.log('Response Data:', data);
    } catch (e) {
        data = {};
    }
    
    if (!response.ok) {
        console.error('API Error:', data);
        throw data;
    }
    
    return data;
}
```

### 2. Test API Endpoints Manually

#### Using cURL (Command Line)
```bash
# Test login
curl -X POST http://localhost:8000/api/users/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Test get bookings (need token)
curl -X GET http://localhost:8000/api/bookings/my_bookings/ \
  -H "Authorization: Token abc123def456..." \
  -H "Content-Type: application/json"
```

#### Using Postman (GUI)
1. Download Postman: https://www.postman.com/downloads/
2. Create requests for each endpoint
3. Set Authorization header for protected endpoints
4. Save requests in collections for reuse

### 3. Database Inspection

#### View User Data
```sql
SELECT id, email, role, is_verified, created_at FROM users_user;
```

#### View Booking Data
```sql
SELECT id, user_id, booking_type, status, total_amount, created_at 
FROM bookings_booking
ORDER BY created_at DESC;
```

#### View Tokens
```sql
SELECT user_id, key FROM authtoken_token;
```

## Step-by-Step Testing Checklist

### ✅ Setup Verification
- [ ] Backend running on `http://localhost:8000`
- [ ] Frontend running on `http://localhost:5173`
- [ ] MySQL server running
- [ ] Database `autonexus_db` exists
- [ ] No errors in backend console
- [ ] No errors in browser console

### ✅ User Registration Test
- [ ] Click "Book Now" on frontend
- [ ] Fill signup form completely
- [ ] Check Network tab for POST to `/api/users/signup/`
- [ ] Response shows status: "success"
- [ ] User record created in database
- [ ] Token created in database
- [ ] Token saved to localStorage

### ✅ User Login Test
- [ ] Use created account credentials
- [ ] Check Network tab for POST to `/api/users/login/`
- [ ] Response includes token
- [ ] Token matches token in database
- [ ] Redirected to dashboard
- [ ] User data displays on dashboard

### ✅ Booking Creation Test
- [ ] Login to account
- [ ] Go to home and click "Book Now" on car type
- [ ] Fill all booking details
- [ ] Check Network tab for POST to `/api/bookings/`
- [ ] Response shows created booking with ID
- [ ] Booking record created in database
- [ ] Booking appears in User Dashboard

### ✅ Data Persistence Test
- [ ] Logout
- [ ] Close browser
- [ ] Open browser again
- [ ] Navigate to frontend
- [ ] Check if auto-logged in from localStorage
- [ ] Check if bookings persist in database

## Performance Monitoring

### Frontend Performance
```javascript
// Measure API call time
const startTime = performance.now();
const response = await authAPI.login({email, password});
const endTime = performance.now();
console.log(`API call took ${endTime - startTime}ms`);
```

### Backend Performance
```python
# In Django shell, check query count
from django.db import connection
from django.test.utils import CaptureQueriesContext

with CaptureQueriesContext(connection) as context:
    # Your code here
    bookings = Booking.objects.filter(user_id=1)
    
print(f"Total queries: {len(context)}")
for query in context:
    print(f"Time: {query['time']}s - {query['sql']}")
```

## Production Checklist

- [ ] Change DEBUG = False in settings.py
- [ ] Set ALLOWED_HOSTS correctly
- [ ] Use environment variables for secrets
- [ ] Enable HTTPS/SSL
- [ ] Update CORS_ALLOWED_ORIGINS for production domain
- [ ] Enable rate limiting
- [ ] Set up error logging (Sentry, etc.)
- [ ] Enable database backups
- [ ] Use environment-specific .env files
- [ ] Test error pages (404, 500, etc.)

## Getting Help

1. **Check the integration guide**: `FRONTEND_BACKEND_INTEGRATION.md`
2. **Check the quick start**: `INTEGRATION_QUICK_START.md`
3. **Review API response**: Check Network tab for actual error
4. **Check database**: Verify data is being saved
5. **Check logs**: Both frontend and backend console logs
6. **Isolate the issue**: Test individual components separately

## Useful Commands

```bash
# Backend
python manage.py runserver                    # Start server
python manage.py migrate                      # Run migrations
python manage.py makemigrations               # Create migrations
python manage.py shell                        # Python shell with Django context
python manage.py createsuperuser              # Create admin user

# Frontend
npm run dev                                   # Start dev server
npm run build                                 # Build for production
npm run preview                               # Preview production build
npm run lint                                  # Check code style

# Database
mysql -u django_user -p autonexus_db         # Connect to MySQL
SHOW TABLES;                                  # List all tables
DESCRIBE users_user;                          # Show table structure
```

---

Happy debugging! 🚀
