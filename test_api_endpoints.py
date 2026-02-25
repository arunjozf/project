import requests
import json
import sys

BASE_URL = "http://localhost:8000/api"

# First login to get token
login_data = {
    "email": "admin@example.com",
    "password": "admin123"
}

print("=" * 60)
print("Testing Admin Dashboard Data Endpoints")
print("=" * 60)

# Try login
print("\n1. Attempting admin login...")
login_response = requests.post(f"{BASE_URL}/users/login/", json=login_data)
print(f"Status: {login_response.status_code}")

if login_response.status_code == 200:
    response_json = login_response.json()
    auth_token = response_json.get('token') or response_json.get('data', {}).get('token')
    print(f"✅ Login successful! Token: {auth_token[:20] if auth_token else 'NOT FOUND'}...")
    
    if not auth_token:
        print("Response:", json.dumps(response_json, indent=2))
        sys.exit(1)
    
    headers = {
        'Authorization': f'Token {auth_token}',
        'Content-Type': 'application/json'
    }
    
    # Test admin stats endpoint
    print("\n2. Testing /api/bookings/admin/stats/...")
    stats_response = requests.get(f"{BASE_URL}/bookings/admin/stats/", headers=headers)
    print(f"Status: {stats_response.status_code}")
    if stats_response.status_code == 200:
        print("Response:", json.dumps(stats_response.json(), indent=2))
    else:
        print("Error:", stats_response.text)
    
    # Test admin users endpoint
    print("\n3. Testing /api/bookings/admin/users/...")
    users_response = requests.get(f"{BASE_URL}/bookings/admin/users/", headers=headers)
    print(f"Status: {users_response.status_code}")
    if users_response.status_code == 200:
        data = users_response.json()
        print(f"Response (first user only):")
        print(json.dumps(data[:1] if isinstance(data, list) else data, indent=2))
    else:
        print("Error:", users_response.text)
    
    # Test all bookings endpoint
    print("\n4. Testing /api/bookings/all_bookings/...")
    bookings_response = requests.get(f"{BASE_URL}/bookings/all_bookings/", headers=headers)
    print(f"Status: {bookings_response.status_code}")
    if bookings_response.status_code == 200:
        data = bookings_response.json()
        print(f"Response (first booking only):")
        print(json.dumps(data[:1] if isinstance(data, list) else data, indent=2))
    else:
        print("Error:", bookings_response.text)
    
    # Test manager stats endpoint
    print("\n5. Testing /api/bookings/manager/stats/ (as admin)...")
    manager_stats = requests.get(f"{BASE_URL}/bookings/manager/stats/", headers=headers)
    print(f"Status: {manager_stats.status_code}")
    print("Response:", json.dumps(manager_stats.json(), indent=2) if manager_stats.status_code == 200 else manager_stats.text)
    
    # Test manager bookings endpoint
    print("\n6. Testing /api/bookings/manager/bookings/ (as admin)...")
    manager_bookings = requests.get(f"{BASE_URL}/bookings/manager/bookings/", headers=headers)
    print(f"Status: {manager_bookings.status_code}")
    print("Response:", json.dumps(manager_bookings.json(), indent=2) if manager_bookings.status_code == 200 else manager_bookings.text)

else:
    print("❌ Login failed!")
    print("Response:", login_response.text)
