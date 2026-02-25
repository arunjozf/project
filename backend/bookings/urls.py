from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BookingViewSet
from .manager_admin_views import (
    ManagerBookingViewSet,
    ManagerStatsViewSet,
    AdminStatsViewSet,
    AdminUserViewSet,
    AdminPaymentViewSet,
    AdminSettingsViewSet,
    ManagerCarManagementViewSet,
    AdminCarManagementViewSet,
    ManagerDriverViewSet,
    AdminDriverViewSet,
    ManagerTaxiRidesViewSet
)

router = DefaultRouter()
router.register(r'', BookingViewSet, basename='booking')

# Manager routes
router.register(r'manager/bookings', ManagerBookingViewSet, basename='manager-bookings')
router.register(r'manager/stats', ManagerStatsViewSet, basename='manager-stats')
router.register(r'manager/car-management', ManagerCarManagementViewSet, basename='manager-cars')
router.register(r'manager/drivers', ManagerDriverViewSet, basename='manager-drivers')
router.register(r'manager/taxi-rides', ManagerTaxiRidesViewSet, basename='manager-taxi-rides')

# Admin routes
router.register(r'admin/stats', AdminStatsViewSet, basename='admin-stats')
router.register(r'admin/users', AdminUserViewSet, basename='admin-users')
router.register(r'admin/payments', AdminPaymentViewSet, basename='admin-payments')
router.register(r'admin/settings', AdminSettingsViewSet, basename='admin-settings')
router.register(r'admin/car-management', AdminCarManagementViewSet, basename='admin-cars')
router.register(r'admin/drivers', AdminDriverViewSet, basename='admin-drivers')

urlpatterns = [
    path('', include(router.urls)),
]
