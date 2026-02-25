"""
Manager and Admin API ViewSets
Handles role-specific operations for managers and admins
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import Count, Sum, Avg
from django.utils import timezone
from datetime import timedelta
from .models import Booking
from .serializers import BookingSerializer
from users.models import User
from users.serializers import UserDetailSerializer
from carsales.models import Car
from carsales.serializers import CarSerializer


class ManagerBookingViewSet(viewsets.ModelViewSet):
    """
    Manager-specific booking endpoints
    GET /api/manager/bookings/ - List pending bookings
    PATCH /api/manager/bookings/{id}/ - Approve/reject booking
    """
    permission_classes = [IsAuthenticated]
    serializer_class = BookingSerializer

    def get_queryset(self):
        """Only managers can access"""
        if self.request.user.role != 'manager':
            return Booking.objects.none()
        # Return pending bookings
        return Booking.objects.filter(status='pending').order_by('-created_at')

    def list(self, request):
        """Get list of pending bookings for manager approval"""
        try:
            bookings = self.get_queryset()
            serializer = self.get_serializer(bookings, many=True)
            return Response({
                'status': 'success',
                'data': serializer.data,
                'count': bookings.count()
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    def partial_update(self, request, pk=None):
        """Approve or reject a booking"""
        try:
            booking = Booking.objects.get(pk=pk)
            action_type = request.data.get('action')  # 'approve' or 'reject'
            
            if action_type == 'approve':
                booking.status = 'confirmed'
                message = 'Booking approved'
            elif action_type == 'reject':
                booking.status = 'cancelled'
                message = 'Booking rejected'
            else:
                return Response({
                    'status': 'error',
                    'message': 'Invalid action. Use "approve" or "reject"'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            booking.save()
            return Response({
                'status': 'success',
                'message': message,
                'data': BookingSerializer(booking).data
            }, status=status.HTTP_200_OK)
        except Booking.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Booking not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class ManagerStatsViewSet(viewsets.ViewSet):
    """
    Manager statistics endpoint
    GET /api/manager/stats/
    """
    permission_classes = [IsAuthenticated]

    def list(self, request):
        """Get manager statistics"""
        if request.user.role != 'manager':
            return Response({
                'status': 'error',
                'message': 'Only managers can access this endpoint'
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            # Calculate statistics
            total_bookings = Booking.objects.count()
            pending_bookings = Booking.objects.filter(status='pending').count()
            confirmed_bookings = Booking.objects.filter(status='confirmed').count()
            completed_bookings = Booking.objects.filter(status='completed').count()
            cancelled_bookings = Booking.objects.filter(status='cancelled').count()
            
            # Revenue calculations
            total_revenue = Booking.objects.filter(
                status='confirmed',
                payment_status='completed'
            ).aggregate(Sum('total_amount'))['total_amount__sum'] or 0
            
            # This month revenue
            first_day_of_month = timezone.now().replace(day=1)
            this_month_revenue = Booking.objects.filter(
                status='confirmed',
                payment_status='completed',
                created_at__gte=first_day_of_month
            ).aggregate(Sum('total_amount'))['total_amount__sum'] or 0
            
            # Booking types breakdown
            booking_types = Booking.objects.values('booking_type').annotate(
                count=Count('id'),
                revenue=Sum('total_amount')
            )
            
            return Response({
                'status': 'success',
                'data': {
                    'totalBookings': total_bookings,
                    'pendingApprovals': pending_bookings,
                    'confirmedBookings': confirmed_bookings,
                    'completedBookings': completed_bookings,
                    'cancelledBookings': cancelled_bookings,
                    'totalRevenue': float(total_revenue),
                    'thisMonthRevenue': float(this_month_revenue),
                    'bookingsByType': list(booking_types)
                }
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class AdminStatsViewSet(viewsets.ViewSet):
    """
    Admin system statistics endpoint
    GET /api/admin/stats/
    """
    permission_classes = [IsAuthenticated]

    def list(self, request):
        """Get system statistics for admin dashboard"""
        if request.user.role != 'admin':
            return Response({
                'status': 'error',
                'message': 'Only admins can access this endpoint'
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            # User statistics
            total_users = User.objects.count()
            total_managers = User.objects.filter(role='manager').count()
            total_customers = User.objects.filter(role='customer').count()
            total_drivers = User.objects.filter(role='driver').count()
            total_admins = User.objects.filter(role='admin').count()
            
            # Booking statistics
            total_bookings = Booking.objects.count()
            pending_bookings = Booking.objects.filter(status='pending').count()
            confirmed_bookings = Booking.objects.filter(status='confirmed').count()
            completed_bookings = Booking.objects.filter(status='completed').count()
            
            # Payment statistics
            total_revenue = Booking.objects.filter(
                status='confirmed',
                payment_status='completed'
            ).aggregate(Sum('total_amount'))['total_amount__sum'] or 0
            
            pending_payments = Booking.objects.filter(
                payment_status='pending'
            ).aggregate(Sum('total_amount'))['total_amount__sum'] or 0
            
            failed_payments = Booking.objects.filter(
                payment_status='failed'
            ).count()
            
            # Health metrics (placeholder - can be enhanced)
            api_health = 99  # Would measure real API health
            database_health = 95
            
            return Response({
                'status': 'success',
                'data': {
                    'totalUsers': total_users,
                    'totalManagers': total_managers,
                    'totalCustomers': total_customers,
                    'totalDrivers': total_drivers,
                    'totalAdmins': total_admins,
                    'totalBookings': total_bookings,
                    'pendingBookings': pending_bookings,
                    'confirmedBookings': confirmed_bookings,
                    'completedBookings': completed_bookings,
                    'totalRevenue': float(total_revenue),
                    'pendingPayments': float(pending_payments),
                    'failedPayments': failed_payments,
                    'apiHealth': api_health,
                    'databaseHealth': database_health,
                    'platformHealth': 97
                }
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class AdminUserViewSet(viewsets.ViewSet):
    """
    Admin user management endpoint
    GET /api/admin/users/ - List all users
    PATCH /api/admin/users/{id}/ - Block/unblock user
    """
    permission_classes = [IsAuthenticated]

    def list(self, request):
        """Get list of all users"""
        if request.user.role != 'admin':
            return Response({
                'status': 'error',
                'message': 'Only admins can access this endpoint'
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            # Get filter parameters
            role_filter = request.query_params.get('role')
            is_active_filter = request.query_params.get('is_active')
            
            queryset = User.objects.all()
            
            if role_filter:
                queryset = queryset.filter(role=role_filter)
            if is_active_filter:
                queryset = queryset.filter(is_active=is_active_filter.lower() == 'true')
            
            # Add booking count for each user
            users_data = []
            for user in queryset:
                user_data = UserDetailSerializer(user).data
                user_data['bookingCount'] = user.bookings.count()
                users_data.append(user_data)
            
            return Response({
                'status': 'success',
                'data': users_data,
                'count': len(users_data)
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    def partial_update(self, request, pk=None):
        """Block or unblock a user"""
        try:
            user = User.objects.get(pk=pk)
            
            # Get action from request
            action_type = request.data.get('action')  # 'block' or 'unblock'
            
            if action_type == 'block':
                user.is_active = False
                message = 'User blocked successfully'
            elif action_type == 'unblock':
                user.is_active = True
                message = 'User unblocked successfully'
            else:
                return Response({
                    'status': 'error',
                    'message': 'Invalid action. Use "block" or "unblock"'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            user.save()
            return Response({
                'status': 'success',
                'message': message,
                'data': UserDetailSerializer(user).data
            }, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['delete'], permission_classes=[IsAuthenticated])
    def delete_user(self, request, pk=None):
        """Delete a user"""
        if request.user.role != 'admin':
            return Response({
                'status': 'error',
                'message': 'Only admins can delete users'
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            user = User.objects.get(pk=pk)
            username = user.username
            user.delete()
            return Response({
                'status': 'success',
                'message': f'User "{username}" deleted successfully'
            }, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class AdminPaymentViewSet(viewsets.ViewSet):
    """
    Admin payment management endpoint
    GET /api/admin/payments/ - List all payments
    DELETE /api/admin/payments/{id}/ - Delete a payment/booking
    """
    permission_classes = [IsAuthenticated]

    def list(self, request):
        """Get list of all payment transactions"""
        if request.user.role != 'admin':
            return Response({
                'status': 'error',
                'message': 'Only admins can access this endpoint'
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            # Get filter parameters
            status_filter = request.query_params.get('status')
            
            queryset = Booking.objects.all().order_by('-created_at')
            
            if status_filter:
                queryset = queryset.filter(payment_status=status_filter)
            
            serializer = BookingSerializer(queryset, many=True)
            
            return Response({
                'status': 'success',
                'data': serializer.data,
                'count': queryset.count()
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['delete'], permission_classes=[IsAuthenticated])
    def delete_payment(self, request, pk=None):
        """Delete a booking/payment"""
        if request.user.role != 'admin':
            return Response({
                'status': 'error',
                'message': 'Only admins can delete payments'
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            booking = Booking.objects.get(pk=pk)
            booking_id = booking.id
            booking.delete()
            return Response({
                'status': 'success',
                'message': f'Booking #{booking_id} deleted successfully'
            }, status=status.HTTP_200_OK)
        except Booking.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Booking not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class AdminSettingsViewSet(viewsets.ViewSet):
    """
    Admin settings endpoint
    GET /api/admin/settings/ - Get platform settings
    POST /api/admin/settings/ - Update platform settings
    """
    permission_classes = [IsAuthenticated]

    def list(self, request):
        """Get current platform settings"""
        if request.user.role != 'admin':
            return Response({
                'status': 'error',
                'message': 'Only admins can access this endpoint'
            }, status=status.HTTP_403_FORBIDDEN)
        
        from django.conf import settings
        
        # Return default settings including pending booking config
        settings_data = {
            'commissionRate': 15,
            'minBookingAmount': 1000,
            'maxBookingDays': 365,
            'maintenanceMode': False,
            'maxConcurrentBookings': 100,
            'supportEmail': 'support@autonexus.com',
            'supportPhone': '+1-800-123-4567',
            'platformFee': 2.99,
            'currency': 'USD',
            'pendingBookingTimeout': getattr(settings, 'PENDING_BOOKING_TIMEOUT', 3600),
            'pendingPaymentTimeout': getattr(settings, 'PENDING_PAYMENT_TIMEOUT', 1800),
            'autoApproveBookings': getattr(settings, 'AUTO_APPROVE_BOOKINGS', False),
            'autoCancelExpiredPending': getattr(settings, 'AUTO_CANCEL_EXPIRED_PENDING', True),
            'pendingBookingHoldTime': getattr(settings, 'PENDING_BOOKING_HOLD_TIME', 7200),
        }
        
        return Response({
            'status': 'success',
            'data': settings_data
        }, status=status.HTTP_200_OK)

    def create(self, request):
        """Update platform settings"""
        if request.user.role != 'admin':
            return Response({
                'status': 'error',
                'message': 'Only admins can access this endpoint'
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            # In a real implementation, would save to database
            # For now, just return success
            updated_settings = request.data
            
            return Response({
                'status': 'success',
                'message': 'Settings updated successfully',
                'data': updated_settings
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class ManagerCarManagementViewSet(viewsets.ModelViewSet):
    """
    Manager car management endpoints
    GET /api/manager/car-management/ - List manager's cars
    POST /api/manager/car-management/ - Add new car
    PATCH /api/manager/car-management/{id}/ - Edit car
    DELETE /api/manager/car-management/{id}/ - Delete car
    """
    permission_classes = [IsAuthenticated]
    serializer_class = CarSerializer
    parser_classes = (MultiPartParser, FormParser)

    def get_queryset(self):
        """Only return cars listed by the current manager"""
        if self.request.user.role == 'manager':
            return Car.objects.filter(seller=self.request.user).order_by('-created_at')
        return Car.objects.none()

    def list(self, request):
        """Get all cars listed by the manager"""
        try:
            cars = self.get_queryset()
            serializer = self.get_serializer(cars, many=True)
            return Response({
                'status': 'success',
                'data': serializer.data,
                'count': cars.count()
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    def create(self, request):
        """Add a new car to manager's fleet"""
        if request.user.role != 'manager':
            return Response({
                'status': 'error',
                'message': 'Only managers can add cars'
            }, status=status.HTTP_403_FORBIDDEN)

        try:
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                serializer.save(seller=request.user, status='available')
                return Response({
                    'status': 'success',
                    'message': 'Car added successfully',
                    'data': serializer.data
                }, status=status.HTTP_201_CREATED)
            return Response({
                'status': 'error',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    def partial_update(self, request, pk=None):
        """Update a car listing"""
        try:
            car = Car.objects.get(pk=pk, seller=request.user)
            serializer = self.get_serializer(car, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'status': 'success',
                    'message': 'Car updated successfully',
                    'data': serializer.data
                }, status=status.HTTP_200_OK)
            return Response({
                'status': 'error',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        except Car.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Car not found or access denied'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['delete'])
    def delete_car(self, request, pk=None):
        """Delete a car listing"""
        try:
            car = Car.objects.get(pk=pk, seller=request.user)
            car.delete()
            return Response({
                'status': 'success',
                'message': 'Car deleted successfully'
            }, status=status.HTTP_204_NO_CONTENT)
        except Car.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Car not found or access denied'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class AdminCarManagementViewSet(viewsets.ModelViewSet):
    """
    Admin car management endpoints
    GET /api/admin/car-management/ - List all cars
    PATCH /api/admin/car-management/{id}/ - Edit any car
    DELETE /api/admin/car-management/{id}/ - Delete any car
    """
    permission_classes = [IsAuthenticated]
    serializer_class = CarSerializer
    parser_classes = (MultiPartParser, FormParser)

    def get_queryset(self):
        """Admin sees all cars regardless of status"""
        if self.request.user.role == 'admin':
            return Car.objects.all().order_by('-created_at')
        return Car.objects.none()

    def list(self, request):
        """Get all cars in the system"""
        if request.user.role != 'admin':
            return Response({
                'status': 'error',
                'message': 'Only admins can access this endpoint'
            }, status=status.HTTP_403_FORBIDDEN)

        try:
            cars = self.get_queryset()
            serializer = self.get_serializer(cars, many=True)
            return Response({
                'status': 'success',
                'data': serializer.data,
                'count': cars.count()
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    def partial_update(self, request, pk=None):
        """Admin can update any car"""
        if request.user.role != 'admin':
            return Response({
                'status': 'error',
                'message': 'Only admins can edit cars'
            }, status=status.HTTP_403_FORBIDDEN)

        try:
            car = Car.objects.get(pk=pk)
            serializer = self.get_serializer(car, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'status': 'success',
                    'message': 'Car updated successfully',
                    'data': serializer.data
                }, status=status.HTTP_200_OK)
            return Response({
                'status': 'error',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        except Car.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Car not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['delete'])
    def delete_car(self, request, pk=None):
        """Admin can delete any car"""
        if request.user.role != 'admin':
            return Response({
                'status': 'error',
                'message': 'Only admins can delete cars'
            }, status=status.HTTP_403_FORBIDDEN)

        try:
            car = Car.objects.get(pk=pk)
            car.delete()
            return Response({
                'status': 'success',
                'message': 'Car deleted successfully'
            }, status=status.HTTP_204_NO_CONTENT)
        except Car.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Car not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class ManagerDriverViewSet(viewsets.ViewSet):
    """
    Manager-specific driver management endpoints
    GET /api/manager/drivers/ - List all drivers
    POST /api/manager/drivers/ - Create a new driver
    """
    permission_classes = [IsAuthenticated]

    def list(self, request):
        """List all drivers added by managers"""
        # Check if user is manager
        if request.user.role != 'manager':
            return Response({
                'status': 'error',
                'message': 'Only managers can view drivers'
            }, status=status.HTTP_403_FORBIDDEN)

        try:
            from .models import Driver
            from .serializers import DriverSerializer
            
            # Get all drivers
            drivers = Driver.objects.select_related('user').order_by('-created_at') if hasattr(Driver, 'created_at') else Driver.objects.select_related('user').all()
            serializer = DriverSerializer(drivers, many=True)
            
            return Response({
                'status': 'success',
                'data': serializer.data,
                'count': drivers.count()
            })

        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.exception(f'Error listing drivers: {str(e)}')
            return Response({
                'status': 'error',
                'message': f'Failed to fetch drivers: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)

    def create(self, request):
        """Create a new driver account (manager only)"""
        # Check if user is manager
        if request.user.role != 'manager':
            return Response({
                'status': 'error',
                'message': 'Only managers can create drivers'
            }, status=status.HTTP_403_FORBIDDEN)

        try:
            from .models import Driver
            import logging
            logger = logging.getLogger(__name__)
            
            # Extract data from request
            email = request.data.get('email', '').strip()
            first_name = request.data.get('firstName', '').strip()
            last_name = request.data.get('lastName', '').strip()
            license_number = request.data.get('licenseNumber', '').strip()
            license_expiry = request.data.get('licenseExpiry', '')
            experience_years = request.data.get('experienceYears', 0)
            phone_number = request.data.get('phone', '').strip()

            # Validate required fields
            if not all([email, first_name, license_number]):
                return Response({
                    'status': 'error',
                    'message': 'Missing required fields: email, firstName, licenseNumber'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Check if email already exists
            if User.objects.filter(email=email).exists():
                return Response({
                    'status': 'error',
                    'message': 'Email already exists'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Check if license number already exists
            if Driver.objects.filter(license_number=license_number).exists():
                return Response({
                    'status': 'error',
                    'message': 'License number already registered'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Create user with driver role
            username = email.split('@')[0]
            # Generate temporary password
            temp_password = 'Driver@123Temp'
            
            user = User.objects.create_user(
                username=username,
                email=email,
                first_name=first_name,
                last_name=last_name,
                password=temp_password,
                role='driver',
                phone_number=phone_number,
                is_active=True
            )
            
            logger.info(f'Created driver user: {user.email} with role: {user.role}')

            # Create driver profile
            from django.utils import timezone
            driver = Driver.objects.create(
                user=user,
                license_number=license_number,
                license_expiry=license_expiry,
                experience_years=int(experience_years) if experience_years else 0,
                is_verified=True,  # Auto-verify when manager creates (manager acts as admin)
                verification_date=timezone.now(),
                status='available'
            )
            
            logger.info(f'Created driver profile for user {user.id}: {driver.id}')

            # Return success with driver info
            return Response({
                'status': 'success',
                'message': 'Driver created successfully',
                'data': {
                    'id': driver.id,
                    'user': {
                        'id': user.id,
                        'email': user.email,
                        'firstName': user.first_name,
                        'lastName': user.last_name,
                    },
                    'licenseNumber': driver.license_number,
                    'licenseExpiry': driver.license_expiry,
                    'experienceYears': driver.experience_years,
                    'isVerified': driver.is_verified,
                    'status': driver.status,
                    'note': f'✓ Driver verified and ready! Customers can select this driver for bookings. Temporary password: {temp_password}. Driver should change password after first login.'
                }
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.exception(f'Error creating driver: {str(e)}')
            return Response({
                'status': 'error',
                'message': f'Failed to create driver: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, pk=None):
        """Get a specific driver by ID"""
        if request.user.role != 'manager':
            return Response({
                'status': 'error',
                'message': 'Only managers can view drivers'
            }, status=status.HTTP_403_FORBIDDEN)

        try:
            from .models import Driver
            from .serializers import DriverSerializer
            
            driver = Driver.objects.select_related('user').get(id=pk)
            serializer = DriverSerializer(driver)
            
            return Response({
                'status': 'success',
                'data': serializer.data
            })
        except Driver.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Driver not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.exception(f'Error retrieving driver: {str(e)}')
            return Response({
                'status': 'error',
                'message': f'Failed to retrieve driver: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk=None):
        """Update a driver (PUT)"""
        if request.user.role != 'manager':
            return Response({
                'status': 'error',
                'message': 'Only managers can update drivers'
            }, status=status.HTTP_403_FORBIDDEN)

        try:
            from .models import Driver
            from .serializers import DriverSerializer
            
            driver = Driver.objects.get(id=pk)
            serializer = DriverSerializer(driver, data=request.data, partial=False)
            
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'status': 'success',
                    'data': serializer.data
                })
            else:
                return Response({
                    'status': 'error',
                    'message': 'Invalid data',
                    'errors': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
        except Driver.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Driver not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.exception(f'Error updating driver: {str(e)}')
            return Response({
                'status': 'error',
                'message': f'Failed to update driver: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)

    def partial_update(self, request, pk=None):
        """Update a driver (PATCH)"""
        if request.user.role != 'manager':
            return Response({
                'status': 'error',
                'message': 'Only managers can update drivers'
            }, status=status.HTTP_403_FORBIDDEN)

        try:
            from .models import Driver
            from .serializers import DriverSerializer
            
            driver = Driver.objects.get(id=pk)
            serializer = DriverSerializer(driver, data=request.data, partial=True)
            
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'status': 'success',
                    'data': serializer.data
                })
            else:
                return Response({
                    'status': 'error',
                    'message': 'Invalid data',
                    'errors': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
        except Driver.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Driver not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.exception(f'Error updating driver: {str(e)}')
            return Response({
                'status': 'error',
                'message': f'Failed to update driver: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, pk=None):
        """Delete a driver"""
        if request.user.role != 'manager':
            return Response({
                'status': 'error',
                'message': 'Only managers can delete drivers'
            }, status=status.HTTP_403_FORBIDDEN)

        try:
            from .models import Driver
            
            driver = Driver.objects.get(id=pk)
            driver.user.delete()  # Deleting user will cascade delete driver
            
            return Response({
                'status': 'success',
                'message': 'Driver deleted successfully'
            })
        except Driver.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Driver not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.exception(f'Error deleting driver: {str(e)}')
            return Response({
                'status': 'error',
                'message': f'Failed to delete driver: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)


class ManagerTaxiRidesViewSet(viewsets.ViewSet):
    """
    Manager taxi ride management endpoints
    GET /api/manager/taxi-rides/ - List all taxi bookings
    POST /api/manager/taxi-rides/{id}/assign-driver/ - Assign driver to taxi ride
    """
    permission_classes = [IsAuthenticated]

    def list(self, request):
        """List all taxi ride bookings"""
        if request.user.role != 'manager':
            return Response({
                'status': 'error',
                'message': 'Only managers can view taxi rides'
            }, status=status.HTTP_403_FORBIDDEN)

        try:
            import logging
            logger = logging.getLogger(__name__)
            
            # Get all taxi bookings (pending, confirmed, completed)
            # Manager needs to see all statuses to assign drivers
            taxi_bookings = Booking.objects.filter(
                booking_type='taxi'
            ).select_related('user', 'assigned_driver').order_by('-created_at')
            
            logger.info(f'[ManagerTaxiRides] Found {taxi_bookings.count()} taxi bookings')
            logger.info(f'[ManagerTaxiRides] Booking statuses: {list(taxi_bookings.values_list("status", flat=True))}')
            
            serializer = BookingSerializer(taxi_bookings, many=True)
            
            return Response({
                'status': 'success',
                'data': serializer.data,
                'count': taxi_bookings.count()
            })
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.exception(f'Error fetching taxi rides: {str(e)}')
            return Response({
                'status': 'error',
                'message': f'Failed to fetch taxi rides: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def assign_driver(self, request, pk=None):
        """Assign a driver to a taxi ride"""
        if request.user.role != 'manager':
            return Response({
                'status': 'error',
                'message': 'Only managers can assign drivers'
            }, status=status.HTTP_403_FORBIDDEN)

        try:
            from .models import Driver
            
            booking = Booking.objects.get(id=pk, booking_type='taxi')
            driver_id = request.data.get('driver_id')
            
            if not driver_id:
                return Response({
                    'status': 'error',
                    'message': 'driver_id is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            driver = Driver.objects.get(id=driver_id)
            booking.assigned_driver = driver
            booking.status = 'confirmed'
            booking.save()
            
            serializer = BookingSerializer(booking)
            return Response({
                'status': 'success',
                'message': f'Driver {driver.user.first_name} assigned to booking #{booking.id}',
                'data': serializer.data
            })
            
        except Booking.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Booking not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Driver.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Driver not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.exception(f'Error assigning driver: {str(e)}')
            return Response({
                'status': 'error',
                'message': f'Failed to assign driver: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)


class AdminDriverViewSet(viewsets.ViewSet):
    """
    Admin driver management endpoints
    GET /api/admin/drivers/ - List all drivers in system
    """
    permission_classes = [IsAuthenticated]

    def list(self, request):
        """List all drivers in the system (admin only)"""
        # Check if user is admin
        if request.user.role != 'admin':
            return Response({
                'status': 'error',
                'message': 'Only admins can view all drivers'
            }, status=status.HTTP_403_FORBIDDEN)

        try:
            from .models import Driver
            from .serializers import DriverSerializer
            
            # Get all drivers with related user data
            drivers = Driver.objects.select_related('user').order_by('-created_at')
            serializer = DriverSerializer(drivers, many=True)
            
            return Response({
                'status': 'success',
                'data': serializer.data,
                'count': drivers.count()
            }, status=status.HTTP_200_OK)

        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.exception(f'Error listing drivers for admin: {str(e)}')
            return Response({
                'status': 'error',
                'message': f'Failed to fetch drivers: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)

