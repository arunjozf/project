# Car Rental & Vehicle Service Management System - Complete Specification

## Overview
A comprehensive web-based platform for car rentals, vehicle services, taxi management, and used vehicle sales with role-based access control for Admin, Manager, and Customer.

---

## PART 1: ADMIN DASHBOARD FEATURES

### 1.1 User Management
**Purpose:** Complete control over all system users

**Features:**
- **View All Users**
  - List all customers, managers, and drivers
  - Filter by role, status (active/inactive), registration date
  - Search by email, name, phone number
  - Pagination support

- **Add New User**
  - Create customer, manager, or driver accounts
  - Assign roles and set initial passwords
  - Enable/disable users

- **Edit User Details**
  - Modify user information
  - Change roles
  - Update contact information

- **Deactivate/Reactivate Users**
  - Temporarily or permanently disable accounts
  - Audit trail for deactivation reasons

- **View User Profiles**
  - Complete user details including documents
  - Booking history
  - Payment history
  - Ratings and reviews

---

### 1.2 Role-Based Access Control
**Purpose:** Manage permissions and access levels

**Features:**
- **Define Roles**
  - Admin: Full system access
  - Manager: Operational control
  - Customer: Service user
  - Driver: Vehicle operation

- **Permission Management**
  - Granular permission control per role
  - Module-level access control
  - Action-level permissions

- **Audit Logs**
  - Track all admin actions
  - View who accessed what and when
  - Download audit reports

---

### 1.3 Booking Overview & Control
**Purpose:** Monitor and manage all bookings

**Features:**
- **Dashboard Overview**
  - Total bookings (daily, weekly, monthly)
  - Ongoing bookings count
  - Completed bookings count
  - Cancelled bookings count
  - Booking status distribution (pie chart)

- **View All Bookings**
  - List view with filters (status, date range, customer, car type)
  - Detailed booking view with all details
  - Booking timeline (created, approved, started, completed)

- **Booking Actions**
  - Approve/reject pending bookings
  - Cancel bookings with reason
  - View booking details and modifications

- **Booking Analytics**
  - Most booked car types
  - Peak booking times
  - Booking trends

---

### 1.4 Revenue Tracking & Financial Reports
**Purpose:** Monitor financial performance

**Features:**
- **Revenue Dashboard**
  - Total revenue (all time, monthly, yearly)
  - Revenue by service type (rentals, taxi, used cars)
  - Revenue by car type
  - Revenue growth charts

- **Payment Reports**
  - All transactions list
  - Payment method breakdown
  - Failed payments
  - Refunded amounts

- **Financial Summary**
  - Income statement
  - Commission tracking
  - Outstanding payments

- **Invoice Reports**
  - Generated invoices list
  - Download/view customer invoices
  - Tax reports
  - Financial year summaries

---

### 1.5 Platform Analytics
**Purpose:** Track system performance and usage

**Features:**
- **User Analytics**
  - Active users count
  - New registrations (daily, weekly, monthly)
  - User retention rate
  - User demographics

- **Service Usage**
  - Most used services
  - Service performance metrics
  - Customer satisfaction metrics
  - Service feedback analysis

- **Performance Metrics**
  - Page load times
  - API response times
  - System uptime
  - Error rates

---

### 1.6 Car Inventory Management
**Purpose:** Manage vehicle fleet

**Features:**
- **Vehicle List**
  - All vehicles with details (registration, model, status)
  - Filter by type, status, availability
  - Search functionality
  - Bulk actions

- **Add/Edit Vehicles**
  - Vehicle details (registration, model, year, color, capacity)
  - Upload vehicle images
  - Set rental pricing
  - Define availability schedule

- **Vehicle Status Tracking**
  - Available/Reserved/Rented/Maintenance status
  - Real-time status updates
  - Status history

- **Maintenance Tracking**
  - Schedule maintenance
  - View maintenance history
  - Track maintenance costs
  - Set vehicle unavailable for maintenance

- **Vehicle Analytics**
  - Most rented vehicles
  - Vehicle utilization rate
  - Revenue per vehicle
  - Maintenance costs per vehicle

---

### 1.7 Driver Management
**Purpose:** Manage driver fleet

**Features:**
- **Driver List**
  - All drivers with details (license, status)
  - Filter by status (available, on-trip, maintenance)
  - Search by name, license number

- **Driver Registration**
  - Add new drivers
  - Verify documents (license, ID, police check)
  - Assign to vehicles
  - Set availability

- **Driver Profile**
  - Personal details
  - Document verification status
  - Driving history
  - Ratings and reviews
  - Trip history

- **Driver Status Management**
  - Mark as available/unavailable
  - Assign to vehicles
  - View current assignments

- **Driver Performance**
  - Ratings and reviews
  - Trip count
  - Cancellation rate
  - Customer feedback

---

### 1.8 Taxi Monitoring
**Purpose:** Monitor taxi service operations

**Features:**
- **Taxi Dashboard**
  - Active taxi bookings
  - Idle taxi count
  - Occupied taxi count
  - Average wait time

- **Real-time Taxi Tracking**
  - Live map view of taxi locations
  - Current passenger count
  - Driver location updates
  - Trip time estimates

- **Taxi Request History**
  - All taxi bookings
  - Filter by date, status, driver
  - View request details
  - Customer feedback

---

### 1.9 Used Car Sales Monitoring
**Purpose:** Track used vehicle sales

**Features:**
- **Used Car Inventory**
  - List all used cars
  - Details and images
  - Pricing
  - Availability status

- **Sales Tracking**
  - All inquiries
  - All sales
  - Pending sales
  - Completed sales

- **Inquiry Management**
  - View customer inquiries
  - Track inquiry status
  - Follow-up reminders

---

### 1.10 Complaint Management
**Purpose:** Handle customer complaints

**Features:**
- **Complaint Dashboard**
  - New complaints count
  - Open complaints
  - Resolved complaints
  - Complaint trends

- **View Complaints**
  - List all complaints
  - Filter by status, date, category
  - Priority levels

- **Complaint Actions**
  - Assign to staff
  - Add notes and updates
  - Change status (open, in-progress, resolved)
  - Send customer responses

- **Complaint Categories**
  - Driver behavior
  - Vehicle condition
  - Billing issues
  - Service quality
  - Other

---

### 1.11 Refund Approval
**Purpose:** Manage refund requests

**Features:**
- **Refund Dashboard**
  - Pending refunds
  - Approved refunds
  - Rejected refunds
  - Total refund amount

- **Process Refunds**
  - View refund requests
  - Reason for refund
  - Approve with amount
  - Reject with reason
  - Payment status tracking

---

### 1.12 System Settings
**Purpose:** Configure system parameters

**Features:**
- **General Settings**
  - Platform name
  - Support email and phone
  - Business address
  - Operating hours

- **Pricing Settings**
  - Base prices for services
  - Tax rates
  - Commission rates
  - Discounts and coupons

- **Payment Settings**
  - Payment gateway configuration
  - Payment methods enabled
  - Refund policies

- **Notification Settings**
  - Email templates
  - SMS templates
  - Notification triggers
  - Email/SMS configuration

- **Security Settings**
  - Password policies
  - Two-factor authentication
  - API keys management
  - Data encryption settings

---

### 1.13 Maintenance Tracking
**Purpose:** Track vehicle and system maintenance

**Features:**
- **Vehicle Maintenance**
  - Schedule maintenance
  - Track maintenance history
  - Maintenance costs
  - Set vehicle unavailable
  - Completion tracking

- **System Maintenance**
  - Scheduled downtime
  - Database backups
  - Log retention settings
  - Health checks

---

### 1.14 Notification Management
**Purpose:** Manage system notifications

**Features:**
- **Notification Templates**
  - Create custom templates
  - Edit existing templates
  - View template usage

- **Notification Triggers**
  - Configure when notifications are sent
  - Notification recipients
  - Notification channels (email, SMS)

- **Notification History**
  - View all notifications sent
  - Filter by type, date, recipient
  - Download reports

---

## PART 2: MANAGER DASHBOARD FEATURES

### 2.1 Booking Approval & Rejection
**Purpose:** Manage booking approvals

**Features:**
- **Pending Bookings**
  - List of pending approvals
  - Booking details (customer, car, dates, time)
  - Customer rating and history
  - Quick view without full details required

- **Approval Process**
  - View booking requirements
  - Check availability
  - Approve with options (accept as-is, assign driver)
  - Reject with reason notification to customer

- **Batch Actions**
  - Bulk approve similar bookings
  - Bulk reject with same reason

---

### 2.2 Driver Assignment
**Purpose:** Assign drivers to bookings with driver

**Features:**
- **Assignment Workflow**
  - When customer selects "with driver"
  - Manager sees list of approved bookings needing drivers
  - View available drivers for date/time
  - Assign driver with confirmation
  - Driver and customer both notified

- **Driver Availability Check**
  - Filter drivers by:
    - Available on booking dates
    - Qualified for vehicle type
    - Location proximity (if applicable)
    - Rating and performance
  - Show driver details before assignment

- **Driver Acceptance**
  - Driver can accept/reject assignment
  - Manager can reassign if rejected
  - Notification to customer of driver details

---

### 2.3 Car Allocation & Availability Tracking
**Purpose:** Manage vehicle allocation

**Features:**
- **Car Availability**
  - Real-time car availability status
  - View bookings and reserved periods
  - Mark cars as maintenance/unavailable
  - Update car status manually if needed

- **Allocation Management**
  - Allocate cars to bookings
  - View which car is allocated to which booking
  - Change allocation if needed
  - Update status as cars are used

- **Inventory Alerts**
  - Low availability warnings
  - Maintenance alerts
  - Upcoming reservations

---

### 2.4 Taxi Request Handling & Driver Assignment
**Purpose:** Manage taxi service operations

**Features:**
- **Taxi Requests**
  - Real-time taxi booking requests
  - Location (pickup and dropoff)
  - Duration and distance estimates
  - Customer details

- **Driver Assignment**
  - View available drivers
  - Assign nearest/best driver
  - Send assignment to driver
  - Track assignment acceptance

- **Trip Monitoring**
  - View active trips
  - Track progress
  - Customer and driver both on map
  - Support driver with routing

---

### 2.5 Active Trip Monitoring
**Purpose:** Monitor ongoing trips in real-time

**Features:**
- **Trip Dashboard**
  - All active rentals and taxi trips
  - Real-time location tracking (if enabled)
  - Trip progress (time remaining, distance)
  - Driver and customer info

- **Trip Actions**
  - Communicate with driver/customer
  - Handle emergencies
  - Early completion
  - Extended trips
  - Trip issues/problems

- **Trip Notifications**
  - Trip start notifications
  - Midpoint notifications
  - Completion notifications
  - Issue alerts

---

### 2.6 Payment Verification
**Purpose:** Verify and track payments

**Features:**
- **Payment Records**
  - View bookings and payment status
  - Pending payments
  - Completed payments
  - Failed payments

- **Payment Verification**
  - Verify payment amounts match booking
  - Check payment method
  - Confirm payment status with payment gateway
  - Action failed payments

---

### 2.7 Used Vehicle Inquiry Handling
**Purpose:** Manage used vehicle sales inquiries

**Features:**
- **Inquiry Management**
  - View customer inquiries on used cars
  - Customer contact information
  - Inquiry date and details
  - Follow-up status

- **Response Management**
  - Send responses to inquiries
  - Track response status
  - Schedule follow-ups
  - Convert inquiry to sale

- **Sales Tracking**
  - Track inquiry to sale conversion
  - View completed sales
  - Pending sales status

---

### 2.8 Maintenance Scheduling
**Purpose:** Schedule and track vehicle maintenance

**Features:**
- **Maintenance Schedule**
  - Schedule vehicle maintenance
  - View upcoming maintenance
  - Set maintenance window
  - Notify when maintenance needed

- **Maintenance Records**
  - Log completed maintenance
  - Track maintenance costs
  - Note issues and repairs
  - Mark vehicle as available after maintenance

---

### 2.9 Cancellation Handling
**Purpose:** Process booking cancellations

**Features:**
- **Cancellation Requests**
  - View pending cancellation requests
  - Customer reason for cancellation
  - Booking details

- **Cancellation Processing**
  - Approve cancellation
  - Process refunds
  - Cancel assignments (driver, car)
  - Notify all parties

- **Cancellation History**
  - View all cancellations
  - Cancellation reasons
  - Refund amounts

---

### 2.10 Customer Support Handling
**Purpose:** Provide customer support

**Features:**
- **Support Tickets**
  - View open support tickets
  - Ticket priority level
  - Customer inquiry details
  - Response history

- **Ticket Actions**
  - Send responses
  - Update status
  - Escalate if needed
  - Close resolved tickets

- **Common Issues**
  - Quick response templates
  - FAQ access
  - Escalation procedures

---

### 2.11 Limited Reporting Access
**Purpose:** Generate operational reports

**Features:**
- **Performance Reports**
  - Bookings processed (daily, weekly, monthly)
  - Approval rates
  - Cancellation rates
  - Average approval time

- **Revenue Reports**
  - Bookings revenue
  - Taxi revenue
  - Total revenue
  - Filter by date range

- **Driver Performance**
  - Driver metrics
  - Ratings summary
  - Trip counts
  - Performance trends

---

## PART 3: CUSTOMER DASHBOARD FEATURES

### 3.1 Profile Management
**Purpose:** Manage customer account

**Features:**
- **View Profile**
  - Name, email, phone
  - Address and location
  - Profile picture
  - Account status

- **Edit Profile**
  - Update personal information
  - Change password
  - Add emergency contact
  - Set notification preferences

- **Account Settings**
  - Privacy settings
  - Communication preferences
  - Saved payment methods
  - Linked accounts

---

### 3.2 Document Upload
**Purpose:** Verify customer identity for rentals

**Features:**
- **Required Documents**
  - Driver license upload
  - ID proof upload
  - Address proof (optional)

- **Document Management**
  - View uploaded documents
  - Replace documents
  - Verification status display
  - Expiration alerts

- **Document Requirements**
  - License validity check
  - Document type icons
  - Clear instructions

---

### 3.3 Car Rental Booking System
**Purpose:** Create rental bookings

**Features:**
- **Browse Cars**
  - View available car types (luxury, premium, local, SUV)
  - Filter by type, price, capacity
  - View car details and images
  - View pricing and rates

- **Select Options**
  - With driver or without driver
  - Pickup and dropoff locations
  - Pickup and dropoff dates/times
  - One-way or round-trip

- **Create Booking**
  - Confirm details
  - Add special requests
  - Review pricing breakdown
  - Submit booking

- **Booking Confirmation**
  - Booking ID and details
  - Awaiting approval notification
  - Real-time status updates

---

### 3.4 Taxi Booking System
**Purpose:** Book on-demand taxi service

**Features:**
- **Quick Booking**
  - Pickup location (auto-detect or manual)
  - Dropoff location
  - Current time or scheduled time
  - Estimate cost

- **Book Taxi**
  - Confirm booking
  - Receive driver assignment
  - Real-time driver tracking
  - Driver contact and details

- **Booking Options**
  - Regular taxi
  - Premium taxi (if available)
  - Shared ride (if available)

---

### 3.5 Used Car Browsing & Inquiry
**Purpose:** Browse and inquire about used cars

**Features:**
- **Browse Inventory**
  - View all used cars listed
  - Filter by brand, model, price range, year
  - View car details and images
  - View price and features

- **Car Details**
  - Specifications
  - Condition report
  - Service history
  - Price

- **Send Inquiry**
  - Complete inquiry form
  - Share contact details
  - Request test drive
  - Request more information
  - Submit inquiry

- **Inquiry Tracking**
  - View submitted inquiries
  - Track inquiry status
  - View responses

---

### 3.6 Booking Status Tracking
**Purpose:** Track booking progress

**Features:**
- **Status Updates**
  - Real-time booking status
  - Notifications at each stage
  - Timeline view (created, approved, confirmed, in-progress, completed)

- **Booking Details**
  - View all booking information
  - Car details (if assigned)
  - Driver details (if assigned)
  - Pickup/dropoff information
  - Total cost

- **Trip Progress**
  - Trip timeline
  - Driver location (if enabled)
  - Time remaining
  - Distance traveled

---

### 3.7 Payment History
**Purpose:** View all transactions

**Features:**
- **Transaction List**
  - All bookings and payments
  - Booking ID and date
  - Amount paid
  - Payment method
  - Payment status

- **Transaction Details**
  - Breakdown of charges:
    - Base fare
    - Taxes
    - Discounts
    - Total paid
  - Invoice link

- **Filter Options**
  - Filter by date range
  - Filter by service type
  - Filter by status
  - Search by booking ID

---

### 3.8 Invoice Download
**Purpose:** Download transaction invoices

**Features:**
- **View Invoices**
  - List of all invoices
  - Invoice date and number
  - Amount
  - Status (paid, pending, etc.)

- **Download Invoices**
  - Download as PDF
  - Email invoice
  - Print invoice

- **Invoice Details**
  - Complete billing information
  - Itemized charges
  - Tax details
  - Payment method

---

### 3.9 Cancellation & Refund Request
**Purpose:** Cancel bookings and request refunds

**Features:**
- **Cancel Booking**
  - View cancellation policy
  - Option to cancel (if allowed)
  - Provide cancellation reason
  - Review refund amount
  - Submit cancellation request

- **Refund Tracking**
  - View refund status
  - Refund amount
  - Expected refund date
  - Refund method

- **Cancellation History**
  - View past cancellations
  - Refund details
  - Reasons

---

### 3.10 Driver Details View
**Purpose:** View assigned driver information

**Features:**
- **Driver Profile**
  - Driver name and photo
  - Rating and reviews
  - Experience (years, trips)
  - Vehicle assigned

- **Driver Contact**
  - Call driver
  - Message driver
  - Driver phone (shown only for active trips)

- **Driver Tracking** (during trip)
  - Live location map
  - Real-time updates
  - ETA to destination

---

### 3.11 Ratings & Reviews
**Purpose:** Rate and review services

**Features:**
- **Rate Trip**
  - Star rating (1-5)
  - Rate driver (if applicable)
  - Rate vehicle
  - Rate overall service

- **Write Review**
  - Text review
  - Highlight strengths/issues
  - Photo upload (optional)
  - Submit review

- **View Reviews**
  - See ratings history
  - Read own reviews
  - View feedback from providers

---

### 3.12 Notifications
**Purpose:** Keep customer informed

**Features:**
- **Notification Center**
  - All notifications list
  - Filter by type (booking, payment, system)
  - Mark as read
  - Delete notifications

- **Notification Types**
  - Booking approved/rejected
  - Driver assigned
  - Trip start reminder
  - Trip completed
  - Payment confirmed
  - Refund processed
  - Support responses
  - Promotions (if opted in)

- **Notification Settings**
  - Enable/disable notification types
  - Notification channels (app, email, SMS)
  - Quiet hours

---

## PART 4: COMPLETE SYSTEM WORKFLOWS

### 4.1 RENTAL WITH DRIVER

**Booking Creation:**
1. Customer browses available cars
2. Selects car and "With Driver" option
3. Chooses pickup/dropoff dates and times
4. Adds special requests
5. Reviews booking details and pricing
6. Submits booking
7. Booking status: PENDING

**Approval Process:**
1. Manager receives notification of pending booking
2. Checks car availability
3. Approves booking
4. Booking status: APPROVED
5. Customer receives approval notification

**Driver Assignment:**
1. Manager views approved bookings needing drivers
2. Checks available drivers for booking dates
3. Selects and assigns driver
4. Driver receives assignment notification
5. Driver can accept/reject
6. If accepted: Driver status = ASSIGNED
7. Customer receives driver details

**Pre-Trip Preparation:**
1. Driver and customer can communicate
2. Confirm pickup location and time
3. Customer gets final reminders
4. Vehicle status: RESERVED → RENTED

**Trip Start:**
1. Driver picks up customer at location
2. Driver marks trip as started
3. Booking status: ONGOING
4. Real-time tracking begins (if enabled)
5. Driver status: ON_TRIP

**During Trip:**
1. Manager can monitor trip progress
2. Real-time location updates
3. Communication available
4. Issues can be reported

**Trip Completion:**
1. Driver reaches destination
2. Driver marks trip as completed
3. Customer confirms completion
4. Trip time and distance recorded
5. Final charges calculated
6. Booking status: COMPLETED
7. Vehicle status: AVAILABLE
8. Driver status: AVAILABLE

**Payment & Invoicing:**
1. Final amount charged (if hourly/extra charges)
2. Payment processed
3. Invoice generated and sent
4. Payment status: PAID

**Rating & Review:**
1. Customer receives rating request
2. Customer rates driver and vehicle
3. Customer writes optional review
4. Booking status: CLOSED
5. Reviews saved to driver and vehicle profiles

**Status Flow:**
```
Booking: PENDING → APPROVED → ONGOING → COMPLETED → CLOSED
Car: AVAILABLE → RESERVED → RENTED → AVAILABLE
Driver: AVAILABLE → ASSIGNED → ON_TRIP → AVAILABLE
```

---

### 4.2 RENTAL WITHOUT DRIVER

**Booking Creation:**
1. Customer browses available cars
2. Selects car and "Without Driver" option
3. Chooses pickup/dropoff dates and times
4. Reviews booking details and pricing
5. Submits booking
6. Booking status: PENDING

**Approval Process:**
1. Manager receives notification
2. Verifies car availability
3. Checks customer license and documents
4. Approves booking
5. Booking status: APPROVED
6. Car status: RESERVED
7. Customer notified

**Pickup:**
1. Customer arrives for pickup
2. Car details and keys provided
3. Damage inspection (photos)
4. Fuel level recorded
5. Mileage recorded
6. Trip start recorded
7. Booking status: ONGOING
8. Car status: RENTED
9. Customer receives car instructions

**During Rental:**
1. Customer has full access to vehicle
2. Can contact support if needed
3. Can view trip time remaining

**Return:**
1. Customer returns to dropoff location
2. Fuel level recorded
3. Mileage recorded
4. Vehicle inspection for damages
5. Damage report generated if needed
6. Trip ended
7. Booking status: COMPLETED
8. Car status: AVAILABLE
9. Return inspection photos taken

**Damage Assessment:**
- If no damage: Invoice with base rental amount
- If damage: Damage charges added to invoice
- Photos and details recorded

**Payment & Invoicing:**
1. Total amount calculated (rental + fuel + damage)
2. Payment processed
3. Invoice generated and sent
4. Payment status: PAID

**Rating & Review:**
1. Customer rates vehicle and overall service
2. Writes optional review
3. Booking status: CLOSED

**Status Flow:**
```
Booking: PENDING → APPROVED → ONGOING → COMPLETED → CLOSED
Car: AVAILABLE → RESERVED → RENTED → AVAILABLE
Customer Document: VERIFIED (prerequisite)
```

---

### 4.3 ON-DEMAND TAXI

**Booking Creation:**
1. Customer opens taxi booking
2. Auto-detects current location (or manual entry)
3. Enters dropoff location
4. Selects current time or future time
5. System shows fare estimate
6. Confirms booking
7. Booking status: PENDING

**Driver Assignment:**
1. Manager receives taxi request
2. Filters available drivers
3. Assigns nearest available driver
4. Driver receives assignment notification
5. Driver accepts/rejects
6. If accepted: Driver status: ASSIGNED
7. Customer receives driver assignment
8. Customer sees driver info and location
9. Real-time driver tracking starts

**Driver Pickup:**
1. Driver navigates to pickup location
2. Customer sees driver approaching
3. Driver arrives and customer boards
4. Trip status: ONGOING
5. Driver status: ON_TRIP
6. Real-time tracking continues

**During Trip:**
1. Route displayed on customer's map
2. ETA shown
3. Driver can be contacted
4. Manager can monitor (if needed)

**Trip Completion:**
1. Driver reaches destination
2. Meter/trip ends
3. Fare calculated and displayed
4. Customer confirms completion
5. Booking status: COMPLETED
6. Driver status: AVAILABLE
7. Payment processed (auto or manual)
8. Invoice sent

**Rating & Review:**
1. Customer rates driver
2. Rates overall service
3. Writes optional review
4. Driver rating updated
5. Booking status: CLOSED

**Status Flow:**
```
Booking: PENDING → ASSIGNED → ONGOING → COMPLETED → CLOSED
Driver: AVAILABLE → ASSIGNED → ON_TRIP → AVAILABLE
```

---

### 4.4 USED VEHICLE PURCHASE

**Browsing & Inquiry:**
1. Customer browses used car inventory
2. Views car details, images, specifications
3. Sees price and condition report
4. Interested in specific car
5. Clicks "Send Inquiry"
6. Fills inquiry form with contact details
7. Submits inquiry
8. Inquiry status: PENDING

**Manager Notification:**
1. Manager receives inquiry notification
2. Views customer inquiry
3. Customer details retrieved

**Response & Follow-up:**
1. Manager sends response to inquiry
2. Offers test drive
3. Provides additional information
4. Inquiry status: IN_PROGRESS
5. Customer receives response

**Test Drive (if requested):**
1. Schedule test drive date and time
2. Customer comes to location
3. Manager provides vehicle for test drive
4. Customer drives vehicle
5. Collects feedback

**Sales Discussion:**
1. If interested: Manager discusses pricing
2. Negotiation (if applicable)
3. Final price agreed
4. Inquiry status: NEGOTIATION
5. Payment terms discussed

**Documents & Finalization:**
1. Vehicle registration documents prepared
2. Insurance documents prepared
3. Transfer of ownership initiated
4. Final payment confirmed
5. Inquiry status: SOLD
6. Sale status: COMPLETED

**Payment Processing:**
1. Payment method selected
2. Amount confirmed
3. Payment processed
4. Invoice generated
5. Receipt sent

**Delivery/Handover:**
1. Keys handed over
2. Documents transferred
3. Inspection completed by customer
4. Test drive completed
5. Documents signed
6. Vehicle handed over
7. Sale status: HANDOVER_COMPLETE

**Status Flow:**
```
Inquiry: PENDING → IN_PROGRESS → NEGOTIATION → SOLD → CLOSED
Vehicle: AVAILABLE → RESERVED → SOLD → REMOVED
```

---

## KEY STATUS DEFINITIONS

### Booking Status
- **PENDING:** Awaiting manager approval
- **APPROVED:** Manager approved, ready for assignment
- **ASSIGNED:** Driver or car assigned
- **ONGOING:** Trip/rental active
- **COMPLETED:** Trip/rental finished, awaiting payment/review
- **CLOSED:** Final review given, booking archived
- **CANCELLED:** Booking cancelled, refund processed

### Car Status
- **AVAILABLE:** Ready for booking
- **RESERVED:** Booked but rental not started
- **RENTED:** Currently with customer
- **MAINTENANCE:** Under maintenance, unavailable
- **DAMAGED:** Damaged, awaiting repair
- **INACTIVE:** Removed from service

### Driver Status
- **AVAILABLE:** Ready for assignment
- **ASSIGNED:** Assigned to booking, awaiting trip start
- **ON_TRIP:** Currently with customer
- **OFF_DUTY:** Offline, unavailable
- **ON_BREAK:** Break time
- **MAINTENANCE:** Under vehicle maintenance

### Payment Status
- **PENDING:** Awaiting payment
- **PROCESSING:** Payment in process
- **PAID:** Successfully paid
- **FAILED:** Payment failed
- **REFUNDED:** Refund processed
- **PARTIAL:** Partially paid (if installments)

### Document Status
- **PENDING:** Uploaded, awaiting verification
- **VERIFIED:** Document verified
- **REJECTED:** Document rejected, reupload needed
- **EXPIRED:** Document expired
- **EXPIRED_SOON:** Document expiring soon

---

## DATABASE MODELS REQUIRED

### User Model (Extended)
- id, email, password, first_name, last_name
- phone_number, date_of_birth, address, city, country
- profile_picture, role (customer, manager, admin, driver)
- is_active, created_at, updated_at

### Car Model
- id, registration_number, model, brand, year, color
- capacity, fuel_type, rental_price_per_day
- status, location, images, acquired_date
- total_km, last_maintenance_date, created_at, updated_at

### Booking Model
- id, customer_id, car_id, driver_id
- booking_type (rental_with_driver, rental_without_driver, taxi, used_car_inquiry)
- pickup_location, dropoff_location
- pickup_datetime, dropoff_datetime, estimated_duration
- vehicle_status, payment_status, booking_status
- special_requests, total_amount, created_at, updated_at

### Trip Model
- id, booking_id, driver_id, customer_id
- start_location, end_location, start_time, end_time
- distance_traveled, duration, start_fuel, end_fuel
- vehicle_condition_before, vehicle_condition_after
- created_at, updated_at

### Payment Model
- id, booking_id, amount, payment_method
- payment_gateway_id, payment_status
- transaction_date, created_at, updated_at

### Invoice Model
- id, booking_id, customer_id, invoice_number
- subtotal, tax, discount, total_amount
- payment_status, generated_at, created_at, updated_at

### Driver Model
- id, user_id, license_number, license_expiry
- experience_years, total_trips, average_rating
- assigned_vehicle_id, status, is_verified
- created_at, updated_at

### Document Model
- id, user_id, document_type (license, id_proof, address_proof)
- file_path, verified_status, expiry_date
- uploaded_at, verified_at, created_at, updated_at

### ReviewRating Model
- id, booking_id, reviewer_id (customer or admin), reviewed_id (driver or vehicle)
- rating (1-5), review_text, review_type (driver, vehicle, overall)
- created_at, updated_at

### Inquiry Model (Used Cars)
- id, user_id, car_id, inquiry_type
- customer_name, customer_email, customer_phone
- inquiry_status, notes, created_at, updated_at

### Complaint Model
- id, user_id, complaint_category, complaint_text
- status, priority, assigned_to, resolution_notes
- created_at, updated_at, resolved_at

### MaintenanceLog Model
- id, car_id, maintenance_type, cost
- scheduled_date, completed_date, notes
- created_at, updated_at

---

## IMPLEMENTATION PRIORITY

**Phase 1 - Core Features:**
- User authentication and role management
- Home page and basic navigation
- Customer booking interface
- Booking approval workflow
- Payment integration
- Invoice generation

**Phase 2 - Dashboard Features:**
- Admin dashboard with basic analytics
- Manager dashboard with booking management
- Customer dashboard with booking history
- Status tracking

**Phase 3 - Advanced Features:**
- Real-time trip monitoring
- Driver assignment
- Document verification
- Rating and reviews
- Reporting and analytics

**Phase 4 - Optimization:**
- Performance optimization
- Enhanced analytics
- Mobile app considerations
- Additional integrations

---

End of Specification Document
