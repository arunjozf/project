#!/usr/bin/env python
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from bookings.models import Booking, Driver
from rest_framework.test import APIRequestFactory
from rest_framework.authtoken.models import Token

User = get_user_model()

print("=" * 80)
print("DRIVER ALLOCATION DIAGNOSTIC TEST")
print("=" * 80)

# Check for bookings with driver option
print("\n1. Checking bookings in database...")
all_bookings = Booking.objects.all()
print(f"   Total bookings: {all_bookings.count()}")

for booking in all_bookings:
    print(f"\n   Booking ID: {booking.id}")
    print(f"   - User: {booking.user.email}")
    print(f"   - Type: {booking.booking_type}")
    print(f"   - Driver Option: {booking.driver_option}")
    print(f"   - Assigned Driver: {booking.assigned_driver}")
    print(f"   - Status: {booking.status}")
    print(f"   - Pickup Date: {booking.pickup_date}")

# Check for drivers in database
print("\n2. Checking drivers in database...")
drivers = Driver.objects.all()
print(f"   Total drivers: {drivers.count()}")

for driver in drivers:
    print(f"\n   Driver ID: {driver.id}")
    print(f"   - User: {driver.user.email}")
    print(f"   - License: {driver.license_number}")
    print(f"   - Verified: {driver.is_verified}")

# Check for manager users
print("\n3. Checking manager users...")
managers = User.objects.filter(role='manager')
print(f"   Total managers: {managers.count()}")

for manager in managers:
    print(f"\n   Manager ID: {manager.id}")
    print(f"   - Email: {manager.email}")
    print(f"   - First Name: {manager.first_name}")
    try:
        token = Token.objects.get(user=manager)
        print(f"   - Has Token: Yes ({token.key[:10]}...)")
    except Token.DoesNotExist:
        print(f"   - Has Token: No")

# Check bookings that need drivers
print("\n4. Checking bookings needing drivers...")
bookings_needing_drivers = Booking.objects.filter(
    driver_option='with-driver',
    assigned_driver__isnull=True
)
print(f"   Bookings needing drivers: {bookings_needing_drivers.count()}")

for booking in bookings_needing_drivers:
    print(f"\n   Booking ID: {booking.id}")
    print(f"   - User: {booking.user.email}")
    print(f"   - Status: {booking.status}")
    print(f"   - Pickup: {booking.pickup_date} at {booking.pickup_time}")

print("\n" + "=" * 80)
