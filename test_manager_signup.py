import requests
import json

url = 'http://localhost:8000/api/users/signup/'
data = {
    'firstName': 'Test',
    'lastName': 'Manager',
    'email': 'testmanager@example.com',
    'password': 'testpass123',
    'confirmPassword': 'testpass123',
    'role': 'manager'
}

try:
    response = requests.post(url, json=data)
    print(f'Status: {response.status_code}')
    print(f'Response: {json.dumps(response.json(), indent=2)}')
except Exception as e:
    print(f'Error: {e}')
