# Enhanced Dashboard - Testing & Verification Guide

## 🧪 Complete Testing Checklist

### Test Environment Setup

**Backend Running**:
```bash
cd backend
python manage.py runserver
# Expected: Starting development server at http://127.0.0.1:8000/
```

**Frontend Running**:
```bash
cd frontend
npm run dev
# Expected: VITE v7.2.4 ready in XXX ms
# ➜  Local: http://localhost:5173/
```

**Database Status**:
```bash
mysql -u django_user -p autonexus_db
# Command: show tables;
# Expected: bookings, users_user, authtoken_token tables exist
```

---

## 📋 Test Scenarios & Expected Results

### TEST 1: Login & Dashboard Load

**Steps**:
1. Open `http://localhost:5173` in browser
2. Click "LOGIN" button
3. Enter:
   - Email: `customer@example.com`
   - Password: `password123`
4. Click "Login" button

**Expected Results**:
```
✅ Page redirects to UserDashboard
✅ Welcome message shows: "👋 Welcome, John!"
✅ Token saved in localStorage
✅ API call GET /api/bookings/my_bookings/ made
✅ "My Bookings" tab is active by default
✅ If first time: "📭 No bookings yet" message shown
✅ If returning: Previous bookings displayed in list
```

**DevTools Verification**:
- Application → LocalStorage → `authToken` should exist
- Application → LocalStorage → `userData` should contain user info
- Network tab should show:
  - POST /api/users/login/ → 200
  - GET /api/bookings/my_bookings/ → 200

---

### TEST 2: Form Visibility & Toggle

**Steps**:
1. Click "➕ New Booking" button

**Expected Results**:
```
✅ Booking form appears below the button
✅ Form shows all fields clearly
✅ "➕ New Booking" changes to "✕ Cancel"
✅ Form has proper spacing and styling
✅ All input fields are empty
```

**Steps 2**:
1. Click "✕ Cancel" button

**Expected Results**:
```
✅ Form disappears
✅ Button changes back to "➕ New Booking"
✅ List of bookings (or empty message) visible
```

---

### TEST 3: Form Field Validation (Empty Submit)

**Steps**:
1. Click "➕ New Booking"
2. Click "CONFIRM BOOKING" without filling any fields

**Expected Results**:
```
✅ Red error alert appears: "❌ Please enter pickup location"
✅ Alert shows at top-right corner
✅ Form does NOT submit
✅ Booking is NOT added to list
✅ Booking is NOT saved to database
```

**Repeat for each required field**:
- Pickup Location → Error: "Please enter pickup location"
- Dropoff Location → Error: "Please enter dropoff location"
- Pickup Date → Error: "Please select pickup date"
- Pickup Time → Error: "Please select pickup time"
- Phone Number → Error: "Please enter phone number"
- Terms Checkbox → Error: "Please agree to terms and conditions"

---

### TEST 4: Form Field Validation (Invalid Phone)

**Steps**:
1. Fill form with valid data except phone
2. Leave phone field empty or with invalid format
3. Try to submit

**Expected Results**:
```
✅ Red error alert: "Please enter phone number"
✅ Form does not submit
```

---

### TEST 5: Successful Booking Creation

**Steps**:
1. Click "➕ New Booking"
2. Fill form with:
   ```
   Booking Type: Premium Cars (₹5000/day)
   Number of Days: 2
   Driver Option: With Driver
   Pickup Location: Central Station
   Dropoff Location: Airport Terminal 3
   Pickup Date: 2024-01-20 (future date)
   Pickup Time: 09:30
   Phone: +1 (555) 123-4567
   Payment Method: Credit Card
   Terms: ✓ Checked
   ```
3. Click "CONFIRM BOOKING"

**Expected Results**:
```
✅ Button shows "Submitting..." state
✅ Form is disabled during submission
✅ Green success alert appears:
   "✅ Booking submitted successfully! Your booking 
    is pending confirmation."
✅ Form disappears/closes
✅ Form fields clear
✅ New booking appears at top of list
✅ Booking status shows: "PENDING" (orange badge)
✅ All entered data visible in booking card
✅ Alert auto-dismisses after 5 seconds
```

**Backend Verification**:
```bash
mysql> SELECT * FROM bookings ORDER BY created_at DESC LIMIT 1;
# Should show:
# id=1, user_id=<your_id>, booking_type='premium', 
# number_of_days=2, driver_option='with-driver',
# pickup_location='Central Station', etc.
```

**Database Fields Check**:
```
✅ id - Auto-generated primary key
✅ user_id - Matches logged-in user
✅ booking_type - 'premium'
✅ number_of_days - 2
✅ driver_option - 'with-driver'
✅ pickup_location - 'Central Station'
✅ dropoff_location - 'Airport Terminal 3'
✅ pickup_date - 2024-01-20
✅ pickup_time - 09:30:00
✅ phone - '+1 (555) 123-4567'
✅ payment_method - 'credit-card'
✅ total_amount - 11000.00 (calculation: (5000+500)*2)
✅ status - 'pending'
✅ agree_to_terms - 1 (true)
✅ created_at - Current timestamp
✅ updated_at - Current timestamp
```

---

### TEST 6: Price Calculation Verification

**Scenario A: Premium with Driver, 3 days**
```
Input:
- Booking Type: Premium (₹5,000/day)
- Days: 3
- Driver: With Driver (₹500/day)

Expected: ₹45,000
Calculation: (5,000 + 500) × 3 = 45,000
Display: "Estimated Total: ₹45,000"
```

**Scenario B: Local without Driver, 2 days**
```
Input:
- Booking Type: Local (₹1,500/day)
- Days: 2
- Driver: Without Driver

Expected: ₹3,000
Calculation: (1,500 + 0) × 2 = 3,000
Display: "Estimated Total: ₹3,000"
```

**Scenario C: Taxi, 5 days**
```
Input:
- Booking Type: On-Demand Taxi (₹100/day)
- Days: 5
- Driver: (Not applicable)

Expected: ₹500
Calculation: 100 × 5 = 500
Display: "Estimated Total: ₹500"
```

**Verification Steps**:
1. In form, select each booking type
2. Watch the summary section update
3. Change days and see price recalculate
4. Toggle driver option and see price change

---

### TEST 7: View Booking Details Modal

**Steps**:
1. Create a booking (or use existing)
2. Click "👁️ VIEW DETAILS" button on booking card

**Expected Results**:
```
✅ Modal overlay appears with semi-transparent background
✅ Modal window centered on screen
✅ Modal shows title: "📋 Booking Details"
✅ Close button (✕) visible in top-right
```

**Modal Content Verification**:
```
Trip Information Section:
  ✅ Booking ID: #1 (or respective ID)
  ✅ Booking Type: PREMIUM
  ✅ Status: PENDING (orange badge)

Location & Date Section:
  ✅ Pickup Location: Central Station
  ✅ Dropoff Location: Airport Terminal 3
  ✅ Pickup Date & Time: 01/20/2024 at 09:30
  ✅ Number of Days: 2

Service Details Section:
  ✅ Driver Option: With Driver 👤
  ✅ Payment Method: CREDIT CARD

Contact Information Section:
  ✅ Phone Number: +1 (555) 123-4567

Amount Section:
  ✅ Total Amount: ₹11,000 (red, large font)
```

**Modal Interactions**:
1. Click "CLOSE" button → Modal closes
2. Click outside modal → Modal closes
3. Click "✕" close button → Modal closes

---

### TEST 8: Cancel Booking from Modal

**Steps**:
1. Open booking details modal
2. Click "✕ CANCEL BOOKING" button

**Expected Results**:
```
✅ Confirmation dialog appears:
   "Are you sure you want to cancel this booking?"
✅ User must click "OK" or "Cancel" to proceed
```

**If User Clicks Cancel**:
```
✅ Dialog closes
✅ Booking remains unchanged
✅ Modal still open
```

**If User Clicks OK**:
```
✅ Dialog closes
✅ Modal closes
✅ Green success alert appears:
   "✅ Booking cancelled successfully"
✅ Booking status in list changes to "CANCELLED" (red)
✅ Cancel button removed from card
✅ Alert auto-dismisses
```

**Database Verification**:
```bash
mysql> SELECT status FROM bookings WHERE id=1;
# Should show: 'cancelled'
```

---

### TEST 9: Cancel Button Availability

**Test with PENDING Booking**:
1. Create a new booking
2. Status shows "PENDING"
3. Click "👁️ VIEW DETAILS"

**Expected**:
```
✅ "✕ CANCEL BOOKING" button visible and enabled
✅ Can click and cancel
```

**Test with COMPLETED Booking**:
1. (Admin changes status to 'completed')
2. Refresh page
3. Click "👁️ VIEW DETAILS"

**Expected**:
```
✅ "✕ CANCEL BOOKING" button NOT visible
✅ Only "CLOSE" button shown
```

**Test with CANCELLED Booking**:
1. Cancel a booking (from TEST 8)
2. Status shows "CANCELLED"
3. Click "👁️ VIEW DETAILS"

**Expected**:
```
✅ "✕ CANCEL BOOKING" button NOT visible
✅ Only "CLOSE" button shown
```

---

### TEST 10: My Profile Tab

**Steps**:
1. Click "👤 MY PROFILE" in sidebar

**Expected Results**:
```
✅ Content changes to profile view
✅ Shows: Email: customer@example.com
✅ Shows: Full Name: John Doe (or logged-in user)
✅ Shows: Account Type: 👤 Customer
✅ Shows: Total Bookings: X (number of bookings created)
✅ "EDIT PROFILE" button visible (not functional yet)
```

**Verification**:
- Email should match login email
- Name should match user data
- Total bookings count should increase as you create bookings

---

### TEST 11: Booking History Tab

**Steps**:
1. Click "📊 BOOKING HISTORY" in sidebar

**Expected Results**:
```
✅ Content changes to history view
✅ Shows list of all bookings
✅ Bookings shown with compact format
✅ Each booking shows:
   - Type with icon (🚗 PREMIUM, 🚙 LOCAL, 🚕 TAXI)
   - Date & Time (e.g., 01/20/2024 - 09:30 AM)
   - Locations (From → To)
   - Status badge with color
```

**If Multiple Bookings**:
```
✅ List shows in chronological order (newest first)
✅ Can scroll through history
✅ Cancelled bookings show with red badge
✅ Completed bookings show with blue badge
```

**If No Bookings**:
```
✅ Shows: "No booking history yet"
```

---

### TEST 12: Tab Switching Smooth Transition

**Steps**:
1. Create multiple bookings
2. Click each tab: My Bookings → My Profile → Booking History
3. Click back to My Bookings

**Expected Results**:
```
✅ Content smoothly transitions
✅ No lag or flickering
✅ Form closes when switching tabs
✅ Data persists correctly
✅ No errors in console
```

---

### TEST 13: Multiple Alerts in Sequence

**Steps**:
1. Try to submit form without pickup location
2. Fix it and submit again successfully
3. Try to create another booking with validation error
4. Fix and submit

**Expected Results**:
```
✅ First alert: Red error alert appears
✅ Stays on screen (doesn't auto-dismiss immediately)
✅ Second alert: Green success alert appears
✅ Auto-dismisses after 5 seconds
✅ Third alert: Red error alert
✅ Fourth alert: Green success alert
✅ Alerts don't overlap or interfere
```

---

### TEST 14: Alert Auto-Dismiss

**Steps**:
1. Create a booking successfully
2. Green success alert appears
3. Wait 5 seconds without clicking anything

**Expected Results**:
```
✅ Alert visible for ~5 seconds
✅ Alert smoothly fades out
✅ No error in console
✅ Next action can proceed normally
```

---

### TEST 15: Responsive Design - Mobile (375px)

**Setup**:
1. Open DevTools (F12)
2. Toggle device toolbar
3. Select iPhone SE (375px) or smaller

**Expected Results**:
```
Mobile Dashboard Layout:
  ✅ Header content stacks properly
  ✅ Sidebar hidden or becomes vertical
  ✅ Content takes full width
  ✅ Forms are readable and usable
  ✅ Buttons are touch-friendly (>44px)
  ✅ Text is readable (no zooming needed)
  ✅ Modal fits screen
  ✅ Alerts visible and accessible
```

**Form on Mobile**:
```
  ✅ Fields stack vertically
  ✅ Full-width input fields
  ✅ Keyboard doesn't hide critical buttons
  ✅ Date/time pickers work correctly
  ✅ Select dropdowns accessible
```

---

### TEST 16: Responsive Design - Tablet (768px)

**Setup**:
1. Open DevTools
2. Select iPad (768px) or similar

**Expected Results**:
```
Tablet Dashboard Layout:
  ✅ Sidebar visible with adjusted spacing
  ✅ Content area properly sized
  ✅ Grid layout for forms adjusted
  ✅ All content readable
  ✅ Touch targets appropriately sized
```

---

### TEST 17: Responsive Design - Desktop (1920px)

**Setup**:
1. Maximize browser window
2. Or set zoom to 100%

**Expected Results**:
```
Desktop Dashboard Layout:
  ✅ Full sidebar on left
  ✅ Content takes remaining space
  ✅ 2-column form layout
  ✅ Proper spacing and alignment
  ✅ All content visible without scrolling horizontally
```

---

### TEST 18: LocalStorage Persistence

**Setup**:
1. Login successfully
2. Open DevTools → Application → LocalStorage

**Expected Keys**:
```
✅ authToken - Token string
✅ userData - JSON with {id, email, firstName, lastName, role}
```

**Test Persistence**:
1. Close tab
2. Reopen `http://localhost:5173`
3. Should auto-login and show dashboard

**Expected**:
```
✅ No login page shown
✅ Dashboard loads with previous user data
✅ Bookings list loads without re-logging
```

---

### TEST 19: Network Error Handling

**Steps**:
1. Stop backend server (Ctrl+C in terminal)
2. On dashboard, click "➕ New Booking"
3. Fill form and try to submit

**Expected Results**:
```
✅ Red error alert appears after timeout
✅ Error message is clear and helpful
✅ "Failed to submit booking" shown
✅ Form remains filled with data (not lost)
✅ Can retry or fix without re-entering
```

**Resume Backend**:
1. Restart `python manage.py runserver`
2. Try submitting again
3. Should work normally

---

### TEST 20: Token Expiration (Long Session)

**Setup**:
1. Set backend token expiration to 1 minute (for testing)
2. Login successfully
3. Wait 2 minutes
4. Try to create a booking

**Expected Results**:
```
✅ API call fails with 401 Unauthorized
✅ Red error alert appears
✅ User should see: "Authentication required"
✅ Should redirect to login or show login prompt
```

---

## 🔍 Browser Console Verification

### Expected Logs (No Errors)
```javascript
// In DevTools Console (F12 → Console tab)

// Should see NO red error messages
// Should see NO "TypeError" or "SyntaxError"
// Should see NO "404 Not Found" for API calls

// API Calls in Network tab:
GET /api/bookings/my_bookings/ → 200 OK
POST /api/bookings/ → 201 Created
PATCH /api/bookings/{id}/ → 200 OK
```

### Checking for Warnings
```
⚠️ Some warnings are OK (deprecated features, etc.)
❌ Critical errors block functionality
```

---

## 📊 Backend Response Verification

### Sample Response for GET /api/bookings/my_bookings/
```json
{
  "status": "success",
  "count": 2,
  "data": [
    {
      "id": 1,
      "booking_type": "premium",
      "number_of_days": 2,
      "driver_option": "with-driver",
      "pickup_location": "Central Station",
      "dropoff_location": "Airport Terminal 3",
      "pickup_date": "2024-01-20",
      "pickup_time": "09:30:00",
      "phone": "+1 (555) 123-4567",
      "payment_method": "credit-card",
      "total_amount": "11000.00",
      "status": "pending",
      "created_at": "2024-01-15T10:30:45Z",
      "updated_at": "2024-01-15T10:30:45Z"
    }
  ]
}
```

### Sample Response for POST /api/bookings/
```json
{
  "status": "success",
  "message": "Booking created successfully",
  "data": {
    "id": 2,
    "booking_type": "local",
    "number_of_days": 1,
    "driver_option": "without-driver",
    "pickup_location": "Hotel A",
    "dropoff_location": "Station B",
    "pickup_date": "2024-01-21",
    "pickup_time": "15:00:00",
    "phone": "+1 (555) 987-6543",
    "payment_method": "upi",
    "total_amount": "1500.00",
    "status": "pending",
    "created_at": "2024-01-15T10:45:30Z",
    "updated_at": "2024-01-15T10:45:30Z"
  }
}
```

---

## ✅ Final Verification Checklist

### Dashboard Functionality
- [ ] Login works
- [ ] Bookings load on startup
- [ ] Form creates bookings
- [ ] Prices calculate correctly
- [ ] Alerts show and dismiss
- [ ] Modal opens/closes
- [ ] Cancel booking works
- [ ] Tabs switch smoothly
- [ ] Profile shows user data
- [ ] History displays all bookings

### Data Persistence
- [ ] Bookings save to database
- [ ] All fields stored correctly
- [ ] User ID linked properly
- [ ] Status defaults to pending
- [ ] Total amount matches calculation
- [ ] Timestamps auto-generated

### User Experience
- [ ] Form validation works
- [ ] Error messages clear
- [ ] Success alerts appear
- [ ] Loading states visible
- [ ] No console errors
- [ ] Responsive on all sizes
- [ ] Smooth animations

### API Integration
- [ ] Token sent in headers
- [ ] 200/201 status codes
- [ ] Error messages displayed
- [ ] Auto-refresh works
- [ ] No CORS issues

---

## 🎯 Summary

**All tests passing** ✅ = Production Ready

**Partial success** = Review error logs and fix issues

**Major failures** = Contact support or review QUICK_START_DASHBOARD.md

---

**Total Test Coverage**: 20+ comprehensive test scenarios
**Expected Duration**: 30-45 minutes for full testing
**Status**: Ready for deployment after all tests pass ✅
