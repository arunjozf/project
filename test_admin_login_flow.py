import requests
import json

# Test complete login flow
BASE_URL = "http://localhost:8000/api"

print("=" * 70)
print("TESTING COMPLETE LOGIN FLOW")
print("=" * 70)

# Step 1: Check if admin user exists
print("\n[STEP 1] Checking if admin user exists...")
try:
    response = requests.get(
        f"{BASE_URL}/users/",
        headers={"Content-Type": "application/json"}
    )
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        users = response.json()
        if isinstance(users, dict):
            users = users.get('data', []) if 'data' in users else users.get('results', [])
        admin_exists = any(u.get('email') == 'admin@example.com' for u in users if isinstance(u, dict))
        print(f"Admin exists: {admin_exists}")
except Exception as e:
    print(f"Error: {e}")

# Step 2: Test login with correct credentials
print("\n[STEP 2] Testing login with admin credentials...")
login_data = {
    "email": "admin@example.com",
    "password": "admin123"
}

try:
    response = requests.post(
        f"{BASE_URL}/users/login/",
        json=login_data,
        headers={"Content-Type": "application/json"}
    )
    print(f"Status: {response.status_code}")
    print(f"Response Headers: {dict(response.headers)}")
    
    response_json = response.json()
    print(f"Response Body:\n{json.dumps(response_json, indent=2)}")
    
    if response.status_code == 200:
        # Extract token properly
        token = response_json.get('data', {}).get('token') or response_json.get('token')
        print(f"\n✅ LOGIN SUCCESSFUL!")
        print(f"Token: {token}")
        print(f"User Role: {response_json.get('data', {}).get('role')}")
        
        # Step 3: Test using token to access protected endpoint
        print("\n[STEP 3] Testing token authentication on protected endpoint...")
        headers = {
            "Authorization": f"Token {token}",
            "Content-Type": "application/json"
        }
        
        admin_stats_response = requests.get(
            f"{BASE_URL}/bookings/admin/stats/",
            headers=headers
        )
        print(f"Admin Stats Status: {admin_stats_response.status_code}")
        print(f"Admin Stats Response: {json.dumps(admin_stats_response.json(), indent=2)}")
        
    elif response.status_code == 401:
        print("❌ LOGIN FAILED: Invalid credentials")
        print(f"Error: {response_json}")
    else:
        print(f"❌ Unexpected status code: {response.status_code}")
        
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
