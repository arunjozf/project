import React, { useState, useEffect } from 'react';
import { getToken } from '../../utils/api';
import '../../styles/ManagerModules.css';

const DriverAllocation = ({ onAllocationUpdate }) => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allocating, setAllocating] = useState(false);
  const [filterStatus, setFilterStatus] = useState('confirmed');
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [driverLoadingId, setDriverLoadingId] = useState(null);
  const [showAddDriverModal, setShowAddDriverModal] = useState(false);
  const [addingDriver, setAddingDriver] = useState(false);
  const [panelView, setPanelView] = useState('bookings'); // 'bookings' or 'drivers'
  const [allDrivers, setAllDrivers] = useState([]);
  const [loadingAllDrivers, setLoadingAllDrivers] = useState(false);
  const [driverForm, setDriverForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    licenseNumber: '',
    licenseExpiry: '',
    experienceYears: '',
  });

  useEffect(() => {
    fetchBookingsNeedingDrivers();
    fetchAllDrivers();
  }, []);

  useEffect(() => {
    const filtered = bookings.filter(booking => {
      const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
      const matchesSearch = 
        booking.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.pickup_location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.user?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.id?.toString().includes(searchTerm);
      
      // Show all bookings that have with-driver option (both with and without assigned drivers)
      const hasDriverOption = booking.driver_option === 'with-driver';
      
      return matchesStatus && matchesSearch && hasDriverOption;
    });
    setFilteredBookings(filtered);
  }, [bookings, filterStatus, searchTerm]);

  const fetchBookingsNeedingDrivers = async () => {
    try {
      setLoading(true);
      const token = getToken() || localStorage.getItem('authToken');
      
      // Fetch CONFIRMED bookings (not just pending) that need drivers assigned
      // Use the general bookings endpoint to get all CONFIRMED bookings
      const response = await fetch('http://localhost:8000/api/bookings/?status=confirmed', {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const allBookings = data.results || data.data || [];
        
        console.log('[DriverAllocation] Raw response:', { status: response.status, bookingCount: allBookings.length, firstBooking: allBookings[0] });
        
        // Filter to show only confirmed bookings that have with-driver option
        const bookingsNeedingDrivers = allBookings.filter(booking => 
          booking.driver_option === 'with-driver' && !booking.assigned_driver
        );
        
        setBookings(allBookings); // Keep all for filtering
        console.log('[DriverAllocation] Bookings fetched:', allBookings.length);
        console.log('[DriverAllocation] Bookings needing drivers:', bookingsNeedingDrivers.length);
        console.log('[DriverAllocation] Sample booking:', allBookings[0]);
        setMessage({ type: 'success', text: `Found ${bookingsNeedingDrivers.length} bookings needing drivers` });
      } else if (response.status === 403) {
        console.warn('[DriverAllocation] Access denied to bookings endpoint - may need different permissions');
        setMessage({ type: 'error', text: 'Access denied - check manager permissions' });
      } else {
        console.error('[DriverAllocation] Failed to fetch bookings - status:', response.status);
        setMessage({ type: 'error', text: 'Failed to fetch bookings' });
      }
    } catch (error) {
      console.error('[DriverAllocation] Error fetching bookings:', error);
      setMessage({ type: 'error', text: 'Error loading bookings' });
    } finally {
      setLoading(false);
    }
  };

  const fetchAllDrivers = async () => {
    try {
      setLoadingAllDrivers(true);
      const token = getToken() || localStorage.getItem('authToken');
      
      const response = await fetch('http://localhost:8000/api/manager/drivers/', {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const drivers = data.data || [];
        console.log('[DriverAllocation] All drivers fetched:', drivers.length);
        console.log('[DriverAllocation] Driver details:', drivers.map(d => ({ id: d.id, name: d.user?.first_name, is_verified: d.is_verified, status: d.status })));
        setAllDrivers(drivers);
      } else if (response.status === 404) {
        console.warn('[DriverAllocation] Drivers endpoint not available (404) - endpoint may not be implemented');
        setAllDrivers([]);
      } else {
        console.error('[DriverAllocation] Failed to fetch drivers - status:', response.status);
        setAllDrivers([]);
      }
    } catch (error) {
      console.error('[DriverAllocation] Error fetching all drivers:', error);
      setAllDrivers([]);
    } finally {
      setLoadingAllDrivers(false);
    }
  };

  const fetchAvailableDrivers = async (bookingId) => {
    try {
      setDriverLoadingId(bookingId);
      const token = getToken() || localStorage.getItem('authToken');
      
      const response = await fetch(
        `http://localhost:8000/api/bookings/${bookingId}/available_drivers/`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const drivers = data.data || [];
        setAvailableDrivers(drivers);
        console.log('[DriverAllocation] Available drivers fetched:', drivers.length);
        setMessage({ type: 'success', text: `Found ${drivers.length} available drivers` });
      } else {
        setAvailableDrivers([]);
        setMessage({ type: 'error', text: 'No available drivers for this booking' });
      }
    } catch (error) {
      console.error('[DriverAllocation] Error fetching drivers:', error);
      setMessage({ type: 'error', text: 'Error loading available drivers' });
      setAvailableDrivers([]);
    } finally {
      setDriverLoadingId(null);
    }
  };

  const handleSelectBooking = async (booking) => {
    setSelectedBooking(booking);
    setAvailableDrivers([]);
    await fetchAvailableDrivers(booking.id);
  };

  const handleAssignDriver = async (driverId) => {
    if (!selectedBooking) {
      setMessage({ type: 'error', text: 'Please select a booking first' });
      return;
    }

    try {
      setAllocating(true);
      const token = getToken() || localStorage.getItem('authToken');
      
      const response = await fetch(
        `http://localhost:8000/api/bookings/${selectedBooking.id}/assign_driver/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ driver_id: driverId }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        
        // Update local state
        setBookings(prev =>
          prev.map(b => 
            b.id === selectedBooking.id 
              ? { ...b, assigned_driver: data.data.assigned_driver }
              : b
          )
        );
        
        // Get driver info for display
        const assignedDriver = availableDrivers.find(d => d.id === driverId);
        setMessage({ 
          type: 'success', 
          text: `✅ Driver ${assignedDriver?.user?.first_name || 'assigned'} successfully allocated to booking #${selectedBooking.id}` 
        });
        
        // Reset selection after a short delay
        setTimeout(() => {
          setSelectedBooking(null);
          setAvailableDrivers([]);
          if (onAllocationUpdate) onAllocationUpdate();
        }, 1500);
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.message || 'Failed to assign driver' });
      }
    } catch (error) {
      console.error('[DriverAllocation] Error assigning driver:', error);
      setMessage({ type: 'error', text: 'Error assigning driver' });
    } finally {
      setAllocating(false);
    }
  };

  const handleAddDriverChange = (field, value) => {
    setDriverForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddDriver = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!driverForm.firstName || !driverForm.email || !driverForm.licenseNumber) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }

    try {
      setAddingDriver(true);
      const token = getToken() || localStorage.getItem('authToken');
      
      // Create driver via manager endpoint
      const driverResponse = await fetch('http://localhost:8000/api/manager/drivers/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: driverForm.firstName,
          lastName: driverForm.lastName,
          email: driverForm.email,
          phone: driverForm.phone,
          licenseNumber: driverForm.licenseNumber,
          licenseExpiry: driverForm.licenseExpiry,
          experienceYears: driverForm.experienceYears || 0,
        }),
      });

      if (!driverResponse.ok) {
        const error = await driverResponse.json();
        setMessage({ type: 'error', text: error.message || 'Failed to create driver account' });
        setAddingDriver(false);
        return;
      }

      const driverData = await driverResponse.json();
      
      setMessage({ 
        type: 'success', 
        text: `✅ Driver ${driverForm.firstName} added successfully! Temporary password has been sent to ${driverForm.email}` 
      });
      
      // Reset form
      setDriverForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        licenseNumber: '',
        licenseExpiry: '',
        experienceYears: '',
      });
      
      setTimeout(() => {
        setShowAddDriverModal(false);
        fetchBookingsNeedingDrivers();
        fetchAllDrivers(); // Refresh drivers list
      }, 1500);
    } catch (error) {
      console.error('[DriverAllocation] Error adding driver:', error);
      setMessage({ type: 'error', text: 'Error creating driver' });
    } finally {
      setAddingDriver(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="module-container driver-allocation-module">
      <div className="module-header">
        <div>
          <h2>🚗 Driver Allocation</h2>
          <p className="module-subtitle">Assign drivers to bookings requiring driver services</p>
        </div>
        <div className="header-actions">
          <button 
            className="add-driver-btn"
            onClick={() => setShowAddDriverModal(true)}
            title="Add a new driver"
          >
            ➕ Add Driver
          </button>
          <button 
            className="refresh-btn"
            onClick={() => {
              fetchBookingsNeedingDrivers();
              fetchAllDrivers();
            }}
            disabled={loading || loadingAllDrivers}
          >
            {loading || loadingAllDrivers ? '⟳ Loading...' : '🔄 Refresh'}
          </button>
        </div>
      </div>

      {message.text && (
        <div className={`message-alert message-${message.type}`}>
          <span>{message.text}</span>
          <button 
            onClick={() => setMessage({ type: '', text: '' })}
            className="close-message"
          >
            ✕
          </button>
        </div>
      )}

      {/* View Switcher Tabs */}
      <div className="view-switcher-tabs" style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #e0e0e0', paddingBottom: '10px' }}>
        <button
          className={`view-tab ${panelView === 'bookings' ? 'active' : ''}`}
          onClick={() => setPanelView('bookings')}
          style={{
            padding: '10px 20px',
            border: 'none',
            backgroundColor: panelView === 'bookings' ? '#1976D2' : 'transparent',
            color: panelView === 'bookings' ? 'white' : '#666',
            cursor: 'pointer',
            borderRadius: '4px',
            fontWeight: panelView === 'bookings' ? 'bold' : 'normal',
            transition: 'all 0.3s ease'
          }}
        >
          📋 Driver Service Bookings ({bookings.filter(b => b.driver_option === 'with-driver').length})
        </button>
        <button
          className={`view-tab ${panelView === 'drivers' ? 'active' : ''}`}
          onClick={() => setPanelView('drivers')}
          style={{
            padding: '10px 20px',
            border: 'none',
            backgroundColor: panelView === 'drivers' ? '#1976D2' : 'transparent',
            color: panelView === 'drivers' ? 'white' : '#666',
            cursor: 'pointer',
            borderRadius: '4px',
            fontWeight: panelView === 'drivers' ? 'bold' : 'normal',
            transition: 'all 0.3s ease'
          }}
        >
          👥 All Drivers ({allDrivers.length})
        </button>
      </div>

      <div className="allocation-layout">
        {/* Bookings View */}
        {panelView === 'bookings' && (
        <>
        {/* Left Panel: Bookings List */}
        <div className="allocation-bookings-panel">
          <div className="panel-header">
            <h3>📋 Driver Service Bookings</h3>
            <span className="count-badge">{filteredBookings.length}</span>
          </div>

          <div className="search-filter">
            <input
              type="text"
              placeholder="Search by name, email, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="status-tabs">
            <button
              className={`status-tab ${filterStatus === 'all' ? 'active' : ''}`}
              onClick={() => setFilterStatus('all')}
            >
              All ({bookings.filter(b => b.driver_option === 'with-driver').length})
            </button>
            <button
              className={`status-tab ${filterStatus === 'confirmed' ? 'active' : ''}`}
              onClick={() => setFilterStatus('confirmed')}
            >
              Confirmed ({bookings.filter(b => b.status === 'confirmed' && b.driver_option === 'with-driver').length})
            </button>
            <button
              className={`status-tab ${filterStatus === 'pending' ? 'active' : ''}`}
              onClick={() => setFilterStatus('pending')}
            >
              Pending ({bookings.filter(b => b.status === 'pending' && b.driver_option === 'with-driver').length})
            </button>
          </div>

          <div className="bookings-list">
            {loading ? (
              <div className="loading-state">
                <p>⟳ Loading bookings...</p>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="empty-state">
                <p>✓ No driver service bookings at the moment</p>
              </div>
            ) : (
              filteredBookings.map((booking) => (
                <div
                  key={booking.id}
                  className={`booking-card ${selectedBooking?.id === booking.id ? 'selected' : ''} ${booking.assigned_driver ? 'has-driver' : 'needs-driver'}`}
                  onClick={() => handleSelectBooking(booking)}
                >
                  <div className="booking-card-header">
                    <h4>Booking #{booking.id}</h4>
                    <div  style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {booking.assigned_driver && (
                        <span style={{ backgroundColor: '#4CAF50', color: 'white', padding: '4px 8px', borderRadius: '3px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                          ✓ DRIVER ASSIGNED
                        </span>
                      )}
                      <span className={`status-badge status-${booking.status}`}>
                        {booking.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="booking-card-info">
                    <div className="info-row">
                      <span className="label">👤 Customer:</span>
                      <span className="value">{booking.user?.first_name || 'N/A'}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">📧 Email:</span>
                      <span className="value">{booking.user?.email}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">📍 Route:</span>
                      <span className="value">
                        {booking.pickup_location} → {booking.dropoff_location}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="label">📅 Dates:</span>
                      <span className="value">
                        {formatDate(booking.pickup_date)} | {formatTime(booking.pickup_time)}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="label">⏱️ Duration:</span>
                      <span className="value">{booking.number_of_days} day(s)</span>
                    </div>
                    <div className="info-row">
                      <span className="label">💰 Amount:</span>
                      <span className="value">₹{booking.total_amount}</span>
                    </div>
                    {booking.assigned_driver && (
                      <>
                        <div style={{ borderTop: '1px solid #e0e0e0', marginTop: '10px', paddingTop: '10px' }}>
                          <div className="info-row" style={{ backgroundColor: '#f0f8ff', padding: '8px', borderRadius: '4px' }}>
                            <span className="label">🚗 Assigned Driver:</span>
                            <span className="value" style={{ color: '#4CAF50', fontWeight: 'bold' }}>
                              {booking.assigned_driver.user_name}
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Panel: Driver Selection */}
        <div className="allocation-drivers-panel">
          {selectedBooking ? (
            <div className="drivers-selection">
              <div className="panel-header">
                <h3>{selectedBooking.assigned_driver ? '✓ Driver Assigned' : '👥 Available Drivers'}</h3>
                <button 
                  className="close-selection"
                  onClick={() => {
                    setSelectedBooking(null);
                    setAvailableDrivers([]);
                  }}
                >
                  ✕
                </button>
              </div>

              <div className="selected-booking-info">
                <h4>📝 Booking Details</h4>
                <p><strong>Booking ID:</strong> #{selectedBooking.id}</p>
                <p><strong>Customer:</strong> {selectedBooking.user?.first_name} {selectedBooking.user?.last_name}</p>
                <p><strong>Email:</strong> {selectedBooking.user?.email}</p>
                <p><strong>Pickup:</strong> {formatDate(selectedBooking.pickup_date)}</p>
                <p><strong>Duration:</strong> {selectedBooking.number_of_days} day(s)</p>
              </div>

              {selectedBooking.assigned_driver ? (
                <div className="assigned-driver-info" style={{ backgroundColor: '#f0f8ff', padding: '15px', borderRadius: '8px', border: '2px solid #4CAF50' }}>
                  <h4 style={{ marginTop: 0, color: '#4CAF50' }}>✓ Driver Assigned</h4>
                  <p><strong>Customer selected during booking:</strong></p>
                  <div style={{ backgroundColor: 'white', padding: '10px', borderRadius: '6px', marginTop: '10px' }}>
                    <p><strong>Name:</strong> {selectedBooking.assigned_driver.user_name}</p>
                    <p><strong>Email:</strong> {selectedBooking.assigned_driver.user_email}</p>
                    <p><strong>License:</strong> {selectedBooking.assigned_driver.license_number}</p>
                    <p><strong>Experience:</strong> {selectedBooking.assigned_driver.experience_years} years</p>
                    <p><strong>Rating:</strong> ⭐ {selectedBooking.assigned_driver.average_rating}/5</p>
                  </div>
                  <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '15px', fontStyle: 'italic' }}>
                    You can reassign to a different driver below if needed.
                  </p>
                </div>
              ) : (
                <div style={{ backgroundColor: '#fff3cd', padding: '15px', borderRadius: '8px', border: '2px solid #ffc107', marginBottom: '15px' }}>
                  <p><strong>⚠️ No driver assigned</strong></p>
                  <p style={{ fontSize: '0.9rem', color: '#666' }}>
                    Customer did not select a driver during booking. Select one from the available drivers below.
                  </p>
                </div>
              )}

              <div className="drivers-list">
                {driverLoadingId === selectedBooking.id ? (
                  <div className="loading-state">
                    <p>⟳ Loading available drivers...</p>
                  </div>
                ) : availableDrivers.length === 0 ? (
                  <div className="empty-state">
                    <p>❌ No drivers available for this period</p>
                  </div>
                ) : (
                  availableDrivers.map((driver) => (
                    <div key={driver.id} className="driver-card">
                      <div className="driver-header">
                        <h4>{driver.user?.first_name} {driver.user?.last_name}</h4>
                        <span className="rating-badge">⭐ {driver.average_rating}/5</span>
                      </div>

                      <div className="driver-info">
                        <div className="info-item">
                          <span className="icon">🎫</span>
                          <span>{driver.license_number}</span>
                        </div>
                        <div className="info-item">
                          <span className="icon">✈️</span>
                          <span>{driver.experience_years} years experience</span>
                        </div>
                        <div className="info-item">
                          <span className="icon">📍</span>
                          <span>{driver.total_trips} trips completed</span>
                        </div>
                        {driver.status && (
                          <div className="info-item">
                            <span className="icon">📊</span>
                            <span className="status-label">{driver.status}</span>
                          </div>
                        )}
                      </div>

                      <button
                        className="assign-btn"
                        onClick={() => handleAssignDriver(driver.id)}
                        disabled={allocating}
                      >
                        {allocating ? '⟳ Assigning...' : '✓ Assign Driver'}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="no-selection">
              <div className="empty-state">
                <p>👈 Select a booking to view available drivers</p>
                <p className="subtitle">Click on any booking from the list to see driver options</p>
              </div>
            </div>
          )}
        </div>
        </>
        )}

        {/* Drivers View */}
        {panelView === 'drivers' && (
        <div className="allocation-drivers-list-panel" style={{ width: '100%', padding: '20px' }}>
          <div className="panel-header">
            <h3>👥 All Drivers ({allDrivers.length})</h3>
            <button 
              className="refresh-btn"
              onClick={fetchAllDrivers}
              disabled={loadingAllDrivers}
              style={{ padding: '8px 16px' }}
            >
              {loadingAllDrivers ? '⟳' : '🔄'}
            </button>
          </div>

          {loadingAllDrivers ? (
            <div className="loading-state">
              <p>⟳ Loading drivers...</p>
            </div>
          ) : allDrivers.length === 0 ? (
            <div className="empty-state">
              <p>📭 No drivers added yet</p>
              <p className="subtitle">Click "Add Driver" to create new driver accounts</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' }}>
              {allDrivers.map((driver) => {
                // Ensure is_verified is a boolean, default to true for newly created drivers
                const isVerified = driver.is_verified === true || driver.is_verified === 'true';
                return (
                <div key={driver.id} className="driver-card" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)', padding: '15px', borderRadius: '8px', backgroundColor: '#fff', border: isVerified ? '2px solid #4CAF50' : '2px solid #ffc107' }}>
                  <div className="driver-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ margin: 0 }}>{driver.user?.first_name} {driver.user?.last_name}</h4>
                    <span style={{ 
                      backgroundColor: isVerified ? '#4CAF50' : '#ffc107', 
                      color: 'white', 
                      padding: '4px 8px', 
                      borderRadius: '3px', 
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}>
                      {isVerified ? '✓ Verified' : '⏳ Pending'}
                    </span>
                  </div>

                  <div className="driver-info" style={{ backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '6px', marginBottom: '12px' }}>
                    <div style={{ marginBottom: '8px' }}>
                      <span style={{ fontWeight: 'bold' }}>📧 Email:</span> {driver.user?.email}
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <span style={{ fontWeight: 'bold' }}>🎫 License:</span> {driver.license_number}
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <span style={{ fontWeight: 'bold' }}>⏰ Expires:</span> {driver.license_expiry || 'N/A'}
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <span style={{ fontWeight: 'bold' }}>✈️ Experience:</span> {driver.experience_years} years
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <span style={{ fontWeight: 'bold' }}>⭐ Rating:</span> {driver.average_rating}/5
                    </div>
                    <div>
                      <span style={{ fontWeight: 'bold' }}>📊 Status:</span> <span style={{ textTransform: 'capitalize', backgroundColor: driver.status === 'available' ? '#e8f5e9' : '#fff3e0', padding: '2px 8px', borderRadius: '3px' }}>{driver.status}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', fontSize: '0.9rem', color: '#666', borderTop: '1px solid #e0e0e0', paddingTop: '10px' }}>
                    <span>👤 ID: {driver.id}</span>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>
        )}
      </div>

      {/* Add Driver Modal */}
      {showAddDriverModal && (
        <div className="modal-overlay" onClick={() => !addingDriver && setShowAddDriverModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>➕ Add New Driver</h3>
              <button 
                className="modal-close"
                onClick={() => !addingDriver && setShowAddDriverModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddDriver} className="driver-form">
              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    value={driverForm.firstName}
                    onChange={(e) => handleAddDriverChange('firstName', e.target.value)}
                    placeholder="John"
                    disabled={addingDriver}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    value={driverForm.lastName}
                    onChange={(e) => handleAddDriverChange('lastName', e.target.value)}
                    placeholder="Doe"
                    disabled={addingDriver}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    value={driverForm.email}
                    onChange={(e) => handleAddDriverChange('email', e.target.value)}
                    placeholder="driver@example.com"
                    disabled={addingDriver}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={driverForm.phone}
                    onChange={(e) => handleAddDriverChange('phone', e.target.value)}
                    placeholder="+91 9876543210"
                    disabled={addingDriver}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>License Number *</label>
                  <input
                    type="text"
                    value={driverForm.licenseNumber}
                    onChange={(e) => handleAddDriverChange('licenseNumber', e.target.value)}
                    placeholder="DL-0123456789"
                    disabled={addingDriver}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>License Expiry Date</label>
                  <input
                    type="date"
                    value={driverForm.licenseExpiry}
                    onChange={(e) => handleAddDriverChange('licenseExpiry', e.target.value)}
                    disabled={addingDriver}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Years of Experience</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={driverForm.experienceYears}
                    onChange={(e) => handleAddDriverChange('experienceYears', e.target.value)}
                    placeholder="5"
                    disabled={addingDriver}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => !addingDriver && setShowAddDriverModal(false)}
                  disabled={addingDriver}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-add"
                  disabled={addingDriver}
                >
                  {addingDriver ? '⟳ Creating...' : '✓ Add Driver'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverAllocation;
