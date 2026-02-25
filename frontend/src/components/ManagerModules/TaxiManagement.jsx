import React, { useState, useEffect } from 'react';
import { getToken } from '../../utils/api';
import '../../styles/ManagerModules.css';

const TaxiManagement = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTaxiRides();
  }, []);

  const fetchTaxiRides = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getToken();
      console.log('[TaxiManagement] Fetching from: http://localhost:8000/api/manager/taxi-rides/');
      console.log('[TaxiManagement] Using token:', token ? 'Present' : 'Missing');
      const response = await fetch('http://localhost:8000/api/manager/taxi-rides/', {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('[TaxiManagement] Response status:', response.status);

      if (response.ok) {
        const jsonData = await response.json();
        console.log('[TaxiManagement] Response data:', jsonData);
        // Handle both array and object response
        const ridesData = Array.isArray(jsonData) ? jsonData : (jsonData.data || []);
        setRides(ridesData);
        console.log('[TaxiManagement] Rides loaded:', ridesData.length, 'rides');
      } else {
        console.error('[TaxiManagement] Response status:', response.status);
        const errorData = await response.text();
        console.error('[TaxiManagement] Error response:', errorData);
        setError(`Failed to load taxi rides (${response.status})`);
        setRides([]);
      }
    } catch (error) {
      console.error('[TaxiManagement] Error fetching rides:', error);
      setError(`Error: ${error.message}`);
      setRides([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="module-container">
      <div className="module-header">
        <h2>🚕 Taxi Management</h2>
        <button className="btn btn-refresh" onClick={fetchTaxiRides}>
          🔄 Refresh
        </button>
      </div>

      {loading ? (
        <p className="loading-text">Loading taxi bookings...</p>
      ) : error ? (
        <div style={{
          padding: '20px',
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          color: '#721c24',
          marginBottom: '20px'
        }}>
          <strong>⚠️ Error:</strong> {error}
          <button 
            onClick={fetchTaxiRides}
            style={{
              marginTop: '10px',
              padding: '8px 16px',
              backgroundColor: '#721c24',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            🔄 Retry
          </button>
        </div>
      ) : rides.length === 0 ? (
        <p className="empty-text">No customers have booked taxi services yet.</p>
      ) : (
        <div className="rides-list">
          {rides.map(ride => {
            // Extract customer info from nested user object
            const customerName = ride.user?.first_name && ride.user?.last_name 
              ? `${ride.user.first_name} ${ride.user.last_name}`
              : ride.user?.username || 'Unknown Customer';
            const customerEmail = ride.user?.email || 'N/A';
            const customerPhone = ride.phone || 'N/A';
            
            return (
              <div key={ride.id} className="ride-card">
                <div className="ride-header">
                  <div>
                    <h4>👤 {customerName}</h4>
                    <p className="ride-id">Booking ID: #{ride.id}</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                    <span style={{
                      padding: '6px 14px',
                      borderRadius: '20px',
                      fontWeight: 'bold',
                      fontSize: '0.9rem',
                      backgroundColor: ride.status === 'pending' ? '#fff3cd' : 
                                       ride.status === 'confirmed' ? '#d4edda' : 
                                       ride.status === 'completed' ? '#d1ecf1' :
                                       '#f8d7da',
                      color: ride.status === 'pending' ? '#856404' : 
                             ride.status === 'confirmed' ? '#155724' : 
                             ride.status === 'completed' ? '#0c5460' :
                             '#721c24'
                    }}>
                      {ride.status === 'pending' && '⏳ Pending'}
                      {ride.status === 'confirmed' && '✅ Confirmed'}
                      {ride.status === 'completed' && '✅ Completed'}
                      {ride.status === 'cancelled' && '❌ Cancelled'}
                    </span>
                    <span style={{
                      fontSize: '0.75rem',
                      color: '#666',
                      fontStyle: 'italic'
                    }}>
                      On-Demand Taxi
                    </span>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="ride-details">
                  <div className="detail-row">
                    <span>📧 Email:</span>
                    <span>{customerEmail}</span>
                  </div>
                  <div className="detail-row">
                    <span>📱 Phone:</span>
                    <span>{customerPhone}</span>
                  </div>
                  
                  {/* Location Details */}
                  <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e0e0e0' }}>
                    <div className="detail-row">
                      <span>📍 Pickup Location:</span>
                      <span>{ride.pickup_location}</span>
                    </div>
                    <div className="detail-row">
                      <span>📍 Dropoff Location:</span>
                      <span>{ride.dropoff_location}</span>
                    </div>
                  </div>

                  {/* Date & Time Details */}
                  <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e0e0e0' }}>
                    <div className="detail-row">
                      <span>📅 Pickup Date:</span>
                      <span>{new Date(ride.pickup_date).toLocaleDateString()}</span>
                    </div>
                    <div className="detail-row">
                      <span>🕐 Pickup Time:</span>
                      <span>{ride.pickup_time}</span>
                    </div>
                  </div>

                  {/* Booking Details */}
                  <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e0e0e0' }}>
                    <div className="detail-row">
                      <span>📋 Duration:</span>
                      <span>{ride.number_of_days} day{ride.number_of_days !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="detail-row">
                      <span>💰 Total Amount:</span>
                      <span className="highlight">₹{ride.total_amount}</span>
                    </div>
                    <div className="detail-row">
                      <span>💳 Payment Method:</span>
                      <span>{ride.payment_method ? ride.payment_method.replace('-', ' ').toUpperCase() : 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <span>💵 Payment Status:</span>
                      <span style={{ 
                        color: ride.payment_status === 'completed' ? '#28a745' : '#ffc107',
                        fontWeight: 'bold'
                      }}>
                        {ride.payment_status ? ride.payment_status.toUpperCase() : 'PENDING'}
                      </span>
                    </div>
                  </div>

                  {/* Driver Assignment */}
                  {ride.assigned_driver && (
                    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e0e0e0', backgroundColor: '#f0f8ff', padding: '12px', borderRadius: '4px' }}>
                      <div className="detail-row">
                        <span>👨‍💼 Assigned Driver:</span>
                        <span style={{ fontWeight: 'bold' }}>
                          {ride.assigned_driver.user?.first_name || ride.assigned_driver.first_name || 'Driver'} {ride.assigned_driver.user?.last_name || ride.assigned_driver.last_name || ''}
                        </span>
                      </div>
                      {ride.assigned_driver.license_number && (
                        <div className="detail-row">
                          <span>🎫 License:</span>
                          <span>{ride.assigned_driver.license_number}</span>
                        </div>
                      )}
                      {ride.assigned_driver.experience_years && (
                        <div className="detail-row">
                          <span>📊 Experience:</span>
                          <span>{ride.assigned_driver.experience_years} years</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}


    </div>
  );
};

export default TaxiManagement;
