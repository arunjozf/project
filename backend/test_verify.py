import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.insert(0, '/src')
django.setup()

from bookings.models import Driver, User
from django.utils import timezone
import time

# Create a test user
test_email = f'testdriver{int(time.time())}@example.com'
test_username = f'testdriver{int(time.time())}'

test_user = User.objects.create_user(
    username=test_username,
    email=test_email,
    first_name='Test',
    last_name='Driver',
    password='TestPass123',
    role='driver',
    is_active=True
)

# Create a driver with is_verified=True (like the create() method does)
test_driver = Driver.objects.create(
    user=test_user,
    license_number=f'TEST-LIC-{int(time.time())}',
    license_expiry='2026-02-28',
    experience_years=5,
    is_verified=True,  # This is what we're setting
    status='available'
)

# Verify it was saved
print(f"Created driver: {test_driver.user.first_name} {test_driver.user.last_name}")
print(f"is_verified value (in memory): {test_driver.is_verified}")
print(f"Status: {test_driver.status}")

# Query it back from the database to double-check
from_db = Driver.objects.get(id=test_driver.id)
print(f"\nAfter fetching from DB:")
print(f"is_verified value (from DB): {from_db.is_verified}")
