#!/usr/bin/env python
import requests
import json

print("=" * 70)
print("Testing Login Endpoint Directly")
print("=" * 70)

url = 'http://localhost:8000/api/users/login/'

# Test data
test_data = {
    'email': 'admin@example.com',
    'password': 'admin123'
}

print(f"\nURL: {url}")
print(f"Method: POST")
print(f"Data: {json.dumps(test_data, indent=2)}")
print(f"\n" + "-" * 70)

try:
    response = requests.post(url, json=test_data)
    
    print(f"Status Code: {response.status_code}")
    print(f"Response Headers: {dict(response.headers)}")
    print(f"\nResponse Body:")
    print(json.dumps(response.json(), indent=2))
    
except Exception as e:
    print(f"Error: {e}")

print("\n" + "=" * 70)
