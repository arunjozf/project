import requests
import json

BASE_URL = "http://localhost:8000/api"

print("Testing admin login...")
login_data = {
    "email": "admin@example.com",
    "password": "admin123"
}

try:
    response = requests.post(
        f"{BASE_URL}/users/login/",
        json=login_data,
        timeout=5
    )
    print(f"Status: {response.status_code}")
    
    result = response.json()
    print(json.dumps(result, indent=2))
    
except requests.exceptions.Timeout:
    print("❌ Request timed out - backend may be slow or unresponsive")
except requests.exceptions.ConnectionError:
    print("❌ Connection error - backend not responding")
except Exception as e:
    print(f"❌ Error: {e}")
