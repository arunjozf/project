#!/usr/bin/env python
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.insert(0, os.path.dirname(__file__))

django.setup()

from users.models import User
from rest_framework.authtoken.models import Token

# Create admin user if doesn't exist
admin_user, created = User.objects.get_or_create(
    email='admin@test.com',
    defaults={
        'username': 'admin',
        'first_name': 'Admin',
        'last_name': 'User',
        'role': 'admin',
        'is_staff': True,
        'is_superuser': True,
        'is_active': True
    }
)

admin_user.set_password('password123')
admin_user.save()

# Create token
token, _ = Token.objects.get_or_create(user=admin_user)

print(f"✅ Admin user: {admin_user.email}")
print(f"✅ Token: {token.key}")

# Create a manager user for testing
manager_user, created = User.objects.get_or_create(
    email='manager@test.com',
    defaults={
        'username': 'manager',
        'first_name': 'Manager',
        'last_name': 'User',
        'role': 'manager',
        'is_active': True
    }
)

manager_user.set_password('password123')
manager_user.save()

token_m, _ = Token.objects.get_or_create(user=manager_user)

print(f"✅ Manager user: {manager_user.email}")
print(f"✅ Token: {token_m.key}")

# Create a customer user for testing
customer_user, created = User.objects.get_or_create(
    email='customer@test.com',
    defaults={
        'username': 'customer',
        'first_name': 'Customer',
        'last_name': 'User',
        'role': 'customer',
        'is_active': True
    }
)

customer_user.set_password('password123')
customer_user.save()

token_c, _ = Token.objects.get_or_create(user=customer_user)

print(f"✅ Customer user: {customer_user.email}")
print(f"✅ Token: {token_c.key}")
