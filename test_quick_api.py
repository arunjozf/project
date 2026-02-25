import requests
import json

BASE_URL = "http://localhost:8000/api"
login_data = {"email": "admin@example.com", "password": "admin123"}

# Login
login_response = requests.post(f"{BASE_URL}/users/login/", json=login_data)
if login_response.status_code != 200:
    print("Login failed")
    exit(1)

response_json = login_response.json()
auth_token = response_json.get('token') or response_json.get('data', {}).get('token')

headers = {
    'Authorization': f'Token {auth_token}',
    'Content-Type': 'application/json'
}

print("\n" + "=" * 80)
print("ADMIN STATS ENDPOINT - /api/bookings/admin/stats/")
print("=" * 80)

stats_response = requests.get(f"{BASE_URL}/bookings/admin/stats/", headers=headers)
print(f"Status: {stats_response.status_code}")
if stats_response.status_code == 200:
    stats = stats_response.json()
    print(json.dumps(stats, indent=2))
else:
    print("Error:", stats_response.text)

print("\n" + "=" * 80)
print("ADMIN USERS ENDPOINT - /api/bookings/admin/users/")
print("=" * 80)

users_response = requests.get(f"{BASE_URL}/bookings/admin/users/", headers=headers)
print(f"Status: {users_response.status_code}")
if users_response.status_code == 200:
    users = users_response.json()
    if isinstance(users, list):
        print(f"Total users: {len(users)}")
        print("First user:", json.dumps(users[0] if users else {}, indent=2))
    else:
        print(json.dumps(users, indent=2))
else:
    print("Error:", users_response.text)

print("\n" + "=" * 80)
print("MANAGER STATS ENDPOINT - /api/bookings/manager/stats/")
print("=" * 80)

stats_response = requests.get(f"{BASE_URL}/bookings/manager/stats/", headers=headers)
print(f"Status: {stats_response.status_code}")
if stats_response.status_code == 200:
    stats = stats_response.json()
    print(json.dumps(stats, indent=2))
else:
    print("Error:", stats_response.text)
