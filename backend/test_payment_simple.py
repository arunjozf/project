#!/usr/bin/env python
"""Quick payment flow test"""
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from bookings.models import Booking
from rest_framework.authtoken.models import Token
from datetime import datetime, timedelta
import requests
import json

User = get_user_model()
API_BASE = 'http://localhost:8000/api'

# Get or create test user
user, _ = User.objects.get_or_create(
    email='test@example.com',
    defaults={'username': 'test@example.com', 'first_name': 'Test', 'last_name': 'User', 'role': 'user'}
)
if _ : user.set_password('testpassword123'); user.save()

# Get token
token, _ = Token.objects.get_or_create(user=user)

# Create booking
booking = Booking.objects.create(
    user=user, booking_type='taxi', number_of_days=1,
    pickup_location='Test', dropoff_location='Test',
    pickup_date=datetime.now().date() + timedelta(days=1),
    pickup_time=datetime.now().time(), phone='9999999999',
    payment_method='razorpay', total_amount=500.00,
    agree_to_terms=True, status='pending', payment_status='pending'
)

print(f"✓ Test user and booking created (ID={booking.id})")

# Test payment order creation
headers = {'Authorization': f'Token {token.key}', 'Content-Type': 'application/json'}
url = f'{API_BASE}/bookings/{booking.id}/create_payment_order/'

response = requests.post(url, headers=headers, timeout=10)
print(f"\nPayment Order Response ({response.status_code}):")
print(json.dumps(response.json(), indent=2))

# Check success
if response.status_code == 200:
    data = response.json()
    if data.get('status') == 'success':
        print("\n✓ PAYMENT ORDER CREATED SUCCESSFULLY!")
        print(f"  Order ID: {data['data']['order_id']}")
        print(f"  Mode: {'Test Mode (Mock)' if 'Test Mode' in data['message'] else 'Production'}")
    else:
        print(f"\n✗ Failed: {data.get('message')}")
else:
    print(f"\n✗ HTTP {response.status_code}")
