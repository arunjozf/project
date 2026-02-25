#!/usr/bin/env python
"""
Quick API test for admin stats
"""
import requests
import json

BASE_URL = 'http://localhost:8000/api'

# Login
login_response = requests.post(f'{BASE_URL}/users/login/', json={
    'email': 'admin@example.com',
    'password': 'admin123'
})

if login_response.status_code == 200:
    token = login_response.json()['data']['token']
    print(f"✅ Logged in with token: {token[:20]}...")
    
    headers = {
        'Authorization': f'Token {token}',
        'Content-Type': 'application/json'
    }
    
    # Test stats endpoint
    print("\n" + "="*60)
    print("ADMIN STATS ENDPOINT TEST")
    print("="*60)
    
    response = requests.get(f'{BASE_URL}/bookings/admin/stats/', headers=headers)
    print(f"\nStatus Code: {response.status_code}")
    print(f"Response:\n{json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 200:
        data = response.json()['data']
        print("\n" + "="*60)
        print("KEY STATS:")
        print("="*60)
        print(f"Total Users: {data.get('totalUsers', 'N/A')}")
        print(f"Total Managers: {data.get('totalManagers', 'N/A')}")
        print(f"Total Customers: {data.get('totalCustomers', 'N/A')}")
        print(f"Total Drivers: {data.get('totalDrivers', 'N/A')}")
        print(f"Total Bookings: {data.get('totalBookings', 'N/A')}")
        print(f"Pending Bookings: {data.get('pendingBookings', 'N/A')}")
        print(f"Confirmed Bookings: {data.get('confirmedBookings', 'N/A')}")
        print(f"Total Revenue: {data.get('totalRevenue', 'N/A')}")
        print(f"Platform Health: {data.get('platformHealth', 'N/A')}")
else:
    print(f"❌ Login failed: {login_response.status_code}")
    print(login_response.text)
