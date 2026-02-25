#!/usr/bin/env python
import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from bookings.models import Booking
from bookings.serializers import BookingSerializer
from rest_framework.authtoken.models import Token

User = get_user_model()

# Get manager user
manager = User.objects.filter(role='manager').first()

if manager:
    print(f"Testing API response for manager: {manager.email}")
    print("=" * 80)
    
    # Get all bookings as manager would see them
    bookings = Booking.objects.all()
    
    # Serialize them
    serializer = BookingSerializer(bookings, many=True)
    
    # Check response format
    print(f"\nTotal bookings in response: {len(serializer.data)}")
    print("\nResponse structure:")
    print(json.dumps({
        'status': 'success',
        'count': len(bookings),
        'data': []  # truncated for brevity
    }, indent=2))
    
    # Check each booking
    print("\nBooking details:")
    for booking in serializer.data[:3]:  # First 3
        print(f"\nBooking ID: {booking['id']}")
        print(f"  driver_option: {booking.get('driver_option')}")
        print(f"  assigned_driver: {booking.get('assigned_driver')}")
        print(f"  status: {booking.get('status')}")
else:
    print("No manager found!")
