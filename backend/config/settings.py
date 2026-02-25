"""
Django settings for config project.
"""

from pathlib import Path
import os
from decouple import config

try:
    import pymysql  # type: ignore
    pymysql.install_as_MySQLdb()
except ImportError:
    pass

# Build paths inside the project
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = config('SECRET_KEY', default='django-insecure-your-secret-key')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = config('DEBUG', default=True, cast=bool)

ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1').split(',')

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
    'users',
    'bookings',
    'carsales',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# Database configuration
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'autonexus_db',
        'USER': 'django_user',
        'PASSWORD': 'Arun@5432',
        'HOST': 'localhost',
        'PORT': '3306',
        'OPTIONS': {
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
        },
    }
}




# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# REST Framework Configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
    ],
}

# CORS Configuration
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_METHODS = [
    "DELETE",
    "GET",
    "OPTIONS",
    "PATCH",
    "POST",
    "PUT",
]
CORS_ALLOW_HEADERS = [
    "authorization",
    "content-type",
]
# Allow all localhost ports
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^http://localhost:\d+$",
]

# CSRF settings
CSRF_TRUSTED_ORIGINS = [
    "http://localhost",
]

# File Upload Settings
DATA_UPLOAD_MAX_MEMORY_SIZE = 5242880  # 5MB
FILE_UPLOAD_MAX_MEMORY_SIZE = 5242880  # 5MB
FILE_UPLOAD_PERMISSIONS = 0o644

# Custom User Model
AUTH_USER_MODEL = 'users.User'

# Razorpay Configuration
# IMPORTANT: Add your Razorpay API keys from https://dashboard.razorpay.com/
# These are test mode keys - change to rzp_live_* keys for production
# Test keys automatically open Razorpay in sandbox mode
RAZORPAY_KEY_ID = config('RAZORPAY_KEY_ID', default='rzp_test_S9zIjNpZG23rXQ')
RAZORPAY_KEY_SECRET = config('RAZORPAY_KEY_SECRET', default='IhY1ymgzzid92MUqL4lNkgxv')

# Pending Bookings Configuration
PENDING_BOOKING_TIMEOUT = config('PENDING_BOOKING_TIMEOUT', default=3600, cast=int)  # 1 hour in seconds
PENDING_PAYMENT_TIMEOUT = config('PENDING_PAYMENT_TIMEOUT', default=1800, cast=int)  # 30 minutes in seconds
AUTO_APPROVE_BOOKINGS = config('AUTO_APPROVE_BOOKINGS', default=False, cast=bool)  # Auto-approve bookings
AUTO_CANCEL_EXPIRED_PENDING = config('AUTO_CANCEL_EXPIRED_PENDING', default=True, cast=bool)  # Auto-cancel expired pending bookings
PENDING_BOOKING_HOLD_TIME = config('PENDING_BOOKING_HOLD_TIME', default=7200, cast=int)  # 2 hours in seconds before cancelling unpaid
