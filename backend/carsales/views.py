from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Car
from .serializers import CarSerializer

class CarViewSet(viewsets.ModelViewSet):
    queryset = Car.objects.all()
    serializer_class = CarSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['make', 'model', 'description']
    ordering_fields = ['price', 'year', 'created_at']
    parser_classes = (MultiPartParser, FormParser)

    def get_queryset(self):
        """Return cars visible to the user based on their role"""
        user = self.request.user
        
        if user.is_authenticated and user.is_staff:
            # Admins see all cars (filtered by status)
            return Car.objects.filter(status='available').order_by('-created_at')
        elif user.is_authenticated and user.role == 'manager':
            # Managers see all available cars (for reference)
            return Car.objects.filter(status='available').order_by('-created_at')
        else:
            # Non-authenticated users and customers see only available cars
            return Car.objects.filter(status='available').order_by('-created_at')

    def perform_create(self, serializer):
        """Create a car listing tied to the current user (manager/admin only)"""
        if self.request.user.is_authenticated and (self.request.user.role == 'manager' or self.request.user.is_staff):
            serializer.save(seller=self.request.user)
        else:
            return Response(
                {"error": "Only managers and admins can list cars"},
                status=status.HTTP_403_FORBIDDEN
            )

    def perform_update(self, serializer):
        """Only allow seller or admin to update the car"""
        car = self.get_object()
        if self.request.user == car.seller or self.request.user.is_staff:
            serializer.save()
        else:
            return Response(
                {"error": "You can only edit your own listings"},
                status=status.HTTP_403_FORBIDDEN
            )

    def perform_destroy(self, instance):
        """Only allow seller or admin to delete the car"""
        if self.request.user == instance.seller or self.request.user.is_staff:
            instance.delete()
        else:
            return Response(
                {"error": "You can only delete your own listings"},
                status=status.HTTP_403_FORBIDDEN
            )

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_listings(self, request):
        """Get cars listed by the current user (manager/admin)"""
        if request.user.role == 'manager' or request.user.is_staff:
            cars = Car.objects.filter(seller=request.user).order_by('-created_at')
            serializer = self.get_serializer(cars, many=True)
            return Response(serializer.data)
        else:
            return Response(
                {"error": "Only managers and admins can view their listings"},
                status=status.HTTP_403_FORBIDDEN
            )

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def delete_car(self, request, pk=None):
        """Custom delete endpoint for car"""
        car = self.get_object()
        if request.user == car.seller or request.user.is_staff:
            self.perform_destroy(car)
            return Response(
                {"status": "success", "message": "Car deleted successfully"},
                status=status.HTTP_204_NO_CONTENT
            )
        else:
            return Response(
                {"error": "You can only delete your own listings"},
                status=status.HTTP_403_FORBIDDEN
            )
