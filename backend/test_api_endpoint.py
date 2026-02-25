#!/usr/bin/env python
import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.test import Client
from rest_framework.authtoken.models import Token
from bookings.models import Booking

User = get_user_model()

# Get manager user
manager = User.objects.filter(role='manager', email='alanjoseph@gmail.com').first()

if not manager:
    print("Manager not found!")
else:
    print(f"Testing API with manager: {manager.email}")
    print("=" * 80)
    
    # Get or create token
    token, created = Token.objects.get_or_create(user=manager)
    
    print(f"\nManager token: {token.key[:20]}...")
    print(f"Manager role: {manager.role}")
    
    # Test API endpoint
    client = Client()
    
    # Call the API as the manager would
    response = client.get(
        '/api/bookings/',
        HTTP_AUTHORIZATION=f'Token {token.key}',
        HTTP_CONTENT_TYPE='application/json'
    )
    
    print(f"\nAPI Response Status: {response.status_code}")
    print(f"API Response Content-Type: {response.get('Content-Type', 'Not set')}")
    
    try:
        data = json.loads(response.content)
        print(f"\nResponse Keys: {list(data.keys())}")
        print(f"\nFull Response:")
        print(json.dumps(data, indent=2, default=str)[:1000])  # First 1000 chars
    except:
        print(f"\nResponse (raw): {response.content[:500]}")
