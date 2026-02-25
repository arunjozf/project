import React from "react";
import "../styles/LocalCars.css";

const LocalCars = ({ onBookNow, onBookingCarType }) => {
  const localCars = [
    {
      id: 1,
      name: "Maruti Swift",
      description: "Compact and fuel-efficient sedan",
      type: "Budget",
      price: "$49/day",
      image: "/images/swift.jpg",
      specs: ["⚡ Manual/Auto", "👥 5 Seats"],
    },
    {
      id: 2,
      name: "Maruti Wagon R",
      description: "Spacious hatchback for families",
      type: "Budget",
      price: "$59/day",
      image: "/images/wagon-r.jpg",
      specs: ["⚡ Manual/Auto", "👥 5 Seats"],
    },
    {
      id: 3,
      name: "Maruti Alto",
      description: "Ultra-compact city car",
      type: "Economy",
      price: "$39/day",
      image: "/images/alto.jpg",
      specs: ["⚡ Manual", "👥 4 Seats"],
    },
    {
      id: 4,
      name: "Hyundai i20",
      description: "Modern economy hatchback",
      type: "Budget",
      price: "$45/day",
      image: "/images/i10.jpg",
      specs: ["⚡ Manual/Auto", "👥 5 Seats"],
    },
    {
      id: 5,
      name: "Tata Nexon",
      description: "Affordable compact SUV",
      type: "Compact SUV",
      price: "$69/day",
      image: "/images/tata-nexon.jpg",
      specs: ["⚡ Manual/Auto", "👥 5 Seats"],
    },
    {
      id: 6,
      name: "Hyundai Creta",
      description: "Stylish compact SUV with features",
      type: "Compact SUV",
      price: "$79/day",
      image: "/images/creta.jpg",
      specs: ["⚡ Manual/Auto", "👥 5 Seats"],
    },
    {
      id: 7,
      name: "Toyota Innova Crysta",
      description: "Spacious 7-seater family SUV",
      type: "Family SUV",
      price: "$99/day",
      image: "/images/innova.jpg",
      specs: ["⚡ Manual/Auto", "👥 7 Seats"],
    },
    {
      id: 8,
      name: "Ertiga",
      description: "Premium 7-seater MPV for families",
      type: "Family MPV",
      price: "$109/day",
      image: "/images/ertiga.jpg",
      specs: ["⚡ Manual/Auto", "👥 7 Seats"],
    },
  ];

  return (
    <section className="local-cars">
      <div className="local-cars-header">
        <h1>Affordable Local Cars</h1>
        <p>Budget-friendly options for daily commuting and short trips</p>
      </div>

      <div className="local-cars-grid">
        {localCars.map((car) => (
          <div key={car.id} className="local-car-card">
            <div className="local-car-image">
              <img 
                src={car.image} 
                alt={car.name} 
                className="local-car-img"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <div className="local-car-type">{car.type}</div>
            </div>
            <div className="local-car-info">
              <h3>{car.name}</h3>
              <p className="local-car-desc">{car.description}</p>
              <div className="local-car-specs">
                {car.specs.map((spec, idx) => (
                  <span key={idx}>{spec}</span>
                ))}
              </div>
              <div className="local-car-footer">
                <span className="local-car-price">{car.price}</span>
                <button 
                  className="local-book-btn" 
                  onClick={() => onBookingCarType ? onBookingCarType('local') : onBookNow()}
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

export default LocalCars;
