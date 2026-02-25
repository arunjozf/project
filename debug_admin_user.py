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

print("=" * 70)
print("CHECKING ADMIN USER IN DATABASE")
print("=" * 70)

try:
    admin = User.objects.get(email='admin@example.com')
    print(f"\n✅ User found: {admin.email}")
    print(f"   Username: {admin.username}")
    print(f"   Password hash: {admin.password[:30]}...")
    print(f"   Has usable password: {admin.has_usable_password()}")
    print(f"   Role: {admin.role}")
    print(f"   First Name: {admin.first_name}")
    print(f"   Last Name: {admin.last_name}")
    
    # Test password
    print(f"\n   Testing password 'admin123'...")
    if admin.check_password('admin123'):
        print(f"   ✅ Password is CORRECT")
    else:
        print(f"   ❌ Password is WRONG")
        
except User.DoesNotExist:
    print(f"\n❌ User NOT found with email: admin@example.com")

print("\n" + "=" * 70)
print("ALL USERS IN DATABASE")
print("=" * 70)

users = User.objects.all()
print(f"\nTotal users: {users.count()}\n")

for u in users:
    print(f"Email: {u.email:40} Role: {u.role:10} Active: {u.is_active}")

