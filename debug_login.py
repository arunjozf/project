#!/usr/bin/env python
"""
Debug login response
"""
import requests
import json
import uuid

BASE_URL = "http://localhost:8000/api"

# Test signup
email = f"test_{uuid.uuid4().hex[:8]}@test.com"
signup_data = {
    "firstName": "Test",
    "lastName": "User",
    "email": email,
    "password": "TestPassword123",
    "confirmPassword": "TestPassword123",
    "role": "customer"
}

print("Signing up...")
signup_resp = requests.post(f"{BASE_URL}/users/signup/", json=signup_data)
print(f"Status: {signup_resp.status_code}")
print(f"Response:\n{json.dumps(signup_resp.json(), indent=2)}")

# Test login
print("\n\nLogging in...")
login_data = {
    "email": email,
    "password": "TestPassword123"
}

login_resp = requests.post(f"{BASE_URL}/users/login/", json=login_data)
print(f"Status: {login_resp.status_code}")
print(f"Response:\n{json.dumps(login_resp.json(), indent=2)}")
