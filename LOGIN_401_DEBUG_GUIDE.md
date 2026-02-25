# 🔓 Login 401 Error - Debug & Fix Guide

## ✅ Status Check

Backend tested and working:
- ✅ Admin user exists in database
- ✅ Password is correct: `admin123`
- ✅ Login endpoint returns 200 OK with correct response
- ✅ All test user passwords reset and verified

## 📋 Exact Credentials to Use

```
ADMIN
  Email:    admin@example.com
  Password: admin123

MANAGER
  Email:    manager@example.com
  Password: manager123

CUSTOMER
  Email:    customer@example.com
  Password: customer123
```

Copy-paste these exactly - no extra spaces!

---

## 🔍 Step-by-Step Debugging

### Step 1: Verify Backend is Running

```bash
# Terminal 1 - Backend
cd backend
python manage.py runserver
```

You should see:
```
Starting development server at http://127.0.0.1:8000/
```

### Step 2: Open Frontend

```bash
# Terminal 2 - Frontend
cd frontend
npm run dev
```

Open the URL it shows (usually `http://localhost:5173`)

### Step 3: Open Browser DevTools

Press **F12** to open DevTools
- Go to **Console** tab
- You should see console.log messages with `[API]` and `[Login]` prefix

### Step 4: Try Login

1. Click "Login" button
2. Copy-paste from table above:
   - Email: `admin@example.com`
   - Password: `admin123`
3. Click "Sign In"

### Step 5: Check Console Logs

You should see logs like:
```
[Login] Submitting login request for: admin@example.com
[API] Sending login request: {...}
[API Response] {url: "...", status: 200, ok: true, ...}
[Login] Login successful. User role: admin
[App] handleLoginSuccess called with userData: {...}
```

**If you see status: 401 instead of 200:**
- The password is wrong
- Or the email doesn't match
- Or the user doesn't exist in the database

---

## 🐛 Troubleshooting 401 Error

### Problem: Getting 401 Unauthorized

#### Possible Cause #1: Credentials Not Copied Exactly
- **Check**: Are there any extra spaces in email or password?
- **Fix**: Copy from table above very carefully
- **Test**: Try using Ctrl+C to copy and Ctrl+V to paste

#### Possible Cause #2: User Doesn't Exist
- **Check**: Open DevTools Console, look for `[LoginSerializer] User NOT found`
- **Fix**: The user email doesn't match exactly what's in the database
- **Solution**: Use exact emails from above:
  - `admin@example.com` (not `admin@example.com ` with space)
  - `manager@example.com`
  - `customer@example.com`

#### Possible Cause #3: Password Wrong
- **Check**: Open DevTools Console, look for `[LoginSerializer] Password check FAILED`
- **Fix**: 
  1. Check that you're using the correct password: `admin123` (not `admin` or `123456`)
  2. There are no capital letters - it's all lowercase
  3. There's no space at the end of the password
  
#### Possible Cause #4: User Exists but Password Hash is Wrong
- **Check**: In DevTools Console, look for message about "has_usable_password"
- **Fix**: Run this command:
  ```bash
  cd backend
  python ..\setup_test_users.py
  ```
  This will reset all passwords to the correct values

---

## ✅ Quick Verification Checklist

Before trying to login, verify:

- [ ] Backend terminal shows: `Starting development server at http://127.0.0.1:8000/`
- [ ] Frontend terminal shows the dev server is running
- [ ] Frontend page loads in browser (you see the AutoNexus logo/website)
- [ ] You can click the Login button and see the login form
- [ ] DevTools opens (F12) and you see the Console tab
- [ ] No red errors in the Console (yet)

---

## 🧪 Test Login Directly (Skip Frontend)

If you want to test without using the frontend UI:

```bash
cd c:\Users\7280\OneDrive\Attachments\Desktop\project
python test_all_logins.py
```

This will test all three users at once. You should see:
```
Status Code: 200
Status: success
Message: Login successful!
```

If this works but frontend still fails, it's a frontend-specific issue.

---

## 📊 Expected Console Logs for Successful Login

When login succeeds, console should show:

```
[Login] Submitting login request for: admin@example.com
[API] Sending login request: {
  url: "http://localhost:8000/api/users/login/",
  email: "admin@example.com",
  passwordLength: 8,
  credentialsKeys: ["email", "password"]
}
[API Response] {
  url: "http://localhost:8000/api/users/login/",
  status: 200,
  ok: true,
  statusText: "OK",
  response: {
    status: "success",
    message: "Login successful!",
    data: {
      id: 16,
      firstName: "Admin",
      lastName: "User",
      email: "admin@example.com",
      role: "admin",
      token: "d3bf656d027760c4237..."
    }
  }
}
[Login] Extracted userData: {...}
[Login] Saving token and user data
[Login] Login successful. User role: admin
[Login] Calling onLoginSuccess callback
[App] handleLoginSuccess called with userData: {...}
[App] User role from backend: admin
[App] Setting role to admin and navigating to dashboard
[App] Rendering AdminDashboard
```

---

## 🔧 Backend Console Logs for Reference

When you see errors in frontend, also check backend terminal. You should see:

```
[LoginView] Received request data: {'email': 'admin@example.com', 'password': 'admin123'}
[LoginView] Email: admin@example.com
[LoginView] Password length: 8
[LoginSerializer] Attempting login with email: admin@example.com
[LoginSerializer] User found: admin@example.com, has_usable_password: True
[LoginSerializer] Password check PASSED for admin@example.com
[LoginView] Login successful for admin@example.com
```

If password check FAILED, that's the issue - the password doesn't match what's in the database.

---

## 🆘 Still Not Working?

If you've tried everything above, try this:

### Nuclear Option: Reset Database

```bash
cd backend
python manage.py shell
from django.contrib.auth import get_user_model
User = get_user_model()
User.objects.filter(email='admin@example.com').delete()
exit()
python ..\setup_test_users.py
```

Then try logging in again.

---

## 📱 What Should Happen After Successful Login

1. Login form closes automatically ✅
2. You see the Admin Dashboard (or Manager/Customer depending on role) ✅
3. Page shows modules specific to your role ✅
4. DevTools Console shows green `[App] Rendering AdminDashboard` ✅
5. In DevTools → Application → Local Storage, you see:
   - `authToken` = your token
   - `userData` = your user object with role ✅

---

## 🆙 Next Steps

1. Try logging in with the exact credentials above
2. Check console logs (F12)
3. Tell me what you see in the console
4. I'll help you debug further if needed

**The most common issue is:** Wrong password or email with extra spaces. Double-check you're copying from the exact list above!

