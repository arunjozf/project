# Quick Start Guide - Enhanced Customer Dashboard

## Prerequisites
- Node.js installed (for frontend)
- Python 3.9+ installed (for backend)
- MySQL running with database `autonexus_db`
- Backend running on `http://localhost:8000`
- Frontend running on `http://localhost:5173`

## Frontend Setup

### Step 1: Install Dependencies
```bash
cd frontend
npm install
```

### Step 2: Start Development Server
```bash
npm run dev
```

Frontend will be available at: `http://localhost:5173`

## Backend Setup

### Step 1: Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### Step 2: Run Migrations
```bash
python manage.py migrate
```

### Step 3: Create Test User (Optional)
```bash
python create_test_user.py
```

This creates:
- Email: `customer@example.com`
- Password: `password123`
- Role: `customer`

### Step 4: Start Development Server
```bash
python manage.py runserver
```

Backend will be available at: `http://localhost:8000`

## Testing the Enhanced Dashboard

### Test Scenario 1: Login and Create Booking

1. **Login with Test User**
   - Go to `http://localhost:5173`
   - Click on "LOGIN"
   - Enter credentials:
     - Email: `customer@example.com`
     - Password: `password123`
   - Click "Login"
   - Should redirect to UserDashboard

2. **Create New Booking**
   - Click "➕ New Booking" button
   - Fill in the form:
     - **Booking Type**: Premium Cars (₹5000/day)
     - **Number of Days**: 3
     - **Driver Option**: With Driver
     - **Pickup Location**: New York Central Station
     - **Dropoff Location**: JFK Airport
     - **Pickup Date**: Select tomorrow or later (cannot be past date)
     - **Pickup Time**: 10:00 AM
     - **Phone**: +1 (555) 123-4567
     - **Payment Method**: Credit Card
     - **Agree to Terms**: Check the checkbox
   
3. **Expected Result**
   - ✅ See "Confirm Booking" button enabled
   - ✅ Price calculation shows: ₹45,000 (5000 + 500) * 3 days
   - ✅ Green success alert appears: "✅ Booking submitted successfully!"
   - ✅ Form clears and closes
   - ✅ New booking appears in the list with status "pending"

### Test Scenario 2: View Booking Details

1. **Click "👁️ View Details"** on the booking you just created
2. **Expected Result**
   - ✅ Modal opens with complete booking information
   - ✅ Shows Booking ID, type, status
   - ✅ Shows location and date/time details
   - ✅ Shows driver option and payment method
   - ✅ Shows total amount: ₹45,000
   - ✅ All information matches what you entered

### Test Scenario 3: Cancel Booking

1. **In the modal, click "✕ Cancel Booking"**
2. **Confirm the cancellation dialog**
3. **Expected Result**
   - ✅ Green success alert: "✅ Booking cancelled successfully"
   - ✅ Modal closes
   - ✅ Booking status in list changes to "cancelled" (Red badge)
   - ✅ "Cancel Booking" button is no longer visible for that booking

### Test Scenario 4: View Profile

1. **Click "👤 My Profile" tab**
2. **Expected Result**
   - ✅ See email address
   - ✅ See full name
   - ✅ See account type: "👤 Customer"
   - ✅ See total bookings count

### Test Scenario 5: View Booking History

1. **Click "📊 Booking History" tab**
2. **Expected Result**
   - ✅ See all your bookings listed
   - ✅ Each booking shows type, date/time, locations, and status
   - ✅ Easy to scan through booking history

### Test Scenario 6: Form Validation

1. **Click "➕ New Booking"**
2. **Try to submit without filling required fields**
   - **Expected**: Error alert appears for missing field
3. **Enter invalid phone number**
   - **Expected**: Error validation may occur
4. **Don't check terms & conditions**
   - **Expected**: Cannot submit, error alert shown
5. **Select a past date**
   - **Expected**: Date input prevents selection (browser native validation)

## API Endpoints Being Used

### 1. Fetch User Bookings
```
GET /api/bookings/my_bookings/
Authorization: Token {token}
```

**Success Response** (200):
```json
{
  "status": "success",
  "count": 2,
  "data": [
    {
      "id": 1,
      "booking_type": "premium",
      "number_of_days": 3,
      "driver_option": "with-driver",
      "pickup_location": "New York Central Station",
      "dropoff_location": "JFK Airport",
      "pickup_date": "2024-01-15",
      "pickup_time": "10:00:00",
      "phone": "+1 (555) 123-4567",
      "payment_method": "credit-card",
      "total_amount": "45000.00",
      "status": "pending",
      "created_at": "2024-01-10T12:34:56Z",
      "updated_at": "2024-01-10T12:34:56Z"
    }
  ]
}
```

### 2. Create Booking
```
POST /api/bookings/
Authorization: Token {token}
Content-Type: application/json

{
  "booking_type": "premium",
  "number_of_days": 3,
  "driver_option": "with-driver",
  "pickup_location": "New York Central Station",
  "dropoff_location": "JFK Airport",
  "pickup_date": "2024-01-15",
  "pickup_time": "10:00:00",
  "phone": "+1 (555) 123-4567",
  "agree_to_terms": true,
  "payment_method": "credit-card",
  "total_amount": 45000
}
```

**Success Response** (201):
```json
{
  "status": "success",
  "message": "Booking created successfully",
  "data": {
    "id": 2,
    "booking_type": "premium",
    "total_amount": "45000.00",
    "status": "pending",
    ...
  }
}
```

**Error Response** (400):
```json
{
  "status": "error",
  "message": "Booking creation failed",
  "errors": {
    "pickup_location": ["This field may not be blank."]
  }
}
```

### 3. Cancel Booking
```
PATCH /api/bookings/{id}/
Authorization: Token {token}
Content-Type: application/json

{
  "status": "cancelled"
}
```

**Success Response** (200):
```json
{
  "status": "success",
  "message": "Booking status updated",
  "data": {
    "id": 1,
    "status": "cancelled",
    ...
  }
}
```

## Debugging Tips

### 1. Check Backend Logs
```bash
# Terminal where backend is running
# Look for:
# - POST /api/bookings/ 201 Created
# - GET /api/bookings/my_bookings/ 200 OK
# - PATCH /api/bookings/1/ 200 OK
```

### 2. Check Frontend Console (F12)
- Look for API requests in Network tab
- Check response status codes
- Verify token is being sent in Authorization header

### 3. Check LocalStorage
- Open DevTools → Application → LocalStorage
- Look for keys: `token`, `user`, `userInfo`
- Verify token value matches header requests

### 4. Verify Database
```bash
# In MySQL
mysql -u django_user -p autonexus_db
SELECT * FROM bookings;
```

## Common Issues & Solutions

### Issue: "Authentication required" alert
**Solution**:
- Log out and log in again
- Clear browser cache and LocalStorage
- Ensure token is saved in LocalStorage
- Check backend is running

### Issue: Bookings not appearing after creation
**Solution**:
- Check browser console for API errors
- Verify backend response has correct data
- Check database: `SELECT * FROM bookings;`
- Ensure user_id matches logged-in user

### Issue: Alert not showing
**Solution**:
- Check browser console for errors
- Verify showAlert() function is called
- Check z-index in DevTools (should be 1000+)
- Check alert display property is not hidden

### Issue: Form validation not working
**Solution**:
- Try submitting empty form to see errors
- Check console for validation errors
- Verify handleSubmitBooking is being called
- Check field names match state object

### Issue: Modal not opening
**Solution**:
- Click "View Details" button again
- Check console for errors
- Verify selectedBooking state is updating
- Check modal CSS is not hidden

## Performance Notes

- Bookings list loads on component mount
- Alert auto-dismisses after 5 seconds
- Form submission shows loading state
- Modal has smooth animations
- All API calls have error handling
- Total files with new changes: 2 (JSX + CSS)
- Code is optimized and efficient

## Next Steps

### For Production Deployment

1. **Backend**:
   - Set `DEBUG=False` in settings.py
   - Configure allowed hosts
   - Set up proper database backup
   - Enable HTTPS (SSL certificate)
   - Configure CORS for production domain

2. **Frontend**:
   - Build for production: `npm run build`
   - Deploy to web server (Vercel, Netlify, etc.)
   - Set proper API_BASE_URL for production
   - Enable service workers for offline support

3. **Database**:
   - Regular backups
   - Monitor performance
   - Optimize queries if needed
   - Archive old bookings (60+ days)

## Support & Questions

For issues:
1. Check the DASHBOARD_IMPLEMENTATION.md file
2. Review backend logs
3. Check browser DevTools console
4. Verify database entries
5. Ensure all services are running

Happy booking! 🚗✨
