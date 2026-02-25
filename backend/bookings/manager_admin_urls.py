"""
Manager and Admin specific URL routes
These are registered under /api/manager/ and /api/admin/
"""
from rest_framework.routers import DefaultRouter
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

# Manager routes - registered as /api/manager/bookings/, /api/manager/cars/, etc.
router.register(r'bookings', ManagerBookingViewSet, basename='manager-bookings')
router.register(r'stats', ManagerStatsViewSet, basename='manager-stats')
router.register(r'car-management', ManagerCarManagementViewSet, basename='manager-cars')
router.register(r'drivers', ManagerDriverViewSet, basename='manager-drivers')
router.register(r'taxi-rides', ManagerTaxiRidesViewSet, basename='manager-taxi-rides')

# Admin routes - registered as /api/manager/admin/stats/, /api/manager/admin/users/, etc.
router.register(r'admin/stats', AdminStatsViewSet, basename='admin-stats')
router.register(r'admin/users', AdminUserViewSet, basename='admin-users')
router.register(r'admin/payments', AdminPaymentViewSet, basename='admin-payments')
router.register(r'admin/settings', AdminSettingsViewSet, basename='admin-settings')
router.register(r'admin/car-management', AdminCarManagementViewSet, basename='admin-cars')
router.register(r'admin/drivers', AdminDriverViewSet, basename='admin-drivers')

# Note: These routes will be included in config/urls.py as:
# path('api/manager/', include(manager_router.urls))
#
# This results in URLs like:
# /api/manager/bookings/
# /api/manager/cars/
# /api/manager/drivers/
# /api/manager/taxi-rides/
# /api/manager/admin/stats/
# /api/manager/admin/users/
# etc.
