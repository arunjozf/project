"""
Direct script to create first admin user (non-interactive)
"""
import os
import sys
import django

# Configure Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.insert(0, os.path.dirname(__file__))

django.setup()

from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token

User = get_user_model()

def create_admin():
    """Create admin user directly"""
    print("\n" + "="*60)
    print("🔐 ADMIN USER CREATION")
    print("="*60)
    
    email = 'admin@example.com'
    first_name = 'Admin'
    last_name = 'User'
    password = 'Admin@123'
    
    # Check if user exists
    if User.objects.filter(email=email).exists():
        print(f"\n⚠️  User with email '{email}' already exists!")
        print("Getting existing user token...")
        user = User.objects.get(email=email)
        token = Token.objects.filter(user=user).first()
        if token:
            print(f"\n✅ Existing Admin User:")
            print(f"   Email: {user.email}")
            print(f"   Token: {token.key}")
            return True
        else:
            print("Creating new token...")
            token = Token.objects.create(user=user)
            print(f"\n✅ New Token Generated:")
            print(f"   Email: {user.email}")
            print(f"   Token: {token.key}")
            return True
    
    # Create new user
    print(f"\nCreating new admin user with email: {email}")
    user = User.objects.create_user(
        email=email,
        first_name=first_name,
        last_name=last_name,
        password=password,
        role='admin',
        is_active=True
    )
    
    # Generate token
    token = Token.objects.create(user=user)
    
    print("\n" + "="*60)
    print("✅ ADMIN USER CREATED SUCCESSFULLY!")
    print("="*60)
    print(f"\n📧 Email:    {user.email}")
    print(f"👤 Name:     {user.first_name} {user.last_name}")
    print(f"🔑 Password: {password}")
    print(f"🎫 Token:    {token.key}")
    print(f"\n🌐 Login at: http://localhost:5173")
    print("="*60 + "\n")
    
    return True

if __name__ == '__main__':
    try:
        create_admin()
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        sys.exit(1)
