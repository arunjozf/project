"""
Quick script to verify existing users and create test users
Run from backend directory: python verify_users.py
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

def verify_users():
    """Check what users exist"""
    print("\n" + "="*70)
    print("📋 EXISTING USERS IN DATABASE")
    print("="*70)
    
    users = User.objects.all()
    if not users.exists():
        print("\n❌ NO USERS FOUND IN DATABASE!")
        print("\nYou need to create test users. Choose option below:")
        return False
    
    for user in users:
        print(f"\n✅ User Found:")
        print(f"   Email: {user.email}")
        print(f"   Name: {user.first_name} {user.last_name}")
        print(f"   Role: {user.role}")
        print(f"   Active: {user.is_active}")
        
        token = Token.objects.filter(user=user).first()
        if token:
            print(f"   Token: {token.key}")
        else:
            print(f"   Token: NOT SET (creating...)")
            token = Token.objects.create(user=user)
            print(f"   Token: {token.key}")
    
    return True

def create_test_users():
    """Create standard test users"""
    print("\n" + "="*70)
    print("🔨 CREATING TEST USERS")
    print("="*70)
    
    test_users = [
        {
            'email': 'admin@example.com',
            'password': 'Admin@123',
            'first_name': 'Admin',
            'last_name': 'User',
            'role': 'admin'
        },
        {
            'email': 'manager@example.com',
            'password': 'Manager@123',
            'first_name': 'Manager',
            'last_name': 'User',
            'role': 'manager'
        },
        {
            'email': 'customer@example.com',
            'password': 'Customer@123',
            'first_name': 'Customer',
            'last_name': 'User',
            'role': 'customer'
        }
    ]
    
    for user_data in test_users:
        email = user_data['email']
        
        # Check if exists
        if User.objects.filter(email=email).exists():
            user = User.objects.get(email=email)
            print(f"\n⚠️  User '{email}' already exists")
            
            # Ensure token exists
            token, created = Token.objects.get_or_create(user=user)
            if created:
                print(f"   ✅ Token created: {token.key}")
            else:
                print(f"   ✅ Token exists: {token.key}")
        else:
            # Create new user
            user = User.objects.create_user(
                email=email,
                password=user_data['password'],
                first_name=user_data['first_name'],
                last_name=user_data['last_name'],
                role=user_data['role'],
                is_active=True
            )
            
            # Create token
            token = Token.objects.create(user=user)
            
            print(f"\n✅ Created user: {email}")
            print(f"   Password: {user_data['password']}")
            print(f"   Role: {user_data['role']}")
            print(f"   Token: {token.key}")

def test_login_credentials():
    """Test if credentials work"""
    print("\n" + "="*70)
    print("🧪 TEST LOGIN CREDENTIALS")
    print("="*70)
    
    test_credentials = [
        ('admin@example.com', 'Admin@123'),
        ('manager@example.com', 'Manager@123'),
        ('customer@example.com', 'Customer@123'),
    ]
    
    for email, password in test_credentials:
        try:
            user = User.objects.get(email=email)
            
            # Test password
            if user.check_password(password):
                print(f"\n✅ {email}")
                print(f"   Password: VALID ✓")
                token = Token.objects.filter(user=user).first()
                if token:
                    print(f"   Token: {token.key}")
            else:
                print(f"\n❌ {email}")
                print(f"   Password: INVALID ✗")
        except User.DoesNotExist:
            print(f"\n❌ {email}")
            print(f"   User: NOT FOUND ✗")

if __name__ == '__main__':
    print("\n🚀 USER VERIFICATION & CREATION TOOL\n")
    
    # First check what exists
    users_exist = verify_users()
    
    if not users_exist:
        print("\n" + "="*70)
        print("Creating test users now...")
        print("="*70)
        create_test_users()
    
    # Test credentials
    test_login_credentials()
    
    print("\n" + "="*70)
    print("✅ SETUP COMPLETE")
    print("="*70)
    print("\nYou can now login with:")
    print("  admin@example.com / Admin@123")
    print("  manager@example.com / Manager@123")
    print("  customer@example.com / Customer@123")
    print("\n")
