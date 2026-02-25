---
description: Workflow to implement the Used Car Sales module
---

# Used Car Sales Module Implementation Workflow

This workflow covers the end-to-end implementation of the "Used Car Sales" feature for AutoNexus.

## Phase 1: Backend Implementation (Django)

### 1. Create New App
Create a dedicated Django app for managing car sales.

```bash
cd backend
python manage.py startapp carsales
```

### 2. Define Models (`backend/carsales/models.py`)
Create a `Car` model to store vehicle details.

```python
from django.db import models
from django.conf import settings

class Car(models.Model):
    CONDITION_CHOICES = (
        ('new', 'New'),
        ('used', 'Used'),
    )
    
    STATUS_CHOICES = (
        ('available', 'Available'),
        ('sold', 'Sold'),
        ('pending', 'Pending'),
    )

    seller = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='cars_for_sale')
    make = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    year = models.IntegerField()
    price = models.DecimalField(max_digits=12, decimal_places=2)
    mileage = models.IntegerField(help_text="Mileage in km")
    condition = models.CharField(max_length=20, choices=CONDITION_CHOICES, default='used')
    description = models.TextField(blank=True)
    primary_image = models.ImageField(upload_to='car_images/', blank=True, null=True)
    # If using external URLs for images while prototyping:
    image_url = models.URLField(blank=True, null=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.year} {self.make} {self.model} - ${self.price}"
```

### 3. Create Serializers (`backend/carsales/serializers.py`)
Create serializers to validate and convert data.

```python
from rest_framework import serializers
from .models import Car
from users.serializers import UserDetailSerializer

class CarSerializer(serializers.ModelSerializer):
    seller_details = UserDetailSerializer(source='seller', read_only=True)

    class Meta:
        model = Car
        fields = '__all__'
        read_only_fields = ('seller', 'created_at', 'updated_at', 'status')
```

### 4. Create Views (`backend/carsales/views.py`)
Implement the API logic.

```python
from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Car
from .serializers import CarSerializer

class CarViewSet(viewsets.ModelViewSet):
    queryset = Car.objects.filter(status='available')
    serializer_class = CarSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['make', 'model', 'description']
    ordering_fields = ['price', 'year', 'created_at']

    def perform_create(self, serializer):
        serializer.save(seller=self.request.user)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_listings(self, request):
        cars = Car.objects.filter(seller=request.user)
        serializer = self.get_serializer(cars, many=True)
        return Response(serializer.data)
```

### 5. Register URLs (`backend/carsales/urls.py` and `backend/config/urls.py`)

**`backend/carsales/urls.py`**:
```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CarViewSet

router = DefaultRouter()
router.register(r'', CarViewSet, basename='cars')

urlpatterns = [
    path('', include(router.urls)),
]
```

**Update `backend/config/urls.py`**:
```python
path('api/cars/', include('carsales.urls')),
```

### 6. Run Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

---

## Phase 2: Frontend Implementation (React)

### 1. Update API Service (`frontend/src/utils/api.js`)
Add `carsAPI` to handle car-related requests.

```javascript
export const carsAPI = {
  getAll: async (params) => {
    // Logic to fetch /api/cars/
  },
  create: async (carData, token) => {
    // Logic to POST /api/cars/
  },
  getMyListings: async (token) => {
    // Logic to GET /api/cars/my_listings/
  }
};
```

### 2. Create Components
- `CarCard.jsx`: To display individual car summary.
- `CarList.jsx`: Grid view of available cars.
- `SellCarForm.jsx`: Form to list a new car.

### 3. Create Pages
- `UsedCarsPage.jsx`: Main marketplace page.
- `CarDetailsPage.jsx`: Detailed view of a specific car.
- `SellCarPage.jsx`: Page containing the form for users to sell.

### 4. Update Navigation (`Navbar.jsx`)
Add links to "Buy Used Cars" and "Sell Your Car".

---

## Phase 3: Integration & Testing

### 1. Test Listing Creation
- User logs in.
- Navigates to "Sell Your Car".
- Submits form.
- Verify entry in database and response.

### 2. Test Marketplace View
- Verify all "available" cars appear on the "Used Cars" page.
- Test filters (Price, Year).

### 3. Permissions Check
- Ensure unauthenticated users can VIEW but not CREATE.
- Ensure only the owner can EDIT/DELETE their listing.
