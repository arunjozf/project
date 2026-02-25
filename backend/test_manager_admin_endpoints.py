"""
Test Manager and Admin API Endpoints
"""
import requests
import json

BASE_URL = 'http://localhost:8000/api'

# Admin credentials
ADMIN_EMAIL = 'admin@example.com'
ADMIN_PASSWORD = 'Admin@123'

def test_endpoints():
    print("=" * 70)
    print("TESTING MANAGER & ADMIN API ENDPOINTS")
    print("=" * 70)
    
    # Step 1: Login as admin
    print("\n[STEP 1] Logging in as admin...")
    login_response = requests.post(
        f'{BASE_URL}/users/login/',
        json={'email': ADMIN_EMAIL, 'password': ADMIN_PASSWORD},
        timeout=5
    )
    
    if login_response.status_code != 200:
        print(f"Login failed: {login_response.text}")
        return
    
    admin_data = login_response.json()
    admin_token = admin_data['data']['token']
    print(f"[OK] Admin login successful. Token: {admin_token[:20]}...")
    
    headers = {
        'Authorization': f'Token {admin_token}',
        'Content-Type': 'application/json'
    }
    
    # Step 2: Test Manager Stats endpoint
    print("\n[STEP 2] Testing GET /api/bookings/manager/stats/...")
    try:
        response = requests.get(
            f'{BASE_URL}/bookings/manager/stats/',
            headers=headers,
            timeout=5
        )
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"[OK] Manager stats retrieved successfully")
            print(json.dumps(data['data'], indent=2))
        else:
            print(f"[FAILED] {response.text}")
    except Exception as e:
        print(f"[ERROR] {str(e)}")
    
    # Step 3: Test Admin Stats endpoint
    print("\n[STEP 3] Testing GET /api/bookings/admin/stats/...")
    try:
        response = requests.get(
            f'{BASE_URL}/bookings/admin/stats/',
            headers=headers,
            timeout=5
        )
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"[OK] Admin stats retrieved successfully")
            print(json.dumps(data['data'], indent=2))
        else:
            print(f"[FAILED] {response.text}")
    except Exception as e:
        print(f"[ERROR] {str(e)}")
    
    # Step 4: Test Admin Users endpoint
    print("\n[STEP 4] Testing GET /api/bookings/admin/users/...")
    try:
        response = requests.get(
            f'{BASE_URL}/bookings/admin/users/',
            headers=headers,
            timeout=5
        )
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"[OK] Admin users retrieved successfully")
            print(f"Total users: {data['count']}")
            if data['data']:
                print(f"Sample user: {data['data'][0]['email']} (role: {data['data'][0]['role']})")
        else:
            print(f"[FAILED] {response.text}")
    except Exception as e:
        print(f"[ERROR] {str(e)}")
    
    # Step 5: Test Admin Payments endpoint
    print("\n[STEP 5] Testing GET /api/bookings/admin/payments/...")
    try:
        response = requests.get(
            f'{BASE_URL}/bookings/admin/payments/',
            headers=headers,
            timeout=5
        )
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"[OK] Admin payments retrieved successfully")
            print(f"Total payments: {data['count']}")
        else:
            print(f"[FAILED] {response.text}")
    except Exception as e:
        print(f"[ERROR] {str(e)}")
    
    # Step 6: Test Admin Settings endpoint
    print("\n[STEP 6] Testing GET /api/bookings/admin/settings/...")
    try:
        response = requests.get(
            f'{BASE_URL}/bookings/admin/settings/',
            headers=headers,
            timeout=5
        )
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"[OK] Admin settings retrieved successfully")
            print(json.dumps(data['data'], indent=2))
        else:
            print(f"[FAILED] {response.text}")
    except Exception as e:
        print(f"[ERROR] {str(e)}")
    
    # Step 7: Test Manager Bookings endpoint
    print("\n[STEP 7] Testing GET /api/bookings/manager/bookings/...")
    try:
        response = requests.get(
            f'{BASE_URL}/bookings/manager/bookings/',
            headers=headers,
            timeout=5
        )
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"[OK] Manager bookings retrieved successfully")
            print(f"Pending bookings: {data['count']}")
        else:
            print(f"[FAILED] {response.text}")
    except Exception as e:
        print(f"[ERROR] {str(e)}")
    
    print("\n" + "=" * 70)
    print("TEST COMPLETE")
    print("=" * 70)

if __name__ == '__main__':
    test_endpoints()
