# 🔐 Admin User Creation & Access Guide

## Overview
This document explains how admin users are created and how they access the admin dashboard.

---

## 📋 Access Flow

### Step 1: Admin User Creation (Backend)
There are **3 ways** to create an admin user:

#### **Method 1: Using create_admin.py Script (RECOMMENDED)**
```bash
cd backend
python create_admin.py
```

Follow the prompts:
- First Name: `John`
- Last Name: `Admin`
- Email: `admin@example.com`
- Password: `SecurePassword123`

**Output:**
```
✅ ADMIN USER CREATED SUCCESSFULLY!
👤 Name: John Admin
📧 Email: admin@example.com
🔐 Role: ADMIN
🔑 API Token: abc123def456...
🌐 Login URL: http://localhost:5173/login
```

---

#### **Method 2: Using Django Shell**
```bash
cd backend
python manage.py shell
```

Then run:
```python
from users.models import User
from rest_framework.authtoken.models import Token

user = User.objects.create_user(
    username='admin@example.com',
    email='admin@example.com',
    password='SecurePassword123',
    first_name='John',
    last_name='Admin',
    role='admin',
    is_active=True
)

token, created = Token.objects.get_or_create(user=user)
print(f"Admin created! Token: {token.key}")
```

---

#### **Method 3: Using Django Admin Panel**
1. Create a superuser first (if not exists):
   ```bash
   python manage.py createsuperuser
   ```

2. Access Django Admin:
   - Go to: `http://localhost:8000/admin`
   - Login with superuser credentials
   - Click "Users" → "Add User"
   - Set **role = 'admin'**
   - Save

---

## 🌐 Admin Login Flow

### Step 2: Visit Website
```
User visits → http://localhost:5173
```

### Step 3: Click Login
Home page → Click "Login" button

### Step 4: Enter Credentials
```
Email: admin@example.com
Password: SecurePassword123
```

### Step 5: Backend Verification
Backend verifies credentials and returns:
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "firstName": "John",
    "lastName": "Admin",
    "email": "admin@example.com",
    "role": "admin",
    "token": "abc123def456..."
  }
}
```

### Step 6: Auto-Redirect to Admin Dashboard
App.jsx checks user role:
```javascript
if (userObj.role === 'admin') {
  navigate('/admin-dashboard');  // ✅ Auto redirects here
}
```

### Step 7: Admin Dashboard Loads
Admin sees the control panel with:
- 👥 User Management
- 🏥 System Monitoring  
- ✅ Car Approvals
- 💳 Payment Control
- ⚙️ Platform Settings

---

## 🔍 Admin Dashboard Layout

### Top Section
```
┌─────────────────────────────────────────────┐
│ Admin Control Panel                         │
│ Platform Administration & Monitoring        │
└─────────────────────────────────────────────┘
```

### Left Sidebar (Navigation)
```
🔐 Admin
Full Control

ADMINISTRATION
├─ 📊 Overview
├─ 👥 User Management
├─ 🏥 System Monitoring
├─ ✅ Car Approvals
├─ 💳 Payment Control
└─ ⚙️ Platform Settings

ℹ️ Help & Support
🚪 Logout
```

### Main Content Area
Shows selected module (e.g., User Management table, System stats, etc.)

---

## 🛡️ Security Features

### Token-Based Authentication
- Admin login returns **API Token**
- Every API request needs token in header:
  ```
  Authorization: Token abc123def456...
  ```

### Role-Based Access Control
- Only users with `role='admin'` can:
  - Create new admin users
  - Access admin dashboard
  - Manage system settings
  - Block/unblock users

- Non-admin users auto-redirected to their dashboard

### Permission Checks
All admin endpoints verify user role:
```python
if request.user.role != 'admin':
    return Response({
        'status': 'error',
        'message': 'Admin access required'
    }, status=HTTP_403_FORBIDDEN)
```

---

## 📡 API Endpoints for Admin

### Authentication
```
POST /api/users/login/            # Login
POST /api/users/logout/           # Logout
POST /api/users/create_admin/     # Create new admin (admin only)
```

### Admin Operations
```
GET  /api/admin/stats/            # Dashboard stats
GET  /api/admin/users/            # All users
POST /api/admin/users/{id}/block/      # Block user
POST /api/admin/users/{id}/unblock/    # Unblock user
GET  /api/admin/cars/pending/     # Pending car approvals
POST /api/admin/cars/{id}/approve/     # Approve car
POST /api/admin/cars/{id}/reject/      # Reject car
GET  /api/admin/payments/         # Payment transactions
POST /api/admin/settings/         # Update platform settings
```

---

## 🚀 Quick Start for First Admin

### On Windows (PowerShell/CMD)
```bash
cd C:\path\to\project\backend
python create_admin.py
```

### On Mac/Linux
```bash
cd /path/to/project/backend
python create_admin.py
```

### Follow the prompts:
```
First Name: Admin
Last Name: User
Email: admin@yourdomain.com
Password: StrongPassword123
```

Then login at: `http://localhost:5173`

---

## ✅ Default Admin User (For Testing)

If you want to create a quick test admin:

```bash
cd backend
python manage.py shell
```

```python
from users.models import User
from rest_framework.authtoken.models import Token

user = User.objects.create_user(
    username='admin@test.com',
    email='admin@test.com',
    password='admin123',
    first_name='Test',
    last_name='Admin',
    role='admin'
)

token, _ = Token.objects.get_or_create(user=user)
print(f"Created: admin@test.com / admin123")
print(f"Token: {token.key}")
```

---

## 🔄 Creating Additional Admins

Once first admin is created, they can create more admins:

### Via API
```bash
curl -X POST http://localhost:8000/api/users/create_admin/ \
  -H "Authorization: Token <first_admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Admin",
    "email": "jane@example.com",
    "password": "SecurePass123"
  }'
```

### Via Script
Use the same `create_admin.py` script with different name/email

---

## ⚠️ Important Notes

1. **First Admin Must Be Created Manually** - Use create_admin.py or Django shell
2. **Only Admins Can Create Admins** - Regular users cannot promote themselves
3. **Forgot Password?** - Use Django admin panel or create new admin
4. **Token Expires?** - Login again to get new token
5. **Security** - Use strong passwords (min 6 chars, preferably longer)

---

## 🆘 Troubleshooting

### "User with this email already exists"
- Create admin with different email
- Or reset database: `python manage.py flush`

### "Password mismatch"
- Confirm password must match exactly
- No visible characters shown, type carefully

### "Admin not appearing in dashboard"
- Refresh browser: `Ctrl+F5`
- Clear localStorage: Open DevTools → Application → Storage → Clear All

### "API Token rejected"
- Token included in request header? `Authorization: Token <token>`
- Token not expired? Login again to refresh

---

## 📚 Related Files

- `backend/create_admin.py` - Script to create admin users
- `backend/users/views.py` - Admin creation endpoint
- `frontend/src/pages/AdminDashboard.jsx` - Admin dashboard UI
- `frontend/src/components/AdminSidebar.jsx` - Navigation
- `frontend/src/App.jsx` - Role-based routing

---

**Last Updated:** February 2026
**Version:** 1.0 (Admin Dashboard Complete)
