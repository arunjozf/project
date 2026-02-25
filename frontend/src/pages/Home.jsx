import React from "react";
import LocalCars from "./LocalCars";
import "../styles/Home.css";

const Home = ({ user, onLogout, onBookNow, onNavigate, onBookingCarType, onLogin, onRegister, onRoleSelect }) => {
  return (
    <>
      {/* Hero Section with Background */}
      <section className="hero">
        <div className="hero-overlay">
          <h1>Drive Your Dream Car Today</h1>
          <p>Experience luxury and adventure with our premium fleet of vehicles. From sports cars to SUVs, we have the perfect ride for every occasion.</p>
          <div className="hero-highlights">
            <div className="highlight">
              <span className="highlight-icon">⭐</span>
              <span>Premium Quality</span>
            </div>
            <div className="highlight">
              <span className="highlight-icon">💰</span>
              <span>Best Prices</span>
            </div>
            <div className="highlight">
              <span className="highlight-icon">🚚</span>
              <span>Free Delivery</span>
            </div>
          </div>
          <div className="cta-buttons">
            <button className="btn-secondary" onClick={onBookNow}>Book Now</button>
          </div>
        </div>

        <div className="hero-wave">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
            <path fill="var(--white)" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </section>

      {/* Featured Image Section */}
      <section className="featured-image-section">
        <div className="featured-image-container">
          <img
            src="/images/hero-car.jpg"
            alt="Premium car showcase"
            className="featured-image"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <div className="featured-overlay">
            <div className="featured-car-showcase">
              <img
                src="/images/background.jpg"
                alt="Featured luxury car"
                className="featured-car-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
            <h2>Premium Luxury Fleet</h2>
            <p>Experience the finest in automotive excellence</p>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="services">
        <div className="section-header">
          <h2>Our Premium Services</h2>
          <p>Choose from our wide range of premium rental services</p>
        </div>

        <div className="service-grid">
          <div className="service-card">
            <div className="service-icon-wrapper">
              <img
                src="/images/self-drive.jpg"
                alt="Self Drive Service"
                className="service-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'block';
                }}
              />
              <div className="service-icon" style={{ display: 'none' }}>🚗</div>
            </div>
            <h3>Self Drive</h3>
            <p>Take control with our premium self-drive cars. Perfect for road trips and daily commutes.</p>
            <span className="service-tag">Popular</span>
          </div>

          <div className="service-card">
            <div className="service-icon-wrapper">
              <img
                src="/images/chauffeur.jpg"
                alt="Chauffeur Service"
                className="service-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'block';
                }}
              />
              <div className="service-icon" style={{ display: 'none' }}>🧑‍✈️</div>
            </div>
            <h3>Chauffeur Service</h3>
            <p>Professional drivers for a luxurious, stress-free travel experience.</p>
            <span className="service-tag">Luxury</span>
          </div>

          <div className="service-card">
            <div className="service-icon-wrapper">
              <img
                src="/images/wedding-cars.jpg"
                alt="Wedding Cars"
                className="service-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'block';
                }}
              />
              <div className="service-icon" style={{ display: 'none' }}>💍</div>
            </div>
            <h3>Wedding Cars</h3>
            <p>Make your special day unforgettable with our luxury wedding car collection.</p>
            <span className="service-tag">Special</span>
          </div>

          <div className="service-card">
            <div className="service-icon-wrapper">
              <img
                src="/images/corporate.jpg"
                alt="Corporate Rental"
                className="service-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'block';
                }}
              />
              <div className="service-icon" style={{ display: 'none' }}>🏢</div>
            </div>
            <h3>Corporate Rental</h3>
            <p>Premium vehicles for business meetings and corporate events.</p>
            <span className="service-tag">Business</span>
          </div>
        </div>
      </section>

      {/* Car Listings */}
      <section className="car-listings">
        <div className="section-header">
          <h2>Featured Luxury Cars</h2>
          <p>Choose from our collection of premium vehicles</p>
        </div>
        <div className="car-grid">
          <div className="car-card">
            <div className="car-image">
              <img
                src="/images/mercedes.jpg"
                alt="Mercedes-Benz S-Class"
                className="car-image-img"
              />
              <div className="car-type">Luxury Sedan</div>
              <div className="car-rating">⭐ 4.9</div>
            </div>
            <div className="car-info">
              <div className="car-header">
                <h3>Mercedes-Benz S-Class</h3>
                <div className="car-tag">Popular</div>
              </div>
              <div className="car-specs">
                <span><i className="spec-icon">⚡</i> Automatic</span>
                <span><i className="spec-icon">👥</i> 5 Seats</span>
                <span><i className="spec-icon">⛽</i> Petrol</span>
              </div>
              <div className="car-footer">
                <div className="car-price">
                  <span className="price">$299</span>
                  <span className="period">/day</span>
                </div>
                <button className="book-btn" onClick={() => onBookingCarType ? onBookingCarType('premium') : onBookNow()}>Book Now</button>
              </div>
            </div>
          </div>

          <div className="car-card">
            <div className="car-image">
              <img
                src="/images/Bmwx7.jpg"
                alt="BMW M8 Competition"
                className="car-image-img"
              />
              <div className="car-type">Sports Car</div>
              <div className="car-rating">⭐ 4.8</div>
            </div>
            <div className="car-info">
              <div className="car-header">
                <h3>BMW M8 Competition</h3>
                <div className="car-tag">Fast</div>
              </div>
              <div className="car-specs">
                <span><i className="spec-icon">⚡</i> Automatic</span>
                <span><i className="spec-icon">👥</i> 4 Seats</span>
                <span><i className="spec-icon">⛽</i> Petrol</span>
              </div>
              <div className="car-footer">
                <div className="car-price">
                  <span className="price">$399</span>
                  <span className="period">/day</span>
                </div>
                <button className="book-btn" onClick={() => onBookingCarType ? onBookingCarType('premium') : onBookNow()}>Book Now</button>
              </div>
            </div>
          </div>

          <div className="car-card">
            <div className="car-image">
              <img
                src="/images/range-rover.jpg"
                alt="Range Rover Velar"
                className="car-image-img"
              />
              <div className="car-type">Premium SUV</div>
              <div className="car-rating">⭐ 4.7</div>
            </div>
            <div className="car-info">
              <div className="car-header">
                <h3>Range Rover Velar</h3>
                <div className="car-tag">Family</div>
              </div>
              <div className="car-specs">
                <span><i className="spec-icon">⚡</i> Automatic</span>
                <span><i className="spec-icon">👥</i> 5 Seats</span>
                <span><i className="spec-icon">⛽</i> Diesel</span>
              </div>
              <div className="car-footer">
                <div className="car-price">
                  <span className="price">$349</span>
                  <span className="period">/day</span>
                </div>
                <button className="book-btn" onClick={() => onBookingCarType ? onBookingCarType('premium') : onBookNow()}>Book Now</button>
              </div>
            </div>
          </div>

          <div className="car-card">
            <div className="car-image">
              <img
                src="/images/tesla.jpg"
                alt="Tesla Model X"
                className="car-image-img"
              />
              <div className="car-type">Electric SUV</div>
              <div className="car-rating">⭐ 4.9</div>
            </div>
            <div className="car-info">
              <div className="car-header">
                <h3>Tesla Model X</h3>
                <div className="car-tag">Eco</div>
              </div>
              <div className="car-specs">
                <span><i className="spec-icon">⚡</i> Automatic</span>
                <span><i className="spec-icon">👥</i> 7 Seats</span>
                <span><i className="spec-icon">🔋</i> Electric</span>
              </div>
              <div className="car-footer">
                <div className="car-price">
                  <span className="price">$379</span>
                  <span className="period">/day</span>
                </div>
                {user ? (
                  <button className="book-btn" onClick={() => onBookingCarType ? onBookingCarType('premium') : onBookNow()}>Book Now</button>
                ) : (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="book-btn" onClick={onRegister} style={{ flex: 1 }}>Register</button>
                    <button className="book-btn" onClick={onLogin} style={{ flex: 1 }}>Login</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <LocalCars onBookNow={onBookNow} onBookingCarType={onBookingCarType} />

      {/* Features Section */}
      <section className="features">
        <div className="section-header">
          <h2>Why Choose CarRent</h2>
          <p>Experience the difference with our premium service</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">⭐</div>
            <h3>Premium Quality</h3>
            <p>Only well-maintained, latest model cars with regular inspections</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💰</div>
            <h3>Best Prices</h3>
            <p>Competitive rates with no hidden charges and flexible packages</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🛡️</div>
            <h3>Full Insurance</h3>
            <p>Comprehensive coverage included for complete peace of mind</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Easy Booking</h3>
            <p>Book in 3 easy steps - Select, Confirm, and Drive</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🚚</div>
            <h3>Free Delivery</h3>
            <p>We deliver your car to your doorstep at no extra cost</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📞</div>
            <h3>24/7 Support</h3>
            <p>Round-the-clock customer support for all your needs</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready for Your Next Adventure?</h2>
          <p>Book your dream car today and experience luxury on wheels</p>
          <button className="cta-btn" onClick={onBookNow}>Start Your Journey</button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-logo">CarRent</div>
            <p>Premium car rental service providing luxury vehicles since 2010</p>
            <div className="social-icons">
              <span className="social-icon">📘</span>
              <span className="social-icon">📷</span>
              <span className="social-icon">🐦</span>
              <span className="social-icon">📱</span>
            </div>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <a href="#">Home</a>
            <a href="#">Our Fleet</a>
            <a href="#">Services</a>
            <a href="#">About Us</a>
            <a href="#">Contact</a>
          </div>
          <div className="footer-section">
            <h4>Contact Us</h4>
            <p><span className="contact-icon">📍</span> 123 Premium Street, Luxury City</p>
            <p><span className="contact-icon">📞</span> +1 (555) 123-4567</p>
            <p><span className="contact-icon">✉️</span> info@carrent.com</p>
          </div>
          <div className="footer-section">
            <h4>Newsletter</h4>
            <p>Subscribe for exclusive deals</p>
            <div className="newsletter">
              <input type="email" placeholder="Your email" />
              <button>Subscribe</button>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 CarRent. All Rights Reserved. | <a href="#">Privacy Policy</a> | <a href="#">Terms of Service</a></p>
        </div>
      </footer>
    </>
  );
};

export default Home;