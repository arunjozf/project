# 🔐 Admin Access Flow - Visual Guide

## Complete Admin Login Journey

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ADMIN USER CREATION                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Backend Admin Setup (Choose One Method):                           │
│                                                                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │
│  │  Method 1:      │  │  Method 2:      │  │  Method 3:      │     │
│  │  Python Script  │  │  Django Shell   │  │  Django Admin   │     │
│  │  create_admin.py│  │  manage.py      │  │  Panel /admin   │     │
│  │                 │  │  shell          │  │                 │     │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘     │
│           │                    │                    │                │
│           └────────────────────┼────────────────────┘                │
│                                │                                     │
│                   Creates User in Database                          │
│                   role='admin', is_active=True                      │
│                   Generates API Token                               │
│                                │                                     │
│                                ▼                                     │
│                   ✅ Admin User Ready                                │
└─────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                       ADMIN LOGIN FLOW                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Step 1: Admin opens browser                                        │
│          ▼                                                           │
│  http://localhost:5173 (Home Page)                                  │
│          │                                                           │
│          ▼                                                           │
│  ┌──────────────────────────┐                                       │
│  │   Admin clicks "Login"   │                                       │
│  └────────────┬─────────────┘                                       │
│               │                                                      │
│               ▼                                                      │
│  ┌─────────────────────────────────────────┐                        │
│  │      Login Form Appears                 │                        │
│  │  Email: admin@example.com               │                        │
│  │  Password: •••••••••••••                │                        │
│  │  [Login Button]                         │                        │
│  └────────────┬────────────────────────────┘                        │
│               │                                                      │
│               ▼                                                      │
│  ┌──────────────────────────────────────────────┐                   │
│  │   FRONTEND                   │   BACKEND     │                   │
│  │                               │               │                   │
│  │ POST /api/users/login/        │               │                   │
│  │ ────────────────────────►     │ Verify Email  │                   │
│  │                               │ & Password    │                   │
│  │                               │ ────────────► │                   │
│  │                               │ Database      │                   │
│  │ ◄──────────────────────       │ ◄──────────── │                   │
│  │  {                            │               │                   │
│  │    role: 'admin',             │  Create Token │                   │
│  │    token: 'abc123...',        │               │                   │
│  │    id: 1                      │               │                   │
│  │  }                            │               │                   │
│  └──────────┬───────────────────────────────────┘                   │
│             │                                                        │
│             ▼                                                        │
│  ┌────────────────────────────────────────┐                         │
│  │  Frontend Stores in localStorage:      │                         │
│  │  - token                               │                         │
│  │  - user {role: 'admin', ...}           │                         │
│  └────────────┬───────────────────────────┘                         │
│               │                                                      │
│               ▼                                                      │
│  ┌────────────────────────────────────────────────┐                │
│  │  App.jsx Checks User Role:                    │                │
│  │                                                │                │
│  │  if (user.role === 'admin') {                 │                │
│  │    navigate('/admin-dashboard')  ✅           │                │
│  │  }                                            │                │
│  └────────────┬─────────────────────────────────┘                │
│               │                                                    │
│               ▼                                                    │
│  ┌──────────────────────────────────────────┐                    │
│  │  AdminDashboard Component Loads          │                    │
│  │                                          │                    │
│  │  - Fetches admin stats                  │                    │
│  │  - Loads modules (Users, Payments, etc) │                    │
│  │  - Displays admin sidebar                │                    │
│  └──────────────┬───────────────────────────┘                    │
│                 │                                                 │
│                 ▼                                                 │
│    ✅ ADMIN DASHBOARD READY                                      │
│                                                                  │
│    ╔═════════════════════════════════════════════╗              │
│    ║  Admin Control Panel                        ║              │
│    ║  Platform Administration & Monitoring       ║              │
│    ╠═════════════════════════════════════════════╣              │
│    ║ 📊 Overview      [Selected Module Content]  ║              │
│    ║ 👥 User Mgmt                                ║              │
│    ║ 🏥 Monitoring                               ║              │
│    ║ ✅ Car Approvals                            ║              │
│    ║ 💳 Payments                                 ║              │
│    ║ ⚙️ Settings                                 ║              │
│    ╚═════════════════════════════════════════════╝              │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Authentication Details

### What Gets Stored (Frontend localStorage)

```javascript
// After successful login, stored as:
localStorage.setItem('token', 'abc123def456...');
localStorage.setItem('user', JSON.stringify({
  id: 1,
  firstName: 'John',
  lastName: 'Admin',
  email: 'admin@example.com',
  role: 'admin',        // 🔑 KEY FIELD - Determines dashboard
  phone_number: '+1234567890',
  is_active: true
}));
```

### API Requests (Every subsequent request)

```
GET /api/admin/stats/
Headers: {
  'Authorization': 'Token abc123def456...',
  'Content-Type': 'application/json'
}
```

---

## Role-Based Routing Decision Tree

```
User Logs In
      │
      ▼
Check localStorage['user'].role
      │
      ├─► 'admin' ──────────► AdminDashboard ✅
      │                      
      ├─► 'manager' ────────► ManagerDashboard ✅
      │
      ├─► 'customer' ───────► UserDashboard ✅
      │
      └─► 'driver' ─────────► (Future Feature)
```

**Code Location:** `frontend/src/App.jsx` Lines 60-80

---

## Security Layers

### Layer 1: Backend User Authentication
```python
# backend/users/views.py - LoginView
def login(request):
    ✓ Email exists in database
    ✓ Password matches
    ✓ User is_active = True
    ✓ Generate token
```

### Layer 2: Role Check
```python
# backend/users/views.py - create_admin()
if request.user.role != 'admin':
    return ❌ Forbidden
```

### Layer 3: Frontend Redirect
```javascript
// frontend/src/App.jsx
if (user.role !== 'admin') {
    navigate('/dashboard')  // ❌ No access to admin
}
```

### Layer 4: Protected Endpoints
```python
# Admin endpoints require authentication
@action(detail=False, methods=['get'], 
        permission_classes=[IsAuthenticated])
def stats(self, request):
    if request.user.role != 'admin':
        return ❌ Forbidden
```

---

## Summary

### ✅ How Admins Enter the System:

1. **Creation** (Backend Admin)
   - Use `create_admin.py` script
   - Or Django shell
   - Or Django admin panel

2. **Login** (Admin User)
   - Go to http://localhost:5173
   - Click Login
   - Enter email & password
   - Backend verifies & returns token

3. **Redirect** (App.jsx)
   - Checks role='admin'
   - Auto-redirects to AdminDashboard

4. **Access Dashboard**
   - All admin features available
   - Can manage users, payments, cars, etc.

---

## Quick Command Reference

```bash
# Create first admin user
cd backend
python create_admin.py

# Login
- URL: http://localhost:5173
- Email: admin@example.com
- Password: (your password)

# Access admin dashboard
- Automatically redirected after login
- Or direct: http://localhost:5173/admin-dashboard (if logged in as admin)
```

---

**Status:** ✅ Complete Admin Access System Ready
**Last Updated:** February 2026
