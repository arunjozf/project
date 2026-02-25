#!/usr/bin/env python
"""
Quick Razorpay API test
"""
import os
import django
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.conf import settings
import razorpay

print("Testing Razorpay API...")
print("-" * 60)

try:
    client = razorpay.Client(
        auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
    )
    print("Client created successfully")
    
    # Try to create a simple order
    order_data = {
        'amount': 50000,  # 500 INR in paise
        'currency': 'INR',
        'receipt': 'test_order_1',
    }
    
    print("\nAttempting to create order...")
    print(f"Order data: {order_data}")
    
    order = client.order.create(data=order_data)
    print("\nOrder created successfully!")
    print(f"Order  ID: {order.get('id')}")
    print(f"Status: {order.get('status')}")
    
except razorpay.errors.BadRequestError as e:
    print(f"\nBadRequestError (Authentication failure): {e}")
    print("This likely means the Razorpay credentials are invalid.")
    print("Please verify your test key credentials.")
except razorpay.errors.ServerError as e:
    print(f"\nServerError (Razorpay server issue): {e}")
except razorpay.errors.GatewayError as e:
    print(f"\nGatewayError (Network/Gateway issue): {e}")
except Exception as e:
    print(f"\nUnexpected error ({type(e).__name__}): {e}")
    import traceback
    traceback.print_exc()

print("\nTest complete.")
