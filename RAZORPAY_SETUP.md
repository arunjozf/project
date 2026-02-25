# Razorpay Integration - Setup Guide

## Quick Setup (5 Minutes)

### Step 1: Create Free Razorpay Account
1. Go to https://dashboard.razorpay.com/
2. Click "Sign Up"
3. Enter your email and create account
4. Verify your email

### Step 2: Get Your Test API Keys
1. Log in to Razorpay dashboard
2. Go to **Settings** (gear icon)
3. Click **API Keys** 
4. Make sure you're on **Test Mode** tab (toggle on right)
5. Copy your:
   - **Key ID** (starts with `rzp_test_`)
   - **Key Secret**

### Step 3: Add Keys to Your Backend

#### Option A: Using Environment Variable (Recommended)
Create a `.env` file in the `backend/` directory:

```
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID_HERE
RAZORPAY_KEY_SECRET=YOUR_KEY_SECRET_HERE
```

Then restart the server.

#### Option B: Direct in settings.py
Edit `backend/config/settings.py` (around line 168):

```python
RAZORPAY_KEY_ID = 'rzp_test_YOUR_KEY_ID_HERE'
RAZORPAY_KEY_SECRET = 'YOUR_KEY_SECRET_HERE'
```

### Step 4: Restart Backend Server
```bash
cd backend
python manage.py runserver 0.0.0.0:8000
```

### Step 5: Test Payment
1. Open http://localhost:3000
2. Login or signup
3. Create a booking
4. Click "Proceed to Payment"
5. Real Razorpay modal will open
6. Use test card: **4111 1111 1111 1111**
   - Expiry: Any future date (e.g., 12/25)
   - CVV: Any 3 digits (e.g., 123)
7. Confirm payment
8. Done! ✓

## Test Card Details

For testing payments with Razorpay (works in Test Mode only):

| Field | Value |
|-------|-------|
| Card Number | 4111 1111 1111 1111 |
| Expiry | Any future date (MM/YY) |
| CVV | Any 3 digits |
| OTP | 000000 (if prompted) |

Other test cards:
- Visa: `4111 1111 1111 1111`
- Mastercard: `5555 5555 5555 4444`
- American Express: `3782 822463 10005`

## Troubleshooting

### Payment modal doesn't appear
**Problem:** "Failed to initialize payment" error

**Solution:** 
- Check you entered your Razorpay Key ID correctly
- Make sure you're on Test Mode in Razorpay dashboard
- Restart Django server after changing credentials

### Signature verification failed
**Problem:** After payment, error "Invalid payment signature"

**Solution:**
- Verify both Key ID and Key Secret are correct
- Check there are no extra spaces in the keys
- Make sure Key Secret wasn't truncated

### "Razorpay is not defined"
**Problem:** Browser console error

**Solution:**
- Check `frontend/index.html` includes Razorpay script:
  ```html
  <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
  ```
- Wait for page to fully load before testing payment

## Architecture

```
User Flow:
1. Create booking
   ↓
2. Click "Proceed to Payment"
   ↓
3. Frontend calls: POST /api/bookings/{id}/create_payment_order/
   ↓
4. Backend calls Razorpay API to create order
   ↓
5. Razorpay returns: order_id, amount
   ↓
6. Frontend opens Razorpay Checkout modal with order_id
   ↓
7. User enters payment details and confirms
   ↓
8. Razorpay processes payment
   ↓
9. Frontend calls: POST /api/bookings/{id}/verify_payment/
   ↓
10. Backend verifies signature with Razorpay key secret
    ↓
11. If valid: Booking marked "CONFIRMED", Payment "COMPLETED"
    ↓
12. Payment complete ✓
```

## Security Notes

- Never commit API keys to version control
- Use `.env` file for local development
- Use environment variables for production
- Key Secret is sensitive - treat like passwords
- Test keys are safe - they only process test transactions

## Files Reference

| File | Purpose |
|------|---------|
| `backend/config/settings.py` | Razorpay configuration |
| `backend/bookings/views.py` | Payment endpoints |
| `frontend/src/components/RazorpayPayment.jsx` | Payment UI |
| `frontend/src/utils/api.js` | API calls |
| `frontend/index.html` | Razorpay script |
| `backend/.env` | Your local credentials |

## Next Steps

1. ✓ [Get free Razorpay account](#step-1-create-free-razorpay-account)
2. ✓ [Copy your test keys](#step-2-get-your-test-api-keys)
3. ✓ [Add to your backend](#step-3-add-keys-to-your-backend)
4. ✓ [Restart server](#step-4-restart-backend-server)
5. ✓ [Test payment](#step-5-test-payment)

## Support

- Razorpay Docs: https://razorpay.com/docs/
- Test Cards: https://razorpay.com/docs/payments/payments/test-cards-upi/
- API Reference: https://razorpay.com/docs/api/orders/

---
**Last Updated:** February 10, 2026
