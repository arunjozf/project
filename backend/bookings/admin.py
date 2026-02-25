from django.contrib import admin
from .models import (
    Booking, Car, Driver, Trip, ReviewRating, 
    UsedCarInquiry, Complaint, MaintenanceLog, 
    Payment, Invoice, Refund
)


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'booking_type', 'pickup_date', 'status', 'total_amount', 'created_at']
    list_filter = ['booking_type', 'status', 'pickup_date', 'created_at']
    search_fields = ['user__email', 'pickup_location', 'dropoff_location']
    readonly_fields = ['created_at', 'updated_at', 'user']
    
    fieldsets = (
        ('User Information', {
            'fields': ('user',)
        }),
        ('Booking Details', {
            'fields': ('booking_type', 'number_of_days', 'driver_option', 'status')
        }),
        ('Location & Time', {
            'fields': ('pickup_location', 'dropoff_location', 'pickup_date', 'pickup_time')
        }),
        ('Contact & Payment', {
            'fields': ('phone', 'payment_method', 'total_amount', 'agree_to_terms')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Car)
class CarAdmin(admin.ModelAdmin):
    list_display = ['registration_number', 'brand', 'model', 'car_type', 'status', 'daily_rental_price', 'current_location']
    list_filter = ['status', 'car_type', 'year', 'fuel_type']
    search_fields = ['registration_number', 'brand', 'model', 'current_location']
    readonly_fields = ['created_at', 'updated_at', 'total_km']
    
    fieldsets = (
        ('Vehicle Information', {
            'fields': ('registration_number', 'brand', 'model', 'year', 'color', 'fuel_type', 'car_type')
        }),
        ('Capacity & Pricing', {
            'fields': ('capacity', 'daily_rental_price', 'with_driver_premium')
        }),
        ('Status & Location', {
            'fields': ('status', 'current_location', 'image_url')
        }),
        ('Maintenance', {
            'fields': ('total_km', 'last_maintenance_date', 'next_maintenance_date', 'insurance_expiry', 'pollution_expiry'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('acquired_date', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Driver)
class DriverAdmin(admin.ModelAdmin):
    list_display = ['license_number', 'user', 'status', 'average_rating', 'total_trips', 'is_verified']
    list_filter = ['status', 'is_verified', 'average_rating', 'created_at']
    search_fields = ['license_number', 'user__email', 'user__first_name', 'user__last_name']
    readonly_fields = ['created_at', 'updated_at', 'total_trips', 'average_rating']
    
    fieldsets = (
        ('User & License', {
            'fields': ('user', 'license_number', 'license_expiry', 'license_image_url')
        }),
        ('Experience & Rating', {
            'fields': ('experience_years', 'total_trips', 'average_rating')
        }),
        ('Assignment', {
            'fields': ('assigned_vehicle', 'status')
        }),
        ('Verification', {
            'fields': ('is_verified', 'verification_date'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Trip)
class TripAdmin(admin.ModelAdmin):
    list_display = ['id', 'customer', 'driver', 'car', 'start_time', 'status', 'total_cost', 'damage_reported']
    list_filter = ['status', 'damage_reported', 'start_time']
    search_fields = ['customer__email', 'driver__user__email', 'start_location', 'end_location']
    readonly_fields = ['created_at', 'updated_at', 'start_time']
    
    fieldsets = (
        ('Trip References', {
            'fields': ('booking', 'driver', 'customer', 'car')
        }),
        ('Route & Distance', {
            'fields': ('start_location', 'end_location', 'distance_traveled', 'start_time', 'end_time', 'estimated_duration', 'actual_duration')
        }),
        ('Odometer & Fuel', {
            'fields': ('start_odometer', 'end_odometer', 'start_fuel_level', 'end_fuel_level')
        }),
        ('Vehicle Condition', {
            'fields': ('vehicle_condition_before', 'vehicle_condition_after', 'damage_reported', 'damage_description')
        }),
        ('Costing', {
            'fields': ('base_fare', 'additional_charges', 'tax', 'total_cost')
        }),
        ('Status', {
            'fields': ('status',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(ReviewRating)
class ReviewRatingAdmin(admin.ModelAdmin):
    list_display = ['trip', 'review_type', 'rating', 'reviewer', 'would_recommend', 'created_at']
    list_filter = ['review_type', 'rating', 'would_recommend', 'created_at']
    search_fields = ['trip__id', 'reviewer__email', 'review_text']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(UsedCarInquiry)
class UsedCarInquiryAdmin(admin.ModelAdmin):
    list_display = ['customer_name', 'car', 'inquiry_type', 'status', 'test_drive_date', 'created_at']
    list_filter = ['status', 'inquiry_type', 'created_at']
    search_fields = ['customer_name', 'customer_email', 'car__brand', 'car__model']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Customer Information', {
            'fields': ('customer', 'customer_name', 'customer_email', 'customer_phone')
        }),
        ('Inquiry Details', {
            'fields': ('car', 'inquiry_type', 'inquiry_message', 'status')
        }),
        ('Test Drive', {
            'fields': ('test_drive_date', 'test_drive_completed_at')
        }),
        ('Sale Information', {
            'fields': ('final_negotiated_price', 'sold_date')
        }),
        ('Manager Notes', {
            'fields': ('manager_notes',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Complaint)
class ComplaintAdmin(admin.ModelAdmin):
    list_display = ['id', 'customer', 'category', 'priority', 'status', 'assigned_to', 'created_at']
    list_filter = ['category', 'priority', 'status', 'assigned_to', 'created_at']
    search_fields = ['customer__email', 'complaint_text']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Complaint Information', {
            'fields': ('customer', 'trip', 'category', 'complaint_text')
        }),
        ('Status & Assignment', {
            'fields': ('status', 'priority', 'assigned_to')
        }),
        ('Resolution', {
            'fields': ('resolution_notes', 'resolved_at')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(MaintenanceLog)
class MaintenanceLogAdmin(admin.ModelAdmin):
    list_display = ['car', 'maintenance_type', 'status', 'scheduled_date', 'completed_date', 'actual_cost']
    list_filter = ['status', 'maintenance_type', 'scheduled_date']
    search_fields = ['car__registration_number', 'car__brand', 'description']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Maintenance Information', {
            'fields': ('car', 'maintenance_type', 'description')
        }),
        ('Scheduling', {
            'fields': ('scheduled_date', 'completed_date', 'status')
        }),
        ('Costing', {
            'fields': ('estimated_cost', 'actual_cost')
        }),
        ('Notes', {
            'fields': ('notes',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['id', 'booking', 'trip', 'total_amount', 'payment_method', 'status', 'transaction_date']
    list_filter = ['status', 'payment_method', 'gateway_name', 'transaction_date']
    search_fields = ['gateway_transaction_id', 'gateway_order_id', 'booking__id', 'trip__id']
    readonly_fields = ['created_at', 'updated_at', 'transaction_date']


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ['invoice_number', 'customer', 'total_amount', 'payment_status', 'invoice_date']
    list_filter = ['payment_status', 'invoice_date']
    search_fields = ['invoice_number', 'customer__email']
    readonly_fields = ['created_at', 'updated_at', 'generated_at', 'invoice_number']


@admin.register(Refund)
class RefundAdmin(admin.ModelAdmin):
    list_display = ['id', 'booking', 'refund_amount', 'status', 'requested_date', 'approved_by']
    list_filter = ['status', 'requested_date']
    search_fields = ['booking__id', 'refund_reason']
    readonly_fields = ['created_at', 'updated_at', 'requested_date']
