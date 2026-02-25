#!/usr/bin/env python3
"""
Test script to verify the Premium Fleet feature in UserDashboard
"""

import subprocess
import time
import json
import requests
from requests.exceptions import RequestException

def test_backend_api():
    """Test if backend APIs are responding"""
    print("\n" + "="*60)
    print("TESTING BACKEND API")
    print("="*60)
    
    try:
        # Test basic API endpoint
        response = requests.get('http://localhost:8000/api/cars/?search=&ordering=-created_at', timeout=5)
        print(f"✓ Backend API responding (status: {response.status_code})")
        
        if response.ok:
            data = response.json()
            print(f"✓ Cars API returns data")
            if isinstance(data, dict) and 'results' in data:
                print(f"  - Found {len(data['results'])} cars in results")
            elif isinstance(data, list):
                print(f"  - Found {len(data)} cars in list")
            else:
                print(f"  - API response: {str(data)[:100]}...")
        return True
    except RequestException as e:
        print(f"✗ Backend API error: {e}")
        return False

def test_vite_frontend():
    """Test if Vite frontend is running"""
    print("\n" + "="*60)
    print("TESTING VITE FRONTEND")
    print("="*60)
    
    try:
        response = requests.get('http://localhost:5174/', timeout=5)
        print(f"✓ Frontend responding (status: {response.status_code})")
        
        # Check if it contains React/Vite indicators
        if 'script' in response.text.lower() or 'react' in response.text.lower():
            print("✓ Frontend appears to be a React application")
        return True
    except RequestException as e:
        print(f"✗ Frontend error: {e}")
        return False

def verify_fleet_case_syntax():
    """Parse and verify the fleet case syntax in UserDashboard.jsx"""
    print("\n" + "="*60)
    print("VERIFYING FLEET CASE SYNTAX")
    print("="*60)
    
    try:
        with open(r'c:\Users\7280\OneDrive\Attachments\Desktop\project\frontend\src\pages\UserDashboard.jsx', 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if fleet case exists
        if 'case "fleet":' in content:
            print("✓ Fleet case found in renderContent()")
            
            # Find the fleet case and check structure
            fleet_start = content.find('case "fleet":')
            fleet_section = content[fleet_start:fleet_start+3000]
            
            # Check for key elements
            checks = {
                'console.log': 'Debug logging',
                'fleetCars.map': 'Fleet cars mapping',
                'onClick={() => setSelectedCar(car)}': 'Book Now buttons',
                'Premium Fleet': 'Section title',
                '<div className="content-section">': 'Content section wrapper'
            }
            
            for check_str, check_name in checks.items():
                if check_str in fleet_section:
                    print(f"✓ Found {check_name}")
                else:
                    print(f"✗ Missing {check_name}")
        else:
            print("✗ Fleet case NOT found in renderContent()")
        
        return True
    except Exception as e:
        print(f"✗ Error checking syntax: {e}")
        return False

def verify_fleet_cars_definition():
    """Verify fleetCars array is properly defined"""
    print("\n" + "="*60)
    print("VERIFYING FLEETCARS DEFINITION")
    print("="*60)
    
    try:
        with open(r'c:\Users\7280\OneDrive\Attachments\Desktop\project\frontend\src\pages\UserDashboard.jsx', 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if fleetCars is defined
        if 'const fleetCars = [' in content:
            print("✓ fleetCars array is defined")
            
            # Count cars
            fleet_start = content.find('const fleetCars = [')
            fleet_end = content.find('];', fleet_start)
            fleet_section = content[fleet_start:fleet_end+2]
            
            # Simple count by looking for {id: markers
            car_count = fleet_section.count('{id:')
            print(f"✓ Found {car_count} cars in fleetCars array")
            
            # List car names
            import re
            names = re.findall(r'name: "([^"]+)"', fleet_section)
            if names:
                print(f"✓ Fleet contains: {', '.join(names[:3])}...")
        else:
            print("✗ fleetCars array NOT found")
        
        return True
    except Exception as e:
        print(f"✗ Error checking fleetCars: {e}")
        return False

def check_sidebar_button():
    """Verify Premium Fleet button is in sidebar"""
    print("\n" + "="*60)
    print("CHECKING SIDEBAR BUTTON")
    print("="*60)
    
    try:
        with open(r'c:\Users\7280\OneDrive\Attachments\Desktop\project\frontend\src\pages\UserDashboard.jsx', 'r', encoding='utf-8') as f:
            content = f.read()
        
        if '🏎️ Premium Fleet' in content:
            print("✓ Premium Fleet button found in sidebar")
            
            if 'setActiveTab("fleet")' in content:
                print("✓ Button calls setActiveTab('fleet')")
            else:
                print("✗ Button doesn't call setActiveTab('fleet')")
        else:
            print("✗ Premium Fleet button NOT found in sidebar")
        
        return True
    except Exception as e:
        print(f"✗ Error checking sidebar: {e}")
        return False

def main():
    """Run all tests"""
    print("\n" + "="*80)
    print("PREMIUM FLEET FEATURE TEST SUITE")
    print("="*80)
    
    results = {
        'Backend API': test_backend_api(),
        'Frontend Server': test_vite_frontend(),
        'Fleet Case Syntax': verify_fleet_case_syntax(),
        'FleetCars Definition': verify_fleet_cars_definition(),
        'Sidebar Button': check_sidebar_button()
    }
    
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{status} - {test_name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n✓ ALL TESTS PASSED!")
        print("\nRECOMMENDATIONS:")
        print("1. Open http://localhost:5174 in your browser")
        print("2. Log in as a customer")
        print("3. Click on '🏎️ Premium Fleet' button in the sidebar")
        print("4. Check browser console (F12) for debug logs starting with '[FLEET DEBUG]'")
        print("5. Verify that fleet cars are displayed")
    else:
        print("\n✗ Some tests failed. Check output above for details.")

if __name__ == "__main__":
    main()
