"""
Script to create the first admin user in the system
Run this from the project directory: python create_admin.py
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
    """Create a new admin user"""
    print("\n" + "="*60)
    print("🔐 ADMIN USER CREATION TOOL")
    print("="*60)
    
    # Collect input
    first_name = input("\nFirst Name: ").strip()
    last_name = input("Last Name: ").strip()
    email = input("Email: ").strip()
    password = input("Password: ").strip()
    confirm_password = input("Confirm Password: ").strip()
    
    # Validation
    if not all([first_name, last_name, email, password]):
        print("\n❌ Error: All fields are required!")
        return False
    
    if password != confirm_password:
        print("\n❌ Error: Passwords don't match!")
        return False
    
    if len(password) < 6:
        print("\n❌ Error: Password must be at least 6 characters!")
        return False
    
    # Check if user exists
    if User.objects.filter(email=email).exists():
        print(f"\n❌ Error: User with email '{email}' already exists!")
        return False
    
    try:
        # Create admin user
        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            role='admin',
            is_active=True,
            is_staff=True,  # Allow Django admin access
            is_superuser=False
        )
        
        # Create token for API access
        token, created = Token.objects.get_or_create(user=user)
        
        print("\n" + "="*60)
        print("✅ ADMIN USER CREATED SUCCESSFULLY!")
        print("="*60)
        print(f"\n👤 Name: {user.first_name} {user.last_name}")
        print(f"📧 Email: {user.email}")
        print(f"🔐 Role: {user.role.upper()}")
        print(f"🔑 API Token: {token.key}")
        print("\n🌐 Login URL: http://localhost:5173/login")
        print("   Email: " + email)
        print("   Password: " + password)
        print("\n" + "="*60)
        return True
        
    except Exception as e:
        print(f"\n❌ Error creating admin user: {str(e)}")
        return False


if __name__ == '__main__':
    success = create_admin()
    sys.exit(0 if success else 1)
