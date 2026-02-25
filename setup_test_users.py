#!/usr/bin/env python
import os
import sys
import django

# Setup Django
sys.path.insert(0, 'c:\\Users\\7280\\OneDrive\\Attachments\\Desktop\\project\\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

# Set password for admin user
user = User.objects.get(email='admin@example.com')
user.set_password('admin123')
user.save()
print(f"Password set for {user.email}")

# Also create/update a manager user
manager, created = User.objects.get_or_create(
    email='manager@example.com',
    defaults={
        'username': 'manager@example.com',
        'first_name': 'Manager',
        'last_name': 'User',
        'role': 'manager'
    }
)
manager.set_password('manager123')
manager.save()
print(f"Manager user {'created' if created else 'updated'}: {manager.email}")

# And a customer user
customer, created = User.objects.get_or_create(
    email='customer@example.com',
    defaults={
        'username': 'customer@example.com',
        'first_name': 'Customer',
        'last_name': 'User',
        'role': 'customer'
    }
)
customer.set_password('customer123')
customer.save()
print(f"Customer user {'created' if created else 'updated'}: {customer.email}")

print("\nTest credentials are ready!")
print("Admin: admin@example.com / admin123")
print("Manager: manager@example.com / manager123")
print("Customer: customer@example.com / customer123")
