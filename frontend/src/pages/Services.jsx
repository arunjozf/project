import React from "react";
import "../styles/Services.css";

const Services = () => {
  const services = [
    {
      id: 1,
      icon: "🚗",
      title: "Self Drive",
      description:
        "Drive yourself and explore at your own pace. Perfect for road trips and adventures.",
      details: [
        "24/7 Roadside Assistance",
        "GPS Navigation",
        "Insurance Included",
      ],
    },
    {
      id: 2,
      icon: "👨‍💼",
      title: "Driver Provided",
      description:
        "Sit back and relax with our professional drivers. Perfect for business travel.",
      details: [
        "Professional Drivers",
        "Flexible Hours",
        "Premium Comfort",
      ],
    },
    {
      id: 3,
      icon: "💰",
      title: "Corporate Lease",
      description:
        "Long-term vehicle leasing solutions for your business needs.",
      details: [
        "Flexible Terms",
        "Maintenance Included",
        "Tax Benefits",
      ],
    },
    {
      id: 4,
      icon: "🎉",
      title: "Special Events",
      description:
        "Premium vehicles for weddings, parties, and special occasions.",
      details: [
        "Luxury Options",
        "Decoration Services",
        "Professional Drivers",
      ],
    },
    {
      id: 5,
      icon: "✈️",
      title: "Airport Transfer",
      description:
        "Hassle-free pickup and drop-off service at major airports.",
      details: [
        "On-Time Guarantee",
        "Flight Tracking",
        "Luggage Assistance",
      ],
    },
    {
      id: 6,
      icon: "🌍",
      title: "Intercity Trips",
      description: "Comfortable long-distance travel between cities.",
      details: [
        "Premium Comfort",
        "Rest Stops Included",
        "Affordable Rates",
      ],
    },
  ];

  return (
    <section className="services-section">
      <div className="services-header">
        <h1>Our Premium Services</h1>
        <p>Choose from our wide range of rental services</p>
      </div>

      <div className="services-grid">
        {services.map((service) => (
          <div key={service.id} className="service-card">
            <div className="service-icon-wrapper">
              <div className="service-icon">{service.icon}</div>
            </div>
            <h3>{service.title}</h3>
            <p>{service.description}</p>
            <ul className="service-details">
              {service.details.map((detail, idx) => (
                <li key={idx}>✓ {detail}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Services;
