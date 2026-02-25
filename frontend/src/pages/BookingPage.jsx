import React, { useState, useEffect } from "react";
import "./BookingPage.css";
import { bookingAPI, getToken } from "../utils/api";
import RazorpayPayment from "../components/RazorpayPayment";

const BookingPage = ({ carType, onBack, onBookingSubmit }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [drivingLoading, setDriversLoading] = useState(false);
  const [booking, setBooking] = useState(null);
  const [showBillDetails, setShowBillDetails] = useState(false);
  const [showRazorpay, setShowRazorpay] = useState(false);
  const [formData, setFormData] = useState({
    numberOfDays: 1,
    driverOption: "with-driver",
    selectedDriver: null,
    pickupLocation: "",
    dropoffLocation: "",
    pickupDate: "",
    pickupTime: "",
    email: "",
    phone: "",
    agreeToTerms: false,

  });

  const [errors, setErrors] = useState({});

  // Fetch available drivers when needed
  const fetchAvailableDrivers = async () => {
    if (!formData.pickupDate || !formData.numberOfDays) {
      alert("Please enter pickup date and number of days first");
      setStep(1);
      return;
    }

    setDriversLoading(true);
    try {
      const token = getToken();
      const response = await fetch(
        `http://localhost:8000/api/bookings/available_drivers/?pickup_date=${formData.pickupDate}&number_of_days=${formData.numberOfDays}`,
        {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch drivers');
      const data = await response.json();
      setAvailableDrivers(data.data || []);

      if (data.data.length === 0) {
        alert('⚠️ No drivers available for the selected date. Please choose a different date.');
        setStep(1);
      }
    } catch (error) {
      console.error('Error fetching drivers:', error);
      alert('Failed to fetch available drivers');
      setStep(1);
    } finally {
      setDriversLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateStep = () => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.pickupLocation.trim()) newErrors.pickupLocation = "Pickup location is required";
      if (!formData.dropoffLocation.trim()) newErrors.dropoffLocation = "Dropoff location is required";
      if (!formData.pickupDate) newErrors.pickupDate = "Pickup date is required";
      if (!formData.pickupTime) newErrors.pickupTime = "Pickup time is required";
      if (formData.numberOfDays < 1) newErrors.numberOfDays = "Number of days must be at least 1";
    }

    if (step === 1.5) {
      // Driver selection step - Optional, manager will assign
      // No validation needed - manager assigns driver after booking
    }

    if (step === 2) {
      if (!formData.email.trim()) newErrors.email = "Email is required";
      if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
      if (!formData.agreeToTerms) newErrors.agreeToTerms = "You must agree to the terms";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep()) {
      if (step === 1 && (carType === "premium" || formData.driverOption === "with-driver")) {
        // Go to driver selection step
        fetchAvailableDrivers();
        setStep(1.5);
      } else {
        setStep(step + 1);
      }
    }
  };

  const handlePrevStep = () => {
    if (step === 1.5) {
      setStep(1);
      setAvailableDrivers([]);
    } else {
      setStep(step - 1);
    }
  };

  const handleDriverSelect = (driver) => {
    setFormData((prev) => ({
      ...prev,
      selectedDriver: driver,
    }));
    setErrors((prev) => ({
      ...prev,
      selectedDriver: "",
    }));
  };

  const handleSubmit = async () => {
    if (validateStep()) {
      setLoading(true);

      const bookingData = {
        booking_type: carType,
        number_of_days: parseInt(formData.numberOfDays),
        driver_option: carType === "premium" ? "with-driver" : formData.driverOption,
        // Note: assigned_driver is NOT sent here - manager assigns it later from dashboard
        pickup_location: formData.pickupLocation,
        dropoff_location: formData.dropoffLocation,
        pickup_date: formData.pickupDate,
        pickup_time: formData.pickupTime,
        phone: formData.phone,
        agree_to_terms: formData.agreeToTerms,
        total_amount: calculatePrice(),
        payment_method: "online-payment",
      };

      try {
        const token = getToken();
        const response = await bookingAPI.createBooking(bookingData, token);
        
        // Store booking and show payment modal
        setBooking(response.data);
        setShowRazorpay(true);
      } catch (error) {
        console.error("Error:", error);
        const errorMessage = error.message || error.errors?.detail || "Unknown error";
        alert("Booking failed: " + errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  const calculatePrice = () => {
    let basePrice = 0;
    let driverCost = 0;

    if (carType === "premium") {
      basePrice = 5000; // Per day in local currency
      driverCost = formData.driverOption === "with-driver" ? 500 : 0;
    } else if (carType === "local") {
      basePrice = 1500; // Per day
      driverCost = formData.driverOption === "with-driver" ? 300 : 0;
    } else if (carType === "taxi") {
      basePrice = 100; // Per km or flat rate
      return basePrice;
    }

    return (basePrice + driverCost) * formData.numberOfDays;
  };

  return (
    <div className="booking-page">
      <div className="booking-container">
        <div className="booking-header">
          <button className="back-btn" onClick={onBack}>
            ← Back
          </button>
          <h1>Complete Your {carType === "premium" ? "Premium" : carType === "local" ? "Local" : "Taxi"} Booking</h1>
          <div className="step-indicator">
            <div className={`step ${step >= 1 ? "active" : ""}`}>1. Details</div>
            {(carType === "premium" || formData.driverOption === "with-driver") && (
              <div className={`step ${step >= 1.5 ? "active" : ""}`}>1.5 Driver</div>
            )}
            <div className={`step ${step >= 2 ? "active" : ""}`}>2. Personal Info</div>
            <div className={`step ${step >= 3 ? "active" : ""}`}>3. Confirmation</div>
          </div>
        </div>

        <div className="booking-content">
          {/* Step 1: Booking Details */}
          {step === 1 && (
            <div className="form-section">
              <h2>📍 Booking Details</h2>

              {/* Number of Days */}
              <div className="form-group">
                <label>Number of Days</label>
                <input
                  type="number"
                  name="numberOfDays"
                  min="1"
                  max="30"
                  value={formData.numberOfDays}
                  onChange={handleInputChange}
                  placeholder="Enter number of days"
                />
                {errors.numberOfDays && <span className="error">{errors.numberOfDays}</span>}
              </div>

              {/* Driver Option - Only for local cars (Premium and Taxi are always with driver) */}
              {carType !== "premium" && carType !== "taxi" && (
                <div className="form-group">
                  <label>Driver Service</label>
                  <div className="radio-group">
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="driverOption"
                        value="with-driver"
                        checked={formData.driverOption === "with-driver"}
                        onChange={handleInputChange}
                      />
                      <span>With Driver (+₹300/day) - Manager Assigned</span>
                    </label>
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="driverOption"
                        value="without-driver"
                        checked={formData.driverOption === "without-driver"}
                        onChange={handleInputChange}
                      />
                      <span>Self Drive</span>
                    </label>
                  </div>
                </div>
              )}

              {(carType === "premium" || carType === "taxi") && (
                <div className="info-box">
                  <p>✓ Driver-Assisted Service Only - Our professional drivers ensure your safety and comfort</p>
                </div>
              )}

              {/* Pickup Location */}
              <div className="form-group">
                <label>Pickup Location</label>
                <input
                  type="text"
                  name="pickupLocation"
                  value={formData.pickupLocation}
                  onChange={handleInputChange}
                  placeholder="Enter pickup location"
                />
                {errors.pickupLocation && <span className="error">{errors.pickupLocation}</span>}
              </div>

              {/* Dropoff Location */}
              <div className="form-group">
                <label>Dropoff Location</label>
                <input
                  type="text"
                  name="dropoffLocation"
                  value={formData.dropoffLocation}
                  onChange={handleInputChange}
                  placeholder="Enter dropoff location"
                />
                {errors.dropoffLocation && <span className="error">{errors.dropoffLocation}</span>}
              </div>

              {/* Pickup Date */}
              <div className="form-group">
                <label>Pickup Date</label>
                <input
                  type="date"
                  name="pickupDate"
                  value={formData.pickupDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split("T")[0]}
                />
                {errors.pickupDate && <span className="error">{errors.pickupDate}</span>}
              </div>

              {/* Pickup Time */}
              <div className="form-group">
                <label>Pickup Time</label>
                <input
                  type="time"
                  name="pickupTime"
                  value={formData.pickupTime}
                  onChange={handleInputChange}
                />
                {errors.pickupTime && <span className="error">{errors.pickupTime}</span>}
              </div>

              <div className="price-summary">
                <h3>Price Estimate</h3>
                <div className="price-breakdown">
                  <div className="price-row">
                    <span>Base Price ({formData.numberOfDays} day{formData.numberOfDays > 1 ? "s" : ""})</span>
                    <span>₹{carType === "premium" ? 5000 * formData.numberOfDays : carType === "local" ? 1500 * formData.numberOfDays : 100}</span>
                  </div>
                  {formData.driverOption === "with-driver" && carType !== "premium" && (
                    <div className="price-row">
                      <span>Driver Service</span>
                      <span>₹{carType === "local" ? 300 * formData.numberOfDays : 500 * formData.numberOfDays}</span>
                    </div>
                  )}
                  {carType === "premium" && formData.driverOption === "with-driver" && (
                    <div className="price-row">
                      <span>Professional Driver Service</span>
                      <span>₹{500 * formData.numberOfDays}</span>
                    </div>
                  )}
                  <div className="price-row total">
                    <span>Total Amount</span>
                    <span>₹{calculatePrice()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 1.5: Driver Selection */}
          {step === 1.5 && (
            <div className="form-section">
              <h2>👨‍💼 Driver Assignment</h2>
              
              <div className="notification-box pending-driver">
                <div className="notification-header">
                  <span className="notification-icon">📋</span>
                  <h3>Driver Will Be Arranged by Manager</h3>
                </div>
                <p>Your driver details will be provided by our manager within the next 24 hours. You'll receive a notification with the driver's contact information, vehicle details, and trip summary.</p>
                <div className="notification-details">
                  <span>✓ Verified and experienced drivers</span>
                  <span>✓ Real-time updates via notification</span>
                  <span>✓ Direct contact before pickup</span>
                </div>
              </div>
              
              {drivingLoading ? (
                <div className="loading-container">
                  <p>🔄 Fetching available drivers...</p>
                </div>
              ) : availableDrivers.length === 0 ? (
                <div className="error-box">
                  <p>❌ No drivers available for the selected date.</p>
                  <button onClick={() => setStep(1)} className="btn-primary">Go Back to Change Date</button>
                </div>
              ) : (
                <div className="drivers-grid">
                  {availableDrivers.map((driver) => (
                    <div
                      key={driver.id}
                      className={`driver-card ${formData.selectedDriver?.id === driver.id ? "selected" : ""}`}
                      onClick={() => handleDriverSelect(driver)}
                    >
                      <div className="driver-header">
                        <h3>{driver.user_name}</h3>
                        <div className="driver-rating">
                          <span className="stars">{'⭐'.repeat(Math.round(driver.average_rating))}</span>
                          <span className="rating-text">{driver.average_rating}/5</span>
                        </div>
                      </div>
                      <div className="driver-details">
                        <p><strong>License:</strong> {driver.license_number}</p>
                        <p><strong>Experience:</strong> {driver.experience_years} years</p>
                        <p><strong>Total Trips:</strong> {driver.total_trips}</p>
                        <p><strong>Status:</strong> <span className="status-badge">{driver.status}</span></p>
                      </div>
                      <div className="driver-actions">
                        <button
                          className={`btn-select ${formData.selectedDriver?.id === driver.id ? "selected" : ""}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDriverSelect(driver);
                          }}
                        >
                          {formData.selectedDriver?.id === driver.id ? "✓ Selected" : "Select"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {errors.selectedDriver && <span className="error">{errors.selectedDriver}</span>}
            </div>
          )}

          {/* Step 2: Personal Information & Agreement */}
          {step === 2 && (
            <div className="form-section">
              <h2>👤 Your Information</h2>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                />
                {errors.email && <span className="error">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+91 XXXXX XXXXX"
                />
                {errors.phone && <span className="error">{errors.phone}</span>}
              </div>

              {/* Agreement Section */}
              <div className="agreement-box">
                <h3>⚖️ Terms & Agreement</h3>
                <div className="agreement-content">
                  <h4>Important Notice:</h4>
                  <ul>
                    <li>
                      <strong>Fuel Expenses:</strong> The user is responsible for all fuel expenses. The vehicle must be returned with the same fuel level as at pickup.
                    </li>
                    <li>
                      <strong>Accident & Maintenance:</strong> In case of any accident, damage, or maintenance issues, the user will bear all expenses. This includes repairs, replacements, and related costs.
                    </li>
                    <li>
                      <strong>Vehicle Condition:</strong> User acknowledges receiving the vehicle in good condition and agrees to maintain it accordingly.
                    </li>
                    <li>
                      <strong>Insurance:</strong> Basic insurance is covered by the company. However, any additional damage beyond normal wear and tear will be charged to the user.
                    </li>
                    <li>
                      <strong>Traffic Violations:</strong> User is responsible for all traffic violations, parking fines, and toll charges incurred during the rental period.
                    </li>
                    <li>
                      <strong>Late Return:</strong> Late return charges at ₹500 per hour will be applicable.
                    </li>
                  </ul>
                </div>

                <label className="agreement-checkbox">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleInputChange}
                  />
                  <span>I agree to all the above terms and conditions</span>
                </label>
                {errors.agreeToTerms && <span className="error">{errors.agreeToTerms}</span>}
              </div>
            </div>
          )}

          {/* Step 3: Confirmation & Payment */}
          {step === 3 && (
            <div className="form-section">
              <h2>✅ Booking Summary</h2>

              <div className="summary-box">
                <div className="summary-item">
                  <span className="label">Booking Type:</span>
                  <span className="value">{carType === "premium" ? "Premium Car" : carType === "local" ? "Local Car" : "Taxi"}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Number of Days:</span>
                  <span className="value">{formData.numberOfDays}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Driver Service:</span>
                  <span className="value">{formData.driverOption === "with-driver" ? "With Driver" : "Self Drive"}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Pickup:</span>
                  <span className="value">{formData.pickupLocation}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Dropoff:</span>
                  <span className="value">{formData.dropoffLocation}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Date & Time:</span>
                  <span className="value">{formData.pickupDate} at {formData.pickupTime}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Contact:</span>
                  <span className="value">{formData.email}</span>
                </div>
                <div className="summary-item total">
                  <span className="label">Total Amount:</span>
                  <span className="value">₹{calculatePrice()}</span>
                </div>
              </div>

              <div className="confirmation-message">
                <p>🎉 Your booking is ready to be confirmed!</p>
                <p>You will receive a confirmation email shortly with all booking details.</p>
              </div>
            </div>
          )}
        </div>

        {/* Bill Details Modal */}
        {showBillDetails && booking && (
          <div className="modal-overlay">
            <div className="modal-content bill-modal">
              <button className="modal-close" onClick={() => {
                setShowBillDetails(false);
                onBookingSubmit(booking);
              }}>×</button>
              <div className="bill-content">
                <div className="bill-header">
                  <h2>✅ Payment Successful!</h2>
                  <p className="bill-subtitle">Your booking has been confirmed</p>
                </div>
                <div className="bill-details">
                  <div className="bill-section">
                    <h3>📋 Booking Details</h3>
                    <div className="bill-row">
                      <span>Booking ID:</span>
                      <span className="bill-value">#{booking.id}</span>
                    </div>
                    <div className="bill-row">
                      <span>Service Type:</span>
                      <span className="bill-value">{booking.booking_type === "premium" ? "Premium Car" : booking.booking_type === "local" ? "Local Car" : "Taxi"}</span>
                    </div>
                    <div className="bill-row">
                      <span>Pickup Location:</span>
                      <span className="bill-value">{booking.pickup_location}</span>
                    </div>
                    <div className="bill-row">
                      <span>Dropoff Location:</span>
                      <span className="bill-value">{booking.dropoff_location}</span>
                    </div>
                    <div className="bill-row">
                      <span>Date & Time:</span>
                      <span className="bill-value">{new Date(booking.pickup_date).toLocaleDateString()} at {booking.pickup_time}</span>
                    </div>
                    <div className="bill-row">
                      <span>Duration:</span>
                      <span className="bill-value">{booking.number_of_days} day(s)</span>
                    </div>
                  </div>
                  <div className="bill-section">
                    <h3>💰 Payment Summary</h3>
                    <div className="bill-row">
                      <span>Amount Paid:</span>
                      <span className="bill-value amount">₹{parseFloat(booking.total_amount).toFixed(2)}</span>
                    </div>
                    <div className="bill-row">
                      <span>Status:</span>
                      <span className="bill-value status-confirmed">✓ Confirmed</span>
                    </div>
                  </div>
                  <div className="bill-section">
                    <h3>📞 Contact Information</h3>
                    <div className="bill-row">
                      <span>Phone:</span>
                      <span className="bill-value">{booking.phone}</span>
                    </div>
                  </div>
                </div>
                <div className="bill-message">
                  <p>🎉 Your booking is confirmed! You will receive a confirmation email shortly.</p>
                  <p>Driver details will be provided within 24 hours.</p>
                </div>
                <button
                  className="btn-primary bill-action"
                  onClick={() => {
                    setShowBillDetails(false);
                    onBookingSubmit(booking);
                  }}
                >
                  ← Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Razorpay Payment Modal */}
        {showRazorpay && booking && (
          <div className="modal-overlay">
            <div className="modal-content payment-modal">
              <button 
                className="modal-close" 
                onClick={() => {
                  setShowRazorpay(false);
                  // Don't go back - payment was initiated
                }}
              >
                ×
              </button>
              <RazorpayPayment
                bookingId={booking.id}
                amount={booking.total_amount}
                onPaymentSuccess={() => {
                  setShowRazorpay(false);
                  setShowBillDetails(true);
                }}
                onPaymentFailed={(error) => {
                  console.error('Payment failed:', error);
                  setShowRazorpay(false);
                  alert('Payment failed. Please try again.');
                }}
              />
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="booking-actions">
          {step > 1 && (
            <button className="btn-secondary" onClick={handlePrevStep} disabled={loading || drivingLoading}>
              ← Previous
            </button>
          )}
          {step < 3 && step !== 1.5 && (
            <button className="btn-primary" onClick={handleNextStep} disabled={loading || drivingLoading}>
              Next →
            </button>
          )}
          {step === 1.5 && (
            <button className="btn-primary" onClick={handleNextStep} disabled={loading || drivingLoading || !formData.selectedDriver}>
              Next → (Driver Selected)
            </button>
          )}
          {step === 3 && (
            <button className="btn-success" onClick={handleSubmit} disabled={loading || drivingLoading}>
              💳 Proceed to Razorpay Payment
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
