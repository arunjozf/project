# Generated migration file for Booking model

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Booking',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('booking_type', models.CharField(choices=[('premium', 'Premium Car'), ('local', 'Local Car'), ('taxi', 'On-Demand Taxi')], max_length=20)),
                ('number_of_days', models.IntegerField()),
                ('driver_option', models.CharField(blank=True, choices=[('with-driver', 'With Driver'), ('without-driver', 'Without Driver (Self Drive)')], max_length=20, null=True)),
                ('pickup_location', models.CharField(max_length=255)),
                ('dropoff_location', models.CharField(max_length=255)),
                ('pickup_date', models.DateField()),
                ('pickup_time', models.TimeField()),
                ('phone', models.CharField(max_length=20)),
                ('agree_to_terms', models.BooleanField(default=False)),
                ('payment_method', models.CharField(max_length=50)),
                ('total_amount', models.DecimalField(decimal_places=2, max_digits=10)),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('confirmed', 'Confirmed'), ('completed', 'Completed'), ('cancelled', 'Cancelled')], default='pending', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='bookings', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Booking',
                'verbose_name_plural': 'Bookings',
                'db_table': 'bookings',
                'ordering': ['-created_at'],
            },
        ),
    ]
