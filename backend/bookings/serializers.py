from rest_framework import serializers
from .models import (
    Booking, Car, Driver, Trip, ReviewRating, 
    UsedCarInquiry, Complaint, MaintenanceLog, 
    Payment, Invoice, Refund
)

class BookingSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.first_name', read_only=True)
    assigned_driver = serializers.SerializerMethodField()
    
    class Meta:
        model = Booking
        fields = [
            'id',
            'user',
            'user_email',
            'user_name',
            'booking_type',
            'number_of_days',
            'driver_option',
            'assigned_driver',
            'pickup_location',
            'dropoff_location',
            'pickup_date',
            'pickup_time',
            'phone',
            'agree_to_terms',
            'payment_method',
            'total_amount',
            'payment_status',
            'status',
            'razorpay_order_id',
            'razorpay_payment_id',
            'razorpay_signature',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_user(self, obj):
        """Get user details"""
        return {
            'id': obj.user.id,
            'first_name': obj.user.first_name,
            'last_name': obj.user.last_name,
            'username': obj.user.username,
            'email': obj.user.email,
        }
    
    def get_assigned_driver(self, obj):
        """Get assigned driver details"""
        if obj.assigned_driver:
            return {
                'id': obj.assigned_driver.id,
                'first_name': obj.assigned_driver.user.first_name,
                'last_name': obj.assigned_driver.user.last_name,
                'user': {
                    'first_name': obj.assigned_driver.user.first_name,
                    'last_name': obj.assigned_driver.user.last_name,
                    'email': obj.assigned_driver.user.email,
                },
                'license_number': obj.assigned_driver.license_number,
                'experience_years': obj.assigned_driver.experience_years,
                'average_rating': str(obj.assigned_driver.average_rating),
                'is_verified': obj.assigned_driver.is_verified,
            }
        return None

class BookingCreateSerializer(serializers.ModelSerializer):
    selected_driver_id = serializers.IntegerField(required=False, allow_null=True)
    
    class Meta:
        model = Booking
        fields = [
            'booking_type',
            'number_of_days',
            'driver_option',
            'selected_driver_id',
            'pickup_location',
            'dropoff_location',
            'pickup_date',
            'pickup_time',
            'phone',
            'agree_to_terms',
            'payment_method',
            'total_amount',
        ]
    
    def create(self, validated_data):
        """Create booking with optional driver assignment"""
        selected_driver_id = validated_data.pop('selected_driver_id', None)
        
        # Create the booking
        booking = Booking.objects.create(**validated_data)
        
        # If driver was selected, assign them
        if selected_driver_id:
            try:
                driver = Driver.objects.get(id=selected_driver_id)
                booking.assigned_driver = driver
                booking.save()
            except Driver.DoesNotExist:
                pass  # Booking created but no driver assigned
        
        return booking

# ============================================================================
# CAR SERIALIZERS
# ============================================================================

class CarListSerializer(serializers.ModelSerializer):
    """Serializer for listing cars"""
    class Meta:
        model = Car
        fields = [
            'id', 'registration_number', 'brand', 'model', 'year',
            'car_type', 'capacity', 'status', 'daily_rental_price',
            'with_driver_premium', 'image_url', 'current_location'
        ]


class CarDetailSerializer(serializers.ModelSerializer):
    """Detailed car information"""
    class Meta:
        model = Car
        fields = '__all__'


# ============================================================================
# DRIVER SERIALIZERS
# ============================================================================

class DriverSerializer(serializers.ModelSerializer):
    """Serializer for driver management"""
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    user = serializers.SerializerMethodField()
    assigned_vehicle_info = CarListSerializer(source='assigned_vehicle', read_only=True)
    
    def get_user(self, obj):
        return {
            'id': obj.user.id,
            'email': obj.user.email,
            'first_name': obj.user.first_name,
            'last_name': obj.user.last_name,
            'phone_number': obj.user.phone_number if hasattr(obj.user, 'phone_number') else ''
        }
    
    class Meta:
        model = Driver
        fields = [
            'id', 'license_number', 'license_expiry', 'experience_years',
            'total_trips', 'average_rating', 'status', 'is_verified',
            'user_name', 'user_email', 'user', 'assigned_vehicle_info', 'created_at'
        ]
        read_only_fields = ['id', 'total_trips', 'average_rating', 'created_at']


# ============================================================================
# TRIP SERIALIZERS
# ============================================================================

class TripSerializer(serializers.ModelSerializer):
    """Serializer for trip information"""
    driver_name = serializers.CharField(source='driver.user.get_full_name', read_only=True)
    customer_email = serializers.CharField(source='customer.email', read_only=True)
    car_info = CarListSerializer(source='car', read_only=True)
    
    class Meta:
        model = Trip
        fields = [
            'id', 'booking', 'driver', 'driver_name', 'customer', 'customer_email',
            'car', 'car_info', 'start_location', 'end_location', 'distance_traveled',
            'start_time', 'end_time', 'status', 'base_fare', 'additional_charges',
            'tax', 'total_cost', 'damage_reported', 'damage_description'
        ]
        read_only_fields = ['id', 'start_time', 'created_at']


# ============================================================================
# REVIEW & RATING SERIALIZERS
# ============================================================================

class ReviewRatingSerializer(serializers.ModelSerializer):
    """Serializer for reviews and ratings"""
    reviewer_email = serializers.CharField(source='reviewer.email', read_only=True)
    
    class Meta:
        model = ReviewRating
        fields = [
            'id', 'trip', 'review_type', 'rating', 'review_text',
            'would_recommend', 'reviewer_email', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


# ============================================================================
# USED CAR INQUIRY SERIALIZERS
# ============================================================================

class UsedCarInquirySerializer(serializers.ModelSerializer):
    """Serializer for used car inquiries"""
    car_details = CarListSerializer(source='car', read_only=True)
    
    class Meta:
        model = UsedCarInquiry
        fields = [
            'id', 'customer', 'customer_name', 'customer_email', 'customer_phone',
            'car', 'car_details', 'inquiry_type', 'inquiry_message', 'status',
            'test_drive_date', 'final_negotiated_price', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


# ============================================================================
# COMPLAINT SERIALIZERS
# ============================================================================

class ComplaintSerializer(serializers.ModelSerializer):
    """Serializer for complaints"""
    customer_email = serializers.CharField(source='customer.email', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)
    
    class Meta:
        model = Complaint
        fields = [
            'id', 'customer', 'customer_email', 'category', 'complaint_text',
            'status', 'priority', 'assigned_to', 'assigned_to_name',
            'resolution_notes', 'resolved_at', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


# ============================================================================
# MAINTENANCE SERIALIZERS
# ============================================================================

class MaintenanceLogSerializer(serializers.ModelSerializer):
    """Serializer for maintenance logs"""
    car_info = CarListSerializer(source='car', read_only=True)
    
    class Meta:
        model = MaintenanceLog
        fields = [
            'id', 'car', 'car_info', 'maintenance_type', 'description',
            'estimated_cost', 'actual_cost', 'scheduled_date', 'completed_date',
            'status', 'notes', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


# ============================================================================
# PAYMENT SERIALIZERS
# ============================================================================

class PaymentSerializer(serializers.ModelSerializer):
    """Serializer for payments"""
    class Meta:
        model = Payment
        fields = [
            'id', 'booking', 'trip', 'used_car_inquiry', 'amount', 'tax',
            'discount', 'total_amount', 'payment_method', 'gateway_name',
            'gateway_transaction_id', 'status', 'transaction_date'
        ]
        read_only_fields = ['id', 'transaction_date']


# ============================================================================
# INVOICE SERIALIZERS
# ============================================================================

class InvoiceSerializer(serializers.ModelSerializer):
    """Serializer for invoices"""
    customer_email = serializers.CharField(source='customer.email', read_only=True)
    
    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'customer', 'customer_email', 'booking',
            'trip', 'invoice_date', 'due_date', 'subtotal', 'tax_amount',
            'discount_amount', 'total_amount', 'payment_status', 'description'
        ]
        read_only_fields = ['id', 'invoice_number', 'invoice_date']


# ============================================================================
# REFUND SERIALIZERS
# ============================================================================

class RefundSerializer(serializers.ModelSerializer):
    """Serializer for refunds"""
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True)
    
    class Meta:
        model = Refund
        fields = [
            'id', 'booking', 'payment', 'refund_amount', 'refund_reason',
            'status', 'approved_by', 'approved_by_name', 'requested_date',
            'approved_date', 'completed_date', 'rejection_reason', 'refund_method'
        ]
        read_only_fields = ['id', 'requested_date']