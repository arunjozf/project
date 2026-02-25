import React, { useState, useEffect } from 'react';
import { getToken } from '../../utils/api';
import './ModuleStyles.css';

const DriverManagementModule = ({ user }) => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [driverFilter, setDriverFilter] = useState('all'); // 'all', 'verified', 'pending'
  const [sortBy, setSortBy] = useState('rating'); // 'rating', 'trips', 'name'
  const [newDriver, setNewDriver] = useState({
    name: '',
    email: '',
    phone: '',
    licenseNumber: '',
    licenseExpiry: '',
    experience: 0,
    vehicle: '',
    licensePlate: ''
  });
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState(null);
  const [syncMessage, setSyncMessage] = useState('');

  // Fetch drivers managed by managers
  useEffect(() => {
    fetchDriversManagedByManagers();
  }, []);

  const fetchDriversManagedByManagers = async () => {
    try {
      setLoading(true);
      setRefreshing(true);
      setSyncMessage('Syncing all drivers from system...');
      const token = getToken();
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Fetch drivers from admin endpoint (includes all drivers managed in system)
      const response = await fetch('http://localhost:8000/api/bookings/admin_drivers/', {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const managersDrivers = data.data || data.results || [];
        
        // Transform API response to component format with enhanced field mapping
        const transformedDrivers = managersDrivers.map(driver => ({
          // Basic Info
          id: driver.id,
          name: `${driver.user?.first_name || ''} ${driver.user?.last_name || ''}`.trim(),
          email: driver.user?.email || '',
          phone: driver.user?.phone || driver.phone_number || 'N/A',
          
          // License & Verification
          licenseNumber: driver.license_number || driver.license || 'N/A',
          licenseExpiry: driver.license_expiry || driver.license_expiry_date || 'N/A',
          licenseVerified: driver.license_verified || driver.is_license_verified || false,
          
          // Verification Status
          isVerified: driver.is_verified || false,
          aadharVerified: driver.aadhar_verified || driver.is_aadhar_verified || false,
          bankDetails: driver.bank_verified || driver.is_bank_verified || false,
          documents: driver.is_verified ? 'Verified ✅' : 'Pending ⏳',
          
          // Experience & History
          experience: driver.experience_years || driver.experience || 0,
          totalTrips: driver.total_trips || driver.trips_completed || 0,
          joinDate: driver.created_at ? new Date(driver.created_at).toISOString().split('T')[0] : 'N/A',
          lastTrip: driver.last_trip_date || driver.last_trip ? new Date(driver.last_trip_date || driver.last_trip).toISOString().split('T')[0] : 'N/A',
          
          // Ratings & Performance
          rating: Number(driver.rating) || Number(driver.average_rating) || 4.5,
          averageRating: (Number(driver.rating) || Number(driver.average_rating) || 4.5).toFixed(1),
          completionRate: driver.completion_rate || driver.completion_percentage || '95%',
          responseTime: driver.avg_response_time || driver.average_response_time || '2 mins',
          
          // Financial
          totalIncome: driver.total_income ? `₹${driver.total_income.toLocaleString()}` : '₹0',
          
          // Vehicle & Status
          vehicle: driver.vehicle_name || driver.vehicle || 'Not Assigned',
          licensePlate: driver.license_plate || driver.vehicle_registration || 'N/A',
          vehiclesAssigned: driver.vehicles_assigned || driver.vehicle_count || 0,
          status: driver.status || 'available',
          profileCompletion: driver.profile_completion || driver.profile_completion_percentage || '85%',
          
          // Additional fields for manager dashboard sync
          managerId: driver.manager_id || driver.manager,
          createdAt: driver.created_at,
          updatedAt: driver.updated_at
        }));

        setDrivers(transformedDrivers);
        setLastRefreshTime(new Date().toLocaleTimeString());
        setSyncMessage(`✅ Successfully synced ${transformedDrivers.length} drivers from system`);
        console.log('[DriverManagement] Fetched drivers managed by managers:', transformedDrivers.length);
        
        // Clear sync message after 3 seconds
        setTimeout(() => setSyncMessage(''), 3000);
      } else if (response.status === 401) {
        throw new Error('Authentication failed - please login again');
      } else if (response.status === 403) {
        throw new Error('Permission denied - you do not have access to drivers endpoint. Please ensure you are logged in as admin.');
      } else if (response.status === 404) {
        setDrivers([]);
        setSyncMessage('⚠️ No drivers found in system');
        console.warn('[DriverManagement] No drivers found');
      } else {
        throw new Error(`API error: ${response.status}`);
      }
    } catch (error) {
      console.error('[DriverManagement] Error fetching drivers:', error);
      setSyncMessage(`❌ Failed to sync drivers: ${error.message}`);
      setDrivers([]);
      
      // Clear sync message after 5 seconds
      setTimeout(() => setSyncMessage(''), 5000);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Filter logic
  let filteredDrivers = drivers.filter(driver => {
    const statusMatch = filterStatus === 'all' || driver.status === filterStatus;
    const verificationMatch = driverFilter === 'all' || 
      (driverFilter === 'verified' && driver.isVerified) ||
      (driverFilter === 'pending' && !driver.isVerified);
    const searchMatch = driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        driver.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        driver.phone.includes(searchTerm) ||
                        driver.licenseNumber.includes(searchTerm);
    return statusMatch && searchMatch && verificationMatch;
  });

  // Sort logic
  filteredDrivers = [...filteredDrivers].sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'trips') return b.totalTrips - a.totalTrips;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  // Statistics
  const stats = {
    totalDrivers: drivers.length,
    activeDrivers: drivers.filter(d => d.status === 'available' || d.status === 'on_trip').length,
    availableDrivers: drivers.filter(d => d.status === 'available').length,
    verifiedDrivers: drivers.filter(d => d.isVerified).length,
    averageRating: drivers.length > 0 ? (drivers.reduce((sum, d) => sum + (Number(d.rating) || 0), 0) / drivers.length).toFixed(1) : '0.0',
    totalTrips: drivers.reduce((sum, d) => sum + d.totalTrips, 0),
    totalRevenue: drivers.reduce((sum, d) => {
      const income = parseInt(d.totalIncome?.replace(/₹|,/g, '') || 0);
      return sum + income;
    }, 0)
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      'available': '#27ae60',      // Green
      'on_trip': '#3498db',        // Blue
      'off_duty': '#95a5a6',       // Gray
      'maintenance': '#f39c12'     // Orange
    };
    return colors[status] || '#666';
  };

  const getStatusBadgeLabel = (status) => {
    const labels = {
      'available': 'Available',
      'on_trip': 'On Trip',
      'off_duty': 'Off Duty',
      'maintenance': 'Maintenance'
    };
    return labels[status] || status;
  };

  const handleAddDriver = () => {
    if (!newDriver.name || !newDriver.licenseNumber) {
      alert('Please fill in required fields');
      return;
    }
    const newId = Math.max(...drivers.map(d => d.id), 0) + 1;
    const driverEntry = {
      id: newId,
      ...newDriver,
      totalTrips: 0,
      rating: 0,
      status: 'available',
      joinDate: new Date().toISOString().split('T')[0],
      totalIncome: '₹0',
      documents: 'Pending',
      lastTrip: 'N/A',
      vehiclesAssigned: 0
    };
    setDrivers([...drivers, driverEntry]);
    setNewDriver({ name: '', email: '', phone: '', licenseNumber: '', licenseExpiry: '', experience: 0 });
    setShowAddModal(false);
    alert('Driver added successfully!');
  };

  const handleUpdateStatus = (driverId, newStatus) => {
    setDrivers(drivers.map(d => 
      d.id === driverId ? { ...d, status: newStatus } : d
    ));
    alert('Driver status updated!');
  };

  const handleRemoveDriver = (driverId) => {
    if (window.confirm('Are you sure you want to remove this driver? This action cannot be undone.')) {
      setDrivers(drivers.filter(d => d.id !== driverId));
      alert('Driver removed successfully!');
    }
  };

  if (loading) {
    return (
      <div className="admin-module" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
          <p style={{ fontSize: '16px', color: '#666' }}>Loading drivers managed by managers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-module">
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '28px', marginBottom: '10px' }}>👨‍💼 Drivers Managed by Managers</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>View and manage all drivers in the system from all managers</p>

        {/* Statistics Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          <div className="kpi-card">
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>👨‍💼</div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#2c3e50' }}>{stats.totalDrivers}</div>
            <div style={{ fontSize: '13px', color: '#7f8c8d', marginTop: '5px' }}>Total Drivers</div>
          </div>
          <div className="kpi-card">
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>✅</div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#27ae60' }}>{stats.verifiedDrivers}</div>
            <div style={{ fontSize: '13px', color: '#7f8c8d', marginTop: '5px' }}>Verified Drivers</div>
          </div>
          <div className="kpi-card">
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>🎯</div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#3498db' }}>{stats.activeDrivers}</div>
            <div style={{ fontSize: '13px', color: '#7f8c8d', marginTop: '5px' }}>Active Now</div>
          </div>
          <div className="kpi-card">
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>⭐</div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#f39c12' }}>{stats.averageRating}</div>
            <div style={{ fontSize: '13px', color: '#7f8c8d', marginTop: '5px' }}>Avg Rating</div>
          </div>
          <div className="kpi-card">
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>🚗</div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#e74c3c' }}>{stats.totalTrips.toLocaleString()}</div>
            <div style={{ fontSize: '13px', color: '#7f8c8d', marginTop: '5px' }}>Total Trips</div>
          </div>
          <div className="kpi-card">
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>💰</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#27ae60' }}>₹{(stats.totalRevenue / 100000).toFixed(1)}L</div>
            <div style={{ fontSize: '13px', color: '#7f8c8d', marginTop: '5px' }}>Total Revenue</div>
          </div>
        </div>

        {/* Sync Status Message */}
        {syncMessage && (
          <div style={{
            backgroundColor: syncMessage.includes('❌') ? '#fadbd8' : (syncMessage.includes('✅') ? '#d5f4e6' : '#fef5e7'),
            border: `2px solid ${syncMessage.includes('❌') ? '#e74c3c' : (syncMessage.includes('✅') ? '#27ae60' : '#f39c12')}`,
            color: syncMessage.includes('❌') ? '#e74c3c' : (syncMessage.includes('✅') ? '#27ae60' : '#f39c12'),
            padding: '12px 15px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontWeight: '600',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>{syncMessage}</span>
            {lastRefreshTime && (
              <span style={{ fontSize: '12px', opacity: 0.7 }}>Last synced: {lastRefreshTime}</span>
            )}
          </div>
        )}

        {/* Controls */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.6)',
          padding: '20px',
          borderRadius: '10px',
          border: '1px solid rgba(212, 0, 0, 0.1)',
          backdropFilter: 'blur(10px)',
          marginBottom: '20px'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
            marginBottom: '15px'
          }}>
            <input
              type="text"
              placeholder="Search by name, email, license..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '10px 15px',
                border: '1px solid #bdc3c7',
                borderRadius: '6px',
                fontSize: '14px',
                width: '100%'
              }}
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                padding: '10px 15px',
                border: '1px solid #bdc3c7',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="on_trip">On Trip</option>
              <option value="off_duty">Off Duty</option>
              <option value="maintenance">Maintenance</option>
            </select>
            <select
              value={driverFilter}
              onChange={(e) => setDriverFilter(e.target.value)}
              style={{
                padding: '10px 15px',
                border: '1px solid #bdc3c7',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Verification</option>
              <option value="verified">Verified Only</option>
              <option value="pending">Pending Verification</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '10px 15px',
                border: '1px solid #bdc3c7',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}
            >
              <option value="rating">Sort by Rating ⭐</option>
              <option value="trips">Sort by Trips 🚗</option>
              <option value="name">Sort by Name A-Z</option>
            </select>
          </div>
          <div style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => fetchDriversManagedByManagers()}
              disabled={refreshing}
              style={{
                padding: '10px 20px',
                backgroundColor: refreshing ? '#95a5a6' : '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: refreshing ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                transition: 'all 0.3s ease',
                opacity: refreshing ? 0.7 : 1
              }}
              onMouseEnter={(e) => !refreshing && (e.target.style.backgroundColor = '#2980b9')}
              onMouseLeave={(e) => !refreshing && (e.target.style.backgroundColor = '#3498db')}
              title={refreshing ? "Syncing drivers..." : "Refresh driver list from system"}
            >
              {refreshing ? '⏳ Syncing...' : '🔄 Sync Drivers'}
            </button>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
                setDriverFilter('all');
                setSortBy('rating');
              }}
              style={{
                padding: '10px 20px',
                backgroundColor: '#95a5a6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#7f8c8d'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#95a5a6'}
            >
              🔄 Reset Filters
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                marginLeft: 'auto',
                padding: '10px 20px',
                backgroundColor: '#D40000',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#B30000'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#D40000'}
            >
              + Add New Driver
            </button>
          </div>
        </div>

        {/* Drivers Table */}
        <div style={{
          overflowX: 'auto',
          border: '1px solid rgba(212, 0, 0, 0.2)',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <table className="admin-table" style={{
            width: '100%',
            borderCollapse: 'collapse',
            backgroundColor: 'white'
          }}>
            <thead style={{
              backgroundColor: 'linear-gradient(135deg, #1a1a1a 0%, #2c3e50 100%)',
              color: 'white',
              fontWeight: '600'
            }}>
              <tr>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #D40000' }}>Driver Name</th>
                <th style={{ padding: '15px', textAlign: 'center', borderBottom: '2px solid #D40000' }}>License</th>
                <th style={{ padding: '15px', textAlign: 'center', borderBottom: '2px solid #D40000' }}>Experience</th>
                <th style={{ padding: '15px', textAlign: 'center', borderBottom: '2px solid #D40000' }}>Trips</th>
                <th style={{ padding: '15px', textAlign: 'center', borderBottom: '2px solid #D40000' }}>Rating</th>
                <th style={{ padding: '15px', textAlign: 'center', borderBottom: '2px solid #D40000' }}>Completion</th>
                <th style={{ padding: '15px', textAlign: 'center', borderBottom: '2px solid #D40000' }}>Income</th>
                <th style={{ padding: '15px', textAlign: 'center', borderBottom: '2px solid #D40000' }}>Verification</th>
                <th style={{ padding: '15px', textAlign: 'center', borderBottom: '2px solid #D40000' }}>Status</th>
                <th style={{ padding: '15px', textAlign: 'center', borderBottom: '2px solid #D40000' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDrivers.length > 0 ? (
                filteredDrivers.map((driver, index) => (
                  <tr key={driver.id} style={{
                    borderBottom: '1px solid #e0e0e0',
                    backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(212, 0, 0, 0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#f9f9f9' : 'white'}
                  >
                    <td style={{ padding: '15px' }}>
                      <strong style={{ fontSize: '15px' }}>{driver.name}</strong>
                      <br/>
                      <small style={{ color: '#666', fontSize: '12px' }}>{driver.email}</small>
                      <br/>
                      <small style={{ color: '#999', fontSize: '11px' }}>📱 {driver.phone}</small>
                    </td>
                    <td style={{ padding: '15px', textAlign: 'center' }}>
                      <strong>{driver.licenseNumber}</strong>
                      <br/>
                      <small style={{ 
                        color: driver.licenseExpiry < '2024-06-01' ? '#e74c3c' : '#27ae60',
                        fontSize: '11px',
                        fontWeight: '600'
                      }}>
                        {driver.licenseExpiry}
                      </small>
                    </td>
                    <td style={{ padding: '15px', textAlign: 'center', fontWeight: '600' }}>
                      {driver.experience} yr{driver.experience !== 1 ? 's' : ''}
                    </td>
                    <td style={{ padding: '15px', textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '5px 10px',
                        backgroundColor: 'rgba(52, 152, 219, 0.1)',
                        borderRadius: '6px',
                        fontWeight: '600',
                        color: '#3498db'
                      }}>
                        🚗 {driver.totalTrips}
                      </span>
                    </td>
                    <td style={{ padding: '15px', textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '5px 10px',
                        backgroundColor: 'rgba(243, 156, 18, 0.1)',
                        borderRadius: '6px',
                        fontWeight: '700',
                        color: '#f39c12',
                        fontSize: '15px'
                      }}>
                        ⭐ {driver.averageRating}
                      </span>
                    </td>
                    <td style={{ padding: '15px', textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '5px 10px',
                        backgroundColor: 'rgba(39, 174, 96, 0.1)',
                        borderRadius: '6px',
                        fontWeight: '600',
                        color: '#27ae60'
                      }}>
                        {driver.completionRate}
                      </span>
                    </td>
                    <td style={{ padding: '15px', textAlign: 'center', fontWeight: '600', color: '#27ae60' }}>
                      {driver.totalIncome}
                    </td>
                    <td style={{ padding: '15px', textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '5px 10px',
                        backgroundColor: driver.isVerified ? 'rgba(39, 174, 96, 0.15)' : 'rgba(230, 126, 34, 0.15)',
                        color: driver.isVerified ? '#27ae60' : '#e67e22',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {driver.isVerified ? '✅ Verified' : '⏳ Pending'}
                      </span>
                    </td>
                    <td style={{ padding: '15px', textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '6px 12px',
                        backgroundColor: getStatusBadgeColor(driver.status),
                        color: 'white',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {getStatusBadgeLabel(driver.status)}
                      </span>
                    </td>
                    <td style={{ padding: '15px', textAlign: 'center' }}>
                      <button
                        onClick={() => {
                          setSelectedDriver(driver);
                          setShowDetailModal(true);
                        }}
                        style={{
                          padding: '5px 10px',
                          backgroundColor: '#3498db',
                          color: 'white',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '600',
                          transition: 'all 0.3s ease',
                          marginRight: '5px'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#2980b9'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#3498db'}
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleRemoveDriver(driver.id)}
                        style={{
                          padding: '5px 10px',
                          backgroundColor: '#e74c3c',
                          color: 'white',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '600',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#c0392b'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#e74c3c'}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                    {drivers.length === 0 ? (
                      <div>
                        <div style={{ fontSize: '48px', marginBottom: '10px' }}>📭</div>
                        <p>No drivers managed by managers yet.</p>
                        <p style={{ fontSize: '13px', marginTop: '10px' }}>Managers can create drivers from their dashboard and they will appear here.</p>
                      </div>
                    ) : (
                      'No drivers found matching your filters'
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedDriver && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '30px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ marginBottom: '20px', fontSize: '20px', color: '#D40000' }}>👨‍💼 Driver Profile</h3>
            
            {/* Basic Information */}
            <div style={{
              backgroundColor: 'rgba(212, 0, 0, 0.05)',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '20px',
              borderLeft: '4px solid #D40000'
            }}>
              <h4 style={{ marginBottom: '15px', color: '#2c3e50' }}>📝 Basic Information</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#7f8c8d', display: 'block', marginBottom: '5px' }}>👤 Name</label>
                  <div style={{ fontSize: '15px', fontWeight: '600' }}>{selectedDriver.name}</div>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#7f8c8d', display: 'block', marginBottom: '5px' }}>📧 Email</label>
                  <div style={{ fontSize: '13px' }}>{selectedDriver.email}</div>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#7f8c8d', display: 'block', marginBottom: '5px' }}>📱 Phone</label>
                  <div style={{ fontSize: '13px' }}>{selectedDriver.phone}</div>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#7f8c8d', display: 'block', marginBottom: '5px' }}>📜 License Number</label>
                  <div style={{ fontSize: '13px', fontWeight: '600' }}>{selectedDriver.licenseNumber}</div>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#7f8c8d', display: 'block', marginBottom: '5px' }}>⏰ License Expiry</label>
                  <div style={{ 
                    fontSize: '13px', 
                    fontWeight: '600',
                    color: selectedDriver.licenseExpiry < '2024-06-01' ? '#e74c3c' : '#27ae60',
                    padding: '5px 10px',
                    backgroundColor: selectedDriver.licenseExpiry < '2024-06-01' ? 'rgba(231, 76, 60, 0.1)' : 'rgba(39, 174, 96, 0.1)',
                    borderRadius: '4px',
                    display: 'inline-block'
                  }}>
                    {selectedDriver.licenseExpiry}
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#7f8c8d', display: 'block', marginBottom: '5px' }}>💼 Experience</label>
                  <div style={{ fontSize: '13px', fontWeight: '600' }}>{selectedDriver.experience} years</div>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#7f8c8d', display: 'block', marginBottom: '5px' }}>📅 Join Date</label>
                  <div style={{ fontSize: '13px' }}>{selectedDriver.joinDate}</div>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#7f8c8d', display: 'block', marginBottom: '5px' }}>🚗 Last Trip</label>
                  <div style={{ fontSize: '13px' }}>{selectedDriver.lastTrip}</div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div style={{
              backgroundColor: 'rgba(52, 152, 219, 0.05)',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '20px',
              borderLeft: '4px solid #3498db'
            }}>
              <h4 style={{ marginBottom: '15px', color: '#2c3e50' }}>⭐ Performance Metrics</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                <div style={{ 
                  padding: '12px',
                  backgroundColor: 'white',
                  borderRadius: '6px',
                  border: '1px solid rgba(52, 152, 219, 0.2)'
                }}>
                  <div style={{ fontSize: '12px', color: '#7f8c8d', marginBottom: '5px' }}>🚗 Total Trips</div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#3498db' }}>{selectedDriver.totalTrips}</div>
                </div>
                <div style={{ 
                  padding: '12px',
                  backgroundColor: 'white',
                  borderRadius: '6px',
                  border: '1px solid rgba(243, 156, 18, 0.2)'
                }}>
                  <div style={{ fontSize: '12px', color: '#7f8c8d', marginBottom: '5px' }}>⭐ Average Rating</div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#f39c12' }}>{selectedDriver.averageRating}</div>
                </div>
                <div style={{ 
                  padding: '12px',
                  backgroundColor: 'white',
                  borderRadius: '6px',
                  border: '1px solid rgba(39, 174, 96, 0.2)'
                }}>
                  <div style={{ fontSize: '12px', color: '#7f8c8d', marginBottom: '5px' }}>✅ Completion Rate</div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#27ae60' }}>{selectedDriver.completionRate}</div>
                </div>
                <div style={{ 
                  padding: '12px',
                  backgroundColor: 'white',
                  borderRadius: '6px',
                  border: '1px solid rgba(155, 89, 182, 0.2)'
                }}>
                  <div style={{ fontSize: '12px', color: '#7f8c8d', marginBottom: '5px' }}>⏱️ Response Time</div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#9b59b6' }}>{selectedDriver.responseTime}</div>
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div style={{
              backgroundColor: 'rgba(39, 174, 96, 0.05)',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '20px',
              borderLeft: '4px solid #27ae60'
            }}>
              <h4 style={{ marginBottom: '15px', color: '#2c3e50' }}>💰 Financial Summary</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div style={{ 
                  padding: '12px',
                  backgroundColor: 'white',
                  borderRadius: '6px',
                  border: '1px solid rgba(39, 174, 96, 0.2)'
                }}>
                  <div style={{ fontSize: '12px', color: '#7f8c8d', marginBottom: '5px' }}>💸 Total Income</div>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: '#27ae60' }}>{selectedDriver.totalIncome}</div>
                </div>
                <div style={{ 
                  padding: '12px',
                  backgroundColor: 'white',
                  borderRadius: '6px',
                  border: '1px solid rgba(39, 174, 96, 0.2)'
                }}>
                  <div style={{ fontSize: '12px', color: '#7f8c8d', marginBottom: '5px' }}>🎯 Avg Income/Trip</div>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: '#27ae60' }}>
                    ₹{selectedDriver.totalTrips > 0 ? ((parseInt(selectedDriver.totalIncome.replace('₹', '').replace(/,/g, '')) / selectedDriver.totalTrips).toFixed(0)).toLocaleString() : '0'}
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Status */}
            <div style={{
              backgroundColor: 'rgba(230, 126, 34, 0.05)',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '20px',
              borderLeft: '4px solid #e67e22'
            }}>
              <h4 style={{ marginBottom: '15px', color: '#2c3e50' }}>🔒 Verification Status</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                <div style={{
                  padding: '10px',
                  borderRadius: '6px',
                  backgroundColor: selectedDriver.licenseVerified === 'Verified ✅' ? 'rgba(39, 174, 96, 0.1)' : 'rgba(230, 126, 34, 0.1)',
                  border: `1px solid ${selectedDriver.licenseVerified === 'Verified ✅' ? '#27ae60' : '#e67e22'}`
                }}>
                  <div style={{ fontSize: '12px', marginBottom: '5px' }}>📜 License</div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: selectedDriver.licenseVerified === 'Verified ✅' ? '#27ae60' : '#e67e22' }}>
                    {selectedDriver.licenseVerified}
                  </div>
                </div>
                <div style={{
                  padding: '10px',
                  borderRadius: '6px',
                  backgroundColor: selectedDriver.aadharVerified === 'Verified ✅' ? 'rgba(39, 174, 96, 0.1)' : 'rgba(230, 126, 34, 0.1)',
                  border: `1px solid ${selectedDriver.aadharVerified === 'Verified ✅' ? '#27ae60' : '#e67e22'}`
                }}>
                  <div style={{ fontSize: '12px', marginBottom: '5px' }}>🪪 Aadhar</div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: selectedDriver.aadharVerified === 'Verified ✅' ? '#27ae60' : '#e67e22' }}>
                    {selectedDriver.aadharVerified}
                  </div>
                </div>
                <div style={{
                  padding: '10px',
                  borderRadius: '6px',
                  backgroundColor: selectedDriver.bankDetails === 'Verified ✅' ? 'rgba(39, 174, 96, 0.1)' : 'rgba(230, 126, 34, 0.1)',
                  border: `1px solid ${selectedDriver.bankDetails === 'Verified ✅' ? '#27ae60' : '#e67e22'}`
                }}>
                  <div style={{ fontSize: '12px', marginBottom: '5px' }}>🏦 Bank Details</div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: selectedDriver.bankDetails === 'Verified ✅' ? '#27ae60' : '#e67e22' }}>
                    {selectedDriver.bankDetails}
                  </div>
                </div>
                <div style={{
                  padding: '10px',
                  borderRadius: '6px',
                  backgroundColor: selectedDriver.documents === 'Verified ✅' ? 'rgba(39, 174, 96, 0.1)' : 'rgba(230, 126, 34, 0.1)',
                  border: `1px solid ${selectedDriver.documents === 'Verified ✅' ? '#27ae60' : '#e67e22'}`
                }}>
                  <div style={{ fontSize: '12px', marginBottom: '5px' }}>📋 Documents</div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: selectedDriver.documents === 'Verified ✅' ? '#27ae60' : '#e67e22' }}>
                    {selectedDriver.documents}
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle Assignment */}
            <div style={{
              backgroundColor: 'rgba(149, 165, 166, 0.05)',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '20px',
              borderLeft: '4px solid #95a5a6'
            }}>
              <h4 style={{ marginBottom: '15px', color: '#2c3e50' }}>🚗 Vehicle Assignment</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#7f8c8d', display: 'block', marginBottom: '5px' }}>Vehicle</label>
                  <div style={{ fontSize: '14px', fontWeight: '600' }}>{selectedDriver.vehicle}</div>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#7f8c8d', display: 'block', marginBottom: '5px' }}>License Plate</label>
                  <div style={{ fontSize: '14px', fontWeight: '600' }}>{selectedDriver.licensePlate}</div>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#7f8c8d', display: 'block', marginBottom: '5px' }}>Vehicles Count</label>
                  <div style={{ fontSize: '14px' }}>{selectedDriver.vehiclesAssigned}</div>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#7f8c8d', display: 'block', marginBottom: '5px' }}>Profile Completion</label>
                  <div style={{ fontSize: '14px' }}>{selectedDriver.profileCompletion}</div>
                </div>
              </div>
            </div>

            {/* Status Update */}
            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '20px',
              border: '1px solid #ecf0f1'
            }}>
              <label style={{ fontSize: '12px', color: '#7f8c8d', display: 'block', marginBottom: '8px', fontWeight: '600' }}>🔄 Update Status</label>
              <select
                value={selectedDriver.status}
                onChange={(e) => {
                  setSelectedDriver({ ...selectedDriver, status: e.target.value });
                  handleUpdateStatus(selectedDriver.id, e.target.value);
                }}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '2px solid #ecf0f1',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  backgroundColor: 'white'
                }}
              >
                <option value="available">✅ Available</option>
                <option value="on_trip">🚗 On Trip</option>
                <option value="off_duty">😴 Off Duty</option>
                <option value="maintenance">🔧 Maintenance</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowDetailModal(false)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#ecf0f1',
                  color: '#2c3e50',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Driver Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '30px',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h3 style={{ marginBottom: '20px', fontSize: '20px' }}>➕ Add New Driver</h3>
            
            <div style={{ display: 'grid', gap: '15px', marginBottom: '20px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#7f8c8d', display: 'block', marginBottom: '5px' }}>Name *</label>
                <input
                  type="text"
                  value={newDriver.name}
                  onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
                  placeholder="Driver full name"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #bdc3c7',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#7f8c8d', display: 'block', marginBottom: '5px' }}>Email</label>
                <input
                  type="email"
                  value={newDriver.email}
                  onChange={(e) => setNewDriver({ ...newDriver, email: e.target.value })}
                  placeholder="driver@example.com"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #bdc3c7',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#7f8c8d', display: 'block', marginBottom: '5px' }}>Phone</label>
                <input
                  type="tel"
                  value={newDriver.phone}
                  onChange={(e) => setNewDriver({ ...newDriver, phone: e.target.value })}
                  placeholder="9876543210"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #bdc3c7',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#7f8c8d', display: 'block', marginBottom: '5px' }}>License Number *</label>
                <input
                  type="text"
                  value={newDriver.licenseNumber}
                  onChange={(e) => setNewDriver({ ...newDriver, licenseNumber: e.target.value })}
                  placeholder="DL1234567"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #bdc3c7',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#7f8c8d', display: 'block', marginBottom: '5px' }}>License Expiry</label>
                <input
                  type="date"
                  value={newDriver.licenseExpiry}
                  onChange={(e) => setNewDriver({ ...newDriver, licenseExpiry: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #bdc3c7',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#7f8c8d', display: 'block', marginBottom: '5px' }}>Experience (years)</label>
                <input
                  type="number"
                  value={newDriver.experience}
                  onChange={(e) => setNewDriver({ ...newDriver, experience: parseInt(e.target.value) })}
                  min="0"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #bdc3c7',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewDriver({ name: '', email: '', phone: '', licenseNumber: '', licenseExpiry: '', experience: 0 });
                }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#ecf0f1',
                  color: '#2c3e50',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddDriver}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#27ae60',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Add Driver
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverManagementModule;
