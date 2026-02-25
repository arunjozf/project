import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

# Create test user if it doesn't exist
if not User.objects.filter(email='test@example.com').exists():
    User.objects.create_user(
        email='test@example.com',
        username='test@example.com',
        password='testpassword123',
        first_name='Test',
        last_name='User'
    )
    print("✓ Test user created successfully!")
    print("Email: test@example.com")
    print("Password: testpassword123")
else:
    print("✓ Test user already exists")
