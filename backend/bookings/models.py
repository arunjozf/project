from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta

User = get_user_model()

class Booking(models.Model):
    """Model for storing car rental bookings"""
    BOOKING_TYPE_CHOICES = (
        ('premium', 'Premium Car'),
        ('local', 'Local Car'),
        ('taxi', 'On-Demand Taxi'),
    )
    
    DRIVER_CHOICES = (
        ('with-driver', 'With Driver'),
        ('without-driver', 'Without Driver (Self Drive)'),
    )
    
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )
    
    PAYMENT_STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('initiated', 'Initiated'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    )
    
    # User information
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    
    # Booking details
    booking_type = models.CharField(max_length=20, choices=BOOKING_TYPE_CHOICES)
    number_of_days = models.IntegerField()
    driver_option = models.CharField(max_length=20, choices=DRIVER_CHOICES, blank=True, null=True)
    assigned_driver = models.ForeignKey('Driver', on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_bookings')
    
    # Location details
    pickup_location = models.CharField(max_length=255)
    dropoff_location = models.CharField(max_length=255)
    
    # Date and time
    pickup_date = models.DateField()
    pickup_time = models.TimeField()
    
    # Contact information
    phone = models.CharField(max_length=20)
    
    # Agreement
    agree_to_terms = models.BooleanField(default=False)
    
    # Payment details
    payment_method = models.CharField(max_length=50)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    
    # Razorpay Integration
    razorpay_order_id = models.CharField(max_length=100, blank=True, null=True)
    razorpay_payment_id = models.CharField(max_length=100, blank=True, null=True)
    razorpay_signature = models.CharField(max_length=255, blank=True, null=True)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'bookings'
        ordering = ['-created_at']
        verbose_name = 'Booking'
        verbose_name_plural = 'Bookings'
    
    def __str__(self):
        return f"{self.user.email} - {self.booking_type} ({self.pickup_date})"
    
    def get_total_price(self):
        """Calculate total price based on booking type and options"""
        if self.booking_type == 'premium':
            base_price = 5000
            driver_cost = 500 if self.driver_option == 'with-driver' else 0
        elif self.booking_type == 'local':
            base_price = 1500
            driver_cost = 300 if self.driver_option == 'with-driver' else 0
        else:  # taxi
            return 100 * self.number_of_days
        
        return (base_price + driver_cost) * self.number_of_days

# ============================================================================
# CAR MANAGEMENT MODELS
# ============================================================================

class Car(models.Model):
    """Model for managing car inventory"""
    STATUS_CHOICES = (
        ('available', 'Available'),
        ('reserved', 'Reserved'),
        ('rented', 'Rented'),
        ('maintenance', 'Maintenance'),
        ('damaged', 'Damaged'),
        ('inactive', 'Inactive'),
    )
    
    CAR_TYPE_CHOICES = (
        ('premium', 'Premium'),
        ('local', 'Local'),
        ('luxury', 'Luxury'),
        ('suv', 'SUV'),
        ('taxi', 'Taxi'),
        ('used', 'Used'),
    )
    
    registration_number = models.CharField(max_length=20, unique=True)
    model = models.CharField(max_length=100)
    brand = models.CharField(max_length=100)
    year = models.IntegerField()
    color = models.CharField(max_length=50)
    capacity = models.IntegerField(default=4)
    fuel_type = models.CharField(max_length=50)
    car_type = models.CharField(max_length=20, choices=CAR_TYPE_CHOICES)
    
    # Pricing
    daily_rental_price = models.DecimalField(max_digits=10, decimal_places=2)
    with_driver_premium = models.DecimalField(max_digits=10, decimal_places=2, default=500)
    
    # Condition
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    current_location = models.CharField(max_length=255)
    
    # Maintenance
    total_km = models.IntegerField(default=0)
    last_maintenance_date = models.DateTimeField(null=True, blank=True)
    next_maintenance_date = models.DateTimeField(null=True, blank=True)
    
    # Document
    insurance_expiry = models.DateField(null=True, blank=True)
    pollution_expiry = models.DateField(null=True, blank=True)
    
    # Images
    image_url = models.URLField(null=True, blank=True)
    
    # Metadata
    acquired_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'cars'
        verbose_name = 'Car'
        verbose_name_plural = 'Cars'
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['car_type']),
        ]
    
    def __str__(self):
        return f"{self.brand} {self.model} ({self.registration_number})"
    
    def is_available(self):
        """Check if car is available for booking"""
        return self.status == 'available'


class Driver(models.Model):
    """Model for managing drivers"""
    STATUS_CHOICES = (
        ('available', 'Available'),
        ('assigned', 'Assigned'),
        ('on_trip', 'On Trip'),
        ('off_duty', 'Off Duty'),
        ('on_break', 'On Break'),
        ('maintenance', 'Maintenance'),
    )
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='driver_profile')
    
    # License
    license_number = models.CharField(max_length=20, unique=True)
    license_expiry = models.DateField()
    license_image_url = models.URLField(null=True, blank=True)
    
    # Experience
    experience_years = models.IntegerField(default=0)
    total_trips = models.IntegerField(default=0)
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=5.0)
    
    # Assignment
    assigned_vehicle = models.ForeignKey(Car, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_drivers')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    
    # Verification
    is_verified = models.BooleanField(default=False)
    verification_date = models.DateTimeField(null=True, blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'drivers'
        verbose_name = 'Driver'
        verbose_name_plural = 'Drivers'
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['is_verified']),
        ]
    
    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name} ({self.license_number})"


# ============================================================================
# TRIP & TRANSACTION MODELS
# ============================================================================

class Trip(models.Model):
    """Model for tracking individual trips/rides"""
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('started', 'Started'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )
    
    # References
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='trip', null=True, blank=True)
    driver = models.ForeignKey(Driver, on_delete=models.SET_NULL, null=True, blank=True, related_name='trips')
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='trips_as_customer')
    car = models.ForeignKey(Car, on_delete=models.SET_NULL, null=True, blank=True, related_name='trips')
    
    # Location
    start_location = models.CharField(max_length=255)
    end_location = models.CharField(max_length=255)
    
    # Distance (in km)
    distance_traveled = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    
    # Time
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(null=True, blank=True)
    estimated_duration = models.DurationField(null=True, blank=True)
    actual_duration = models.DurationField(null=True, blank=True)
    
    # Fuel/Mileage
    start_odometer = models.IntegerField()
    end_odometer = models.IntegerField(null=True, blank=True)
    start_fuel_level = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    end_fuel_level = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    
    # Vehicle Condition
    vehicle_condition_before = models.CharField(max_length=500, blank=True, null=True)
    vehicle_condition_after = models.CharField(max_length=500, blank=True, null=True)
    damage_reported = models.BooleanField(default=False)
    damage_description = models.TextField(null=True, blank=True)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Cost
    base_fare = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    additional_charges = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'trips'
        verbose_name = 'Trip'
        verbose_name_plural = 'Trips'
        ordering = ['-start_time']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['driver']),
            models.Index(fields=['customer']),
            models.Index(fields=['start_time']),
        ]
    
    def __str__(self):
        return f"Trip: {self.start_location} → {self.end_location}"


class ReviewRating(models.Model):
    """Model for managing ratings and reviews"""
    RATING_CHOICES = ((i, f'{i} Star{"s" if i != 1 else ""}') for i in range(1, 6))
    
    REVIEW_TYPE_CHOICES = (
        ('driver', 'Driver'),
        ('vehicle', 'Vehicle'),
        ('overall_service', 'Overall Service'),
    )
    
    # References
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='reviews')
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE)
    
    # Review details
    review_type = models.CharField(max_length=20, choices=REVIEW_TYPE_CHOICES)
    rating = models.IntegerField(choices=RATING_CHOICES)
    review_text = models.TextField(blank=True, null=True)
    
    # Additional info
    would_recommend = models.BooleanField(default=True, null=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'reviews_ratings'
        verbose_name = 'Review Rating'
        verbose_name_plural = 'Review Ratings'
        unique_together = ('trip', 'reviewer', 'review_type')
        indexes = [
            models.Index(fields=['review_type']),
            models.Index(fields=['rating']),
        ]
    
    def __str__(self):
        return f"{self.get_review_type_display()} - {self.rating} stars"


# ============================================================================
# USED CAR & INQUIRY MODELS
# ============================================================================

class UsedCarInquiry(models.Model):
    """Model for managing used car sale inquiries"""
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('test_drive_scheduled', 'Test Drive Scheduled'),
        ('test_drive_completed', 'Test Drive Completed'),
        ('negotiation', 'Negotiation'),
        ('sold', 'Sold'),
        ('closed', 'Closed'),
    )
    
    INQUIRY_TYPE_CHOICES = (
        ('inquiry', 'General Inquiry'),
        ('test_drive', 'Test Drive Request'),
        ('purchase', 'Purchase Interest'),
    )
    
    # Customer info
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='used_car_inquiries')
    customer_name = models.CharField(max_length=100)
    customer_email = models.EmailField()
    customer_phone = models.CharField(max_length=20)
    
    # Car info
    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name='inquiries')
    inquiry_type = models.CharField(max_length=50, choices=INQUIRY_TYPE_CHOICES)
    
    # Status
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='pending')
    
    # Details
    inquiry_message = models.TextField(blank=True, null=True)
    manager_notes = models.TextField(blank=True, null=True)
    
    # Test Drive
    test_drive_date = models.DateTimeField(null=True, blank=True)
    test_drive_completed_at = models.DateTimeField(null=True, blank=True)
    
    # Sale
    final_negotiated_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    sold_date = models.DateTimeField(null=True, blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'used_car_inquiries'
        verbose_name = 'Used Car Inquiry'
        verbose_name_plural = 'Used Car Inquiries'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['customer']),
            models.Index(fields=['car']),
        ]
    
    def __str__(self):
        return f"Inquiry: {self.customer_name} - {self.car.brand} {self.car.model}"


# ============================================================================
# COMPLAINT & SUPPORT MODELS
# ============================================================================

class Complaint(models.Model):
    """Model for managing customer complaints"""
    CATEGORY_CHOICES = (
        ('driver_behavior', 'Driver Behavior'),
        ('vehicle_condition', 'Vehicle Condition'),
        ('billing_issue', 'Billing Issue'),
        ('service_quality', 'Service Quality'),
        ('lost_item', 'Lost Item'),
        ('accident_damage', 'Accident/Damage'),
        ('other', 'Other'),
    )
    
    STATUS_CHOICES = (
        ('open', 'Open'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    )
    
    PRIORITY_CHOICES = (
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    )
    
    # Reference
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='complaints')
    trip = models.ForeignKey(Trip, on_delete=models.SET_NULL, null=True, blank=True, related_name='complaints')
    
    # Details
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    complaint_text = models.TextField()
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    
    # Assignment
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_complaints')
    
    # Resolution
    resolution_notes = models.TextField(blank=True, null=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'complaints'
        verbose_name = 'Complaint'
        verbose_name_plural = 'Complaints'
        ordering = ['-priority', '-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['priority']),
            models.Index(fields=['customer']),
        ]
    
    def __str__(self):
        return f"Complaint: {self.get_category_display()} - {self.customer.email}"


class MaintenanceLog(models.Model):
    """Model for tracking vehicle maintenance"""
    MAINTENANCE_TYPE_CHOICES = (
        ('regular', 'Regular Service'),
        ('oil_change', 'Oil Change'),
        ('tire_change', 'Tire Change'),
        ('brake_service', 'Brake Service'),
        ('repair', 'Repair'),
        ('inspection', 'Inspection'),
        ('other', 'Other'),
    )
    
    STATUS_CHOICES = (
        ('scheduled', 'Scheduled'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )
    
    # Reference
    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name='maintenance_logs')
    
    # Details
    maintenance_type = models.CharField(max_length=50, choices=MAINTENANCE_TYPE_CHOICES)
    description = models.TextField()
    
    # Cost
    estimated_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    actual_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Dates
    scheduled_date = models.DateTimeField()
    completed_date = models.DateTimeField(null=True, blank=True)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    
    # Notes
    notes = models.TextField(blank=True, null=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'maintenance_logs'
        verbose_name = 'Maintenance Log'
        verbose_name_plural = 'Maintenance Logs'
        ordering = ['-scheduled_date']
        indexes = [
            models.Index(fields=['car']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"Maintenance: {self.car} - {self.get_maintenance_type_display()}"


# ============================================================================
# PAYMENT & INVOICE MODELS
# ============================================================================

class Payment(models.Model):
    """Model for tracking payments"""
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    )
    
    METHOD_CHOICES = (
        ('credit_card', 'Credit Card'),
        ('debit_card', 'Debit Card'),
        ('digital_wallet', 'Digital Wallet'),
        ('bank_transfer', 'Bank Transfer'),
        ('upi', 'UPI'),
        ('razorpay', 'Razorpay'),
    )
    
    # Reference
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='payment', null=True, blank=True)
    trip = models.OneToOneField(Trip, on_delete=models.CASCADE, related_name='payment', null=True, blank=True)
    used_car_inquiry = models.OneToOneField(UsedCarInquiry, on_delete=models.CASCADE, related_name='payment', null=True, blank=True)
    
    # Amount
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    tax = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Payment method
    payment_method = models.CharField(max_length=50, choices=METHOD_CHOICES)
    
    # Gateway
    gateway_name = models.CharField(max_length=50)
    gateway_transaction_id = models.CharField(max_length=255, unique=True, null=True, blank=True)
    gateway_order_id = models.CharField(max_length=255, null=True, blank=True)
    gateway_signature = models.CharField(max_length=255, null=True, blank=True)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Metadata
    transaction_date = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'payments'
        verbose_name = 'Payment'
        verbose_name_plural = 'Payments'
        ordering = ['-transaction_date']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['gateway_transaction_id']),
        ]
    
    def __str__(self):
        return f"Payment: {self.total_amount} - {self.status}"


class Invoice(models.Model):
    """Model for generating invoices"""
    # Reference
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='invoices', null=True, blank=True)
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='invoices', null=True, blank=True)
    payment = models.OneToOneField(Payment, on_delete=models.SET_NULL, related_name='invoice', null=True, blank=True)
    
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='invoices')
    
    # Invoice details
    invoice_number = models.CharField(max_length=50, unique=True)
    invoice_date = models.DateField(auto_now_add=True)
    due_date = models.DateField(null=True, blank=True)
    
    # Amounts
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Payment status
    payment_status = models.CharField(max_length=20, choices=[
        ('unpaid', 'Unpaid'),
        ('partially_paid', 'Partially Paid'),
        ('paid', 'Paid'),
    ], default='unpaid')
    
    # Description
    description = models.TextField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    
    # Metadata
    generated_at = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'invoices'
        verbose_name = 'Invoice'
        verbose_name_plural = 'Invoices'
        ordering = ['-invoice_date']
        indexes = [
            models.Index(fields=['invoice_number']),
            models.Index(fields=['customer']),
            models.Index(fields=['payment_status']),
        ]
    
    def __str__(self):
        return f"Invoice {self.invoice_number}"


class Refund(models.Model):
    """Model for managing refunds"""
    STATUS_CHOICES = (
        ('requested', 'Requested'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
    )
    
    # Reference
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='refunds')
    payment = models.ForeignKey(Payment, on_delete=models.CASCADE, related_name='refunds')
    
    # Details
    refund_amount = models.DecimalField(max_digits=10, decimal_places=2)
    refund_reason = models.TextField()
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='requested')
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_refunds')
    
    # Dates
    requested_date = models.DateTimeField(auto_now_add=True)
    approved_date = models.DateTimeField(null=True, blank=True)
    completed_date = models.DateTimeField(null=True, blank=True)
    
    # Additional
    rejection_reason = models.TextField(null=True, blank=True)
    refund_method = models.CharField(max_length=50, null=True, blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'refunds'
        verbose_name = 'Refund'
        verbose_name_plural = 'Refunds'
        ordering = ['-requested_date']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['booking']),
        ]
    
    def __str__(self):
        return f"Refund: {self.refund_amount} - {self.status}"