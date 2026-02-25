"""
Test script to verify driver creation endpoint works
"""
import django
import os
import sys

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.insert(0, r'c:\Users\7280\OneDrive\Attachments\Desktop\project\backend')

django.setup()

from django.test import Client
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token
from users.models import User
from bookings.models import Driver

# Create manager user
print("Creating test manager...")
manager_email = "manager@test.com"

# Delete if exists
User.objects.filter(email=manager_email).delete()

manager = User.objects.create_user(
    username="testmanager",
    email=manager_email,
    first_name="John",
    last_name="Manager",
    password="TestPassword@123",
    role="manager",
    is_active=True
)

# Get token
token = Token.objects.get_or_create(user=manager)[0]

print(f"✓ Manager created: {manager.email}")
print(f"✓ Token: {token.key}")

# Test driver creation endpoint
client = APIClient()
client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')

driver_data = {
    "firstName": "Jane",
    "lastName": "Driver",
    "email": "jane.driver@test.com",
    "phone": "9876543210",
    "licenseNumber": "DL123456",
    "licenseExpiry": "2025-12-31",
    "experienceYears": 5
}

print("\n" + "="*60)
print("Testing Driver Creation Endpoint")
print("="*60)
print(f"POST /api/bookings/manager/drivers/")
print(f"Data: {driver_data}")
print()

response = client.post(
    'http://localhost:8000/api/bookings/manager/drivers/',
    driver_data,
    format='json'
)

print(f"Status Code: {response.status_code}")
print(f"Response: {response.json()}")

if response.status_code == 201:
    print("\n✅ SUCCESS! Driver creation endpoint works!")
    data = response.json()
    print(f"Driver ID: {data['data']['id']}")
    print(f"User Email: {data['data']['user']['email']}")
    print(f"License: {data['data']['licenseNumber']}")
    print(f"Note: {data['data']['note']}")
    
    # Verify driver was created
    driver = Driver.objects.get(id=data['data']['id'])
    print(f"\n✓ Driver profile verified in database")
    print(f"  - User: {driver.user.email}")
    print(f"  - License: {driver.license_number}")
    print(f"  - Verified: {driver.is_verified}")
    print(f"  - Status: {driver.status}")
else:
    print(f"\n❌ FAILED! Status: {response.status_code}")
    print(f"Error: {response.json()}")

print("\n" + "="*60)
