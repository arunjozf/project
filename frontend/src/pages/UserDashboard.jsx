import React, { useState, useEffect } from "react";
import "./UserDashboard.css";
import "../styles/Home.css"; // Import Home styles
import { bookingAPI, carsAPI, getToken } from "../utils/api";
import { saveDashboardState, loadDashboardState } from "../utils/persistentState";
import UsedCarsPage from "./UsedCarsPage";
import PaymentPage from "./PaymentPage";
import RazorpayPayment from "../components/RazorpayPayment";
import DemoCheckout from "../components/DemoCheckout";

const UserDashboard = ({ user, onLogout }) => {
  // Safety check for user prop
  if (!user) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Error: User not found</h2>
        <p>Please log in again</p>
        <button onClick={onLogout} style={{ padding: '10px 20px', cursor: 'pointer' }}>
          Back to Login
        </button>
      </div>
    );
  }

  // No need for useNavigate - App.jsx handles role-based routing
  
  // Try to restore previous state on mount
  const savedState = loadDashboardState('user');
  
  const [activeTab, setActiveTab] = useState(savedState?.activeTab || "intro");
  const [bookings, setBookings] = useState(savedState?.bookings || []);
  const [listings, setListings] = useState(savedState?.listings || []); // State for car listings
  const [availableCars, setAvailableCars] = useState(savedState?.availableCars || []); // Manager/Admin added cars
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [alert, setAlert] = useState({ show: false, message: "", type: "success" });
  const [paymentPageData, setPaymentPageData] = useState(null); // Payment redirect data

  const [newBooking, setNewBooking] = useState({
    booking_type: "premium",
    pickup_location: "",
    dropoff_location: "",
    pickup_date: "",
    pickup_time: "",
    number_of_days: "1",
    driver_option: "with-driver",
    selected_driver_id: null,
    phone: "",
    agree_to_terms: false,
    payment_method: "credit-card",
  });

  const [showBookingForm, setShowBookingForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [paymentBooking, setPaymentBooking] = useState(null); // booking specifically for payment flow
  const [selectedTaxiType, setSelectedTaxiType] = useState(null); // Selected taxi type for booking
  const [selectedCar, setSelectedCar] = useState(null); // Selected car for booking
  const [customers, setCustomers] = useState([]); // Customers list
  const [customersLoading, setCustomersLoading] = useState(false);

  // Driver selection states
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [loadingDrivers, setLoadingDrivers] = useState(false);

  // Taxi service types
  const taxiServices = [
    {
      id: 1,
      name: "Economy Taxi",
      description: "Budget-friendly option for daily commutes",
      type: "Economy",
      price: "₹170/km",
      image: "/images/eco_taxi.jpg",
      specs: ["⚡ Instant Pickup", "👥 4 Seats", "🛡️ Safe & Verified Drivers"],
    },
    {
      id: 2,
      name: "Comfort Taxi",
      description: "Comfortable ride with premium features",
      type: "Comfort",
      price: "₹300/km",
      image: "/images/comfort-taxi.jpg",
      specs: ["⚡ Quick Response", "👥 5 Seats", "📱 Real-time Tracking"],
    },
    {
      id: 3,
      name: "Premium Taxi",
      description: "Luxury ride with professional drivers",
      type: "Premium",
      price: "₹425/km",
      image: "/images/premium-taxi.jpg",
      specs: ["⚡ Priority Booking", "👥 5 Seats", "🎵 Premium Music System"],
    },
    {
      id: 4,
      name: "XL Taxi",
      description: "Spacious ride for groups and families",
      type: "XL",
      price: "₹510/km",
      image: "/images/xl-taxi.jpg",
      specs: ["⚡ Group Friendly", "👥 7 Seats", "🧳 Large Luggage Space"],
    },
    {
      id: 5,
      name: "Executive Cab",
      description: "High-end luxury for business travel",
      type: "Executive",
      price: "₹680/km",
      image: "/images/executive-cab.jpg",
      specs: ["⚡ VIP Service", "👥 5 Seats", "💼 Complimentary WiFi"],
    },
    {
      id: 6,
      name: "Airport Transfer",
      description: "Reliable service for airport trips",
      type: "Airport",
      price: "₹3,400 Flat Rate",
      image: "/images/airport-transfer.jpg",
      specs: ["⚡ Fixed Pricing", "👥 4-7 Seats", "✈️ 24/7 Available"],
    },
  ];

  // Fleet cars (same as homepage)
  const fleetCars = [
    {
      id: 1,
      name: "Tesla Model S",
      type: "Electric Luxury Sedan",
      price: "₹299/day",
      image: "/images/tesla.jpg",
      features: ["0-60 in 2.5s", "Electric", "Autopilot"],
    },
    {
      id: 2,
      name: "BMW X7",
      type: "Premium SUV",
      price: "₹249/day",
      image: "/images/Bmwx7.jpg",
      features: ["7 Seater", "AWD", "Leather Interior"],
    },
    {
      id: 3,
      name: "Porsche 911",
      type: "Sports Car",
      price: "₹399/day",
      image: "/images/porsche.jpg",
      features: ["V8 Engine", "0-60 in 3.8s", "Premium Sound"],
    },
    {
      id: 4,
      name: "Mercedes Benz E-Class",
      type: "Luxury Sedan",
      price: "₹279/day",
      image: "/images/mercedes.jpg",
      features: ["AIRMATIC Suspension", "Touchpad", "9-Speed"],
    },
    {
      id: 5,
      name: "Range Rover",
      type: "Luxury SUV",
      price: "₹329/day",
      image: "/images/range-rover.jpg",
      features: ["All-Terrain", "Panoramic Roof", "Premium Package"],
    },
    {
      id: 6,
      name: "Audi A8",
      type: "Executive Sedan",
      price: "₹289/day",
      image: "/images/audi.jpg",
      features: ["Quad-Zone Climate", "Bang & Olufsen", "Matrix LED"],
    },
    {
      id: 7,
      name: "Lamborghini Huracán",
      type: "Supercar",
      price: "₹599/day",
      image: "/images/lamborghini.jpg",
      features: ["0-60 in 2.6s", "V10 Engine", "Top Speed 221 mph"],
    },
    {
      id: 8,
      name: "Rolls Royce Phantom",
      type: "Ultra-Luxury Sedan",
      price: "₹799/day",
      image: "/images/rolls-royce.jpg",
      features: ["Bespoke Interior", "Starlight Ceiling", "Premium Chauffeur"],
    },
  ];

  // Local cars (same as homepage)
  const localCars = [
    {
      id: 1,
      name: "Maruti Swift",
      description: "Compact and fuel-efficient sedan",
      type: "Budget",
      price: "₹49/day",
      image: "/images/swift.jpg",
      features: ["Manual/Auto", "5 Seats"],
    },
    {
      id: 2,
      name: "Maruti Wagon R",
      description: "Spacious hatchback for families",
      type: "Budget",
      price: "₹59/day",
      image: "/images/wagon-r.jpg",
      features: ["Manual/Auto", "5 Seats"],
    },
    {
      id: 3,
      name: "Maruti Alto",
      description: "Ultra-compact city car",
      type: "Economy",
      price: "₹39/day",
      image: "/images/alto.jpg",
      features: ["Manual", "4 Seats"],
    },
    {
      id: 4,
      name: "Hyundai i20",
      description: "Modern economy hatchback",
      type: "Budget",
      price: "₹45/day",
      image: "/images/i10.jpg",
      features: ["Manual/Auto", "5 Seats"],
    },
    {
      id: 5,
      name: "Tata Nexon",
      description: "Affordable compact SUV",
      type: "Compact SUV",
      price: "₹69/day",
      image: "/images/tata-nexon.jpg",
      features: ["Manual/Auto", "5 Seats"],
    },
    {
      id: 6,
      name: "Hyundai Creta",
      description: "Stylish compact SUV with features",
      type: "Compact SUV",
      price: "₹79/day",
      image: "/images/creta.jpg",
      features: ["Manual/Auto", "5 Seats"],
    },
    {
      id: 7,
      name: "Toyota Innova Crysta",
      description: "Spacious 7-seater family SUV",
      type: "Family SUV",
      price: "₹99/day",
      image: "/images/innova.jpg",
      features: ["Manual/Auto", "7 Seats"],
    },
    {
      id: 8,
      name: "Ertiga",
      description: "Premium 7-seater MPV for families",
      type: "Family MPV",
      price: "₹109/day",
      image: "/images/ertiga.jpg",
      features: ["Manual/Auto", "7 Seats"],
    },
  ];

  // Fetch bookings on component mount
  useEffect(() => {
    fetchBookings();
  }, []);

  // Auto-hide alerts after 5 seconds
  useEffect(() => {
    if (alert.show) {
      const timer = setTimeout(() => {
        setAlert({ ...alert, show: false });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  // Debug: Log activeTab changes
  useEffect(() => {
    console.log('[UserDashboard] activeTab changed to:', activeTab);
    // Fetch customers when activities tab is opened
    if (activeTab === 'activities') {
      fetchCustomers();
    }
  }, [activeTab]);

  // Fetch available drivers when user selects "with-driver" option and pickup date
  useEffect(() => {
    const fetchAvailableDrivers = async () => {
      if (newBooking.driver_option === "with-driver" && newBooking.pickup_date) {
        try {
          setLoadingDrivers(true);
          const token = getToken();
          
          // Calculate number of days for the query
          const numberOfDays = parseInt(newBooking.number_of_days) || 1;
          
          // Fetch available drivers for the booking dates
          const response = await fetch(
            `http://localhost:8000/api/bookings/available_drivers/?pickup_date=${newBooking.pickup_date}&number_of_days=${numberOfDays}`,
            {
              method: 'GET',
              headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json',
              }
            }
          );

          if (response.ok) {
            const data = await response.json();
            const drivers = data.data || [];
            
            // Validate driver objects have required fields
            const validDrivers = drivers.filter(driver => driver && driver.id);
            setAvailableDrivers(validDrivers);
            console.log('[UserDashboard] Available drivers loaded:', validDrivers.length);
          } else {
            console.log('[UserDashboard] Error response:', response.status);
            setAvailableDrivers([]);
          }
        } catch (error) {
          console.error('[UserDashboard] Error fetching drivers:', error);
          setAvailableDrivers([]);
        } finally {
          setLoadingDrivers(false);
        }
      } else {
        setAvailableDrivers([]);
        setNewBooking(prev => ({ ...prev, selected_driver_id: null }));
      }
    };

    fetchAvailableDrivers();
  }, [newBooking.driver_option, newBooking.pickup_date, newBooking.number_of_days]);

  // Set booking_type to 'taxi' when user selects a taxi service
  useEffect(() => {
    if (selectedTaxiType) {
      setNewBooking(prev => ({
        ...prev,
        booking_type: "taxi",
        driver_option: "with-driver" // For taxi, driver is assigned by manager
      }));
    }
  }, [selectedTaxiType]);

  const showAlert = (message, type = "success") => {
    setAlert({ show: true, message, type });
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      // Fetch bookings (available for all users)
      const bookingsRes = await bookingAPI.getUserBookings(token).catch(err => ({}));
      const bookingsData = bookingsRes.data || [];
      setBookings(bookingsData);

      // Only fetch listings if user is a manager
      let listingsData = [];
      if (user?.role === 'manager' || user?.role === 'admin') {
        try {
          const res = await carsAPI.getMyListings(token).catch(err => ({}));
          listingsData = res ? (Array.isArray(res) ? res : (res.results || [])) : [];
        } catch (err) {
          console.log('[UserDashboard] Skipping listings fetch (not manager)');
        }
      }
      setListings(listingsData);

      // Fetch all available cars from database (added by managers/admins)
      let availableCarsData = [];
      try {
        const carsResponse = await fetch('http://localhost:8000/api/cars/?search=&ordering=-created_at', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (carsResponse.ok) {
          const carsData = await carsResponse.json();
          console.log('[UserDashboard] Cars loaded:', carsData);
          // Handle both array and paginated response
          availableCarsData = Array.isArray(carsData) ? carsData : (carsData.results || []);
          setAvailableCars(availableCarsData);
        }
      } catch (carsErr) {
        console.error('Error fetching cars:', carsErr);
        setAvailableCars([]);
      }

      // Save state to localStorage for persistence
      const stateToSave = {
        activeTab: "activities",
        bookings: bookingsData,
        listings: listingsData,
        availableCars: availableCarsData,
        lastFetch: Date.now()
      };
      saveDashboardState('user', stateToSave);

      setError("");
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      const errorMsg = err.message || "Failed to load data";
      setError(errorMsg);
      setBookings([]);
      setListings([]);
      setAvailableCars([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    // Only admins can fetch all customers
    if (user?.role !== 'admin') {
      console.log('[UserDashboard] Skipping customers fetch - user is not admin');
      setCustomers([]);
      return;
    }

    try {
      setCustomersLoading(true);
      const token = getToken();
      const response = await fetch('http://localhost:8000/api/bookings/admin/users/', {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const customersData = Array.isArray(data) ? data : (data.data || []);
        // Filter for customers only
        const filteredCustomers = customersData.filter(c => c.role === 'customer');
        setCustomers(filteredCustomers);
      } else {
        console.error('Failed to fetch customers:', response.status);
        setCustomers([]);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      setCustomers([]);
    } finally {
      setCustomersLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewBooking((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const calculatePrice = () => {
    let basePrice = 0;
    let driverCost = 0;
    const days = parseInt(newBooking.number_of_days) || 1;

    if (newBooking.booking_type === "premium") {
      basePrice = 5000; // Per day
      driverCost = newBooking.driver_option === "with-driver" ? 500 : 0;
    } else if (newBooking.booking_type === "local") {
      basePrice = 1500; // Per day
      driverCost = newBooking.driver_option === "with-driver" ? 300 : 0;
    } else if (newBooking.booking_type === "taxi") {
      basePrice = 100; // Per day
      return basePrice * days;
    }

    return (basePrice + driverCost) * days;
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();

    // Validation
    if (!newBooking.pickup_location.trim()) {
      showAlert("Please enter pickup location", "error");
      return;
    }
    if (!newBooking.dropoff_location.trim()) {
      showAlert("Please enter dropoff location", "error");
      return;
    }
    if (!newBooking.pickup_date) {
      showAlert("Please select pickup date", "error");
      return;
    }
    if (!newBooking.pickup_time) {
      showAlert("Please select pickup time", "error");
      return;
    }
    if (!newBooking.phone.trim()) {
      showAlert("Please enter phone number", "error");
      return;
    }
    if (!newBooking.agree_to_terms) {
      showAlert("Please agree to terms and conditions", "error");
      return;
    }
    // Only require driver selection for non-taxi bookings with driver option
    if (newBooking.booking_type !== "taxi" && newBooking.driver_option === "with-driver" && !newBooking.selected_driver_id) {
      showAlert("Please select a driver for your booking", "error");
      return;
    }

    setSubmitting(true);
    try {
      const token = getToken();
      if (!token) {
        showAlert("Authentication required", "error");
        return;
      }

      const bookingData = {
        booking_type: newBooking.booking_type,
        number_of_days: parseInt(newBooking.number_of_days),
        driver_option: newBooking.driver_option,
        selected_driver_id: newBooking.selected_driver_id ? parseInt(newBooking.selected_driver_id) : null,
        pickup_location: newBooking.pickup_location,
        dropoff_location: newBooking.dropoff_location,
        pickup_date: newBooking.pickup_date,
        pickup_time: newBooking.pickup_time,
        phone: newBooking.phone,
        agree_to_terms: newBooking.agree_to_terms,
        payment_method: newBooking.payment_method,
        total_amount: calculatePrice(),
      };

      const response = await bookingAPI.createBooking(bookingData, token);

      // Add new booking to list
      setBookings([response.data, ...bookings]);

      // Reset form
      setNewBooking({
        booking_type: "premium",
        pickup_location: "",
        dropoff_location: "",
        pickup_date: "",
        pickup_time: "",
        number_of_days: "1",
        driver_option: "with-driver",
        selected_driver_id: null,
        phone: "",
        agree_to_terms: false,
        payment_method: "credit-card",
      });

      setShowBookingForm(false);
      setSelectedTaxiType(null);
      
      // Show success alert
      showAlert("✅ Booking submitted successfully! Redirecting to payment...", "success");
      
      // Store booking for payment flow (don't use `selectedBooking` to avoid opening the details modal)
      setPaymentBooking(response.data);
      // Redirect to payment after 2 seconds
      setTimeout(() => {
        setActiveTab("payment");
      }, 2000);

    } catch (err) {
      console.error("Error submitting booking:", err);
      const errorMsg = err.message || err.errors?.detail || "Failed to submit booking";
      showAlert("❌ " + errorMsg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    try {
      const token = getToken();
      await bookingAPI.cancelBooking(bookingId, token);

      // Update local state
      setBookings(bookings.map(b =>
        b.id === bookingId ? { ...b, status: 'cancelled' } : b
      ));

      showAlert("✅ Booking cancelled successfully", "success");
    } catch (err) {
      console.error("Error cancelling booking:", err);
      showAlert("❌ Failed to cancel booking", "error");
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "#FF9800"; // Orange
      case "confirmed":
        return "#4CAF50"; // Green
      case "completed":
        return "#2196F3"; // Blue
      case "cancelled":
        return "#F44336"; // Red
      default:
        return "#9E9E9E"; // Gray
    }
  };

  const renderContent = () => {
    console.log('[RENDER] renderContent called with activeTab:', activeTab);
    switch (activeTab) {
      case "intro":
        console.log('[CASE] Matched intro case');
        return (
          <div className="intro-section">
            <div className="intro-hero">
              <h2>Welcome back, {user?.firstName || "User"}! 👋</h2>
              <p>What would you like to do today?</p>
            </div>

            <div className="service-grid">
              {/* Taxi Services */}
              <div className="service-card" onClick={() => setActiveTab("taxi")}>
                <div className="card-icon">🚕</div>
                <h3>Taxi Services</h3>
                <p>Quick and reliable taxi rides for local travel</p>
                <div className="card-arrow">→</div>
              </div>

              {/* On-Demand Taxi */}
              <div className="service-card" onClick={() => setActiveTab("ondemand")}>
                <div className="card-icon">📍</div>
                <h3>On-Demand Taxi</h3>
                <p>Instant pickups with real-time tracking</p>
                <div className="card-arrow">→</div>
              </div>

              {/* Premium Fleet */}
              <div className="service-card" onClick={() => setActiveTab("fleet")}>
                <div className="card-icon">🏎️</div>
                <h3>Premium Fleet</h3>
                <p>Luxury cars for special occasions</p>
                <div className="card-arrow">→</div>
              </div>

              {/* Used Cars */}
              <div className="service-card" onClick={() => setActiveTab("used_cars")}>
                <div className="card-icon">🚗</div>
                <h3>Used Cars</h3>
                <p>Buy or sell quality vehicles</p>
                <div className="card-arrow">→</div>
              </div>

              {/* Pending Bookings */}
              <div className="service-card pending" onClick={() => setActiveTab("pending_bookings")}>
                <div className="card-icon">⏳</div>
                <h3>Pending Bookings</h3>
                <p>Complete or manage pending bookings</p>
                {bookings.filter(b => b.status === 'pending').length > 0 && (
                  <span className="pending-badge">{bookings.filter(b => b.status === 'pending').length}</span>
                )}
                <div className="card-arrow">→</div>
              </div>

              {/* History */}
              <div className="service-card" onClick={() => setActiveTab("activities")}>
                <div className="card-icon">📋</div>
                <h3>Your History</h3>
                <p>View bookings and car listings</p>
                <div className="card-arrow">→</div>
              </div>
            </div>
          </div>
        );

      case "taxi":
        console.log('[CASE] Matched taxi case');
        return (
          <div className="content-section">
            <div className="section-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button className="new-btn" onClick={() => setActiveTab('intro')} style={{ padding: '5px 10px', fontSize: '1rem' }}>⬅ Back</button>
                <h2>Our Vehicles</h2>
              </div>
            </div>

            {!selectedCar ? (
              // Cars Grid with both Premium and Local Cars
              <div style={{
                padding: '30px 0'
              }}>
                {/* Premium Fleet Section */}
                <div style={{
                  marginBottom: '60px'
                }}>
                  <div style={{
                    textAlign: 'center',
                    padding: '35px 25px',
                    backgroundColor: '#f9f9f9',
                    borderRadius: '10px',
                    marginBottom: '40px'
                  }}>
                    <h2 style={{ margin: '0 0 12px 0', color: '#000', fontSize: '1.8rem' }}>Premium Fleet</h2>
                    <p style={{ margin: 0, fontSize: '1.05rem', color: '#000' }}>
                      Experience luxury on every journey
                    </p>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '25px',
                    marginBottom: '20px'
                  }}>
                    {/* Filter premium category cars and combine with built-in fleet */}
                    {[
                      ...fleetCars,
                      ...availableCars.filter(car => car.car_category === 'premium' || !car.car_category)
                    ].map((car, index) => (
                      <div 
                        key={`premium-${car.id}-${index}`} 
                        className="fleet-card" 
                        style={{
                          border: '1px solid #e0e0e0',
                          borderRadius: '10px',
                          overflow: 'hidden',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                          transition: 'all 0.3s ease',
                          cursor: 'pointer',
                          backgroundColor: 'white'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-8px)';
                          e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                        }}
                      >
                        <div className="fleet-image" style={{ 
                          backgroundColor: '#f5f5f5',
                          height: '200px',
                          position: 'relative',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden'
                        }}>
                          <img 
                            src={car.image_url || car.image} 
                            alt={car.name || `${car.year} ${car.make} ${car.model}`} 
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              display: 'block'
                            }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                          <div className="car-type" style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            backgroundColor: '#D40000',
                            color: 'white',
                            padding: '8px 12px',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 'bold'
                          }}>
                            {car.type || car.condition}
                          </div>
                        </div>
                        <div className="fleet-info" style={{ padding: '22px' }}>
                          <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', color: '#000', fontWeight: '600' }}>
                            {car.name || `${car.year} ${car.make} ${car.model}`}
                          </h3>
                          <p style={{ 
                            margin: '0 0 15px 0', 
                            fontSize: '0.93rem', 
                            color: '#000',
                            lineHeight: '1.4'
                          }}>
                            {car.type || car.description}
                          </p>
                          {car.features && (
                            <div className="fleet-features" style={{ marginBottom: '16px' }}>
                              {car.features.map((feature, idx) => (
                                <span key={idx} style={{ 
                                  display: 'inline-block',
                                  fontSize: '0.82rem',
                                  color: '#000',
                                  backgroundColor: '#f5f5f5',
                                  padding: '5px 10px',
                                  borderRadius: '4px',
                                  marginRight: '7px',
                                  marginBottom: '7px'
                                }}>
                                  {feature}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="fleet-footer" style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            paddingTop: '16px',
                            borderTop: '1px solid #e0e0e0'
                          }}>
                            <span className="fleet-price" style={{ 
                              fontSize: '1.25rem', 
                              fontWeight: 'bold',
                              color: '#D40000'
                            }}>
                              {car.price}
                            </span>
                            <button 
                              className="new-btn" 
                              onClick={() => setSelectedCar(car)}
                              style={{ padding: '9px 18px', fontSize: '0.9rem', fontWeight: '500' }}
                            >
                              Book Now
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Local Cars Section */}
                <div style={{ marginBottom: '30px' }}>
                  <div style={{
                    textAlign: 'center',
                    padding: '35px 25px',
                    backgroundColor: '#f9f9f9',
                    borderRadius: '10px',
                    marginBottom: '40px'
                  }}>
                    <h2 style={{ margin: '0 0 12px 0', color: '#000', fontSize: '1.8rem' }}>Affordable Local Cars</h2>
                    <p style={{ margin: 0, fontSize: '1.05rem', color: '#000' }}>
                      Budget-friendly options for daily commuting and short trips
                    </p>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '25px'
                  }}>
                    {/* Show local cars + filter affordable category cars */}
                    {[
                      ...localCars,
                      ...availableCars.filter(car => car.car_category === 'affordable')
                    ].map((car, index) => (
                      <div 
                        key={`local-${car.id}-${index}`} 
                        className="local-car-card" 
                        style={{
                          border: '1px solid #e0e0e0',
                          borderRadius: '10px',
                          overflow: 'hidden',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                          transition: 'all 0.3s ease',
                          cursor: 'pointer',
                          backgroundColor: 'white'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-8px)';
                          e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                        }}
                      >
                        <div className="car-image" style={{ 
                          backgroundColor: '#f5f5f5',
                          height: '200px',
                          position: 'relative',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden'
                        }}>
                          <img 
                            src={car.image} 
                            alt={car.name} 
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              display: 'block'
                            }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                          <div className="car-type" style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            backgroundColor: '#D40000',
                            color: 'white',
                            padding: '8px 12px',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 'bold'
                          }}>
                            {car.type}
                          </div>
                        </div>
                        <div className="car-info" style={{ padding: '22px' }}>
                          <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', color: '#000', fontWeight: '600' }}>
                            {car.name}
                          </h3>
                          <p style={{ 
                            margin: '0 0 15px 0', 
                            fontSize: '0.93rem', 
                            color: '#000',
                            lineHeight: '1.4'
                          }}>
                            {car.description}
                          </p>
                          <div className="car-features" style={{ marginBottom: '16px' }}>
                            {(car.features || []).map((feature, idx) => (
                              <span key={idx} style={{ 
                                display: 'inline-block',
                                fontSize: '0.82rem',
                                color: '#000',
                                backgroundColor: '#f5f5f5',
                                padding: '5px 10px',
                                borderRadius: '4px',
                                marginRight: '7px',
                                marginBottom: '7px'
                              }}>
                                {feature}
                              </span>
                            ))}
                          </div>
                          <div className="car-footer" style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            paddingTop: '16px',
                            borderTop: '1px solid #e0e0e0'
                          }}>
                            <span className="car-price" style={{ 
                              fontSize: '1.25rem', 
                              fontWeight: 'bold',
                              color: '#D40000'
                            }}>
                              {car.price}
                            </span>
                            <button 
                              className="new-btn" 
                              onClick={() => setSelectedCar(car)}
                              style={{ padding: '9px 18px', fontSize: '0.9rem', fontWeight: '500' }}
                            >
                              Book Now
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              // Booking Form for selected car
              <div className="booking-form-wrapper">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <button 
                    className="new-btn" 
                    onClick={() => setSelectedCar(null)}
                    style={{ padding: '5px 10px', fontSize: '1rem' }}
                  >
                    ⬅ Back to Fleet
                  </button>
                  <h3>Booking {selectedCar.name}</h3>
                </div>

                <div className="selected-car-info" style={{
                  backgroundColor: '#f9f9f9',
                  padding: '15px',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  borderLeft: '4px solid #D40000'
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                    <div>
                      <span style={{ color: '#000', fontSize: '0.9rem' }}>Car Name:</span>
                      <p style={{ margin: '5px 0 0 0', fontWeight: 'bold', fontSize: '1rem' }}>
                        {selectedCar.name}
                      </p>
                    </div>
                    <div>
                      <span style={{ color: '#000', fontSize: '0.9rem' }}>Price:</span>
                      <p style={{ margin: '5px 0 0 0', fontWeight: 'bold', fontSize: '1rem', color: '#D40000' }}>
                        {selectedCar.price}
                      </p>
                    </div>
                    <div>
                      <span style={{ color: '#000', fontSize: '0.9rem' }}>Type:</span>
                      <p style={{ margin: '5px 0 0 0', fontWeight: 'bold', fontSize: '1rem' }}>
                        {selectedCar.type}
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmitBooking} className="booking-form" style={{
                  backgroundColor: 'white',
                  padding: '20px',
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0'
                }}>
                  <h4 style={{ marginTop: 0, marginBottom: '15px', color: '#000' }}>📍 Booking Details</h4>

                  <div className="form-row" style={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '15px',
                    marginBottom: '15px'
                  }}>
                    <div className="form-group">
                      <label style={{ fontWeight: '500', marginBottom: '5px', display: 'block' }}>Number of Days</label>
                      <input 
                        type="number" 
                        name="number_of_days" 
                        value={newBooking.number_of_days} 
                        onChange={handleInputChange} 
                        min="1" 
                        max="30" 
                        required 
                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                      />
                    </div>
                    {newBooking.booking_type !== "taxi" && (
                      <div className="form-group">
                        <label style={{ fontWeight: '500', marginBottom: '5px', display: 'block' }}>Driver Option *</label>
                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginTop: '8px' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                            <input 
                              type="radio" 
                              name="driver_option" 
                              value="with-driver" 
                              checked={newBooking.driver_option === "with-driver"}
                              onChange={handleInputChange}
                              style={{ cursor: 'pointer' }}
                            />
                            <span style={{ fontSize: '0.95rem' }}>🚗 With Driver</span>
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                            <input 
                              type="radio" 
                              name="driver_option" 
                              value="without-driver" 
                              checked={newBooking.driver_option === "without-driver"}
                              onChange={handleInputChange}
                              style={{ cursor: 'pointer' }}
                            />
                            <span style={{ fontSize: '0.95rem' }}>🏎️ Self Drive</span>
                          </label>
                        </div>
                      </div>
                    )}

                    {newBooking.driver_option === "with-driver" && (
                      <div className="form-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                          <label style={{ fontWeight: '500', color: '#D40000' }}>👤 Select Driver *</label>
                          <button
                            type="button"
                            onClick={() => {
                              // Manually trigger driver refresh
                              const numberOfDays = parseInt(newBooking.number_of_days) || 1;
                              if (newBooking.pickup_date) {
                                setLoadingDrivers(true);
                                const token = getToken();
                                fetch(
                                  `http://localhost:8000/api/bookings/available_drivers/?pickup_date=${newBooking.pickup_date}&number_of_days=${numberOfDays}`,
                                  {
                                    method: 'GET',
                                    headers: {
                                      'Authorization': `Token ${token}`,
                                      'Content-Type': 'application/json',
                                    }
                                  }
                                ).then(res => res.ok ? res.json() : Promise.reject())
                                 .then(data => {
                                   const validDrivers = (data.data || []).filter(d => d && d.id);
                                   setAvailableDrivers(validDrivers);
                                   console.log('[UserDashboard] Drivers refreshed:', validDrivers.length);
                                 })
                                 .catch(err => {
                                   console.error('[UserDashboard] Refresh error:', err);
                                   setAvailableDrivers([]);
                                 })
                                 .finally(() => setLoadingDrivers(false));
                              }
                            }}
                            disabled={loadingDrivers || !newBooking.pickup_date}
                            style={{
                              padding: '5px 10px',
                              fontSize: '0.85rem',
                              backgroundColor: '#D40000',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: loadingDrivers || !newBooking.pickup_date ? 'not-allowed' : 'pointer',
                              opacity: loadingDrivers || !newBooking.pickup_date ? 0.6 : 1,
                              fontWeight: 'bold'
                            }}
                          >
                            {loadingDrivers ? '⟳ Refreshing...' : '🔄 Refresh'}
                          </button>
                        </div>
                        {loadingDrivers ? (
                          <div style={{ padding: '10px', color: '#000' }}>⏳ Loading available drivers...</div>
                        ) : availableDrivers.length > 0 ? (
                          <select 
                            name="selected_driver_id" 
                            value={newBooking.selected_driver_id || ''} 
                            onChange={handleInputChange}
                            required
                            style={{ 
                              width: '100%', 
                              padding: '10px', 
                              border: `2px solid ${newBooking.selected_driver_id ? '#D40000' : '#ddd'}`, 
                              borderRadius: '4px',
                              fontSize: '0.95rem',
                              fontWeight: '500'
                            }}
                          >
                            <option value="">-- Select a driver --</option>
                            {availableDrivers && availableDrivers.map((driver) => {
                              // Handle different response structures from backend
                              const firstName = driver?.user?.first_name || driver?.first_name || 'Unknown';
                              const lastName = driver?.user?.last_name || driver?.last_name || '';
                              const experience = driver?.experience_years || 0;
                              const rating = driver?.average_rating || 5.0;
                              
                              return (
                                <option key={driver.id} value={driver.id}>
                                  👤 {firstName} {lastName} - Exp: {experience} yr{experience !== 1 ? 's' : ''} - ⭐ {rating}
                                </option>
                              );
                            })}
                          </select>
                        ) : (
                          <div style={{ padding: '15px', color: '#000', backgroundColor: '#f9f9f9', borderRadius: '4px', border: '1px solid #ddd', textAlign: 'center' }}>
                            <p style={{ margin: '0 0 10px 0', fontSize: '1rem' }}>⏳ Loading drivers...</p>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#000' }}>Please wait, fetching available drivers</p>
                          </div>
                        )}
                      </div>
                    )}

                  </div>

                  <div className="form-row" style={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '15px',
                    marginBottom: '15px'
                  }}>
                    <div className="form-group">
                      <label style={{ fontWeight: '500', marginBottom: '5px', display: 'block' }}>Pickup Location *</label>
                      <input 
                        type="text" 
                        name="pickup_location" 
                        value={newBooking.pickup_location} 
                        onChange={handleInputChange} 
                        placeholder="e.g., Central Station" 
                        required
                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                      />
                    </div>
                    <div className="form-group">
                      <label style={{ fontWeight: '500', marginBottom: '5px', display: 'block' }}>Dropoff Location *</label>
                      <input 
                        type="text" 
                        name="dropoff_location" 
                        value={newBooking.dropoff_location} 
                        onChange={handleInputChange} 
                        placeholder="e.g., Airport" 
                        required
                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                      />
                    </div>
                  </div>

                  <div className="form-row" style={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '15px',
                    marginBottom: '15px'
                  }}>
                    <div className="form-group">
                      <label style={{ fontWeight: '500', marginBottom: '5px', display: 'block' }}>Pickup Date *</label>
                      <input 
                        type="date" 
                        name="pickup_date" 
                        value={newBooking.pickup_date} 
                        onChange={handleInputChange} 
                        required
                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                      />
                    </div>
                    <div className="form-group">
                      <label style={{ fontWeight: '500', marginBottom: '5px', display: 'block' }}>Pickup Time *</label>
                      <input 
                        type="time" 
                        name="pickup_time" 
                        value={newBooking.pickup_time} 
                        onChange={handleInputChange} 
                        required
                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                      />
                    </div>
                  </div>

                  <div className="form-row" style={{ marginBottom: '15px' }}>
                    <div className="form-group" style={{ width: '100%' }}>
                      <label style={{ fontWeight: '500', marginBottom: '5px', display: 'block' }}>Phone Number *</label>
                      <input 
                        type="tel" 
                        name="phone" 
                        value={newBooking.phone} 
                        onChange={handleInputChange} 
                        placeholder="Enter your phone number" 
                        required
                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label style={{ fontWeight: '500', marginBottom: '5px', display: 'block' }}>Payment Method *</label>
                    <select 
                      name="payment_method" 
                      value={newBooking.payment_method} 
                      onChange={handleInputChange} 
                      required
                      style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                    >
                      <option value="credit-card">💳 Credit Card</option>
                      <option value="debit-card">💳 Debit Card</option>
                      <option value="upi">📱 UPI</option>
                      <option value="cash">💵 Cash</option>
                    </select>
                  </div>

                  <div className="form-row" style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        name="agree_to_terms" 
                        checked={newBooking.agree_to_terms} 
                        onChange={handleInputChange} 
                        required
                        style={{ width: '18px', height: '18px' }}
                      />
                      <span style={{ fontSize: '0.95rem' }}>I agree to Terms & Conditions and Privacy Policy</span>
                    </label>
                  </div>

                  <div className="price-summary" style={{
                    backgroundColor: '#f0f0f0',
                    padding: '15px',
                    borderRadius: '4px',
                    marginBottom: '20px'
                  }}>
                    <h4 style={{ margin: '0 0 10px 0' }}>Booking Summary</h4>
                    <div className="summary-row" style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontWeight: 'bold',
                      fontSize: '1.1rem',
                      color: '#D40000'
                    }}>
                      <span>Estimated Total:</span>
                      <span className="price">₹{calculatePrice()}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      type="submit" 
                      className="submit-btn" 
                      disabled={submitting}
                      style={{
                        flex: 1,
                        padding: '12px',
                        backgroundColor: '#D40000',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        cursor: submitting ? 'not-allowed' : 'pointer',
                        opacity: submitting ? 0.6 : 1
                      }}
                    >
                      {submitting ? "Processing..." : "Confirm Booking & Proceed to Payment"}
                    </button>
                    <button 
                      type="button" 
                      className="cancel-btn" 
                      onClick={() => setSelectedCar(null)}
                      style={{
                        flex: 1,
                        padding: '12px',
                        backgroundColor: '#ccc',
                        color: '#000',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '1rem',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        );

      case "ondemand":
        console.log('[CASE] Matched ondemand case');
        return (
          <div className="content-section">
            <div className="section-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button className="new-btn" onClick={() => setActiveTab('intro')} style={{ padding: '5px 10px', fontSize: '1rem' }}>⬅ Back</button>
                <h2>On-Demand Taxi Service</h2>
              </div>
            </div>

            {!selectedTaxiType ? (
              // Full OnDemand Taxi Experience
              <div style={{ padding: '20px 0' }}>
                {/* Features Highlight */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '25px',
                  marginBottom: '50px'
                }}>
                  {[
                    { icon: '⚡', title: 'Instant Booking', desc: 'Get a ride in minutes' },
                    { icon: '🛡️', title: 'Safe & Secure', desc: 'Verified drivers & vehicles' },
                    { icon: '💰', title: 'Transparent Pricing', desc: 'No hidden charges' },
                    { icon: '📱', title: 'Real-time Tracking', desc: 'Live location updates' }
                  ].map((feature, idx) => (
                    <div key={idx} style={{
                      textAlign: 'center',
                      padding: '28px 24px',
                      backgroundColor: '#fff',
                      border: '1px solid #e0e0e0',
                      borderRadius: '10px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      transition: 'all 0.3s ease'
                    }}>
                      <div style={{ fontSize: '2.8rem', marginBottom: '15px' }}>{feature.icon}</div>
                      <h3 style={{ margin: '0 0 10px 0', color: '#000', fontSize: '1.1rem' }}>{feature.title}</h3>
                      <p style={{ margin: 0, color: '#000', fontSize: '0.92rem' }}>{feature.desc}</p>
                    </div>
                  ))}
                </div>

                {/* Taxi Services Grid */}
                <div style={{ marginBottom: '50px' }}>
                  <h2 style={{ margin: '0 0 30px 0', color: '#000', textAlign: 'center' }}>Available Taxi Services</h2>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '25px'
                  }}>
                    {taxiServices.map((service) => (
                      <div 
                        key={service.id} 
                        style={{
                          border: '1px solid #e0e0e0',
                          borderRadius: '10px',
                          overflow: 'hidden',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                          transition: 'all 0.3s ease',
                          cursor: 'pointer',
                          backgroundColor: 'white'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-8px)';
                          e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                        }}
                      >
                        <div style={{ 
                          backgroundColor: '#f5f5f5',
                          height: '180px',
                          position: 'relative',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <img 
                            src={service.image} 
                            alt={service.name} 
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              display: 'block'
                            }}
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                          <div style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            backgroundColor: '#D40000',
                            color: 'white',
                            padding: '5px 12px',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            fontWeight: 'bold'
                          }}>
                            {service.type}
                          </div>
                        </div>
                        <div style={{ padding: '22px' }}>
                          <h3 style={{ margin: '0 0 10px 0', fontSize: '1.15rem', color: '#000', fontWeight: '600' }}>{service.name}</h3>
                          <p style={{ margin: '0 0 15px 0', fontSize: '0.92rem', color: '#000', minHeight: '40px', lineHeight: '1.4' }}>
                            {service.description}
                          </p>
                          <div style={{ marginBottom: '16px' }}>
                            {service.specs.map((spec, idx) => (
                              <span key={idx} style={{ 
                                display: 'block',
                                fontSize: '0.88rem',
                                color: '#000',
                                marginBottom: '5px'
                              }}>
                                {spec}
                              </span>
                            ))}
                          </div>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            paddingTop: '16px',
                            borderTop: '1px solid #e0e0e0'
                          }}>
                            <span style={{ 
                              fontSize: '1.2rem', 
                              fontWeight: 'bold',
                              color: '#D40000'
                            }}>
                              {service.price}
                            </span>
                            <button 
                              className="new-btn" 
                              onClick={() => setSelectedTaxiType(service)}
                              style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                            >
                              Book Now
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* How It Works */}
                <div style={{
                  backgroundColor: '#f9f9f9',
                  padding: '50px 25px',
                  borderRadius: '10px',
                  marginBottom: '50px'
                }}>
                  <h2 style={{ textAlign: 'center', margin: '0 0 40px 0', color: '#000', fontSize: '1.8rem' }}>How It Works</h2>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '25px'
                  }}>
                    {[
                      { num: '1', title: 'Open App', desc: 'Launch the AutoNexus app and sign in' },
                      { num: '2', title: 'Set Location', desc: 'Enter your pickup and drop-off points' },
                      { num: '3', title: 'Choose Service', desc: 'Select your preferred taxi type' },
                      { num: '4', title: 'Confirm Booking', desc: 'Review fare and confirm your ride' },
                      { num: '5', title: 'Track Driver', desc: "See your driver's location in real-time" },
                      { num: '6', title: 'Enjoy Ride', desc: 'Sit back and enjoy your journey' }
                    ].map((step, idx) => (
                      <div key={idx} style={{
                        textAlign: 'center',
                        padding: '24px',
                        backgroundColor: 'white',
                        borderRadius: '10px',
                        border: '1px solid #e0e0e0',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                        transition: 'all 0.3s ease'
                      }}>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          backgroundColor: '#D40000',
                          color: 'white',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.2rem',
                          fontWeight: 'bold',
                          margin: '0 auto 10px'
                        }}>
                          {step.num}
                        </div>
                        <h3 style={{ margin: '0 0 8px 0', color: '#000', fontSize: '1rem' }}>{step.title}</h3>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#000' }}>{step.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Safety Features */}
                <div style={{ marginBottom: '50px' }}>
                  <h2 style={{ textAlign: 'center', margin: '0 0 40px 0', color: '#000', fontSize: '1.8rem' }}>Safety & Security</h2>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '25px'
                  }}>
                    {[
                      { icon: '🛡️', title: 'Verified Drivers', desc: 'All drivers undergo thorough background checks' },
                      { icon: '📱', title: 'Real-time Tracking', desc: 'Share ride details with family for safety' },
                      { icon: '🚨', title: 'SOS Button', desc: 'Quick access to emergency services' },
                      { icon: '⭐', title: 'Driver Ratings', desc: 'Rate and review drivers to maintain quality' }
                    ].map((safety, idx) => (
                      <div key={idx} style={{
                        padding: '28px 24px',
                        backgroundColor: '#fff',
                        border: '1px solid #e0e0e0',
                        borderRadius: '10px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        textAlign: 'center',
                        transition: 'all 0.3s ease'
                      }}>
                        <div style={{ fontSize: '2.8rem', marginBottom: '16px' }}>{safety.icon}</div>
                        <h3 style={{ margin: '0 0 12px 0', color: '#000', fontSize: '1.1rem' }}>{safety.title}</h3>
                        <p style={{ margin: 0, color: '#000', fontSize: '0.92rem' }}>{safety.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Testimonials */}
                <div style={{ marginBottom: '50px' }}>
                  <h2 style={{ textAlign: 'center', margin: '0 0 40px 0', color: '#000', fontSize: '1.8rem' }}>What Our Customers Say</h2>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '25px'
                  }}>
                    {[
                      { stars: '⭐⭐⭐⭐⭐', text: '"Amazing service! Drivers are professional and rides are always on time."', author: '- Sarah M.' },
                      { stars: '⭐⭐⭐⭐⭐', text: '"Great app experience. Booking is super easy and prices are competitive."', author: '- John D.' },
                      { stars: '⭐⭐⭐⭐⭐', text: '"Used it for airport transfer and everything was perfect. Clean car, safe driver."', author: '- Emma K.' }
                    ].map((testimonial, idx) => (
                      <div key={idx} style={{
                        padding: '28px 24px',
                        backgroundColor: '#fff',
                        border: '1px solid #e0e0e0',
                        borderRadius: '10px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        transition: 'all 0.3s ease'
                      }}>
                        <div style={{ fontSize: '1.2rem', marginBottom: '15px' }}>{testimonial.stars}</div>
                        <p style={{ margin: '0 0 18px 0', color: '#000', fontStyle: 'italic', fontSize: '0.95rem', lineHeight: '1.5' }}>{testimonial.text}</p>
                        <p style={{ margin: 0, color: '#999', fontSize: '0.9rem', fontWeight: '500' }}>{testimonial.author}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Benefits */}
                <div style={{
                  backgroundColor: '#f9f9f9',
                  padding: '50px 25px',
                  borderRadius: '10px',
                  marginBottom: '50px'
                }}>
                  <h2 style={{ textAlign: 'center', margin: '0 0 40px 0', color: '#000', fontSize: '1.8rem' }}>Why Choose AutoNexus Taxi?</h2>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '25px'
                  }}>
                    {[
                      { title: '✓ 24/7 Availability', desc: 'Book a ride anytime in the city' },
                      { title: '✓ Affordable Pricing', desc: 'Transparent fares with no hidden charges' },
                      { title: '✓ Professional Drivers', desc: 'Experienced and courteous drivers' },
                      { title: '✓ Clean Vehicles', desc: 'Well-maintained and hygienic cars' },
                      { title: '✓ Quick Response', desc: 'Average pickup time of 5 minutes or less' },
                      { title: '✓ Insurance Coverage', desc: 'Complete coverage for every ride' }
                    ].map((benefit, idx) => (
                      <div key={idx} style={{
                        padding: '24px',
                        backgroundColor: 'white',
                        borderRadius: '10px',
                        border: '1px solid #e0e0e0',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                        transition: 'all 0.3s ease'
                      }}>
                        <h3 style={{ margin: '0 0 12px 0', color: '#000', fontSize: '1rem' }}>{benefit.title}</h3>
                        <p style={{ margin: 0, color: '#000', fontSize: '0.92rem' }}>{benefit.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Section */}
                <div style={{
                  textAlign: 'center',
                  padding: '50px 30px',
                  backgroundColor: '#D40000',
                  borderRadius: '10px',
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(212, 0, 0, 0.2)'
                }}>
                  <h2 style={{ margin: '0 0 16px 0', fontSize: '2rem' }}>Ready for Your Next Ride?</h2>
                  <p style={{ margin: '0 0 28px 0', fontSize: '1.1rem', opacity: 0.95 }}>Select any service above to book now</p>
                  <button 
                    className="new-btn"
                    onClick={() => {
                      const firstService = taxiServices[0];
                      setSelectedTaxiType(firstService);
                    }}
                    style={{
                      padding: '16px 48px',
                      fontSize: '1.15rem',
                      fontWeight: 'bold',
                      backgroundColor: 'white',
                      color: '#D40000',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'scale(1.05)';
                      e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    Book a Ride Now
                  </button>
                </div>
              </div>
            ) : (
              // Booking Form for selected taxi service
              <div className="booking-form-wrapper">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <button 
                    className="new-btn" 
                    onClick={() => setSelectedTaxiType(null)}
                    style={{ padding: '5px 10px', fontSize: '1rem' }}
                  >
                    ⬅ Back to Services
                  </button>
                  <h3>Booking {selectedTaxiType.name}</h3>
                </div>

                <div style={{
                  backgroundColor: '#f9f9f9',
                  padding: '15px',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  borderLeft: '4px solid #D40000'
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                    <div>
                      <span style={{ color: '#000', fontSize: '0.9rem' }}>Service Type:</span>
                      <p style={{ margin: '5px 0 0 0', fontWeight: 'bold', fontSize: '1rem' }}>
                        {selectedTaxiType.name}
                      </p>
                    </div>
                    <div>
                      <span style={{ color: '#000', fontSize: '0.9rem' }}>Price:</span>
                      <p style={{ margin: '5px 0 0 0', fontWeight: 'bold', fontSize: '1rem', color: '#D40000' }}>
                        {selectedTaxiType.price}
                      </p>
                    </div>
                    <div>
                      <span style={{ color: '#000', fontSize: '0.9rem' }}>Category:</span>
                      <p style={{ margin: '5px 0 0 0', fontWeight: 'bold', fontSize: '1rem' }}>
                        {selectedTaxiType.type}
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmitBooking} className="booking-form" style={{
                  backgroundColor: 'white',
                  padding: '20px',
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0'
                }}>
                  <h4 style={{ marginTop: 0, marginBottom: '15px', color: '#000' }}>📍 Booking Details</h4>

                  <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '15px',
                    marginBottom: '15px'
                  }}>
                    <div>
                      <label style={{ fontWeight: '500', marginBottom: '5px', display: 'block' }}>Pickup Location *</label>
                      <input 
                        type="text" 
                        name="pickup_location" 
                        value={newBooking.pickup_location} 
                        onChange={handleInputChange} 
                        placeholder="e.g., Central Station" 
                        required
                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontWeight: '500', marginBottom: '5px', display: 'block' }}>Dropoff Location *</label>
                      <input 
                        type="text" 
                        name="dropoff_location" 
                        value={newBooking.dropoff_location} 
                        onChange={handleInputChange} 
                        placeholder="e.g., Airport" 
                        required
                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                      />
                    </div>
                  </div>

                  <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '15px',
                    marginBottom: '15px'
                  }}>
                    <div>
                      <label style={{ fontWeight: '500', marginBottom: '5px', display: 'block' }}>Pickup Date *</label>
                      <input 
                        type="date" 
                        name="pickup_date" 
                        value={newBooking.pickup_date} 
                        onChange={handleInputChange} 
                        required
                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontWeight: '500', marginBottom: '5px', display: 'block' }}>Pickup Time *</label>
                      <input 
                        type="time" 
                        name="pickup_time" 
                        value={newBooking.pickup_time} 
                        onChange={handleInputChange} 
                        required
                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontWeight: '500', marginBottom: '5px', display: 'block' }}>Number of Days *</label>
                      <input 
                        type="number" 
                        name="number_of_days" 
                        value={newBooking.number_of_days} 
                        onChange={handleInputChange} 
                        min="1" 
                        max="30" 
                        required
                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                      />
                    </div>
                  </div>

                  <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '15px',
                    marginBottom: '15px'
                  }}>
                    <div>
                      <label style={{ fontWeight: '500', marginBottom: '5px', display: 'block' }}>Phone Number *</label>
                      <input 
                        type="tel" 
                        name="phone" 
                        value={newBooking.phone} 
                        onChange={handleInputChange} 
                        placeholder="Enter your phone number" 
                        required
                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ fontWeight: '500', marginBottom: '5px', display: 'block' }}>Payment Method *</label>
                    <select 
                      name="payment_method" 
                      value={newBooking.payment_method} 
                      onChange={handleInputChange} 
                      required
                      style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                    >
                      <option value="credit-card">💳 Credit Card</option>
                      <option value="debit-card">💳 Debit Card</option>
                      <option value="upi">📱 UPI</option>
                      <option value="cash">💵 Cash</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        name="agree_to_terms" 
                        checked={newBooking.agree_to_terms} 
                        onChange={handleInputChange} 
                        required
                        style={{ width: '18px', height: '18px' }}
                      />
                      <span style={{ fontSize: '0.95rem' }}>I agree to Terms & Conditions and Privacy Policy</span>
                    </label>
                  </div>

                  <div style={{
                    backgroundColor: '#f0f0f0',
                    padding: '15px',
                    borderRadius: '4px',
                    marginBottom: '20px'
                  }}>
                    <h4 style={{ margin: '0 0 10px 0' }}>Booking Summary</h4>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontWeight: 'bold',
                      fontSize: '1.1rem',
                      color: '#D40000'
                    }}>
                      <span>Estimated Total:</span>
                      <span>₹{calculatePrice()}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      type="submit" 
                      disabled={submitting}
                      style={{
                        flex: 1,
                        padding: '12px',
                        backgroundColor: '#D40000',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        cursor: submitting ? 'not-allowed' : 'pointer',
                        opacity: submitting ? 0.6 : 1
                      }}
                    >
                      {submitting ? "Processing..." : "Confirm Booking & Proceed to Payment"}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setSelectedTaxiType(null)}
                      style={{
                        flex: 1,
                        padding: '12px',
                        backgroundColor: '#ccc',
                        color: '#000',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '1rem',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        );

      case "used_cars":
        console.log('[CASE] Matched used_cars case');
        return (
          <div className="content-section">
            <div className="section-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                <button className="new-btn" onClick={() => setActiveTab('intro')} style={{ padding: '5px 10px', fontSize: '1rem' }}>⬅ Back</button>
                <h2>Used Cars Marketplace</h2>
              </div>
            </div>
            {/* We default to browsing, but UsedCarsPage has its own toggle for Selling */}
            <UsedCarsPage defaultShowSellForm={false} />
          </div>
        );

      case "fleet":
        return (
          <div className="content-section">
            <div className="section-header">
              <button className="new-btn" onClick={() => setActiveTab('intro')} style={{ padding: '5px 10px' }}>⬅ Back</button>
              <h2>🏎️ Premium Fleet</h2>
            </div>

            {!selectedCar ? (
              <div style={{ padding: '30px 0' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '40px' }}>Luxury Rentals</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px' }}>
                  {[...fleetCars, ...availableCars.filter(car => car.car_category === 'premium')].map((car, idx) => (
                    <div key={idx} style={{ border: '1px solid #e0e0e0', borderRadius: '10px', padding: '0', overflow: 'hidden' }}>
                      <img src={car.image_url || car.image} alt={car.name} style={{ width: '100%', height: '200px', objectFit: 'cover' }} onError={(e) => e.target.style.display = 'none'} />
                      <div style={{ padding: '20px' }}>
                        <h3>{car.name || `${car.year} ${car.make}`}</h3>
                        <p style={{ color: '#D40000', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '15px' }}>{car.price}</p>
                        <button className="new-btn" onClick={() => { setSelectedCar(car); setNewBooking({...newBooking, booking_type: 'premium'}); }}>Book Now</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ maxWidth: '800px', margin: '40px auto', backgroundColor: '#fff', padding: '30px', borderRadius: '10px' }}>
                <button className="new-btn" onClick={() => setSelectedCar(null)} style={{ marginBottom: '20px' }}>⬅ Back</button>
                <h2>Booking Details - {selectedCar?.name}</h2>
                <form onSubmit={handleSubmitBooking} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <input type="text" placeholder="Pickup Location" value={newBooking.pickup_location} onChange={(e) => setNewBooking({...newBooking, pickup_location: e.target.value})} required style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} />
                  <input type="text" placeholder="Dropoff Location" value={newBooking.dropoff_location} onChange={(e) => setNewBooking({...newBooking, dropoff_location: e.target.value})} required style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} />
                  <input type="date" value={newBooking.pickup_date} onChange={(e) => setNewBooking({...newBooking, pickup_date: e.target.value})} required style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} />
                  <input type="time" value={newBooking.pickup_time} onChange={(e) => setNewBooking({...newBooking, pickup_time: e.target.value})} required style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} />
                  <input type="number" min="1" placeholder="Days" value={newBooking.number_of_days} onChange={(e) => setNewBooking({...newBooking, number_of_days: e.target.value})} required style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} />
                  <input type="tel" placeholder="Phone" value={newBooking.phone} onChange={(e) => setNewBooking({...newBooking, phone: e.target.value})} required style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} />
                  <label style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center' }}><input type="checkbox" checked={newBooking.agree_to_terms} onChange={(e) => setNewBooking({...newBooking, agree_to_terms: e.target.checked})} style={{ marginRight: '8px' }} />I agree to terms</label>
                  <div style={{ gridColumn: '1/-1', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '5px' }}>
                    <p>Total: <strong style={{ color: '#D40000', fontSize: '1.2rem' }}>₹{calculatePrice()}</strong></p>
                  </div>
                  <button type="submit" disabled={!newBooking.agree_to_terms} style={{ gridColumn: '1/-1', padding: '12px', backgroundColor: newBooking.agree_to_terms ? '#D40000' : '#ccc', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: newBooking.agree_to_terms ? 'pointer' : 'not-allowed' }}>Proceed to Payment</button>
                </form>
              </div>
            )}
          </div>
        );

      case "pending_bookings":
        const pendingBookings = bookings.filter(b => b.status === 'pending');
        return (
          <div className="content-section">
            <div className="section-header">
              <button className="new-btn" onClick={() => setActiveTab('intro')} style={{ padding: '5px 10px' }}>⬅ Back</button>
              <h2>⏳ Pending Bookings</h2>
              <span style={{ fontSize: '0.9rem', color: '#000' }}>Total: {pendingBookings.length}</span>
            </div>

            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#000' }}>
                <p>Loading pending bookings...</p>
              </div>
            ) : pendingBookings.length === 0 ? (
              <div style={{ padding: '60px 30px', textAlign: 'center', backgroundColor: '#f9f9f9', borderRadius: '10px', margin: '30px 0' }}>
                <div style={{ fontSize: '3rem', marginBottom: '15px' }}>✨</div>
                <h3 style={{ margin: '0 0 10px 0', color: '#000' }}>No Pending Bookings</h3>
                <p style={{ margin: '0 0 20px 0', color: '#000' }}>You have no pending bookings at this time.</p>
                <button className="new-btn" onClick={() => setActiveTab('taxi')} style={{ padding: '10px 20px', fontSize: '0.95rem' }}>
                  📱 Book a Ride
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '20px', marginTop: '30px' }}>
                {pendingBookings.map((booking) => (
                  <div key={booking.id} style={{
                    backgroundColor: '#fff8f0',
                    border: '2px solid #ff9800',
                    borderRadius: '10px',
                    padding: '25px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    transition: 'all 0.3s ease'
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '30px', alignItems: 'start' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                          <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#000' }}>
                            Booking #{booking.id}
                          </h3>
                          <span style={{ backgroundColor: '#ff9800', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                            ⏳ PENDING
                          </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                          <div>
                            <p style={{ margin: '0 0 5px 0', color: '#000', fontSize: '0.9rem', fontWeight: '600' }}>📍 Pickup</p>
                            <p style={{ margin: 0, color: '#000', fontSize: '0.95rem' }}>{booking.pickup_location}</p>
                          </div>
                          <div>
                            <p style={{ margin: '0 0 5px 0', color: '#000', fontSize: '0.9rem', fontWeight: '600' }}>🎯 Dropoff</p>
                            <p style={{ margin: 0, color: '#000', fontSize: '0.95rem' }}>{booking.dropoff_location}</p>
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                          <div>
                            <p style={{ margin: '0 0 5px 0', color: '#000', fontSize: '0.9rem', fontWeight: '600' }}>📅 Date & Time</p>
                            <p style={{ margin: 0, color: '#000', fontSize: '0.95rem' }}>
                              {new Date(booking.pickup_date).toLocaleDateString()} at {booking.pickup_time}
                            </p>
                          </div>
                          <div>
                            <p style={{ margin: '0 0 5px 0', color: '#000', fontSize: '0.9rem', fontWeight: '600' }}>🚗 Type</p>
                            <p style={{ margin: 0, color: '#000', fontSize: '0.95rem' }}>{booking.booking_type?.toUpperCase()}</p>
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                          <div>
                            <p style={{ margin: '0 0 5px 0', color: '#000', fontSize: '0.9rem', fontWeight: '600' }}>⏱️ Duration</p>
                            <p style={{ margin: 0, color: '#000', fontSize: '0.95rem' }}>{booking.number_of_days} day(s)</p>
                          </div>
                          <div>
                            <p style={{ margin: '0 0 5px 0', color: '#000', fontSize: '0.9rem', fontWeight: '600' }}>💰 Amount</p>
                            <p style={{ margin: 0, color: '#D40000', fontSize: '1rem', fontWeight: 'bold' }}>₹{booking.total_amount}</p>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '200px' }}>
                        <button
                          onClick={() => {
                            setPaymentBooking(booking);
                            setActiveTab('payment');
                          }}
                          style={{
                            padding: '12px 20px',
                            backgroundColor: '#D40000',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            fontWeight: 'bold',
                            fontSize: '0.95rem',
                            cursor: 'pointer',
                            transition: 'background 0.3s'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#c20000'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = '#D40000'}
                        >
                          💳 Complete Payment
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBooking(booking);
                          }}
                          style={{
                            padding: '12px 20px',
                            backgroundColor: '#2196f3',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            fontWeight: 'bold',
                            fontSize: '0.95rem',
                            cursor: 'pointer',
                            transition: 'background 0.3s'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#1976d2'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = '#2196f3'}
                        >
                          📋 View Details
                        </button>
                        <button
                          onClick={() => {
                            handleCancelBooking(booking.id);
                          }}
                          style={{
                            padding: '12px 20px',
                            backgroundColor: '#f44336',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            fontWeight: 'bold',
                            fontSize: '0.95rem',
                            cursor: 'pointer',
                            transition: 'background 0.3s'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#d32f2f'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = '#f44336'}
                        >
                          ❌ Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "activities":
        console.log('[CASE] Matched activities case');
        // Shows history of bookings/activities
        return (
          <div className="content-section">
            <div className="section-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button className="new-btn" onClick={() => setActiveTab('intro')} style={{ padding: '5px 10px', fontSize: '1rem' }}>⬅ Back</button>
                <h2>My Activities</h2>
              </div>
              <div className="stats-mini" style={{ display: 'flex', gap: '20px', fontSize: '0.95rem', color: '#000' }}>
                <span>Bookings: <b style={{ color: '#D40000' }}>{bookings.length}</b></span>
                <span>Listings: <b style={{ color: '#D40000' }}>{listings.length}</b></span>
              </div>
            </div>

            {loading ? (
              <div className="loading">Loading activities...</div>
            ) : (
              <div className="activities-container">
                {/* Bookings Section */}
                <h3 style={{ margin: '15px 0 15px', color: '#444', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🚖 Rides & Bookings
                </h3>
                <div className="bookings-list">
                  {bookings.length === 0 ? (
                    <div className="empty-state" style={{ padding: '20px', marginBottom: '30px' }}>
                      <p className="empty-message">No bookings found</p>
                    </div>
                  ) : (
                    bookings.map((booking) => (
                      <div key={booking.id} className="booking-card" style={{ borderLeftColor: getStatusColor(booking.status) }}>
                        <div className="booking-header">
                          <h3>
                            {booking.pickup_date} - {booking.booking_type?.toUpperCase()}
                          </h3>
                          <span
                            className="status-badge"
                            style={{ backgroundColor: getStatusColor(booking.status) }}
                          >
                            {booking.status?.toUpperCase()}
                          </span>
                        </div>
                        <div className="booking-details">
                          <p>From: {booking.pickup_location}</p>
                          <p>To: {booking.dropoff_location}</p>
                          <p className="amount-text">₹{booking.total_amount}</p>
                          
                          {/* Driver Information - Shows when driver is assigned */}
                          {booking.assigned_driver && (
                            <div className="driver-info-box">
                              <h4>👨‍💼 Driver Assigned</h4>
                              <p><strong>Name:</strong> {booking.assigned_driver.name || booking.assigned_driver.user_name || booking.assigned_driver.user?.first_name || 'Driver'}</p>
                              {booking.assigned_driver.email && <p><strong>Email:</strong> {booking.assigned_driver.email}</p>}
                              {booking.assigned_driver.user_email && <p><strong>Email:</strong> {booking.assigned_driver.user_email}</p>}
                              {booking.assigned_driver.phone && <p><strong>Phone:</strong> {booking.assigned_driver.phone}</p>}
                              {booking.assigned_driver.license_number && <p><strong>License:</strong> {booking.assigned_driver.license_number}</p>}
                              {booking.assigned_driver.experience_years && <p><strong>Experience:</strong> {booking.assigned_driver.experience_years} years</p>}
                              {booking.assigned_driver.average_rating && <p><strong>Rating:</strong> ⭐ {booking.assigned_driver.average_rating}</p>}
                            </div>
                          )}
                          
                          {/* Pending Driver Assignment - Shows when manager hasn't assigned yet */}
                          {booking.driver_option === "with-driver" && !booking.assigned_driver && (
                            <div className="pending-driver-info">
                              <p>📋 <em>Driver will be assigned by manager soon...</em></p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Listings Section */}
                <h3 style={{ margin: '40px 0 15px', color: '#444', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px', borderTop: '2px dashed #eee', paddingTop: '30px' }}>
                  🚗 My Car Listings
                </h3>
                <div className="listings-list">
                  {listings.length === 0 ? (
                    <div className="empty-state" style={{ padding: '20px' }}>
                      <p className="empty-message">You currently have no cars listed for sale.</p>
                      <button
                        className="new-btn"
                        style={{ marginTop: '10px', fontSize: '0.9rem' }}
                        onClick={() => setActiveTab('used_cars')}
                      >
                        + Sell a Car
                      </button>
                    </div>
                  ) : (
                    listings.map((car) => (
                      <div key={car.id} className="booking-card" style={{ borderLeftColor: '#2980b9' }}>
                        <div className="booking-header">
                          <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {car.year} {car.make} {car.model}
                            <span style={{ fontSize: '0.7rem', background: '#e1f5fe', color: '#0277bd', padding: '2px 8px', borderRadius: '10px' }}>LISTED</span>
                          </h3>
                          <span className="money">₹{Number(car.price).toLocaleString()}</span>
                        </div>
                        <div className="booking-details">
                          <div style={{ display: 'flex', gap: '15px' }}>
                            <p>Mileage: {car.mileage} km</p>
                            <p>Color: {car.color}</p>
                          </div>
                          {car.description && <p style={{ fontSize: '0.85rem', color: '#888', fontStyle: 'italic', marginTop: '5px' }}>"{car.description.substring(0, 50)}..."</p>}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Customers Section */}
                <h3 style={{ margin: '40px 0 15px', color: '#444', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px', borderTop: '2px dashed #eee', paddingTop: '30px' }}>
                  👥 Customers
                </h3>
                <div className="customers-table" style={{ overflowX: 'auto', marginBottom: '30px' }}>
                  {customersLoading ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#000' }}>Loading customers...</div>
                  ) : customers.length === 0 ? (
                    <div className="empty-state" style={{ padding: '20px' }}>
                      <p className="empty-message">No customers found.</p>
                      <button
                        className="new-btn"
                        style={{ marginTop: '10px', fontSize: '0.9rem' }}
                        onClick={() => fetchCustomers()}
                      >
                        🔄 Refresh Customers
                      </button>
                    </div>
                  ) : (
                    <table style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      fontSize: '0.95rem'
                    }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                          <th style={{ padding: '12px 15px', textAlign: 'left', fontWeight: '600', color: '#000' }}>Mail</th>
                          <th style={{ padding: '12px 15px', textAlign: 'left', fontWeight: '600', color: '#000' }}>Status</th>
                          <th style={{ padding: '12px 15px', textAlign: 'left', fontWeight: '600', color: '#000' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customers.map((customer) => (
                          <tr key={customer.id} style={{ borderBottom: '1px solid #e0e0e0', ':hover': { backgroundColor: '#f9f9f9' } }}>
                            <td style={{ padding: '12px 15px', color: '#000', fontWeight: '500' }}>{customer.email}</td>
                            <td style={{ padding: '12px 15px' }}>
                              <span style={{
                                padding: '6px 12px',
                                borderRadius: '20px',
                                fontSize: '0.85rem',
                                fontWeight: '600',
                                backgroundColor: customer.is_active ? '#d4edda' : '#f8d7da',
                                color: customer.is_active ? '#155724' : '#721c24',
                                border: customer.is_active ? '1px solid #c3e6cb' : '1px solid #f5c6cb'
                              }}>
                                {customer.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td style={{ padding: '12px 15px' }}>
                              <button
                                style={{
                                  padding: '6px 12px',
                                  backgroundColor: '#007bff',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '0.85rem',
                                  fontWeight: '500',
                                  marginRight: '8px'
                                }}
                                onClick={() => alert(`Email: ${customer.email}\nName: ${customer.first_name} ${customer.last_name}\nJoined: ${new Date(customer.date_joined).toLocaleDateString()}`)}
                              >
                                👁️ View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}
          </div>
        );

      case 'payment':
        return (
          <div className="tab-content">
            {paymentBooking ? (
              <RazorpayPayment
                bookingId={paymentBooking.id}
                amount={paymentBooking.total_amount}
                onPaymentSuccess={() => {
                  // Clear payment state and redirect to activities
                  setPaymentPageData(null);
                  setPaymentBooking(null);
                  setActiveTab('activities');
                  // Show success toast
                  alert('Payment successful! Your booking is confirmed.');
                }}
                onPaymentFailed={(error) => {
                  console.error('Payment failed:', error);
                  alert('Payment failed. Please try again.');
                }}
              />
            ) : (
              <DemoCheckout onSuccess={() => setActiveTab('activities')} />
            )}
          </div>
        );

      default:
        console.log('[CASE] MATCHED DEFAULT CASE! activeTab was:', activeTab);
        return null;
    }
  };

  return (
    <div className="dashboard-wrapper">
      {/* Alert System */}
      {alert.show && (
        <div className={`alert alert-${alert.type}`}>
          <div className="alert-content">
            <p>{alert.message}</p>
          </div>
        </div>
      )}

      <div className="dashboard-header">
        <div className="header-left">
          <h1>👋 Welcome, {user?.firstName || "User"}!</h1>
          <p>Manage your bookings and enjoy our premium services</p>
        </div>
        <button className="logout-header-btn" onClick={onLogout}>
          🚪 Logout
        </button>
      </div>

      <div className="dashboard-container">
        <div className="sidebar">
          <div className="logo-section">
            <h2 className="logo">🚗 AutoNexus</h2>
            <p className="logo-subtitle">Premium Mobility</p>
          </div>
          
          <nav className="sidebar-nav">
            <div className="nav-section">
              <p className="nav-label">MAIN</p>
              <button
                className={`nav-item ${activeTab === "intro" ? "active" : ""}`}
                onClick={() => setActiveTab("intro")}
              >
                <span className="nav-icon">🏠</span>
                <span className="nav-text">Dashboard</span>
              </button>
            </div>

            <div className="nav-section">
              <p className="nav-label">SERVICES</p>
              <button
                className={`nav-item ${activeTab === "taxi" ? "active" : ""}`}
                onClick={() => setActiveTab("taxi")}
              >
                <span className="nav-icon">🚕</span>
                <span className="nav-text">Taxi Services</span>
              </button>
              <button
                className={`nav-item ${activeTab === "ondemand" ? "active" : ""}`}
                onClick={() => setActiveTab("ondemand")}
              >
                <span className="nav-icon">📍</span>
                <span className="nav-text">On-Demand</span>
              </button>
              <button
                className={`nav-item ${activeTab === "fleet" ? "active" : ""}`}
                onClick={() => setActiveTab("fleet")}
              >
                <span className="nav-icon">🏎️</span>
                <span className="nav-text">Premium Fleet</span>
              </button>
              <button
                className={`nav-item ${activeTab === "used_cars" ? "active" : ""}`}
                onClick={() => setActiveTab("used_cars")}
              >
                <span className="nav-icon">🚗</span>
                <span className="nav-text">Used Cars</span>
              </button>
            </div>

            <div className="nav-section">
              <p className="nav-label">ACCOUNT</p>
              <button
                className={`nav-item ${activeTab === "pending_bookings" ? "active" : ""}`}
                onClick={() => setActiveTab("pending_bookings")}
              >
                <span className="nav-icon">⏳</span>
                <span className="nav-text">Pending</span>
                {bookings.filter(b => b.status === 'pending').length > 0 && (
                  <span className="nav-badge">{bookings.filter(b => b.status === 'pending').length}</span>
                )}
              </button>
              <button
                className={`nav-item ${activeTab === "activities" ? "active" : ""}`}
                onClick={() => setActiveTab("activities")}
              >
                <span className="nav-icon">📋</span>
                <span className="nav-text">History</span>
              </button>
            </div>
          </nav>
        </div>

        <div className="content">{renderContent()}</div>
      </div>

      {/* Booking Details Modal (hidden during payment flow) */}
      {selectedBooking && activeTab !== "payment" && (
        <div className="modal-overlay" onClick={() => setSelectedBooking(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setSelectedBooking(null)}
            >
              ✕
            </button>
            <h2>📋 Booking Details</h2>
            <div className="modal-body">
              <div className="detail-section">
                <h3>Trip Information</h3>
                <div className="detail-row">
                  <span className="label">Booking ID:</span>
                  <span className="value">#{selectedBooking.id}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Booking Type:</span>
                  <span className="value">{selectedBooking.booking_type?.toUpperCase()}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Status:</span>
                  <span
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(selectedBooking.status) }}
                  >
                    {selectedBooking.status?.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="detail-section">
                <h3>Location & Date</h3>
                <div className="detail-row">
                  <span className="label">Pickup Location:</span>
                  <span className="value">{selectedBooking.pickup_location}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Dropoff Location:</span>
                  <span className="value">{selectedBooking.dropoff_location}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Pickup Date & Time:</span>
                  <span className="value">
                    {new Date(selectedBooking.pickup_date).toLocaleDateString()} at {selectedBooking.pickup_time}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Number of Days:</span>
                  <span className="value">{selectedBooking.number_of_days}</span>
                </div>
              </div>

              <div className="detail-section">
                <h3>Service Details</h3>
                <div className="detail-row">
                  <span className="label">Driver Option:</span>
                  <span className="value">
                    {selectedBooking.driver_option === "with-driver" ? "With Driver 👤" : "Self Drive 🚗"}
                  </span>
                </div>
              </div>

              <div className="detail-section">
                <h3>Contact Information</h3>
                <div className="detail-row">
                  <span className="label">Phone Number:</span>
                  <span className="value">{selectedBooking.phone}</span>
                </div>
              </div>

              <div className="detail-section total-section">
                <div className="detail-row total">
                  <span className="label">Total Amount:</span>
                  <span className="value amount">₹{selectedBooking.total_amount}</span>
                </div>
              </div>

              <div className="modal-actions">
                {selectedBooking.status?.toLowerCase() !== "cancelled" &&
                  selectedBooking.status?.toLowerCase() !== "completed" && (
                    <button
                      className="cancel-btn"
                      onClick={() => {
                        handleCancelBooking(selectedBooking.id);
                        setSelectedBooking(null);
                      }}
                    >
                      ✕ Cancel Booking
                    </button>
                  )}
                <button
                  className="close-btn"
                  onClick={() => setSelectedBooking(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
