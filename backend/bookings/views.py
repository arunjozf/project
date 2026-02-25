from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from .models import Booking
from .serializers import BookingSerializer, BookingCreateSerializer
import logging
from decimal import Decimal
import json
import razorpay
from razorpay.errors import BadRequestError, GatewayError, ServerError
import hmac
import hashlib


logger = logging.getLogger(__name__)


def is_valid_razorpay_key(key_id):
    """Return True for realistic Razorpay keys (test or live)."""
    if not key_id or not isinstance(key_id, str):
        return False
    return key_id.startswith('rzp_test_') or key_id.startswith('rzp_live_')
class BookingViewSet(viewsets.ModelViewSet):
    """ViewSet for managing bookings"""
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Initialize Razorpay client
        self.razorpay_client = razorpay.Client(
            auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
        )
    
    def get_queryset(self):
        """Return bookings for the current user or all bookings if admin"""
        user = self.request.user
        if user.role == 'admin' or user.role == 'manager':
            return Booking.objects.all()
        return Booking.objects.filter(user=user)
    
    def create(self, request, *args, **kwargs):
        """Create a new booking"""
        serializer = BookingCreateSerializer(data=request.data)
        if serializer.is_valid():
            booking = serializer.save(user=request.user)
            
            # Note: For with-driver bookings, assigned_driver is initially NULL
            # Manager will assign a driver from the admin dashboard later
            # No validation needed here - let the booking be created
            
            return Response(
                {
                    'status': 'success',
                    'message': 'Booking created successfully',
                    'data': BookingSerializer(booking).data
                },
                status=status.HTTP_201_CREATED
            )
        return Response(
            {
                'status': 'error',
                'message': 'Booking creation failed',
                'errors': serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_bookings(self, request):
        """Get current user's bookings"""
        bookings = Booking.objects.filter(user=request.user)
        serializer = self.get_serializer(bookings, many=True)
        return Response(
            {
                'status': 'success',
                'count': len(bookings),
                'data': serializer.data
            }
        )
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def all_bookings(self, request):
        """Get all bookings (admin/manager only)"""
        if request.user.role not in ['admin', 'manager']:
            return Response(
                {'status': 'error', 'message': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        bookings = Booking.objects.all()
        serializer = self.get_serializer(bookings, many=True)
        return Response(
            {
                'status': 'success',
                'count': len(bookings),
                'data': serializer.data
            }
        )
    
    @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated])
    def update_status(self, request, pk=None):
        """Update booking status (admin/manager only)"""
        if request.user.role not in ['admin', 'manager']:
            return Response(
                {'status': 'error', 'message': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        booking = self.get_object()
        new_status = request.data.get('status')
        
        if new_status not in ['pending', 'confirmed', 'completed', 'cancelled']:
            return Response(
                {'status': 'error', 'message': 'Invalid status'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        booking.status = new_status
        booking.save()
        
        return Response(
            {
                'status': 'success',
                'message': 'Booking status updated',
                'data': BookingSerializer(booking).data
            }
        )
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def create_payment_order(self, request, pk=None):
        """Create a Razorpay order for booking payment"""
        booking = self.get_object()
        
        # Check if booking belongs to current user
        if booking.user != request.user:
            return Response(
                {'status': 'error', 'message': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if booking already has a payment initiated
        if booking.payment_status == 'completed':
            return Response(
                {'status': 'error', 'message': 'Payment already completed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Ensure amount is converted safely to paise
            try:
                amount_decimal = Decimal(str(booking.total_amount))
            except Exception:
                amount_decimal = Decimal(0)

            amount_in_paise = int(amount_decimal * Decimal('100'))
            
            if amount_in_paise <= 0:
                logger.error('Invalid amount for booking %s: %s', booking.id, booking.total_amount)
                return Response(
                    {'status': 'error', 'message': 'Invalid booking amount'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            logger.debug('Creating payment order: booking_id=%s amount_paise=%s', booking.id, amount_in_paise)
            
            # Create Razorpay order
            # Amount should be in paise (1 INR = 100 paise)
            order_data = {
                'amount': amount_in_paise,
                'currency': 'INR',
                'receipt': f'booking_{booking.id}',
                'notes': {
                    'booking_id': booking.id,
                    'user_email': booking.user.email,
                    'booking_type': booking.booking_type
                }
            }
            
            try:
                # Always use real Razorpay API
                order = self.razorpay_client.order.create(data=order_data)
                logger.info('Payment order created: order_id=%s', order['id'])
            except (BadRequestError, GatewayError, ServerError) as rp_e:
                logger.exception('Razorpay API error for booking %s: %s', booking.id, str(rp_e))
                error_msg = str(rp_e).lower()
                
                if 'auth' in error_msg or 'invalid' in error_msg:
                    logger.error('Razorpay credentials validation failed for booking %s', booking.id)
                    return Response(
                        {
                            'status': 'error',
                            'message': 'Razorpay API Error: Invalid or expired credentials',
                            'details': 'Please verify your Razorpay API keys at https://dashboard.razorpay.com/'
                        },
                        status=status.HTTP_400_BAD_REQUEST
                    )
                else:
                    return Response(
                        {'status': 'error', 'message': f'Payment service unavailable: {error_msg}'},
                        status=status.HTTP_502_BAD_GATEWAY
                    )
            except Exception as e:
                logger.exception('Order creation failed for booking %s: %s', booking.id, str(e))
                error_msg = str(e) if str(e) else 'Unknown error'
                return Response(
                    {'status': 'error', 'message': f'Order creation error: {error_msg}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Save order ID to booking
            booking.razorpay_order_id = order['id']
            booking.payment_status = 'initiated'
            booking.save()
            
            # Response data for real Razorpay
            resp_data = {
                'order_id': order['id'],
                'amount': amount_in_paise,
                'currency': 'INR',
                'booking_id': booking.id,
                'user_email': booking.user.email,
            }

            # Expose the key_id for Razorpay checkout
            if is_valid_razorpay_key(settings.RAZORPAY_KEY_ID):
                resp_data['key_id'] = settings.RAZORPAY_KEY_ID

            return Response(
                {
                    'status': 'success',
                    'message': 'Payment order created',
                    'data': resp_data
                },
                status=status.HTTP_200_OK
            )
        except Exception as e:
            logger.exception('Unexpected error in create_payment_order for booking %s', booking.id)
            return Response(
                {'status': 'error', 'message': f'Unexpected error: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def verify_payment(self, request, pk=None):
        """Verify Razorpay payment signature"""
        booking = self.get_object()
        
        # Check if booking belongs to current user
        if booking.user != request.user:
            return Response(
                {'status': 'error', 'message': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            payment_id = request.data.get('razorpay_payment_id')
            order_id = request.data.get('razorpay_order_id')
            signature = request.data.get('razorpay_signature')
            
            if not all([payment_id, order_id, signature]):
                logger.warning('Missing payment details for booking %s', booking.id)
                return Response(
                    {'status': 'error', 'message': 'Missing payment details'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Always verify signature using HMAC-SHA256
            verify_data = f"{order_id}|{payment_id}"
            generated_signature = hmac.new(
                settings.RAZORPAY_KEY_SECRET.encode(),
                verify_data.encode(),
                hashlib.sha256
            ).hexdigest()
            
            signature_valid = (signature == generated_signature)
            if not signature_valid:
                logger.warning('Invalid payment signature for booking %s - Expected: %s, Got: %s', 
                             booking.id, generated_signature, signature)
            
            if not signature_valid:
                return Response(
                    {'status': 'error', 'message': 'Invalid payment signature'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Update booking with payment details
            booking.razorpay_payment_id = payment_id
            booking.razorpay_signature = signature
            booking.payment_status = 'completed'
            booking.status = 'confirmed'
            booking.save()
            
            logger.info('Payment verified and booking confirmed: booking_id=%s payment_id=%s', booking.id, payment_id)
            
            return Response(
                {
                    'status': 'success',
                    'message': 'Payment verified successfully',
                    'data': BookingSerializer(booking).data
                },
                status=status.HTTP_200_OK
            )
        except Exception as e:
            logger.exception('Payment verification failed for booking %s: %s', booking.id, str(e))
            return Response(
                {'status': 'error', 'message': f'Verification error: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def available_drivers(self, request):
        """Get available drivers for a specific date"""
        from .models import Driver, Trip
        from datetime import datetime, timedelta
        
        pickup_date_str = request.query_params.get('pickup_date')
        number_of_days = request.query_params.get('number_of_days', 1)
        
        if not pickup_date_str:
            return Response(
                {'status': 'error', 'message': 'pickup_date is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            pickup_date = datetime.strptime(pickup_date_str, '%Y-%m-%d').date()
            number_of_days = int(number_of_days)
            dropoff_date = pickup_date + timedelta(days=number_of_days)
        except ValueError:
            return Response(
                {'status': 'error', 'message': 'Invalid date format. Use YYYY-MM-DD'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # First, try to get verified drivers with 'available'/'assigned' status
        all_drivers = Driver.objects.filter(
            is_verified=True,
            status__in=['available', 'assigned']
        ).select_related('user')
        
        # If no verified drivers found, get ALL drivers (to show manager-added drivers)
        if not all_drivers.exists():
            all_drivers = Driver.objects.filter(is_verified=True).select_related('user')
        
        # If still no drivers, get unverified drivers too (for testing)
        if not all_drivers.exists():
            all_drivers = Driver.objects.all().select_related('user')
        
        # Filter out drivers who have trips during the booking period
        available_drivers_list = []
        for driver in all_drivers:
            # Check if driver has any trips overlapping with booking period
            overlapping_trips = Trip.objects.filter(
                driver=driver,
                status__in=['pending', 'started']
            ).filter(
                start_time__date__lt=dropoff_date,
                end_time__date__gte=pickup_date
            )
            
            if not overlapping_trips.exists():
                from .serializers import DriverSerializer
                available_drivers_list.append(DriverSerializer(driver).data)
        
        return Response(
            {
                'status': 'success',
                'count': len(available_drivers_list),
                'pickup_date': pickup_date_str,
                'number_of_days': number_of_days,
                'data': available_drivers_list
            }
        )
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def assign_driver(self, request, pk=None):
        """Assign a driver to a booking"""
        from .models import Driver
        
        booking = self.get_object()
        
        # Check if user has permission to assign driver
        # Owner of booking OR manager/admin can assign drivers
        is_owner = booking.user == request.user
        is_manager = request.user.role == 'manager'
        is_admin = request.user.role == 'admin'
        
        if not (is_owner or is_manager or is_admin):
            return Response(
                {'status': 'error', 'message': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if booking allows driver
        if booking.driver_option != 'with-driver':
            return Response(
                {'status': 'error', 'message': 'This booking does not require a driver'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        driver_id = request.data.get('driver_id')
        if not driver_id:
            return Response(
                {'status': 'error', 'message': 'driver_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            driver = Driver.objects.get(id=driver_id)
        except Driver.DoesNotExist:
            return Response(
                {'status': 'error', 'message': 'Driver not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if driver is verified
        if not driver.is_verified:
            return Response(
                {'status': 'error', 'message': 'Driver is not verified'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Assign driver to booking
        booking.assigned_driver = driver
        booking.save()
        
        logger.info('Driver assigned to booking: booking_id=%s driver_id=%s', booking.id, driver.id)
        
        return Response(
            {
                'status': 'success',
                'message': 'Driver assigned successfully',
                'data': BookingSerializer(booking).data
            }
        )

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def admin_drivers(self, request):
        """Get all drivers in system (admin only)"""
        if request.user.role != 'admin':
            return Response(
                {'status': 'error', 'message': 'Only admins can view all drivers'},
                status=status.HTTP_403_FORBIDDEN
            )
        
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
            logger.exception(f'Error fetching drivers for admin: {str(e)}')
            return Response(
                {'status': 'error', 'message': f'Failed to fetch drivers: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )