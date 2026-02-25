# Driver Selection Feature for Car Rental

## Overview
Customers can now select an available driver from the manager's pool when booking a car with the "with-driver" option. The system fetches available drivers for the selected booking date and ensures booking confirmation only after driver assignment.

## Features

### 1. **Backend Implementation**

#### Updated Models
- **Booking Model** (`backend/bookings/models.py`)
  - Added `assigned_driver` ForeignKey field linking to Driver model
  - Nullable field allows both with-driver and without-driver bookings

#### New API Endpoints

##### Get Available Drivers
```
GET /api/bookings/available_drivers/
Parameters:
  - pickup_date (required): YYYY-MM-DD format
  - number_of_days (optional, default: 1): Integer

Response:
{
  "status": "success",
  "count": 5,
  "pickup_date": "2026-02-15",
  "number_of_days": 2,
  "data": [
    {
      "id": 1,
      "user_name": "John Doe",
      "user_email": "john@example.com",
      "license_number": "DL-2026-12345",
      "experience_years": 5,
      "total_trips": 250,
      "average_rating": "4.8",
      "is_verified": true,
      "status": "available",
      "assigned_vehicle_info": {...}
    }
  ]
}
```

##### Assign Driver to Booking
```
POST /api/bookings/{booking_id}/assign_driver/
Body:
{
  "driver_id": 1
}

Response:
{
  "status": "success",
  "message": "Driver assigned successfully",
  "data": {
    "id": 123,
    "booking_type": "premium",
    "assigned_driver": {
      "id": 1,
      "user_name": "John Doe",
      "user_email": "john@example.com",
      "license_number": "DL-2026-12345",
      "experience_years": 5,
      "total_trips": 250,
      "average_rating": "4.8",
      "is_verified": true
    },
    ...
  }
}
```

#### Driver Availability Logic
- **Filters applied:**
  1. Driver must be verified (`is_verified=True`)
  2. Driver status must be 'available' or 'assigned'
  3. Driver cannot have overlapping trips during booking period
  
- **Trip Overlap Detection:**
  - Checks for any trips with status 'pending' or 'started'
  - Compares trip start/end dates with booking pickup/dropoff dates
  - Ensures no driver double-booking

### 2. **Frontend Implementation**

#### New Booking Step: Driver Selection (Step 1.5)
- **Trigger:** When booking with "with-driver" option or for premium cars
- **Flow:**
  1. User completes booking details (Step 1)
  2. System fetches available drivers for selected date
  3. User selects preferred driver (Step 1.5)
  4. Continues with personal info (Step 2)
  5. Payment (Step 3)
  6. Confirmation (Step 4)

#### Driver Selection UI Components
- **Drivers Grid:** Responsive card layout displaying available drivers
- **Driver Card Details:**
  - Driver name and overall rating
  - License number
  - Years of experience
  - Total trips completed
  - Current status badge
  - Select button with hover effects

- **Visual Feedback:**
  - Selected driver highlighted with red border
  - Smooth animations on card hover
  - Loading state while fetching drivers
  - Error message if no drivers available

#### Updated BookingPage.jsx
```jsx
Features:
- fetchAvailableDrivers(): Retrieves drivers for selected date
- handleDriverSelect(): Manages driver selection
- Step 1.5 validation: Ensures driver is selected for with-driver bookings
- Enhanced form data structure with selectedDriver field
```

#### New CSS Classes
- `.drivers-grid`: Responsive grid layout
- `.driver-card`: Individual driver card with hover effects
- `.driver-card.selected`: Selected driver styling
- `.btn-select`: Driver selection button
- `.loading-container`: Loading state display
- `.error-box`: Error message styling

### 3. **Booking Creation Validation**

#### Validation Rules
```python
# In BookingViewSet.create():
1. If driver_option == 'with-driver' and no assigned_driver:
   - Delete incomplete booking
   - Return error: "Driver must be assigned for with-driver bookings"

2. Serialize full booking with driver details
3. Return complete booking data with assigned driver info
```

### 4. **Serializers**

#### Updated BookingSerializer
```python
Fields:
- assigned_driver: SerializerMethodField displaying:
  - Driver ID
  - Full name
  - Email
  - License number
  - Experience years
  - Average rating
  - Verification status
```

#### BookingCreateSerializer
```python
Added field:
- assigned_driver: IntegerField (driver ID)
```

## Usage Flow

### Customer Perspective
1. **Browse & Select Car**
   - Choose car type (premium, local, taxi)

2. **Enter Booking Details**
   - Location, date, time, number of days
   - Select "with-driver" option (if applicable)

3. **Select Available Driver**
   - System shows drivers available for selected date
   - View driver ratings and experience
   - Click to select preferred driver

4. **Complete Booking**
   - Enter personal info
   - Choose payment method
   - Confirm booking

5. **Confirmation**
   - Email with driver details sent to customer
   - Driver can see assigned booking in manager dashboard

### Manager Perspective
- **View Available Drivers:** See verified drivers available for specific dates
- **Monitor Assignments:** Track which drivers are assigned to which bookings
- **Update Status:** Mark drivers as available/busy/on-trip

## Database Migration

### Migration Applied
File: `backend/bookings/migrations/0004_booking_assigned_driver.py`

```
Changes:
- Add assigned_driver ForeignKey field to Booking model
- Links to Driver model with SET_NULL on deletion
- Allows null values for self-drive bookings
```

**Migration Command:**
```bash
python manage.py migrate bookings
```

## API Testing

### Get Available Drivers
```bash
curl -H "Authorization: Token YOUR_TOKEN" \
  "http://localhost:8000/api/bookings/available_drivers/?pickup_date=2026-02-15&number_of_days=2"
```

### Create Booking with Driver
```bash
curl -X POST \
  -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "booking_type": "premium",
    "number_of_days": 2,
    "driver_option": "with-driver",
    "assigned_driver": 1,
    "pickup_location": "Downtown",
    "dropoff_location": "Airport",
    "pickup_date": "2026-02-15",
    "pickup_time": "10:00",
    "phone": "+91-9876543210",
    "agree_to_terms": true,
    "payment_method": "razorpay",
    "total_amount": 11000
  }' \
  "http://localhost:8000/api/bookings/"
```

## Error Handling

### Common Errors

#### No Drivers Available
- **Scenario:** Selected date has no available drivers
- **Response:** 
  ```json
  {
    "status": "success",
    "count": 0,
    "data": []
  }
  ```
- **Frontend Action:** Show error message, suggest date change

#### Driver Not Verified
- **Scenario:** Selected driver not yet verified
- **Response:**
  ```json
  {
    "status": "error",
    "message": "Driver is not verified"
  }
  ```

#### Missing Driver for With-Driver Booking
- **Scenario:** User tries to book with-driver without selecting driver
- **Response:**
  ```json
  {
    "status": "error",
    "message": "Driver must be assigned for with-driver bookings",
    "errors": {
      "assigned_driver": ["Driver is required for with-driver bookings"]
    }
  }
  ```

## Benefits

1. **Better Service Quality:** Customers can select experienced, highly-rated drivers
2. **Transparency:** Drivers' credentials and ratings visible upfront
3. **Reduced No-Shows:** Confirmed driver assignments before payment
4. **Driver Management:** Managers have clear visibility of driver assignments
5. **Flexibility:** Customers can choose based on experience and availability
6. **Trust Building:** Verified driver information builds customer confidence

## Future Enhancements

1. **Driver Preferences:** Allow customers to specify driver requirements
2. **Scheduling:** Drivers can pre-schedule availability
3. **Rating System:** Post-booking driver ratings and reviews
4. **Driver Tracking:** Real-time GPS tracking during trips
5. **Communication:** Direct messaging between drivers and customers
6. **Advanced Filters:** Filter drivers by language, vehicle type, etc.

## Technical Stack

- **Backend:** Django, Django REST Framework
- **Database:** SQLite/PostgreSQL
- **Frontend:** React, JavaScript
- **API:** RESTful endpoints with token authentication
- **Styling:** CSS3 with responsive design

## Files Modified/Created

### Backend
- `bookings/models.py` - Added assigned_driver field to Booking
- `bookings/serializers.py` - Updated BookingSerializer with driver details
- `bookings/views.py` - Added available_drivers and assign_driver endpoints
- `bookings/migrations/0004_booking_assigned_driver.py` - Migration file

### Frontend
- `src/pages/BookingPage.jsx` - Updated with driver selection step
- `src/pages/BookingPage.css` - Added driver selection styles

## Support & Questions

For issues or questions about the driver selection feature:
1. Check this documentation
2. Review test endpoints in API section
3. Check browser console for frontend errors
4. Check Django logs for backend errors

---

**Version:** 1.0
**Last Updated:** February 12, 2026
**Status:** Production Ready
