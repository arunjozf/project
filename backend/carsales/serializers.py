from rest_framework import serializers
from .models import Car
from users.serializers import UserDetailSerializer
import os
from django.conf import settings

class CarSerializer(serializers.ModelSerializer):
    seller_details = UserDetailSerializer(source='seller', read_only=True)
    image_url_full = serializers.SerializerMethodField()

    def get_image_url_full(self, obj):
        """Return full URL for uploaded image or the image_url if provided"""
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return obj.image_url

    class Meta:
        model = Car
        fields = '__all__'
        read_only_fields = ('seller', 'created_at', 'updated_at', 'image_url_full')
