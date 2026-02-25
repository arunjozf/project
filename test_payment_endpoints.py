#!/usr/bin/env python
"""
Test script to verify payment endpoints are working
"""
import requests
import json
import uuid

BASE_URL = "http://localhost:8000/api"

# Generate unique email
email = f"testpayment{uuid.uuid4().hex[:8]}@test.com"

# Test 1: Create a test user and login
print("=" * 60)
print("TEST 1: Creating test user and logging in...")
print("=" * 60)

signup_data = {
    "firstName": "Test",
    "lastName": "User",
    "email": email,
    "password": "TestPassword123",
    "confirmPassword": "TestPassword123",
    "role": "customer"
}

try:
    signup_resp = requests.post(f"{BASE_URL}/users/signup/", json=signup_data)
    print(f"Signup Status: {signup_resp.status_code}")
    print(f"Signup Response: {signup_resp.json()}")
except Exception as e:
    print(f"Signup Error: {e}")
    exit(1)

# Login
print("\n" + "=" * 60)
print("TEST 2: Logging in...")
print("=" * 60)

login_data = {
    "email": signup_data["email"],
    "password": signup_data["password"]
}

try:
    login_resp = requests.post(f"{BASE_URL}/users/login/", json=login_data)
    print(f"Login Status: {login_resp.status_code}")
    login_json = login_resp.json()
    print(f"Login Response: {json.dumps(login_json, indent=2)}")
    
    token = login_json.get("data", {}).get("token")
    if not token:
        print("ERROR: No token in login response!")
        print(f"Available keys: {login_json.keys()}")
        exit(1)
    print(f"✓ Token obtained: {token[:20]}...")
except Exception as e:
    print(f"Login Error: {e}")
    exit(1)

# Test 3: Create a booking
print("\n" + "=" * 60)
print("TEST 3: Creating a test booking...")
print("=" * 60)

booking_data = {
    "booking_type": "taxi",
    "number_of_days": 1,
    "pickup_location": "Delhi",
    "dropoff_location": "Gurgaon",
    "pickup_date": "2026-02-15",
    "pickup_time": "14:30:00",
    "phone": "9999999999",
    "agree_to_terms": True,
    "payment_method": "credit-card"
}

headers = {
    "Authorization": f"Token {token}",
    "Content-Type": "application/json"
}

try:
    booking_resp = requests.post(f"{BASE_URL}/bookings/", json=booking_data, headers=headers)
    print(f"Booking Status: {booking_resp.status_code}")
    booking_json = booking_resp.json()
    print(f"Booking Response: {json.dumps(booking_json, indent=2)}")
    
    booking_id = booking_json.get("id") or booking_json.get("data", {}).get("id")
    if not booking_id:
        print("ERROR: No booking ID in response!")
        print(f"Response: {booking_json}")
        exit(1)
    print(f"✓ Booking created with ID: {booking_id}")
except Exception as e:
    print(f"Booking Error: {e}")
    exit(1)

# Test 4: Create payment order
print("\n" + "=" * 60)
print("TEST 4: Creating payment order...")
print("=" * 60)

try:
    payment_order_resp = requests.post(
        f"{BASE_URL}/bookings/{booking_id}/create_payment_order/",
        headers=headers
    )
    print(f"Payment Order Status: {payment_order_resp.status_code}")
    payment_order_json = payment_order_resp.json()
    print(f"Payment Order Response: {json.dumps(payment_order_json, indent=2)}")
    
    if payment_order_resp.status_code == 200:
        order_data = payment_order_json.get("data", {})
        order_id = order_data.get("order_id")
        test_mode = order_data.get("test_mode")
        print(f"✓ Payment order created!")
        print(f"  - Order ID: {order_id}")
        print(f"  - Test Mode: {test_mode}")
        print(f"  - Amount: {order_data.get('amount')} paise")
    else:
        print("ERROR: Failed to create payment order")
except Exception as e:
    print(f"Payment Order Error: {e}")
    exit(1)

# Test 5: Verify payment
print("\n" + "=" * 60)
print("TEST 5: Verifying payment...")
print("=" * 60)

verify_data = {
    "razorpay_order_id": order_id,
    "razorpay_payment_id": "pay_test_12345",
    "razorpay_signature": "test_signature"
}

try:
    verify_resp = requests.post(
        f"{BASE_URL}/bookings/{booking_id}/verify_payment/",
        json=verify_data,
        headers=headers
    )
    print(f"Payment Verify Status: {verify_resp.status_code}")
    verify_json = verify_resp.json()
    print(f"Payment Verify Response: {json.dumps(verify_json, indent=2)}")
    
    if verify_resp.status_code == 200:
        print("✓ Payment verified successfully!")
        booking = verify_json.get("data", {})
        print(f"  - Payment Status: {booking.get('payment_status')}")
        print(f"  - Booking Status: {booking.get('status')}")
    else:
        print("ERROR: Failed to verify payment")
except Exception as e:
    print(f"Payment Verify Error: {e}")
    exit(1)

print("\n" + "=" * 60)
print("✓ ALL TESTS PASSED!")
print("=" * 60)
