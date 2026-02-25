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
    image_url = models.URLField(blank=True, null=True)
    image = models.ImageField(upload_to='car_images/', blank=True, null=True)
    car_category = models.CharField(max_length=20, default='affordable', choices=[('affordable', 'Affordable'), ('premium', 'Premium')])
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.year} {self.make} {self.model} - ${self.price}"
