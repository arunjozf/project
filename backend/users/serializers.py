from rest_framework import serializers
from .models import User, Document
from django.contrib.auth import authenticate

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    confirmPassword = serializers.CharField(write_only=True, min_length=8)
    firstName = serializers.CharField(source='first_name')
    lastName = serializers.CharField(source='last_name')
    role = serializers.CharField(required=False, default='customer')

    class Meta:
        model = User
        fields = ['firstName', 'lastName', 'email', 'password', 'confirmPassword', 'role']

    def validate(self, data):
        if data['password'] != data.pop('confirmPassword'):
            raise serializers.ValidationError({"password": "Passwords do not match."})
        
        # Check if email already exists
        if User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError({"email": "Email already registered."})
        
        # Validate role - only allow customer and manager during signup
        valid_roles = ['customer', 'manager']
        role = data.get('role', 'customer')
        if role not in valid_roles:
            raise serializers.ValidationError({
                "role": f"Invalid role '{role}'. Only {', '.join(valid_roles)} can self-register. Contact admin for other roles."
            })
        
        return data

    def create(self, validated_data):
        role = validated_data.pop('role', 'customer')
        user = User.objects.create_user(
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            email=validated_data['email'],
            username=validated_data['email'],  # Using email as username
            password=validated_data['password'],
            role=role
        )
        return user


class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')

        print(f"[LoginSerializer] Attempting login with email: {email}")
        print(f"[LoginSerializer] Password length: {len(password) if password else 0}")

        try:
            user = User.objects.get(email=email)
            print(f"[LoginSerializer] User found: {user.email}, has_usable_password: {user.has_usable_password()}")
            
            if not user.check_password(password):
                print(f"[LoginSerializer] Password check FAILED for {email}")
                raise serializers.ValidationError({"password": "Invalid credentials."})
            
            print(f"[LoginSerializer] Password check PASSED for {email}")
        except User.DoesNotExist:
            print(f"[LoginSerializer] User NOT found with email: {email}")
            raise serializers.ValidationError({"email": "User with this email does not exist."})

        data['user'] = user
        return data


class UserDetailSerializer(serializers.ModelSerializer):
    firstName = serializers.CharField(source='first_name', read_only=True)
    lastName = serializers.CharField(source='last_name', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'firstName', 'lastName', 'email', 'phone_number', 'role', 'is_active', 'created_at']
        read_only_fields = ['id', 'email', 'created_at']

# ============================================================================
# DOCUMENT SERIALIZERS
# ============================================================================

class DocumentSerializer(serializers.ModelSerializer):
    """Serializer for user documents"""
    user_email = serializers.CharField(source='user.email', read_only=True)
    verified_by_name = serializers.CharField(source='verified_by.get_full_name', read_only=True)
    
    class Meta:
        model = Document
        fields = [
            'id', 'user', 'user_email', 'document_type', 'file_path',
            'document_number', 'issued_date', 'expiry_date', 'verification_status',
            'verified_by', 'verified_by_name', 'verified_at', 'rejection_reason',
            'uploaded_at', 'created_at'
        ]
        read_only_fields = ['id', 'uploaded_at', 'created_at', 'verified_at']


class DocumentUploadSerializer(serializers.ModelSerializer):
    """Serializer for document uploads"""
    class Meta:
        model = Document
        fields = [
            'document_type', 'file_path', 'document_number',
            'issued_date', 'expiry_date'
        ]


class DocumentVerificationSerializer(serializers.ModelSerializer):
    """Serializer for admin document verification"""
    class Meta:
        model = Document
        fields = [
            'id', 'verification_status', 'rejection_reason',
            'verified_by', 'verified_at'
        ]