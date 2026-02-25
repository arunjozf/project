from django.contrib import admin
from .models import User, Document


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('id', 'username', 'email', 'first_name', 'last_name', 'role', 'is_verified', 'created_at')
    list_filter = ('role', 'is_verified', 'is_active', 'created_at')
    search_fields = ('email', 'first_name', 'last_name', 'username')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('username', 'email', 'first_name', 'last_name', 'role')
        }),
        ('Personal Details', {
            'fields': ('phone_number', 'date_of_birth', 'address', 'city', 'country')
        }),
        ('Account Status', {
            'fields': ('is_verified', 'is_active', 'is_staff', 'is_superuser')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'document_type', 'verification_status', 'expiry_date', 'uploaded_at']
    list_filter = ['document_type', 'verification_status', 'uploaded_at']
    search_fields = ['user__email', 'document_number']
    readonly_fields = ['created_at', 'updated_at', 'uploaded_at']
    
    fieldsets = (
        ('Document Information', {
            'fields': ('user', 'document_type', 'file_path', 'document_number')
        }),
        ('Dates', {
            'fields': ('issued_date', 'expiry_date', 'uploaded_at')
        }),
        ('Verification', {
            'fields': ('verification_status', 'verified_by', 'verified_at', 'rejection_reason')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
