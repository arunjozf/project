#!/usr/bin/env python
import requests
import json

base_url = 'http://localhost:8000/api'

test_cases = [
    {
        'name': 'Admin Login',
        'email': 'admin@example.com',
        'password': 'admin123'
    },
    {
        'name': 'Manager Login',
        'email': 'manager@example.com',
        'password': 'manager123'
    },
    {
        'name': 'Customer Login',
        'email': 'customer@example.com',
        'password': 'customer123'
    }
]

print("=" * 70)
print("Testing Login Endpoints")
print("=" * 70)

for test in test_cases:
    print(f"\n{test['name']}")
    print("-" * 70)
    
    try:
        response = requests.post(
            f'{base_url}/users/login/',
            json={
                'email': test['email'],
                'password': test['password']
            }
        )
        
        print(f"Status Code: {response.status_code}")
        data = response.json()
        print(f"Status: {data.get('status')}")
        print(f"Message: {data.get('message')}")
        
        if 'data' in data:
            user_data = data['data']
            print(f"User ID: {user_data.get('id')}")
            print(f"Email: {user_data.get('email')}")
            print(f"Role: {user_data.get('role')}")
            print(f"Name: {user_data.get('firstName')} {user_data.get('lastName')}")
            print(f"Token: {user_data.get('token')[:20]}...")
        
    except Exception as e:
        print(f"Error: {e}")

print("\n" + "=" * 70)
