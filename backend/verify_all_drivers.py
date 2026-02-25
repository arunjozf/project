import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

from bookings.models import Driver
from django.utils import timezone

# Get all unverified drivers
unverified = Driver.objects.filter(is_verified=False)
print(f"Found {unverified.count()} unverified drivers")

# Update them all to verified
count = 0
for driver in unverified:
    print(f"Verifying: {driver.user.first_name} {driver.user.last_name} ({driver.license_number})")
    driver.is_verified = True
    driver.verification_date = timezone.now()
    driver.save()
    count += 1

print(f"\n✓ Successfully verified {count} drivers!")

# Show all drivers now
all_drivers = Driver.objects.select_related('user').all()
print(f"\nAll drivers:")
for driver in all_drivers:
    status = "✓ Verified" if driver.is_verified else "⏳ Pending"
    print(f"  {driver.user.first_name} {driver.user.last_name} - {status}")
