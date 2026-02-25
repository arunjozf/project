#!/usr/bin/env python
"""
Complete signup flow test for customer and manager roles
"""
import requests
import json
import time
from datetime import datetime

API_BASE = 'http://localhost:8000/api'

def print_section(title):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}\n")

def test_signup(role, first_name, last_name, email):
    """Test signup for a given role"""
    print_section(f"Testing {role.upper()} Registration")
    
    data = {
        'firstName': first_name,
        'lastName': last_name,
        'email': email,
        'password': 'testpass123456',
        'confirmPassword': 'testpass123456',
        'role': role
    }
    
    print(f"📝 Submitting registration data:")
    print(f"   - Email: {email}")
    print(f"   - Role: {role}")
    print(f"   - Name: {first_name} {last_name}")
    
    try:
        response = requests.post(f'{API_BASE}/users/signup/', json=data, timeout=10)
        
        print(f"\n📡 Response Status: {response.status_code}")
        result = response.json()
        
        if response.status_code == 201:
            print(f"✅ SUCCESS: {result.get('message', 'Account created')}")
            print(f"   - User ID: {result['data']['id']}")
            print(f"   - Token: {result['data']['token'][:20]}...")
            print(f"   - Role: {result['data']['role']}")
            return True, result['data']
        else:
            print(f"❌ FAILED: {result.get('message', 'Signup failed')}")
            print(f"   - Errors: {json.dumps(result.get('errors', {}), indent=6)}")
            return False, result
            
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return False, None

def test_login(email, password='testpass123456'):
    """Test login for a registered user"""
    print_section(f"Testing Login for {email}")
    
    data = {
        'email': email,
        'password': password
    }
    
    print(f"🔐 Submitting login credentials:")
    print(f"   - Email: {email}")
    
    try:
        response = requests.post(f'{API_BASE}/users/login/', json=data, timeout=10)
        
        print(f"\n📡 Response Status: {response.status_code}")
        result = response.json()
        
        if response.status_code == 200:
            print(f"✅ SUCCESS: {result.get('message', 'Login successful')}")
            print(f"   - User ID: {result['data']['id']}")
            print(f"   - Role: {result['data']['role']}")
            print(f"   - Token: {result['data']['token'][:20]}...")
            return True, result['data']
        else:
            print(f"❌ FAILED: {result.get('message', 'Login failed')}")
            return False, result
            
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return False, None

def main():
    print(f"\n🚀 Starting Complete Signup Flow Test")
    print(f"   Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"   API Base: {API_BASE}")
    
    # Test 1: Customer Registration
    timestamp = int(time.time())
    customer_email = f"testcustomer{timestamp}@example.com"
    success, customer_data = test_signup('customer', 'Test', 'Customer', customer_email)
    
    if success:
        # Test customer login
        login_success, _ = test_login(customer_email)
    
    # Test 2: Manager Registration
    manager_email = f"testmanager{timestamp}@example.com"
    success, manager_data = test_signup('manager', 'Test', 'Manager', manager_email)
    
    if success:
        # Test manager login
        login_success, _ = test_login(manager_email)
    
    # Test 3: Invalid Role (should fail)
    print_section("Testing Invalid Role (Should Fail)")
    invalid_email = f"testinvalid{timestamp}@example.com"
    success, result = test_signup('admin', 'Test', 'Invalid', invalid_email)
    
    print_section("✨ Test Complete")
    print(f"All tests completed at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

if __name__ == '__main__':
    main()
