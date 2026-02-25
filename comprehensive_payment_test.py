#!/usr/bin/env python
"""
Comprehensive test of the payment flow manually
"""
import requests
import json
import time

BASE_URL = "http://localhost:8000/api"

print("=" * 80)
print("COMPREHENSIVE PAYMENT FLOW TEST")
print("=" * 80)

# Step 1: Sign up
print("\n[STEP 1] Creating test user...")
import uuid
email = f"testpay{uuid.uuid4().hex[:6]}@test.com"
signup_resp = requests.post(f"{BASE_URL}/users/signup/", json={
    "firstName": "Test",
    "lastName": "User",
    "email": email,
    "password": "Test@1234",
    "confirmPassword": "Test@1234",
    "role": "customer"
})
print(f"Status: {signup_resp.status_code}")
if signup_resp.status_code != 201:
    print(f"ERROR: {signup_resp.json()}")
    exit(1)
user_id = signup_resp.json()["data"]["id"]
print(f"✓ User created (ID: {user_id}, Email: {email})")

# Step 2: Login
print("\n[STEP 2] Logging in...")
login_resp = requests.post(f"{BASE_URL}/users/login/", json={
    "email": email,
    "password": "Test@1234"
})
print(f"Status: {login_resp.status_code}")
if login_resp.status_code != 200:
    print(f"ERROR: {login_resp.json()}")
    exit(1)
token = login_resp.json()["data"]["token"]
print(f"✓ Logged in successfully")
print(f"  Token: {token[:30]}...")

headers = {"Authorization": f"Token {token}", "Content-Type": "application/json"}

# Step 3: Create booking
print("\n[STEP 3] Creating a booking...")
booking_resp = requests.post(f"{BASE_URL}/bookings/", json={
    "booking_type": "taxi",
    "number_of_days": 1,
    "pickup_location": "Delhi",
    "dropoff_location": "Gurgaon",
    "pickup_date": "2026-02-20",
    "pickup_time": "14:30:00",
    "phone": "9999999999",
    "agree_to_terms": True,
    "payment_method": "credit-card"
}, headers=headers)
print(f"Status: {booking_resp.status_code}")
if booking_resp.status_code != 201:
    print(f"ERROR: {booking_resp.json()}")
    exit(1)
booking_json = booking_resp.json()
booking_id = booking_json.get("data", {}).get("id") or booking_json.get("id")
if not booking_id:
    print(f"ERROR: No booking ID in response")
    print(booking_json)
    exit(1)
total_amount = booking_json.get("data", {}).get("total_amount") or booking_json.get("total_amount")
print(f"✓ Booking created successfully")
print(f"  Booking ID: {booking_id}")
print(f"  Total Amount: ₹{total_amount}")

# Step 4: Create payment order
print("\n[STEP 4] Creating payment order...")
payment_order_resp = requests.post(
    f"{BASE_URL}/bookings/{booking_id}/create_payment_order/",
    headers=headers
)
print(f"Status: {payment_order_resp.status_code}")
payment_json = payment_order_resp.json()
print(f"Response: {json.dumps(payment_json, indent=2)}")

if payment_order_resp.status_code != 200:
    print(f"ERROR: Failed to create payment order")
    exit(1)

payment_data = payment_json.get("data", {})
order_id = payment_data.get("order_id")
test_mode = payment_data.get("test_mode")
amount = payment_data.get("amount")
key_id = payment_data.get("key_id")

print(f"✓ Payment order created!")
print(f"  Order ID: {order_id}")
print(f"  Test Mode: {test_mode}")
print(f"  Amount (paise): {amount}")
print(f"  Key ID: {key_id if key_id else '(not provided in test mode)'}")

# Step 5: Verify payment (simulating successful payment)
print("\n[STEP 5] Verifying payment...")
verify_resp = requests.post(
    f"{BASE_URL}/bookings/{booking_id}/verify_payment/",
    json={
        "razorpay_order_id": order_id,
        "razorpay_payment_id": "pay_test_12345",
        "razorpay_signature": "test_sig_12345"
    },
    headers=headers
)
print(f"Status: {verify_resp.status_code}")
verify_json = verify_resp.json()
print(f"Response: {json.dumps(verify_json, indent=2)}")

if verify_resp.status_code != 200:
    print(f"ERROR: Failed to verify payment")
    exit(1)

verified_booking = verify_json.get("data", {})
print(f"✓ Payment verified!")
print(f"  Payment Status: {verified_booking.get('payment_status')}")
print(f"  Booking Status: {verified_booking.get('status')}")

# Step 6: Get bookings to verify
print("\n[STEP 6] Getting user bookings to verify...")
bookings_resp = requests.get(f"{BASE_URL}/bookings/my_bookings/", headers=headers)
print(f"Status: {bookings_resp.status_code}")
bookings_json = bookings_resp.json()
bookings = bookings_json.get("data", bookings_json)
if isinstance(bookings, dict) and "results" in bookings:
    bookings = bookings["results"]

print(f"✓ Retrieved {len(bookings)} bookings")
if bookings:
    latest = bookings[0]
    print(f"  Latest booking ID: {latest.get('id')}")
    print(f"  Payment Status: {latest.get('payment_status')}")
    print(f"  Booking Status: {latest.get('status')}")

print("\n" + "=" * 80)
print("✓ ALL TESTS PASSED - PAYMENT FLOW WORKS!")
print("=" * 80)
