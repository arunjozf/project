from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone

class User(AbstractUser):
    """Extended User model with additional fields"""
    ROLE_CHOICES = (
        ('customer', 'Customer'),
        ('driver', 'Driver'),
        ('manager', 'Manager'),
        ('service_provider', 'Service Provider'),
        ('admin', 'Admin'),
    )
    
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='customer')
    is_driver = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    groups = models.ManyToManyField(
        'auth.Group',
        related_name='custom_user_groups',
        blank=True
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='custom_user_permissions',
        blank=True
    )

    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        return f"{self.first_name} {self.last_name}" or self.username    
    def is_manager(self):
        """Check if user is a manager"""
        return self.role == 'manager'
    
    def is_customer(self):
        """Check if user is a customer"""
        return self.role == 'customer'
    
    def can_manage_bookings(self):
        """Check if user can manage bookings"""
        return self.role in ['manager', 'admin']
    
    def can_manage_vehicles(self):
        """Check if user can manage vehicles and maintenance"""
        return self.role in ['manager', 'admin']
    
    def can_assist_drivers(self):
        """Check if user can assist drivers"""
        return self.role in ['manager', 'admin']


class Document(models.Model):
    """Model for managing user documents (license, ID, address proof, etc.)"""
    DOCUMENT_TYPE_CHOICES = (
        ('driver_license', 'Driver License'),
        ('id_proof', 'ID Proof'),
        ('address_proof', 'Address Proof'),
        ('police_check', 'Police Check'),
        ('pan_card', 'PAN Card'),
        ('other', 'Other'),
    )
    
    VERIFICATION_STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('verified', 'Verified'),
        ('rejected', 'Rejected'),
        ('expired', 'Expired'),
        ('expiring_soon', 'Expiring Soon'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='documents')
    document_type = models.CharField(max_length=50, choices=DOCUMENT_TYPE_CHOICES)
    
    # Document details
    file_path = models.FileField(upload_to='documents/%Y/%m/%d/')
    document_number = models.CharField(max_length=100, blank=True, null=True)
    issued_date = models.DateField(null=True, blank=True)
    expiry_date = models.DateField(null=True, blank=True)
    
    # Verification
    verification_status = models.CharField(max_length=20, choices=VERIFICATION_STATUS_CHOICES, default='pending')
    verified_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='verified_documents')
    verified_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(null=True, blank=True)
    
    # Metadata
    uploaded_at = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'documents'
        verbose_name = 'Document'
        verbose_name_plural = 'Documents'
        unique_together = ('user', 'document_type')
        indexes = [
            models.Index(fields=['verification_status']),
            models.Index(fields=['user', 'document_type']),
        ]
    
    def __str__(self):
        return f"{self.get_document_type_display()} - {self.user.email}"
    
    def is_valid(self):
        """Check if document is valid (verified and not expired)"""
        if self.verification_status != 'verified':
            return False
        if self.expiry_date and self.expiry_date < timezone.now().date():
            return False
        return True
