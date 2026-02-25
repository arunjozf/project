import React, { useState, useEffect } from 'react';
import './BookingsManagement.css';
import { bookingAPI, getToken } from '../../utils/api';

const BookingsManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch bookings and drivers on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = getToken();
        
        // Fetch all bookings
        const bookingsResponse = await bookingAPI.getAllBookings(token);
        const bookingsData = bookingsResponse.results || bookingsResponse.data || [];
        
        // Format bookings data for the component
        const formattedBookings = bookingsData.map((booking) => {
          const pickupDate = new Date(booking.pickup_date);
          const bookingDate = pickupDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          });
          const bookingTime = booking.pickup_time || '10:00 AM';
          
          return {
            id: booking.id,
            bookingNo: `BK${String(booking.id).padStart(4, '0')}`,
            customer: booking.user?.first_name + ' ' + booking.user?.last_name,
            phone: booking.user?.phone || 'N/A',
            pickupLocation: booking.pickup_location,
            dropoffLocation: booking.dropoff_location,
            driver: booking.assigned_driver?.name || 'Not Assigned',
            vehicle: booking.car_type || 'Standard',
            bookingType: booking.booking_type || 'standard',
            driverOption: booking.driver_option || 'with-driver',
            status: booking.status ? booking.status.charAt(0).toUpperCase() + booking.status.slice(1) : 'Pending',
            amount: `$${(booking.total_amount || 0).toFixed(2)}`,
            date: bookingDate,
            time: bookingTime,
            pickupDateObj: pickupDate,
          };
        });
        
        setBookings(formattedBookings);
        
        // Fetch available drivers with the first booking's pickup date
        // If no bookings, use today's date
        let pickupDateStr = new Date().toISOString().split('T')[0];
        if (bookingsData.length > 0) {
          const firstBooking = bookingsData[0];
          pickupDateStr = firstBooking.pickup_date;
        }
        
        const driversResponse = await bookingAPI.getAvailableDrivers(token, pickupDateStr);
        const driversData = driversResponse.data || driversResponse.results || [];
        
        // Format drivers data
        const formattedDrivers = driversData.map((driver) => ({
          id: driver.id,
          name: driver.name || driver.user?.first_name + ' ' + driver.user?.last_name,
          license: driver.license_number || 'N/A',
          experience: driver.experience_years || 0,
          rating: driver.average_rating || 0,
          trips: driver.total_trips || 0,
          phone: driver.user?.phone || 'N/A',
        }));
        
        setAvailableDrivers(formattedDrivers);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [expandedBookingId, setExpandedBookingId] = useState(null);
  const [assignmentSuccess, setAssignmentSuccess] = useState(false);

  const handleViewDetails = (booking) => {
    console.log('Opening details modal for booking:', booking);
    setSelectedBooking(booking);
    setShowModal(true);
    setExpandedBookingId(booking.id);
  };

  const handleCardClick = (booking) => {
    console.log('Card clicked:', booking);
    handleViewDetails(booking);
  };

  const handleAssignDriver = (booking) => {
    console.log('Opening assign driver modal for booking:', booking);
    setSelectedBooking(booking);
    setSelectedDriver(null);
    setShowAssignModal(true);
  };

  const handleConfirmAssignment = async () => {
    if (!selectedDriver) {
      alert('Please select a driver');
      return;
    }

    try {
      const token = getToken();
      
      // Call backend API to assign driver
      const response = await bookingAPI.assignDriver(
        selectedBooking.id,
        selectedDriver.id,
        token
      );

      // Update the booking with the selected driver
      setBookings(
        bookings.map((b) =>
          b.id === selectedBooking.id
            ? { ...b, driver: selectedDriver.name }
            : b
        )
      );

      // Update selected booking
      setSelectedBooking({
        ...selectedBooking,
        driver: selectedDriver.name
      });

      // Show success message
      setAssignmentSuccess(true);

      // Close the modal after success
      setTimeout(() => {
        setShowAssignModal(false);
        setSelectedBooking(null);
        setSelectedDriver(null);
        setAssignmentSuccess(false);
      }, 1500);

    } catch (error) {
      console.error('Error assigning driver:', error);
      alert('Failed to assign driver: ' + (error.message || 'Unknown error'));
    }
  };

  const handleStatusChange = (bookingId, newStatus) => {
    setBookings(
      bookings.map((b) =>
        b.id === bookingId ? { ...b, status: newStatus } : b
      )
    );
  };

  const handleDeleteBooking = (bookingId) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      setBookings(bookings.filter((b) => b.id !== bookingId));
    }
  };

  return (
    <div className="bookings-management">
      <div className="management-header">
        <h2>Booking Management</h2>
        <button className="btn btn-primary">+ New Booking</button>
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
          <p>⏳ Loading bookings and drivers...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div style={{ 
          padding: '15px', 
          backgroundColor: '#ffebee', 
          borderLeft: '4px solid #f44336',
          color: '#c62828',
          marginBottom: '20px',
          borderRadius: '4px'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {!loading && (
        <>
          <div className="pending-drivers-section">
        <div className="section-header">
          <h3>⚠️ Pending Driver Assignments</h3>
          <span className="badge-count">{bookings.filter(b => b.driver === 'Not Assigned').length}</span>
        </div>
        <div className="pending-drivers-list">
          {bookings.filter(b => b.driver === 'Not Assigned').length === 0 ? (
            <div className="empty-state">
              <p>✓ All bookings have drivers assigned!</p>
            </div>
          ) : (
            bookings.filter(b => b.driver === 'Not Assigned').map((booking) => (
              <div key={booking.id} className="pending-booking-card">
                <div className="card-header">
                  <span className="booking-id">{booking.bookingNo}</span>
                  <span className="customer-name">{booking.customer}</span>
                  <span className="trip-date">{booking.date}</span>
                </div>
                <div className="card-details">
                  <p><strong>Pickup:</strong> {booking.pickupLocation}</p>
                  <p><strong>Dropoff:</strong> {booking.dropoffLocation}</p>
                  <p><strong>Time:</strong> {booking.time}</p>
                  <p><strong>Vehicle:</strong> {booking.vehicle}</p>
                  <p><strong>Phone:</strong> {booking.phone}</p>
                </div>
                <div className="card-actions">
                  <button className="btn btn-assign" onClick={() => handleAssignDriver(booking)}>Assign Driver</button>
                  <button className="btn btn-view-details" onClick={() => handleViewDetails(booking)}>View Details</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="taxi-bookings-section">
        <div className="section-header">
          <h3>🚕 On-Demand Taxi Requests</h3>
          <span className="badge-count">{bookings.filter(b => b.bookingType === 'taxi').length}</span>
        </div>
        <div className="taxi-bookings-list">
          {bookings.filter(b => b.bookingType === 'taxi').length === 0 ? (
            <div className="empty-state">
              <p>No on-demand taxi requests at the moment.</p>
            </div>
          ) : (
            bookings.filter(b => b.bookingType === 'taxi').map((booking) => (
              <div 
                key={booking.id} 
                className="taxi-booking-card"
                onClick={() => handleCardClick(booking)}
                style={{ cursor: 'pointer' }}
              >
                <div className="card-header">
                  <span className="booking-id">{booking.bookingNo}</span>
                  <span className="customer-name">{booking.customer}</span>
                  <span className="trip-date">{booking.date}</span>
                  <span className={`booking-status ${booking.status.toLowerCase().replace(' ', '-')}`}>
                    {booking.status}
                  </span>
                </div>
                <div className="card-details">
                  <p><strong>From:</strong> {booking.pickupLocation}</p>
                  <p><strong>To:</strong> {booking.dropoffLocation}</p>
                  <p><strong>Time:</strong> {booking.time}</p>
                  <p><strong>Driver Assigned:</strong> <span style={{ color: booking.driver === 'Not Assigned' ? '#f44336' : '#4caf50', fontWeight: '600' }}>{booking.driver}</span></p>
                  <p><strong>Phone:</strong> {booking.phone}</p>
                  <p style={{ color: '#666', fontSize: '0.85rem', marginTop: '8px' }}>💡 Click card to view full details</p>
                </div>
                <div className="card-actions">
                  {booking.driver === 'Not Assigned' && (
                    <button 
                      className="btn btn-assign" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAssignDriver(booking);
                      }}
                    >
                      Assign Driver
                    </button>
                  )}
                  <button 
                    className="btn btn-view-details" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDetails(booking);
                    }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Search by booking no., customer, or phone..."
          className="search-input"
        />
        <select className="filter-select">
          <option value="">All Status</option>
          <option value="Scheduled">Scheduled</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      <div className="bookings-table-container">
        <h3 style={{ marginBottom: '15px' }}>📋 Taxi Customers List</h3>
        <table className="bookings-table">
          <thead>
            <tr>
              <th>Booking No.</th>
              <th>Customer</th>
              <th>Phone</th>
              <th>Driver</th>
              <th>Vehicle</th>
              <th>Status</th>
              <th>Amount</th>
              <th>Date & Time</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.filter(b => b.bookingType === 'taxi').length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '30px', color: '#666' }}>
                  No taxi bookings found
                </td>
              </tr>
            ) : (
              bookings.filter(b => b.bookingType === 'taxi').map((booking) => (
                <tr key={booking.id}>
                  <td>
                    <span className="booking-no">{booking.bookingNo}</span>
                  </td>
                  <td>{booking.customer}</td>
                  <td>{booking.phone}</td>
                  <td>{booking.driver}</td>
                  <td>{booking.vehicle}</td>
                  <td>
                    <select
                      className={`status-select status-${booking.status.toLowerCase().replace(' ', '-')}`}
                      value={booking.status}
                      onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                    >
                      <option value="Scheduled">Scheduled</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>{booking.amount}</td>
                  <td>
                    <div className="date-time">
                      <div>{booking.date}</div>
                      <small>{booking.time}</small>
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-action btn-view"
                        onClick={() => handleViewDetails(booking)}
                        title="View Details"
                      >
                        👁️
                      </button>
                      <button
                        className="btn-action btn-delete"
                        onClick={() => handleDeleteBooking(booking.id)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
        </>
      )}

      {showModal && selectedBooking && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #f0f0f0' }}>
              <div>
                <h3 style={{ margin: '0 0 8px 0' }}>🚕 Taxi Booking Details</h3>
                <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>Booking #{selectedBooking.bookingNo}</p>
              </div>
              <button
                className="close-btn"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              {assignmentSuccess && (
                <div style={{ 
                  background: '#e8f5e9', 
                  border: '2px solid #4caf50',
                  color: '#2e7d32',
                  padding: '12px',
                  borderRadius: '6px',
                  marginBottom: '15px',
                  fontWeight: '600'
                }}>
                  ✅ Driver assigned successfully!
                </div>
              )}

              {/* Booking Overview Section */}
              <div style={{ 
                background: '#f5f5f5', 
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '20px',
                border: '1px solid #ddd'
              }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>📋 Booking Overview</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div className="detail-row">
                    <span className="label">Status:</span>
                    <span className={`badge status-${selectedBooking.status.toLowerCase().replace(' ', '-')}`}>
                      {selectedBooking.status}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Booking Type:</span>
                    <span className="value">{selectedBooking.bookingType?.toUpperCase() || 'TAXI'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Amount:</span>
                    <span className="value" style={{ color: '#4caf50', fontWeight: '600', fontSize: '1.1rem' }}>{selectedBooking.amount}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Date & Time:</span>
                    <span className="value">{selectedBooking.date} at {selectedBooking.time}</span>
                  </div>
                </div>
              </div>

              {/* Customer Information Section */}
              <div style={{ 
                background: '#f9f9f9', 
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '20px',
                border: '1px solid #ddd'
              }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>👤 Customer Information</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div className="detail-row">
                    <span className="label">Name:</span>
                    <span className="value">{selectedBooking.customer}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Phone:</span>
                    <span className="value" style={{ color: '#1976d2', textDecoration: 'underline', cursor: 'pointer' }}>
                      {selectedBooking.phone}
                    </span>
                  </div>
                </div>
              </div>

              {/* Route Information Section */}
              <div style={{ 
                background: '#fafafa', 
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '20px',
                border: '1px solid #ddd'
              }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>📍 Route Details</h4>
                <div style={{ marginBottom: '15px' }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#666' }}>
                    <strong style={{ color: '#333' }}>📤 Pickup Location:</strong>
                  </p>
                  <div style={{
                    background: 'white',
                    padding: '10px',
                    borderLeft: '4px solid #4caf50',
                    borderRadius: '4px',
                    marginBottom: '10px'
                  }}>
                    {selectedBooking.pickupLocation}
                  </div>
                </div>
                <div>
                  <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#666' }}>
                    <strong style={{ color: '#333' }}>📤 Dropoff Location:</strong>
                  </p>
                  <div style={{
                    background: 'white',
                    padding: '10px',
                    borderLeft: '4px solid #f44336',
                    borderRadius: '4px'
                  }}>
                    {selectedBooking.dropoffLocation}
                  </div>
                </div>
              </div>

              {/* Driver Information Section */}
              <div style={{ 
                background: selectedBooking.driver === 'Not Assigned' ? '#fff3e0' : '#f0f4f8',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '20px',
                border: selectedBooking.driver === 'Not Assigned' ? '1px solid #ffb74d' : '1px solid #90caf9',
                position: 'relative'
              }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>👨‍✈️ Driver Assignment</h4>
                {selectedBooking.driver === 'Not Assigned' ? (
                  <div style={{ 
                    textAlign: 'center',
                    padding: '20px',
                  }}>
                    <p style={{ color: '#f57c00', fontWeight: '600', marginBottom: '15px' }}>
                      ⚠️ No driver assigned yet
                    </p>
                    <button 
                      className="btn btn-assign"
                      onClick={() => {
                        setShowModal(false);
                        handleAssignDriver(selectedBooking);
                      }}
                      style={{ marginTop: '10px' }}
                    >
                      Assign Driver Now
                    </button>
                  </div>
                ) : (
                  <div style={{
                    background: 'white',
                    padding: '15px',
                    borderRadius: '6px'
                  }}>
                    <p style={{ margin: '8px 0', fontSize: '0.95rem' }}>
                      <strong>Driver Name:</strong> <span style={{ color: '#4caf50', fontWeight: '600' }}>{selectedBooking.driver}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Actions Section */}
              <div style={{
                background: '#f5f5f5',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>⚙️ Quick Actions</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {selectedBooking.driver === 'Not Assigned' && (
                    <button 
                      className="btn btn-assign"
                      onClick={() => {
                        setShowModal(false);
                        handleAssignDriver(selectedBooking);
                      }}
                    >
                      🚕 Assign Driver
                    </button>
                  )}
                  <button 
                    className="btn btn-primary"
                    onClick={() => alert('Contact functionality coming soon!')}
                    style={{ background: '#1976d2' }}
                  >
                    📞 Contact Customer
                  </button>
                </div>
              </div>
            </div>
            <div className="modal-footer" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '15px', borderTop: '2px solid #f0f0f0' }}>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowModal(false);
                  setAssignmentSuccess(false);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Driver Assignment Modal */}
      {showAssignModal && selectedBooking && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 style={{ margin: '0 0 8px 0' }}>👨‍💼 Assign Driver to Booking</h3>
                <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
                  {selectedBooking.customer} | {selectedBooking.date} at {selectedBooking.time}
                </p>
              </div>
              <button
                className="close-btn"
                onClick={() => setShowAssignModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              {/* Booking Summary */}
              <div style={{
                background: '#f0f8ff',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '20px',
                border: '1px solid #1976d2',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '15px'
              }}>
                <div>
                  <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: '#666' }}>📍 Route</p>
                  <p style={{ margin: 0, fontWeight: '600', color: '#333' }}>{selectedBooking.pickupLocation.substring(0, 20)}...</p>
                  <p style={{ margin: '5px 0 0 0', color: '#999', fontSize: '0.85rem' }}>to {selectedBooking.dropoffLocation.substring(0, 20)}...</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: '#666' }}>💰 Amount</p>
                  <p style={{ margin: 0, fontWeight: '600', color: '#4caf50', fontSize: '1.2rem' }}>{selectedBooking.amount}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: '#666' }}>📅 Schedule</p>
                  <p style={{ margin: 0, fontWeight: '600', color: '#333' }}>{selectedBooking.date}</p>
                  <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '0.9rem' }}>{selectedBooking.time}</p>
                </div>
              </div>

              {/* Available Drivers */}
              <h4 style={{ marginTop: '20px', marginBottom: '15px', color: '#333' }}>🚗 Select an Available Driver</h4>
              <div className="drivers-selection-grid">
                {availableDrivers.length === 0 ? (
                  <div style={{
                    gridColumn: '1 / -1',
                    padding: '30px',
                    textAlign: 'center',
                    background: '#fff3cd',
                    borderRadius: '8px',
                    color: '#856404'
                  }}>
                    <p style={{ margin: 0, fontWeight: '600' }}>⚠️ No drivers available for this date</p>
                    <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem' }}>Please try a different date or check driver availability</p>
                  </div>
                ) : (
                  availableDrivers.map((driver) => (
                    <div
                      key={driver.id}
                      className={`driver-selection-card ${selectedDriver?.id === driver.id ? 'selected' : ''}`}
                      onClick={() => setSelectedDriver(driver)}
                      style={{
                        cursor: 'pointer',
                        border: selectedDriver?.id === driver.id ? '3px solid #1976d2' : '2px solid #ddd',
                        borderRadius: '8px',
                        padding: '15px',
                        marginBottom: '12px',
                        backgroundColor: selectedDriver?.id === driver.id ? '#e3f2fd' : '#f9f9f9',
                        transition: 'all 0.3s ease',
                        boxShadow: selectedDriver?.id === driver.id ? '0 4px 12px rgba(25, 118, 210, 0.2)' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                        <div>
                          <h5 style={{ margin: 0, color: '#333', fontSize: '1rem', fontWeight: 600 }}>👤 {driver.name}</h5>
                          <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '0.85rem' }}>License: {driver.license}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '1rem', fontWeight: '600' }}>⭐ {driver.rating}</div>
                          <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '0.85rem' }}>rating</p>
                        </div>
                      </div>

                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '10px',
                        paddingTop: '10px',
                        borderTop: '1px solid #eee'
                      }}>
                        <p style={{ margin: '8px 0', fontSize: '0.9rem', color: '#666' }}>
                          <strong>Experience:</strong><br />{driver.experience} years
                        </p>
                        <p style={{ margin: '8px 0', fontSize: '0.9rem', color: '#666' }}>
                          <strong>Trips:</strong><br />{driver.trips} completed
                        </p>
                        <p style={{ margin: '8px 0', fontSize: '0.9rem', color: '#666' }}>
                          <strong>Phone:</strong><br />{driver.phone}
                        </p>
                      </div>

                      {selectedDriver?.id === driver.id && (
                        <div style={{
                          marginTop: '12px',
                          padding: '8px',
                          background: '#c8e6c9',
                          borderRadius: '4px',
                          color: '#2e7d32',
                          fontWeight: '600',
                          textAlign: 'center',
                          fontSize: '0.9rem'
                        }}>
                          ✓ Selected
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="modal-footer" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '15px', borderTop: '2px solid #f0f0f0' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setShowAssignModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleConfirmAssignment}
                style={{
                  backgroundColor: selectedDriver ? '#1976d2' : '#ccc',
                  cursor: selectedDriver ? 'pointer' : 'not-allowed',
                  fontWeight: '600'
                }}
                disabled={!selectedDriver}
              >
                ✓ Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsManagement;

