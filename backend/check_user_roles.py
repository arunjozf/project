#!/usr/bin/env python
"""
Check current user roles and create proper test users
"""
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

from users.models import User
from rest_framework.authtoken.models import Token

def check_users():
    """Check existing users and their roles"""
    print("\n" + "="*70)
    print("📊 EXISTING USERS AND PERMISSIONS")
    print("="*70)
    
    users = User.objects.all()
    if not users:
        print("❌ No users found")
        return
    
    for user in users:
        token = Token.objects.filter(user=user).first()
        print(f"\n👤 Email: {user.email}")
        print(f"   Role: {user.role}")
        print(f"   is_staff: {user.is_staff}")
        print(f"   is_active: {user.is_active}")
        print(f"   Token: {token.key if token else 'NO TOKEN'}")

def create_test_users():
    """Create test users with different roles"""
    print("\n" + "="*70)
    print("✨ CREATING TEST USERS WITH PROPER ROLES")
    print("="*70)
    
    test_users = [
        {
            'email': 'manager@test.com',
            'password': 'Manager@123',
            'first_name': 'Test',
            'last_name': 'Manager',
            'role': 'manager',
            'is_staff': False,
        },
        {
            'email': 'admin@test.com',
            'password': 'Admin@123',
            'first_name': 'Test',
            'last_name': 'Admin',
            'role': 'admin',
            'is_staff': True,
        },
        {
            'email': 'customer@test.com',
            'password': 'Customer@123',
            'first_name': 'Test',
            'last_name': 'Customer',
            'role': 'customer',
            'is_staff': False,
        },
    ]
    
    for user_data in test_users:
        email = user_data['email']
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'username': email.split('@')[0],
                'first_name': user_data['first_name'],
                'last_name': user_data['last_name'],
                'role': user_data['role'],
                'is_staff': user_data['is_staff'],
                'is_active': True,
            }
        )
        
        # Update password
        user.set_password(user_data['password'])
        user.save()
        
        # Create token
        token, _ = Token.objects.get_or_create(user=user)
        
        status = "✅ CREATED" if created else "♻️  UPDATED"
        print(f"\n{status}: {email}")
        print(f"   Password: {user_data['password']}")
        print(f"   Role: {user_data['role']}")
        print(f"   Token: {token.key}")

if __name__ == '__main__':
    check_users()
    create_test_users()
    print("\n" + "="*70)
    print("✅ SETUP COMPLETE! Test these endpoints with the tokens above:")
    print("="*70)
    print("\n1️⃣  Manager Test (my_listings):")
    print("   GET /api/cars/my_listings/")
    print("   Header: Authorization: Token <manager_token>")
    print("\n2️⃣  Admin Test (admin users):")
    print("   GET /api/bookings/admin/users/")
    print("   Header: Authorization: Token <admin_token>")
    print("\n3️⃣  Customer Test (my_bookings - works for all):")
    print("   GET /api/bookings/my_bookings/")
    print("   Header: Authorization: Token <any_token>")
    print("\n" + "="*70 + "\n")
