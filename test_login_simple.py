#!/usr/bin/env python
import os
import sys
import django

# Setup Django
sys.path.insert(0, 'c:\\Users\\7280\\OneDrive\\Attachments\\Desktop\\project\\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
import requests
import json

User = get_user_model()

# Check users in database
print("=" * 60)
print("USERS IN DATABASE")
print("=" * 60)
users = User.objects.all()
print(f"Total users: {users.count()}")
for u in users:
    print(f"\n  Email: {u.email}")
    print(f"  Role: {u.role}")
    print(f"  Name: {u.first_name} {u.last_name}")
    print(f"  Active: {u.is_active}")

# Try to login as admin
print("\n" + "=" * 60)
print("TESTING LOGIN ENDPOINT")
print("=" * 60)

try:
    response = requests.post(
        'http://localhost:8000/api/users/login/',
        json={
            'email': 'admin@example.com',
            'password': 'admin123456'
        }
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
except Exception as e:
    print(f"Error: {e}")
    print("Make sure Django server is running on http://localhost:8000")

print("\n" + "=" * 60)
