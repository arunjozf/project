# Razorpay Integration Guide

## Issue Summary
The payment integration is failing because the Razorpay test credentials in `settings.py` are placeholder/invalid credentials. The API returns "Authentication failed" when trying to create payment orders.

## Solution: Configure Valid Razorpay Credentials

### Step 1: Get Your Test Keys from Razorpay
1. Visit https://dashboard.razorpay.com/
2. Sign in (or create a free account for testing)
3. Go to **Settings → API Keys → Test Mode**
4. Copy your:
   - **Key ID** (starts with `rzp_test_`)
   - **Key Secret**

### Step 2: Update Your Backend Configuration

#### Option A: Using Environment Variables (Recommended)
Create a `.env` file in the `backend/` folder:

```
SECRET_KEY=django-insecure-your-secret-key
DEBUG=True
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID_HERE
RAZORPAY_KEY_SECRET=YOUR_KEY_SECRET_HERE
```

#### Option B: Direct Update to settings.py
Edit `backend/config/settings.py` (lines 165-167):

```python
RAZORPAY_KEY_ID = config('RAZORPAY_KEY_ID', default='rzp_test_YOUR_KEY_ID_HERE')
RAZORPAY_KEY_SECRET = config('RAZORPAY_KEY_SECRET', default='YOUR_KEY_SECRET_HERE')
```

### Step 3: Restart the Django Server
Once credentials are updated, restart the backend server:

```bash
cd backend
python manage.py runserver 0.0.0.0:8000
```

### Step 4: Test the Payment Flow
The payment flow should now work end-to-end:
1. Create a booking
2. Click "Proceed to Payment"
3. Razorpay checkout modal should open
4. You can use Razorpay test card: `4111 1111 1111 1111` with any future expiry and CVV

## Troubleshooting

### Still getting "Authentication failed"?
- Verify you copied the **test** keys (not production)
- Check the keys don't have extra spaces
- Restart both the Django server and browser

### Payment modal won't open?
- Check browser console for errors
- Verify your `../index.html` includes the Razorpay script:
  ```html
  <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
  ```

### Payment verification fails?
- Check the HMAC signature verification in `bookings/views.py`
- Ensure the same key secret is used for verification
- Check backend logs for detailed error messages

## Architecture

The payment flow follows this sequence:

```
User
  ↓
1. Create Booking → Backend saves booking
  ↓
2. Frontend calls createPaymentOrder API
  ↓
3. Backend calls Razorpay API to create order (needs valid credentials)
  ↓
4. Razorpay returns order_id
  ↓
5. Frontend opens Razorpay Checkout with order_id
  ↓
6. User completes payment in Razorpay
  ↓
7. Frontend sends payment details + signature to verifyPayment API
  ↓
8. Backend verifies signature using key secret
  ↓
9. If valid, booking status updated to 'confirmed'
```

## Files Involved

- `backend/config/settings.py` - Configuration storage
- `backend/bookings/views.py` - Payment endpoint implementations
- `frontend/src/components/RazorpayPayment.jsx` - Payment UI
- `frontend/src/utils/api.js` - API client methods
- `frontend/index.html` - Razorpay script inclusion

## Next Steps

1. Get your Razorpay test credentials
2. Update settings/environment with credentials
3. Restart the backend server
4. Test the complete payment flow
5. (When ready for production) Swap test keys for production keys

## Support

For more info on Razorpay integration:
- https://razorpay.com/docs/
- https://razorpay.com/docs/api/orders/
- https://razorpay.com/docs/payments/server-side-integration/
