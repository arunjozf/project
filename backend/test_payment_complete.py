#!/usr/bin/env python
"""Test complete payment flow: create order + verify payment"""
import os, django, requests, json
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from bookings.models import Booking
from rest_framework.authtoken.models import Token
from datetime import datetime, timedelta

User = get_user_model()
API_BASE = 'http://localhost:8000/api'

# Setup
user, _ = User.objects.get_or_create(email='test2@example.com', 
    defaults={'username': 'test2', 'first_name': 'Test', 'last_name': 'User', 'role': 'user'})
if _: user.set_password('testpassword123'); user.save()

token, _ = Token.objects.get_or_create(user=user)

booking = Booking.objects.create(user=user, booking_type='taxi', number_of_days=1,
    pickup_location='Test', dropoff_location='Test',
    pickup_date=datetime.now().date() + timedelta(days=1),
    pickup_time=datetime.now().time(), phone='9999999999',
    payment_method='razorpay', total_amount=500.00,
    agree_to_terms=True, status='pending', payment_status='pending')

headers = {'Authorization': f'Token {token.key}', 'Content-Type': 'application/json'}

print("="*60)
print("COMPLETE PAYMENT FLOW TEST")
print("="*60)

# Step 1: Create payment order
print("\n[1] Creating payment order...")
order_response = requests.post(f'{API_BASE}/bookings/{booking.id}/create_payment_order/', 
    headers=headers, timeout=10)

if order_response.status_code != 200:
    print(f"✗ Failed: {order_response.json()}")
    exit(1)

order_data = order_response.json()['data']
print(f"✓ Order created: {order_data['order_id']}")

# Step 2: Verify payment (mock payment data)
print("\n[2] Verifying payment...")
test_payment_id = f"pay_{'A'*20}"
test_signature = 'F'*40

verify_response = requests.post(
    f'{API_BASE}/bookings/{booking.id}/verify_payment/',
    headers=headers,
    json={
        'razorpay_order_id': order_data['order_id'],
        'razorpay_payment_id': test_payment_id,
        'razorpay_signature': test_signature,
    },
    timeout=10
)

if verify_response.status_code != 200:
    print(f"✗ Failed: {verify_response.json()}")
    exit(1)

verify_data = verify_response.json()
print(f"✓ Payment verified!")
print(f"  Booking Status: {verify_data['data']['status']}")
print(f"  Booking Payment Status: {verify_data['data'].get('payment_status', 'completed')}")

print("\n" + "="*60)
print("✓ COMPLETE PAYMENT FLOW SUCCESSFUL!")
print("="*60)
