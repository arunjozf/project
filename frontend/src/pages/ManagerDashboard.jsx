import React, { useState, useEffect } from 'react';
import '../styles/ManagerDashboard.css';
import ManagerSidebar from '../components/ManagerSidebar';
import CarManagement from '../components/ManagerModules/CarManagement';
import BookingApproval from '../components/ManagerModules/BookingApproval';
import DriverAllocation from '../components/ManagerModules/DriverAllocation';
import TaxiManagement from '../components/ManagerModules/TaxiManagement';
import UsedCarListings from '../components/ManagerModules/UsedCarListings';
import ManagerReports from '../components/ManagerModules/ManagerReports';
import { getToken } from '../utils/api';
import { saveDashboardState, loadDashboardState } from '../utils/persistentState';

const ManagerDashboard = ({ user, onLogout }) => {
  // Try to restore previous state on mount
  const savedState = loadDashboardState('manager');
  
  const [activeTab, setActiveTab] = useState(savedState?.activeModule || 'overview');
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState(savedState?.stats || {
    totalCars: 0,
    activeBookings: 0,
    pendingApprovals: 0,
    totalEarnings: 0,
  });
  const [bookings, setBookings] = useState(savedState?.bookings || []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('[ManagerDashboard] Component mounted. User prop:', user);
    
    const storedUser = localStorage.getItem('userData');
    const parsedUser = storedUser ? JSON.parse(storedUser) : user;
    
    console.log('[ManagerDashboard] Using user:', parsedUser);
    
    if (parsedUser && parsedUser.role === 'manager') {
      setUserData(parsedUser);
      fetchManagerData();
    } else {
      console.warn('[ManagerDashboard] User is not a manager or not found');
      setLoading(false);
    }
  }, [user]);

  const fetchManagerData = async () => {
    try {
      const token = getToken() || localStorage.getItem('authToken');
      
      console.log('[ManagerDashboard] Fetching manager data with token:', token?.substring(0, 10) + '...');
      
      let statsData = {};
      let bookingsData = [];
      
      // Fetch stats
      const statsResponse = await fetch('http://localhost:8000/api/manager/stats/', {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (statsResponse.ok) {
        const response = await statsResponse.json();
        console.log('[ManagerDashboard] Stats loaded:', response);
        const data = response.data || response;
        // Map backend data to frontend state
        statsData = {
          totalCars: 0, // Not available in backend stats
          activeBookings: data.confirmedBookings || 0,
          pendingApprovals: data.pendingApprovals || 0,
          totalEarnings: data.thisMonthRevenue || data.totalRevenue || 0,
        };
        setStats(statsData);
      } else {
        console.error('[ManagerDashboard] Failed to fetch stats:', statsResponse.status);
      }

      // Fetch pending bookings for approval
      const bookingsResponse = await fetch('http://localhost:8000/api/manager/bookings/', {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (bookingsResponse.ok) {
        const response = await bookingsResponse.json();
        console.log('[ManagerDashboard] Bookings loaded:', response);
        bookingsData = response.data || [];
        setBookings(bookingsData);
      } else {
        console.error('[ManagerDashboard] Failed to fetch bookings:', bookingsResponse.status);
      }

      // Save state to localStorage for persistence
      const stateToSave = {
        activeModule: 'overview',
        stats: statsData,
        bookings: bookingsData,
        lastFetch: Date.now()
      };
      saveDashboardState('manager', stateToSave);
      
      setError(null);
    } catch (error) {
      console.error('[ManagerDashboard] Error fetching data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const renderModule = () => {
    switch (activeTab) {
      case 'cars':
        return <CarManagement />;
      case 'bookings':
        return <BookingApproval bookings={bookings} onBookingsUpdate={fetchManagerData} />;
      case 'drivers':
        return <DriverAllocation onAllocationUpdate={fetchManagerData} />;
      case 'taxi':
        return <TaxiManagement />;
      case 'used-cars':
        return <UsedCarListings />;
      case 'reports':
        return <ManagerReports />;
      case 'overview':
      default:
        return <ManagerOverview stats={stats} bookings={bookings} onModuleChange={setActiveTab} />;
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Manager Dashboard...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Error: {error}</h2>
        <button onClick={fetchManagerData}>Retry</button>
      </div>
    );
  }

  if (!userData) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Error: Unauthorized Access</h2>
        <p>You must be a manager to access this dashboard.</p>
        <button onClick={onLogout}>Back to Login</button>
      </div>
    );
  }

  return (
    <div className="manager-dashboard">
      {/* Header */}
      <div className="manager-header">
        <div className="manager-header-left">
          <h1>📊 Manager Dashboard</h1>
          <p>Welcome, {userData.first_name || userData.username}</p>
        </div>
        <button className="logout-header-btn" onClick={onLogout}>Logout</button>
      </div>

      {/* Main Container */}
      <div className="manager-dashboard-container">
        {/* Sidebar */}
        <div className="manager-sidebar">
          <div className="manager-logo-section">
            <div className="manager-logo">🚕 Manager</div>
            <p className="manager-logo-subtitle">Control Panel</p>
          </div>
          
          <nav className="manager-nav">
            {/* Main Section */}
            <div className="manager-nav-section">
              <p className="manager-nav-label">Main</p>
              <button 
                className={`manager-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <span className="manager-nav-icon">📈</span>
                <span className="manager-nav-text">Overview</span>
              </button>
            </div>

            {/* Management Section */}
            <div className="manager-nav-section">
              <p className="manager-nav-label">Management</p>
              <button 
                className={`manager-nav-item ${activeTab === 'bookings' ? 'active' : ''}`}
                onClick={() => setActiveTab('bookings')}
              >
                <span className="manager-nav-icon">📋</span>
                <span className="manager-nav-text">Bookings</span>
                {stats.pendingApprovals > 0 && <span className="manager-nav-badge">{stats.pendingApprovals}</span>}
              </button>
              <button 
                className={`manager-nav-item ${activeTab === 'cars' ? 'active' : ''}`}
                onClick={() => setActiveTab('cars')}
              >
                <span className="manager-nav-icon">🚗</span>
                <span className="manager-nav-text">Cars</span>
              </button>
              <button 
                className={`manager-nav-item ${activeTab === 'drivers' ? 'active' : ''}`}
                onClick={() => setActiveTab('drivers')}
              >
                <span className="manager-nav-icon">👨‍💼</span>
                <span className="manager-nav-text">Drivers</span>
              </button>
              <button 
                className={`manager-nav-item ${activeTab === 'taxi' ? 'active' : ''}`}
                onClick={() => setActiveTab('taxi')}
              >
                <span className="manager-nav-icon">🚕</span>
                <span className="manager-nav-text">Taxi Service</span>
              </button>
            </div>

            {/* Services Section */}
            <div className="manager-nav-section">
              <p className="manager-nav-label">Services</p>
              <button 
                className={`manager-nav-item ${activeTab === 'used-cars' ? 'active' : ''}`}
                onClick={() => setActiveTab('used-cars')}
              >
                <span className="manager-nav-icon">🏪</span>
                <span className="manager-nav-text">Used Cars Sales</span>
              </button>
              <button 
                className={`manager-nav-item ${activeTab === 'reports' ? 'active' : ''}`}
                onClick={() => setActiveTab('reports')}
              >
                <span className="manager-nav-icon">📊</span>
                <span className="manager-nav-text">Reports</span>
              </button>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="manager-main-content">
          <div className="manager-module-container">
            {renderModule()}
          </div>
        </div>
      </div>
    </div>
  );
};

const ManagerOverview = ({ stats, bookings, onModuleChange }) => {
  const [selectedCard, setSelectedCard] = useState(null);

  const handleCardClick = (cardType) => {
    setSelectedCard(cardType);
  };

  const closeModal = () => {
    setSelectedCard(null);
  };

  return (
    <div className="manager-overview">
      <div className="overview-title-section">
        <h2>📈 Dashboard Overview</h2>
        <p>Your key performance metrics at a glance</p>
      </div>
      
      <div className="stats-grid">
        <div 
          className="stat-card clickable-card" 
          onClick={() => handleCardClick('approvals')}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>Pending Approvals</h3>
            <p className="stat-value">{stats.pendingApprovals || 0}</p>
            <p className="stat-label">Awaiting review</p>
          </div>
          <div className="card-hover-indicator">Click for details →</div>
        </div>
        <div 
          className="stat-card clickable-card" 
          onClick={() => handleCardClick('earnings')}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Total Earnings</h3>
            <p className="stat-value">₹{(stats.totalEarnings || 0).toLocaleString()}</p>
            <p className="stat-label">This month</p>
          </div>
          <div className="card-hover-indicator">Click for details →</div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedCard && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>✕</button>
            
            {selectedCard === 'approvals' && (
              <div className="detail-modal">
                <h2>⏳ Pending Approvals</h2>
                <p className="modal-subtitle">Total Pending: {stats.pendingApprovals}</p>
                <div className="detail-list">
                  {bookings.filter(b => b.status === 'pending').length > 0 ? (
                    bookings.filter(b => b.status === 'pending').map((booking) => (
                      <div key={booking.id} className="detail-item">
                        <div className="detail-item-header">
                          <h4>Booking #{booking.id}</h4>
                          <span className="status-badge status-pending">pending</span>
                        </div>
                        <div className="detail-item-info">
                          <p><strong>Type:</strong> {booking.booking_type}</p>
                          <p><strong>Route:</strong> {booking.pickup_location} → {booking.dropoff_location}</p>
                          <p><strong>Date:</strong> {booking.pickup_date} at {booking.pickup_time}</p>
                          <p><strong>Duration:</strong> {booking.number_of_days} days</p>
                          <p><strong>Amount:</strong> ₹{booking.total_amount}</p>
                        </div>
                        <div className="detail-item-actions">
                          <button className="btn-approve">✓ Approve</button>
                          <button className="btn-reject">✗ Reject</button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="no-data">No pending approvals</p>
                  )}
                </div>
              </div>
            )}

            {selectedCard === 'earnings' && (
              <div className="detail-modal">
                <h2>💰 Earnings Summary</h2>
                <div className="earnings-summary">
                  <div className="earnings-stat">
                    <h3>This Month</h3>
                    <p className="earnings-value">₹{(stats.totalEarnings || 0).toLocaleString()}</p>
                  </div>
                  <div className="earnings-breakdown">
                    <h4>Earnings by Booking Type</h4>
                    <div className="breakdown-list">
                      <div className="breakdown-item">
                        <span>🚗 Car Rentals</span>
                        <span>₹{((stats.totalEarnings || 0) * 0.7).toLocaleString()}</span>
                      </div>
                      <div className="breakdown-item">
                        <span>🚕 Taxi Service</span>
                        <span>₹{((stats.totalEarnings || 0) * 0.3).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="overview-content">
        <div className="overview-section">
          <h3>⚡ Quick Actions</h3>
          <div className="quick-actions">
            <button 
              className="action-btn action-add-car"
              onClick={() => onModuleChange('cars')}
            >
              <span>➕</span> Add New Car
            </button>
            <button 
              className="action-btn action-view-bookings"
              onClick={() => onModuleChange('bookings')}
            >
              <span>📋</span> Review Bookings
            </button>
            <button 
              className="action-btn action-driver-assignment"
              onClick={() => onModuleChange('taxi')}
            >
              <span>🚕</span> Manage Taxi Service
            </button>
            <button 
              className="action-btn action-reports"
              onClick={() => onModuleChange('reports')}
            >
              <span>📊</span> View Reports
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
