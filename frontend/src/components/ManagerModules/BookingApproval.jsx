import React, { useState, useEffect } from 'react';
import { getToken } from '../../utils/api';
import '../../styles/ManagerModules.css';

const BookingApproval = ({ bookings: propsBookings = [], onBookingsUpdate }) => {
  const [bookings, setBookings] = useState(propsBookings);
  const [filteredBookings, setFilteredBookings] = useState(propsBookings);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('pending');

  useEffect(() => {
    // Update from props if provided
    if (propsBookings && propsBookings.length > 0) {
      setBookings(propsBookings);
    } else if (bookings.length === 0) {
      // Fetch if no props provided
      fetchManagerBookings();
    }
  }, [propsBookings]);

  useEffect(() => {
    const filtered = bookings.filter(booking => 
      filterStatus === 'all' || booking.status === filterStatus
    );
    setFilteredBookings(filtered);
  }, [bookings, filterStatus]);

  const fetchManagerBookings = async () => {
    try {
      setLoading(true);
      const token = getToken() || localStorage.getItem('authToken');
      console.log('[BookingApproval] Fetching bookings with token:', token?.substring(0, 10) + '...');
      
      const response = await fetch('http://localhost:8000/api/manager/bookings/', {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('[BookingApproval] Bookings loaded:', data);
        setBookings(data.data || data || []);
      } else {
        console.error('[BookingApproval] Failed to fetch bookings:', response.status);
      }
    } catch (error) {
      console.error('[BookingApproval] Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectBooking = async (bookingId) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      const token = getToken() || localStorage.getItem('authToken');
      const response = await fetch(
        `http://localhost:8000/api/manager/bookings/${bookingId}/`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action: 'reject', reason }),
        }
      );

      if (response.ok) {
        setBookings(prev =>
          prev.map(b =>
            b.id === bookingId ? { ...b, status: 'cancelled' } : b
          )
        );
        alert('Booking rejected!');
        if (onBookingsUpdate) onBookingsUpdate();
      } else {
        alert('Failed to reject booking');
      }
    } catch (error) {
      console.error('[BookingApproval] Error rejecting booking:', error);
      alert('Error: ' + error.message);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: '⏳ Pending',
      confirmed: '✅ Confirmed',
      completed: '✔️ Completed',
      cancelled: '❌ Cancelled',
    };
    return badges[status] || status;
  };

  return (
    <div className="module-container">
      <div className="module-header">
        <h2>🎫 Booking Approvals</h2>
        <div className="filter-tabs">
          <button
            className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            All ({bookings.length})
          </button>
          <button
            className={`filter-btn ${filterStatus === 'pending' ? 'active' : ''}`}
            onClick={() => setFilterStatus('pending')}
          >
            Pending ({bookings.filter(b => b.status === 'pending').length})
          </button>
          <button
            className={`filter-btn ${filterStatus === 'confirmed' ? 'active' : ''}`}
            onClick={() => setFilterStatus('confirmed')}
          >
            Confirmed ({bookings.filter(b => b.status === 'confirmed').length})
          </button>
        </div>
      </div>

      {loading ? (
        <p className="loading-text">Loading bookings...</p>
      ) : filteredBookings.length === 0 ? (
        <p className="empty-text">
          No {filterStatus === 'all' ? '' : filterStatus} bookings found.
        </p>
      ) : (
        <div className="bookings-list">
          {filteredBookings.map(booking => (
            <div key={booking.id} className="booking-card">
              <div className="booking-header">
                <div>
                  <h4>{booking.user?.first_name || 'Customer'} {booking.user?.last_name || ''}</h4>
                  <p className="booking-id">Booking ID: {booking.id}</p>
                </div>
                <span className="booking-status">{getStatusBadge(booking.status)}</span>
              </div>

              <div className="booking-details-grid">
                <div className="detail-item">
                  <span className="label">📅 Pickup Date</span>
                  <span className="value">{new Date(booking.pickup_date).toLocaleDateString()}</span>
                </div>
                <div className="detail-item">
                  <span className="label">🕐 Pickup Time</span>
                  <span className="value">{booking.pickup_time}</span>
                </div>
                <div className="detail-item">
                  <span className="label">📍 Pickup</span>
                  <span className="value">{booking.pickup_location}</span>
                </div>
                <div className="detail-item">
                  <span className="label">📍 Dropoff</span>
                  <span className="value">{booking.dropoff_location}</span>
                </div>
                <div className="detail-item">
                  <span className="label">🚗 Type</span>
                  <span className="value">{booking.booking_type === 'premium' ? '⭐ Premium' : '🚗 Local'}</span>
                </div>
                <div className="detail-item">
                  <span className="label">👤 Driver</span>
                  <span className="value">{booking.driver_option === 'with-driver' ? 'With Driver' : 'Self Drive'}</span>
                </div>
                <div className="detail-item">
                  <span className="label">📞 Phone</span>
                  <span className="value">{booking.phone}</span>
                </div>
                <div className="detail-item">
                  <span className="label">💰 Amount</span>
                  <span className="value highlight">₹{booking.total_amount}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingApproval;
