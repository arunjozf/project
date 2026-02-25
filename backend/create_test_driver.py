#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from bookings.models import Driver

User = get_user_model()

# Create a test driver user
driver_user = User.objects.create_user(
    username='driver1@example.com',
    email='driver1@example.com',
    password='DriverPass123',
    first_name='John',
    last_name='Driver',
    role='driver',
    is_verified=True
)

# Create driver profile
driver = Driver.objects.create(
    user=driver_user,
    license_number='DL-2026-00001',
    license_expiry='2028-12-31',
    experience_years=5,
    is_verified=True,
    total_trips=25,
    average_rating=4.8
)

print("✓ Driver created successfully!")
print(f"  Driver ID: {driver.id}")
print(f"  User: {driver_user.email}")
print(f"  License: {driver.license_number}")
print(f"  Experience: {driver.experience_years} years")
