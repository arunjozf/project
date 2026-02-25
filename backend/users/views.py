from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token
from .models import User
from .serializers import (
    UserRegistrationSerializer, 
    UserLoginSerializer, 
    UserDetailSerializer
)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserDetailSerializer
    permission_classes = [AllowAny]

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def signup(self, request):
        """
        Handle user registration/signup
        Expected data: {firstName, lastName, email, password, confirmPassword, role}
        """
        print(f"[signup] Received data: {request.data}")
        
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            print(f"[signup] User created: {user.email} with role: {user.role}")
            
            # Create token for the user
            token, created = Token.objects.get_or_create(user=user)
            
            return Response({
                'status': 'success',
                'message': 'Account created successfully!',
                'data': {
                    'id': user.id,
                    'firstName': user.first_name,
                    'lastName': user.last_name,
                    'email': user.email,
                    'role': user.role,
                    'token': token.key,
                }
            }, status=status.HTTP_201_CREATED)
        
        print(f"[signup] Validation errors: {serializer.errors}")
        return Response({
            'status': 'error',
            'message': 'Signup failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def login(self, request):
        """
        Handle user login
        Expected data: {email, password}
        """
        print(f"[LoginView] Received request data: {request.data}")
        print(f"[LoginView] Email: {request.data.get('email')}")
        print(f"[LoginView] Password length: {len(request.data.get('password', ''))}")
        
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            
            # Get or create token
            token, created = Token.objects.get_or_create(user=user)
            
            print(f"[LoginView] Login successful for {user.email}")
            
            return Response({
                'status': 'success',
                'message': 'Login successful!',
                'data': {
                    'id': user.id,
                    'firstName': user.first_name,
                    'lastName': user.last_name,
                    'email': user.email,
                    'role': user.role,
                    'token': token.key,
                }
            }, status=status.HTTP_200_OK)
        
        print(f"[LoginView] Login failed. Errors: {serializer.errors}")
        return Response({
            'status': 'error',
            'message': 'Login failed',
            'errors': serializer.errors
        }, status=status.HTTP_401_UNAUTHORIZED)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def logout(self, request):
        """Handle user logout by deleting token"""
        try:
            request.user.auth_token.delete()
            return Response({
                'status': 'success',
                'message': 'Logout successful!'
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """Get current user profile"""
        serializer = UserDetailSerializer(request.user)
        return Response({
            'status': 'success',
            'data': serializer.data
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def create_admin(self, request):
        """
        Create a new admin user (only existing admins can do this)
        Expected data: {firstName, lastName, email, password}
        """
        # Check if requesting user is admin
        if request.user.role != 'admin':
            return Response({
                'status': 'error',
                'message': 'Only admins can create new admin users'
            }, status=status.HTTP_403_FORBIDDEN)

        # Validate required fields
        required_fields = ['firstName', 'lastName', 'email', 'password']
        missing_fields = [f for f in required_fields if f not in request.data]
        
        if missing_fields:
            return Response({
                'status': 'error',
                'message': f'Missing required fields: {", ".join(missing_fields)}'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Check if user already exists
        if User.objects.filter(email=request.data['email']).exists():
            return Response({
                'status': 'error',
                'message': 'User with this email already exists'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Create new admin user
            user = User.objects.create_user(
                username=request.data['email'],
                email=request.data['email'],
                password=request.data['password'],
                first_name=request.data['firstName'],
                last_name=request.data['lastName'],
                role='admin',  # Force admin role
                is_active=True
            )

            # Create token
            token, created = Token.objects.get_or_create(user=user)

            return Response({
                'status': 'success',
                'message': f'Admin user created: {user.email}',
                'data': {
                    'id': user.id,
                    'firstName': user.first_name,
                    'lastName': user.last_name,
                    'email': user.email,
                    'role': user.role,
                    'token': token.key,
                }
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({
                'status': 'error',
                'message': f'Error creating admin: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)
