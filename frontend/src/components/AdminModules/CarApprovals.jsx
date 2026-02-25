import React, { useState, useEffect } from 'react';
import '../../styles/AdminModules.css';

const CarApprovals = () => {
  const [pendingCars, setPendingCars] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPendingCars();
  }, []);

  const fetchPendingCars = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:8000/api/bookings/admin/cars/pending/', {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPendingCars(data);
      }
    } catch (error) {
      console.error('[CarApprovals] Error fetching pending cars:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveCar = async (carId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `http://localhost:8000/api/bookings/admin/cars/${carId}/approve/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        setPendingCars(prev => prev.filter(c => c.id !== carId));
        alert('✅ Car approved!');
      }
    } catch (error) {
      console.error('[CarApprovals] Error approving car:', error);
    }
  };

  const handleRejectCar = async (carId) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `http://localhost:8000/api/bookings/admin/cars/${carId}/reject/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ reason }),
        }
      );

      if (response.ok) {
        setPendingCars(prev => prev.filter(c => c.id !== carId));
        alert('❌ Car rejected!');
      }
    } catch (error) {
      console.error('[CarApprovals] Error rejecting car:', error);
    }
  };

  return (
    <div className="admin-module-container">
      <div className="module-header">
        <h2>✅ Car Approvals</h2>
        <span className="badge">{pendingCars.length} Pending</span>
      </div>

      {loading ? (
        <p className="loading-text">Loading pending cars...</p>
      ) : pendingCars.length === 0 ? (
        <p className="empty-text">No cars pending approval.</p>
      ) : (
        <div className="approvals-list">
          {pendingCars.map(car => (
            <div key={car.id} className="approval-card">
              <div className="approval-header">
                <h4>{car.make} {car.model} ({car.year})</h4>
                <span className="approval-badge">⏳ Pending</span>
              </div>
              <div className="approval-details">
                <div className="detail">
                  <span>Manager:</span>
                  <span>{car.manager_name}</span>
                </div>
                <div className="detail">
                  <span>Price:</span>
                  <span>₹{car.price}/day</span>
                </div>
                <div className="detail">
                  <span>Mileage:</span>
                  <span>{car.mileage} km</span>
                </div>
                <div className="detail">
                  <span>Submitted:</span>
                  <span>{new Date(car.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              {car.description && (
                <p className="approval-description">{car.description}</p>
              )}
              <div className="approval-actions">
                <button
                  className="btn btn-success"
                  onClick={() => handleApproveCar(car.id)}
                >
                  ✅ Approve
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleRejectCar(car.id)}
                >
                  ❌ Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CarApprovals;
