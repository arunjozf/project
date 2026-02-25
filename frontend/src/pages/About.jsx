import React from "react";
import "../styles/About.css";

const About = () => {
  return (
    <section className="about-section">
      <div className="about-container">
        <div className="about-header">
          <h1>About AutoNexus</h1>
          <p>Leading Premium Car Rental Service</p>
        </div>

        <div className="about-content">
          <div className="about-block">
            <h2>Who We Are</h2>
            <p>
              AutoNexus is a premium car rental service dedicated to providing
              exceptional driving experiences. With over 10 years in the
              industry, we've built a reputation for luxury, reliability, and
              customer satisfaction.
            </p>
          </div>

          <div className="about-block">
            <h2>Our Mission</h2>
            <p>
              To make premium car rental accessible and convenient for everyone.
              We believe that luxury should be affordable, and every journey
              should be memorable. Our mission is to exceed expectations at
              every touchpoint.
            </p>
          </div>

          <div className="about-block">
            <h2>Why Choose Us?</h2>
            <ul className="about-list">
              <li>✓ Premium Fleet of Luxury Vehicles</li>
              <li>✓ Competitive Pricing</li>
              <li>✓ 24/7 Customer Support</li>
              <li>✓ Insurance & Roadside Assistance Included</li>
              <li>✓ Flexible Rental Terms</li>
              <li>✓ Professional & Courteous Staff</li>
            </ul>
          </div>

          <div className="about-stats">
            <div className="stat">
              <h3>500+</h3>
              <p>Happy Customers</p>
            </div>
            <div className="stat">
              <h3>200+</h3>
              <p>Premium Vehicles</p>
            </div>
            <div className="stat">
              <h3>10+</h3>
              <p>Years Experience</p>
            </div>
            <div className="stat">
              <h3>24/7</h3>
              <p>Customer Support</p>
            </div>
          </div>

          <div className="about-block">
            <h2>Our Values</h2>
            <div className="values-grid">
              <div className="value-item">
                <h4>Excellence</h4>
                <p>We strive for excellence in every service we provide</p>
              </div>
              <div className="value-item">
                <h4>Integrity</h4>
                <p>Honest and transparent dealings with all our clients</p>
              </div>
              <div className="value-item">
                <h4>Innovation</h4>
                <p>Constantly improving our services and fleet</p>
              </div>
              <div className="value-item">
                <h4>Customer Focus</h4>
                <p>Your satisfaction is our top priority</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
