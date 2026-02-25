#!/usr/bin/env python
"""
Test script to diagnose payment order creation failure
"""
import os
import sys
import django
import json
import requests
from datetime import datetime, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from bookings.models import Booking
from rest_framework.authtoken.models import Token

User = get_user_model()

# API base URL
API_BASE = 'http://localhost:8000/api'

def test_payment_flow():
    """Test the complete payment flow"""
    
    print("=" * 60)
    print("Payment Flow Test")
    print("=" * 60)
    
    # Step 1: Get or create test user
    print("\n[1] Getting test user...")
    user, created = User.objects.get_or_create(
        email='test@example.com',
        defaults={
            'username': 'test@example.com',
            'first_name': 'Test',
            'last_name': 'User',
            'role': 'user'
        }
    )
    if created:
        user.set_password('testpassword123')
        user.save()
        print("    ✓ Test user created")
    else:
        print("    ✓ Test user exists")
    
    # Step 2: Get or create token
    print("\n[2] Getting auth token...")
    token, _ = Token.objects.get_or_create(user=user)
    print(f"    ✓ Token: {token.key[:20]}...")
    
    # Step 3: Create a test booking
    print("\n[3] Creating test booking...")
    try:
        booking = Booking.objects.create(
            user=user,
            booking_type='taxi',
            number_of_days=1,
            pickup_location='Test Location',
            dropoff_location='Test Dropoff',
            pickup_date=datetime.now().date() + timedelta(days=1),
            pickup_time=datetime.now().time(),
            phone='9999999999',
            payment_method='razorpay',
            total_amount=500.00,
            agree_to_terms=True,
            status='pending',
            payment_status='pending'
        )
        print(f"    ✓ Booking created: ID={booking.id}, Amount={booking.total_amount}")
    except Exception as e:
        print(f"    ✗ Failed to create booking: {e}")
        return
    
    # Step 4: Test payment order creation
    print(f"\n[4] Creating payment order for booking {booking.id}...")
    
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Token {token.key}',
    }
    
    url = f'{API_BASE}/bookings/{booking.id}/create_payment_order/'
    
    try:
        response = requests.post(url, headers=headers, timeout=10)
        print(f"    HTTP Status: {response.status_code}")
        print(f"    Response Body:")
        
        try:
            data = response.json()
            print(json.dumps(data, indent=2))
            
            if response.status_code != 200:
                print(f"\n    ✗ PAYMENT ORDER CREATION FAILED")
                if 'message' in data:
                    print(f"    Error Message: {data['message']}")
                if 'data' in data and isinstance(data['data'], dict) and 'message' in data['data']:
                    print(f"    Error Detail: {data['data']['message']}")
        except ValueError:
            print(f"    {response.text}")
            
    except Exception as e:
        print(f"    ✗ Request failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    test_payment_flow()
