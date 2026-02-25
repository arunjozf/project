import React from "react";
import "../styles/OnDemandTaxi.css";

const OnDemandTaxi = ({ onBookNow, onBookingCarType }) => {
  const taxiServices = [
    {
      id: 1,
      name: "Economy Taxi",
      description: "Budget-friendly option for daily commutes",
      type: "Economy",
      price: "$2/km",
      image: "/images/eco_taxi.jpg",
      specs: ["⚡ Instant Pickup", "👥 4 Seats", "🛡️ Safe & Verified Drivers"],
    },
    {
      id: 2,
      name: "Comfort Taxi",
      description: "Comfortable ride with premium features",
      type: "Comfort",
      price: "$3.50/km",
      image: "/images/comfort-taxi.jpg",
      specs: ["⚡ Quick Response", "👥 5 Seats", "📱 Real-time Tracking"],
    },
    {
      id: 3,
      name: "Premium Taxi",
      description: "Luxury ride with professional drivers",
      type: "Premium",
      price: "$5/km",
      image: "/images/premium-taxi.jpg",
      specs: ["⚡ Priority Booking", "👥 5 Seats", "🎵 Premium Music System"],
    },
    {
      id: 4,
      name: "XL Taxi",
      description: "Spacious ride for groups and families",
      type: "XL",
      price: "$6/km",
      image: "/images/xl-taxi.jpg",
      specs: ["⚡ Group Friendly", "👥 7 Seats", "🧳 Large Luggage Space"],
    },
    {
      id: 5,
      name: "Executive Cab",
      description: "High-end luxury for business travel",
      type: "Executive",
      price: "$8/km",
      image: "/images/executive-cab.jpg",
      specs: ["⚡ VIP Service", "👥 5 Seats", "💼 Complimentary WiFi"],
    },
    {
      id: 6,
      name: "Airport Transfer",
      description: "Reliable service for airport trips",
      type: "Airport",
      price: "$40 Flat Rate",
      image: "/images/airport-transfer.jpg",
      specs: ["⚡ Fixed Pricing", "👥 4-7 Seats", "✈️ 24/7 Available"],
    },
    {
      id: 7,
      name: "Luxury SUV Taxi",
      description: "Premium SUV for style and comfort",
      type: "Luxury",
      price: "$10/km",
      image: "/images/luxury-suv-taxi.jpg",
      specs: ["⚡ Premium Experience", "👥 5 Seats", "🌟 High-end Features"],
    },
    {
      id: 8,
      name: "Outstation Cab",
      description: "Long-distance inter-city travel",
      type: "Outstation",
      price: "$1.50/km",
      image: "/images/outstation-cab.jpg",
      specs: ["⚡ Long Journey", "👥 4 Seats", "🛣️ Highway Safe"],
    },
  ];

  return (
    <section className="on-demand-taxi">
      <div className="taxi-header">
        <h1>On-Demand Taxi Service</h1>
        <p>Quick, reliable, and affordable rides anytime, anywhere</p>
      </div>

      <div className="taxi-features-highlight">
        <div className="feature-highlight">
          <div className="feature-icon">⚡</div>
          <h3>Instant Booking</h3>
          <p>Get a ride in minutes</p>
        </div>
        <div className="feature-highlight">
          <div className="feature-icon">🛡️</div>
          <h3>Safe & Secure</h3>
          <p>Verified drivers & vehicles</p>
        </div>
        <div className="feature-highlight">
          <div className="feature-icon">💰</div>
          <h3>Transparent Pricing</h3>
          <p>No hidden charges</p>
        </div>
        <div className="feature-highlight">
          <div className="feature-icon">📱</div>
          <h3>Real-time Tracking</h3>
          <p>Live location updates</p>
        </div>
      </div>

      <div className="taxi-services-grid">
        {taxiServices.map((service) => (
          <div key={service.id} className="taxi-card">
            <div className="taxi-image">
              <img 
                src={service.image} 
                alt={service.name} 
                className="taxi-img"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <div className="taxi-type">{service.type}</div>
            </div>
            <div className="taxi-info">
              <h3>{service.name}</h3>
              <p className="taxi-desc">{service.description}</p>
              <div className="taxi-specs">
                {service.specs.map((spec, idx) => (
                  <span key={idx}>{spec}</span>
                ))}
              </div>
              <div className="taxi-footer">
                <span className="taxi-price">{service.price}</span>
                <button 
                  className="taxi-book-btn" 
                  onClick={() => onBookingCarType ? onBookingCarType('taxi') : onBookNow()}
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="taxi-how-it-works">
        <h2>How It Works</h2>
        <div className="steps-grid">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Open App</h3>
            <p>Launch the AutoNexus app and sign in</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Set Location</h3>
            <p>Enter your pickup and drop-off points</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Choose Service</h3>
            <p>Select your preferred taxi type</p>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <h3>Confirm Booking</h3>
            <p>Review fare and confirm your ride</p>
          </div>
          <div className="step">
            <div className="step-number">5</div>
            <h3>Track Driver</h3>
            <p>See your driver's location in real-time</p>
          </div>
          <div className="step">
            <div className="step-number">6</div>
            <h3>Enjoy Ride</h3>
            <p>Sit back and enjoy your journey</p>
          </div>
        </div>
      </div>

      <div className="taxi-safety-features">
        <h2>Safety & Security</h2>
        <div className="safety-grid">
          <div className="safety-item">
            <div className="safety-icon">🛡️</div>
            <h3>Verified Drivers</h3>
            <p>All drivers undergo thorough background checks and verification</p>
          </div>
          <div className="safety-item">
            <div className="safety-icon">📱</div>
            <h3>Real-time Tracking</h3>
            <p>Share your ride details with family and friends for added safety</p>
          </div>
          <div className="safety-item">
            <div className="safety-icon">🚨</div>
            <h3>SOS Button</h3>
            <p>Quick access to emergency services directly from the app</p>
          </div>
          <div className="safety-item">
            <div className="safety-icon">⭐</div>
            <h3>Driver Ratings</h3>
            <p>Rate and review drivers to maintain service quality</p>
          </div>
        </div>
      </div>

      <div className="taxi-payment-methods">
        <h2>Payment Methods</h2>
        <div className="payment-options">
          <div className="payment-option">
            <span className="payment-icon">💳</span>
            <h3>Credit/Debit Card</h3>
          </div>
          <div className="payment-option">
            <span className="payment-icon">📱</span>
            <h3>Digital Wallets</h3>
          </div>
          <div className="payment-option">
            <span className="payment-icon">💰</span>
            <h3>Cash Payment</h3>
          </div>
          <div className="payment-option">
            <span className="payment-icon">🏦</span>
            <h3>UPI Transfer</h3>
          </div>
          <div className="payment-option">
            <span className="payment-icon">🎟️</span>
            <h3>Promo Codes</h3>
          </div>
          <div className="payment-option">
            <span className="payment-icon">👛</span>
            <h3>Wallet Balance</h3>
          </div>
        </div>
      </div>

      <div className="taxi-testimonials">
        <h2>What Our Customers Say</h2>
        <div className="testimonials-grid">
          <div className="testimonial">
            <div className="stars">⭐⭐⭐⭐⭐</div>
            <p className="testimonial-text">"Amazing service! Drivers are professional and rides are always on time. Highly recommended!"</p>
            <p className="testimonial-author">- Sarah M.</p>
          </div>
          <div className="testimonial">
            <div className="stars">⭐⭐⭐⭐⭐</div>
            <p className="testimonial-text">"Great app experience. Booking is super easy and the prices are very competitive. Best taxi service!"</p>
            <p className="testimonial-author">- John D.</p>
          </div>
          <div className="testimonial">
            <div className="stars">⭐⭐⭐⭐⭐</div>
            <p className="testimonial-text">"Used it for airport transfer and everything was perfect. Clean car, safe driver, on-time arrival. Worth every penny!"</p>
            <p className="testimonial-author">- Emma K.</p>
          </div>
        </div>
      </div>

      <div className="taxi-benefits">
        <h2>Why Choose AutoNexus Taxi?</h2>
        <div className="benefits-list">
          <div className="benefit-item">
            <h3>✓ 24/7 Availability</h3>
            <p>Book a ride anytime, anywhere in the city</p>
          </div>
          <div className="benefit-item">
            <h3>✓ Affordable Pricing</h3>
            <p>Transparent fares with no hidden charges</p>
          </div>
          <div className="benefit-item">
            <h3>✓ Professional Drivers</h3>
            <p>Experienced and courteous drivers for a pleasant ride</p>
          </div>
          <div className="benefit-item">
            <h3>✓ Clean Vehicles</h3>
            <p>Well-maintained and hygienic cars for your comfort</p>
          </div>
          <div className="benefit-item">
            <h3>✓ Quick Response</h3>
            <p>Average pickup time of 5 minutes or less</p>
          </div>
          <div className="benefit-item">
            <h3>✓ Insurance Coverage</h3>
            <p>Complete insurance coverage for every ride</p>
          </div>
        </div>
      </div>

      <div className="taxi-cta">
        <h2>Ready for Your Next Ride?</h2>
        <p>Download the AutoNexus app or book now through our website</p>
        <button 
          className="taxi-cta-btn" 
          onClick={() => onBookingCarType ? onBookingCarType('taxi') : onBookNow()}
        >
          Book a Ride Now
        </button>
      </div>
    </section>
  );
};

export default OnDemandTaxi;
