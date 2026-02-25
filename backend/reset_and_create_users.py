"""
Script to reset users table and create fresh admin users
This completely wipes and recreates the users table
Run from backend directory: python reset_and_create_users.py
"""
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token

User = get_user_model()

def reset_and_create():
    print("\n" + "="*80)
    print("⚠️  RESET AND CREATE USERS")
    print("="*80)
    
    # Delete all existing users (careful!)
    print("\n[STEP 1] Deleting existing users...")
    user_count = User.objects.count()
    User.objects.all().delete()
    print(f"  ✅ Deleted {user_count} users")
    
    # Delete all tokens
    print("\n[STEP 2] Deleting existing tokens...")
    token_count = Token.objects.count()
    Token.objects.all().delete()
    print(f"  ✅ Deleted {token_count} tokens")
    
    # Create fresh users
    users_to_create = [
        {
            'email': 'admin@example.com',
            'password': 'Admin@123',
            'first_name': 'Admin',
            'last_name': 'User',
            'role': 'admin',
            'is_staff': True,
            'is_superuser': False
        },
        {
            'email': 'manager@example.com',
            'password': 'Manager@123',
            'first_name': 'Manager',
            'last_name': 'User',
            'role': 'manager',
            'is_staff': False,
            'is_superuser': False
        },
        {
            'email': 'customer@example.com',
            'password': 'Customer@123',
            'first_name': 'Customer',
            'last_name': 'User',
            'role': 'customer',
            'is_staff': False,
            'is_superuser': False
        }
    ]
    
    print("\n[STEP 3] Creating fresh users...")
    created_users = []
    
    for user_data in users_to_create:
        email = user_data.pop('email')
        password = user_data.pop('password')
        
        # Create user with create_user (handles password properly)
        # Username is required by Django, use email as username
        user = User.objects.create_user(
            username=email,  # Add username (required by Django)
            email=email,
            password=password,
            **user_data
        )
        
        # Create token
        token = Token.objects.create(user=user)
        
        created_users.append({
            'email': email,
            'password': password,
            'token': token.key
        })
        
        print(f"\n  ✅ Created: {email}")
        print(f"     Password: {password}")
        print(f"     Role: {user.role}")
        print(f"     Token: {token.key}")
    
    # Verify all users work
    print("\n[STEP 4] Verifying all users...")
    for user_data in created_users:
        try:
            user = User.objects.get(email=user_data['email'])
            if user.check_password(user_data['password']):
                print(f"  ✅ {user_data['email']} - Password verified")
            else:
                print(f"  ❌ {user_data['email']} - Password mismatch!")
        except User.DoesNotExist:
            print(f"  ❌ {user_data['email']} - User not found!")
    
    # Final summary
    print("\n" + "="*80)
    print("✅ SETUP COMPLETE!")
    print("="*80)
    print("\nYou can now login with these credentials:\n")
    
    for user_data in created_users:
        print(f"  📧 {user_data['email']}")
        print(f"     Password: {user_data['password']}")
        print()

if __name__ == '__main__':
    confirm = input("⚠️  This will DELETE ALL existing users! Continue? (yes/no): ")
    if confirm.lower() == 'yes':
        reset_and_create()
    else:
        print("Cancelled.")
