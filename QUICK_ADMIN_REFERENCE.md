# ⚡ Admin Access - Quick Command Reference

## 🚀 STEP 1: Create First Admin User

### Option A: Using Python Script (Recommended - Easiest)

```bash
cd c:\Users\7280\OneDrive\Attachments\Desktop\project\backend
python create_admin.py
```

**What happens:**
- Script prompts for: First Name, Last Name, Email, Password
- Creates user in database with `role='admin'`
- Generates API token automatically
- Displays login credentials

**Example output:**
```
Admin User Created Successfully! ✅

========================================
Login Credentials:
Email: admin@example.com
Password: MySecurePassword123

Token for API calls:
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6

Dashboard URL:
http://localhost:5173

========================================
```

---

### Option B: Using Django Shell

```bash
cd c:\Users\7280\OneDrive\Attachments\Desktop\project\backend
python manage.py shell
```

Then inside the shell:

```python
from users.models import User
from rest_framework.authtoken.models import Token

# Create admin user
admin = User.objects.create_user(
    email='admin@example.com',
    first_name='Admin',
    last_name='User',
    password='MySecurePassword123',
    role='admin',
    is_active=True
)
admin.save()

# Generate token
token = Token.objects.create(user=admin)
print(f"Email: {admin.email}")
print(f"Token: {token.key}")

# Exit
exit()
```

---

### Option C: Using Django Admin Panel

```bash
cd c:\Users\7280\OneDrive\Attachments\Desktop\project\backend
python manage.py runserver
```

1. Go to: http://localhost:8000/admin
2. Login with Django superuser (if you don't have one, run: `python manage.py createsuperuser`)
3. Click "Users"
4. Click "Add User"
5. Set fields:
   - Email: `admin@example.com`
   - First Name: `Admin`
   - Password: `MySecurePassword123`
   - Role: `admin` (dropdown)
   - Is Active: ✅ (checked)
6. Click "Save"

---

## 🔐 STEP 2: Login to Admin Dashboard

### Using Browser

1. **Start Frontend Server** (if not already running):
   ```bash
   cd c:\Users\7280\OneDrive\Attachments\Desktop\project\frontend
   npm run dev
   ```

2. **Open Browser**:
   ```
   http://localhost:5173
   ```

3. **Click "Login"** on homepage

4. **Enter Credentials**:
   - Email: `admin@example.com`
   - Password: `MySecurePassword123`

5. **Click "Login"** button

6. **Auto-Redirect** to AdminDashboard ✅

---

## 📊 STEP 3: Explore Admin Dashboard

Once logged in as admin, you'll see:

```
╔════════════════════════════════════════════════════════╗
║         Admin Control Panel                            ║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║  SIDEBAR NAVIGATION:                                   ║
║  ┌──────────────────────────┐                         ║
║  │ 📊 Overview              │ <- Currently here       ║
║  │ 👥 User Management       │ <- Manage all users    ║
║  │ 🏥 System Monitoring     │ <- Health metrics      ║
║  │ ✅ Car Approvals         │ <- Approve cars       ║
║  │ 💳 Payment Control       │ <- View payments      ║
║  │ ⚙️  Settings             │ <- Config platform    ║
║  └──────────────────────────┘                         ║
║                                                        ║
║  MAIN CONTENT:                                         ║
║  ┌──────────────────┬──────────────────┐             ║
║  │ Users: 42        │ Revenue: $12,450 │             ║
║  │ Bookings: 156    │ Pending: $3,200  │             ║
║  │ Cars Listed: 34  │ API Health: 99%  │             ║
║  └──────────────────┴──────────────────┘             ║
║                                                        ║
║  [Module Content Below]                               ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
```

---

## 🔄 Creating Additional Admins (Once First Admin Exists)

### Via API (Frontend):

The first admin can create more admins programmatically:

```javascript
// After logging in as admin
const createNewAdmin = async () => {
  const response = await fetch('http://localhost:8000/api/users/create_admin/', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      firstName: 'John',
      lastName: 'Manager',
      email: 'john@example.com',
      password: 'SecurePass123',
      confirmPassword: 'SecurePass123'
    })
  });
  
  const data = await response.json();
  console.log('New Admin Created:', data);
};
```

---

## 🔑 Security Features

✅ **Backend Verification**
- Email must not already exist
- Password minimum 6 characters
- Password confirmation must match
- Only existing admins can create new admins

✅ **Frontend Protection**
- Token required for API calls
- Role checked before showing admin dashboard
- Automatic redirect if user isn't admin

✅ **Database**
- User stored with `role='admin'`
- API token generated automatically
- Password hashed using Django's security

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| "User with this email already exists" | Use different email address |
| "Password is too short" | Use at least 6 characters |
| "Passwords don't match" | Ensure confirmPassword = password |
| "Only admins can create admins" | Login as admin first, then create others |
| "Login failed" | Check email & password spelling |
| "Dashboard not loading" | Ensure backend server is running on port 8000 |
| "Can't see admin dashboard" | Verify user role is 'admin' in database |

---

## 📋 Files Involved

| File | Purpose |
|------|---------|
| [backend/create_admin.py](backend/create_admin.py) | Script to create admin via CLI |
| [backend/users/views.py](backend/users/views.py) | Backend login & create_admin endpoint |
| [backend/users/models.py](backend/users/models.py) | User model with role field |
| [frontend/src/App.jsx](frontend/src/App.jsx) | Role-based routing logic |
| [frontend/src/pages/AdminDashboard.jsx](frontend/src/pages/AdminDashboard.jsx) | Admin dashboard component |
| [ADMIN_ACCESS_GUIDE.md](ADMIN_ACCESS_GUIDE.md) | Detailed admin access documentation |
| [ADMIN_FLOW_DIAGRAM.md](ADMIN_FLOW_DIAGRAM.md) | Visual flow diagrams |

---

## 🎯 Summary

**Quickest Path to Admin Access:**

```bash
# 1. Create admin (once)
cd backend
python create_admin.py
# Follow prompts, get email & password

# 2. Open browser
# http://localhost:5173

# 3. Login with credentials from step 1

# 4. ✅ Auto-redirected to AdminDashboard
```

---

**Status:** ✅ Ready to Use
**Last Updated:** February 2026
