#!/usr/bin/env python
"""
Quick test script to check driver list API response
"""
import os
import sys
import django
from django.conf import settings

# Setup Django
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from bookings.models import Driver, User
from bookings.serializers import DriverSerializer
import json

# Get all drivers
drivers = Driver.objects.select_related('user').all()
print(f"Total drivers in database: {drivers.count()}")

# Show each driver's verification status
for driver in drivers:
    print(f"\nDriver: {driver.user.first_name} {driver.user.last_name}")
    print(f"  Email: {driver.user.email}")
    print(f"  License: {driver.license_number}")
    print(f"  is_verified (from model): {driver.is_verified}")
    print(f"  status: {driver.status}")

# Test the serializer
print("\n" + "="*50)
print("Serializer output:")
serializer = DriverSerializer(drivers, many=True)
print(json.dumps(serializer.data, indent=2, default=str))
