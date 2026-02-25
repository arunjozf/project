import React from "react";
import "../styles/Fleet.css";

const Fleet = ({ onBookNow, onBookingCarType }) => {
  const cars = [
    {
      id: 1,
      name: "Tesla Model S",
      type: "Electric Luxury Sedan",
      price: "$299/day",
      image: "/images/tesla.jpg",
      features: ["0-60 in 2.5s", "Electric", "Autopilot"],
    },
    {
      id: 2,
      name: "BMW X7",
      type: "Premium SUV",
      price: "$249/day",
      image: "/images/Bmwx7.jpg",
      features: ["7 Seater", "AWD", "Leather Interior"],
    },
    {
      id: 3,
      name: "Porsche 911",
      type: "Sports Car",
      price: "$399/day",
      image: "/images/porsche.jpg",
      features: ["V8 Engine", "0-60 in 3.8s", "Premium Sound"],
    },
    {
      id: 4,
      name: "Mercedes Benz E-Class",
      type: "Luxury Sedan",
      price: "$279/day",
      image: "/images/mercedes.jpg",
      features: ["AIRMATIC Suspension", "Touchpad", "9-Speed"],
    },
    {
      id: 5,
      name: "Range Rover",
      type: "Luxury SUV",
      price: "$329/day",
      image: "/images/range-rover.jpg",
      features: ["All-Terrain", "Panoramic Roof", "Premium Package"],
    },
    {
      id: 6,
      name: "Audi A8",
      type: "Executive Sedan",
      price: "$289/day",
      image: "/images/audi.jpg",
      features: ["Quad-Zone Climate", "Bang & Olufsen", "Matrix LED"],
    },
    {
      id: 7,
      name: "Lamborghini Huracán",
      type: "Supercar",
      price: "$599/day",
      image: "/images/lamborghini.jpg",
      features: ["0-60 in 2.6s", "V10 Engine", "Top Speed 221 mph"],
    },
    {
      id: 8,
      name: "Rolls Royce Phantom",
      type: "Ultra-Luxury Sedan",
      price: "$799/day",
      image: "/images/rolls-royce.jpg",
      features: ["Bespoke Interior", "Starlight Ceiling", "Premium Chauffeur"],
    },
    ,
  ];

  return (
    <section className="fleet-section">
      <div className="fleet-header">
        <h1>Our Premium Fleet</h1>
        <p>Explore our collection of luxury vehicles</p>
      </div>

      <div className="fleet-grid">
        {cars.map((car) => (
          <div key={car.id} className="fleet-card">
            <div className="fleet-image">
              <img src={car.image} alt={car.name} />
            </div>
            <div className="fleet-content">
              <h3>{car.name}</h3>
              <p className="fleet-type">{car.type}</p>
              <div className="fleet-features">
                {car.features.map((feature, idx) => (
                  <span key={idx} className="feature-badge">
                    {feature}
                  </span>
                ))}
              </div>
              <div className="fleet-footer">
                <span className="fleet-price">{car.price}</span>
                <button 
                  className="fleet-book-btn" 
                  onClick={() => onBookingCarType ? onBookingCarType('premium') : onBookNow()}
                >
                  Book
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Fleet;
