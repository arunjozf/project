import React, { useState, useEffect } from 'react';
import { getToken } from '../../utils/api';
import './ModuleStyles.css';

const BookingManagementModule = ({ user }) => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, filterStatus, searchTerm]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await fetch('http://localhost:8000/api/bookings/all_bookings/', {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const bookingsData = Array.isArray(data) ? data : (data.data || data.results || []);
        setBookings(bookingsData);
      } else {
        console.error('Failed to fetch bookings:', response.status);
        setBookings([]);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = bookings;

    if (filterStatus !== 'all') {
      filtered = filtered.filter(b => (b.status || 'pending') === filterStatus);
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(b =>
        (b.customer_email || b.user?.email || b.email || '').toLowerCase().includes(searchLower) ||
        (b.id && b.id.toString().includes(searchTerm)) ||
        (b.user?.first_name && (b.user.first_name + ' ' + (b.user.last_name || '')).toLowerCase().includes(searchLower))
      );
    }

    setFilteredBookings(filtered);
  };

  const handleApproveBooking = async (bookingId) => {
    console.log('Approving booking:', bookingId);
    alert('Booking approved successfully!');
  };

  const handleRejectBooking = async (bookingId) => {
    console.log('Rejecting booking:', bookingId);
    alert('Booking rejected');
  };

  const handleAssignDriver = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const getStatusStats = () => {
    return {
      pending: bookings.filter(b => b.status === 'pending').length,
      approved: bookings.filter(b => b.status === 'approved').length,
      completed: bookings.filter(b => b.status === 'completed').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length,
    };
  };

  if (loading) {
    return <div className="loading">Loading bookings...</div>;
  }

  const stats = getStatusStats();

  return (
    <div className="admin-module booking-management">
      <h2>📅 Booking Management & Control</h2>

      {/* Filters */}
      <div className="module-filters">
        <input
          type="text"
          placeholder="Search by customer email, name or booking ID..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="filter-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Bookings</option>
          <option value="pending">Pending Approval</option>
          <option value="approved">Approved</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Booking Table */}
      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Customer Email</th>
              <th>Booking Type</th>
              <th>Pickup Date</th>
              <th>Status</th>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map(booking => {
              // Handle different response structures from backend
              const customerId = booking.user_id || booking.customer_id;
              const customerEmail = booking.customer_email || booking.user?.email || booking.email || 'N/A';
              const bookingType = booking.booking_type || 'N/A';
              const pickupDate = booking.pickup_date || 'N/A';
              const status = booking.status || 'pending';
              const totalAmount = booking.total_amount || booking.total || 0;
              
              return (
                <tr key={booking.id}>
                  <td>#{booking.id}</td>
                  <td><strong>{customerEmail}</strong></td>
                  <td>{bookingType.charAt(0).toUpperCase() + bookingType.slice(1)}</td>
                  <td>{new Date(pickupDate).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge status-${status}`}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                  </td>
                  <td>₹{totalAmount.toLocaleString()}</td>
                  <td>
                    <button className="action-btn" onClick={() => {
                      setSelectedBooking(booking);
                      setShowModal(true);
                    }} style={{ cursor: 'pointer' }}>
                      View Details
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Status Overview */}
      <div className="module-stats">
        <div className="stat-card">
          <div className="stat-value">{bookings.length}</div>
          <div className="stat-label">Total Bookings</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.approved}</div>
          <div className="stat-label">Approved</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.completed}</div>
          <div className="stat-label">Completed</div>
        </div>
      </div>

      {/* Booking Details Modal */}
      {showModal && selectedBooking && (
        <div className="modal-overlay">
          <div className="modal-content booking-details-modal">
            <div className="modal-header">
              <h3>Booking Details</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>
            
            <div className="details-container">
              {/* Booking Info */}
              <div className="details-section">
                <h4>Booking Information</h4>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Booking ID:</span>
                    <span className="detail-value">#{selectedBooking.id}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Status:</span>
                    <span className={`status-badge status-${selectedBooking.status || 'pending'}`}>
                      {(selectedBooking.status || 'pending').charAt(0).toUpperCase() + (selectedBooking.status || 'pending').slice(1)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Booking Type:</span>
                    <span className="detail-value">{selectedBooking.booking_type || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Total Amount:</span>
                    <span className="detail-value">₹{(selectedBooking.total_amount || selectedBooking.total || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="details-section">
                <h4>Customer Information</h4>
                <div className="details-grid">
                  <div className="detail-item full-width">
                    <span className="detail-label">Customer Email:</span>
                    <span className="detail-value">{selectedBooking.customer_email || selectedBooking.user?.email || selectedBooking.email || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Customer Name:</span>
                    <span className="detail-value">
                      {selectedBooking.user?.first_name || ''} {selectedBooking.user?.last_name || selectedBooking.customer_name || 'N/A'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Phone:</span>
                    <span className="detail-value">{selectedBooking.user?.phone || selectedBooking.phone || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Trip Details */}
              <div className="details-section">
                <h4>Trip Details</h4>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Pickup Date:</span>
                    <span className="detail-value">
                      {selectedBooking.pickup_date ? new Date(selectedBooking.pickup_date).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Pickup Time:</span>
                    <span className="detail-value">{selectedBooking.pickup_time || 'N/A'}</span>
                  </div>
                  <div className="detail-item full-width">
                    <span className="detail-label">Pickup Location:</span>
                    <span className="detail-value">{selectedBooking.pickup_location || 'N/A'}</span>
                  </div>
                  <div className="detail-item full-width">
                    <span className="detail-label">Dropoff Location:</span>
                    <span className="detail-value">{selectedBooking.dropoff_location || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Vehicle Details */}
              {selectedBooking.vehicle_name && (
                <div className="details-section">
                  <h4>Vehicle Information</h4>
                  <div className="details-grid">
                    <div className="detail-item">
                      <span className="detail-label">Vehicle:</span>
                      <span className="detail-value">{selectedBooking.vehicle_name}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">License Plate:</span>
                      <span className="detail-value">{selectedBooking.license_plate || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Driver Details */}
              {(selectedBooking.driver_name || selectedBooking.driver_id) && (
                <div className="details-section">
                  <h4>Driver Information</h4>
                  <div className="details-grid">
                    <div className="detail-item">
                      <span className="detail-label">Driver Name:</span>
                      <span className="detail-value">{selectedBooking.driver_name || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Driver Phone:</span>
                      <span className="detail-value">{selectedBooking.driver_phone || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Driver Rating:</span>
                      <span className="detail-value">{selectedBooking.driver_rating || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Special Requests */}
              {selectedBooking.special_requests && (
                <div className="details-section">
                  <h4>Special Requests</h4>
                  <p className="detail-value">{selectedBooking.special_requests}</p>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingManagementModule;
