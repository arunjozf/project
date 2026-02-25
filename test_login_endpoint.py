import requests
import json

# Test login endpoint
LOGIN_URL = "http://localhost:8000/api/users/login/"

# Test with admin credentials
test_data = {
    "email": "admin@example.com",
    "password": "admin123"
}

print("=" * 60)
print("Testing Login Endpoint")
print("=" * 60)
print(f"URL: {LOGIN_URL}")
print(f"Data: {json.dumps(test_data, indent=2)}")
print("-" * 60)

try:
    response = requests.post(LOGIN_URL, json=test_data)
    print(f"Status Code: {response.status_code}")
    print(f"Headers: {dict(response.headers)}")
    print(f"Response Body: {json.dumps(response.json(), indent=2)}")
except Exception as e:
    print(f"Error: {e}")

# Also test wrong credentials
print("\n" + "=" * 60)
print("Testing with Wrong Password")
print("=" * 60)

wrong_data = {
    "email": "admin@example.com",
    "password": "wrongpassword"
}

try:
    response = requests.post(LOGIN_URL, json=wrong_data)
    print(f"Status Code: {response.status_code}")
    print(f"Response Body: {json.dumps(response.json(), indent=2)}")
except Exception as e:
    print(f"Error: {e}")
