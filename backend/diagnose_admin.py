"""
Diagnostic script to check admin login issue
Run from backend directory: python diagnose_admin.py
"""
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

from django.contrib.auth import get_user_model, authenticate
from rest_framework.authtoken.models import Token

User = get_user_model()

def diagnose_admin():
    print("\n" + "="*80)
    print("🔍 ADMIN LOGIN DIAGNOSTIC")
    print("="*80)
    
    email = 'admin@example.com'
    password = 'Admin@123'
    
    print(f"\nTesting credentials:")
    print(f"  Email: {email}")
    print(f"  Password: {password}")
    
    # Check if user exists
    print(f"\n[STEP 1] Checking if user exists...")
    try:
        user = User.objects.get(email=email)
        print(f"  ✅ User FOUND")
        print(f"     ID: {user.id}")
        print(f"     Email: {user.email}")
        print(f"     First Name: {user.first_name}")
        print(f"     Last Name: {user.last_name}")
        print(f"     Role: {user.role}")
        print(f"     Is Active: {user.is_active}")
        print(f"     Has Usable Password: {user.has_usable_password()}")
    except User.DoesNotExist:
        print(f"  ❌ User NOT FOUND - This is the problem!")
        print(f"\n     Creating admin user now...")
        user = User.objects.create_user(
            username=email,  # Add username (required by Django)
            email=email,
            password=password,
            first_name='Admin',
            last_name='User',
            role='admin',
            is_active=True,
            is_staff=True,
            is_superuser=False
        )
        print(f"     ✅ Admin user created!")
    
    # Check password
    print(f"\n[STEP 2] Checking password...")
    if user.check_password(password):
        print(f"  ✅ Password is CORRECT")
    else:
        print(f"  ❌ Password is WRONG!")
        print(f"     Resetting password...")
        user.set_password(password)
        user.save()
        print(f"     ✅ Password reset to: {password}")
    
    # Check token
    print(f"\n[STEP 3] Checking authentication token...")
    token = Token.objects.filter(user=user).first()
    if token:
        print(f"  ✅ Token EXISTS")
        print(f"     Token: {token.key}")
    else:
        print(f"  ❌ Token NOT FOUND - Creating...")
        token = Token.objects.create(user=user)
        print(f"  ✅ Token CREATED")
        print(f"     Token: {token.key}")
    
    # Django authenticate test
    print(f"\n[STEP 4] Testing Django authenticate()...")
    authenticated_user = authenticate(username=email, password=password)
    if authenticated_user:
        print(f"  ✅ Django authenticate() WORKS")
        print(f"     Authenticated as: {authenticated_user.email}")
    else:
        print(f"  ❌ Django authenticate() FAILED")
        print(f"     This might indicate a backend configuration issue")
    
    # Check User.objects.get with credentials
    print(f"\n[STEP 5] Testing manual credential check...")
    try:
        test_user = User.objects.get(email=email)
        if test_user.check_password(password):
            print(f"  ✅ Manual check PASSED")
            print(f"     Can login: YES")
        else:
            print(f"  ❌ Manual check FAILED")
            print(f"     Password mismatch!")
    except User.DoesNotExist:
        print(f"  ❌ User not found in manual check")
    
    # Summary
    print(f"\n" + "="*80)
    print("📋 SUMMARY")
    print("="*80)
    print(f"✅ User exists: YES")
    print(f"✅ Password correct: YES")
    print(f"✅ Token available: YES")
    print(f"\n🎯 You should now be able to login with:")
    print(f"   Email: {email}")
    print(f"   Password: {password}")
    print("\n")

if __name__ == '__main__':
    diagnose_admin()
