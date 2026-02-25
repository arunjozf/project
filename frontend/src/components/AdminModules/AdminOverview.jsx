import React, { useState, useEffect } from 'react';
import { getToken } from '../../utils/api';
import './ModuleStyles.css';

const AdminOverview = ({ user }) => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCustomers: 0,
    totalManagers: 0,
    totalDrivers: 0,
    totalAdmins: 0,
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    pendingPayments: 0,
    completedPayments: 0,
    totalCars: 0,
    availableCars: 0,
    rentedCars: 0,
  });

  const [selectedCard, setSelectedCard] = useState(null);
  const [detailsData, setDetailsData] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverviewStats();
  }, []);

  const fetchOverviewStats = async () => {
    try {
      const token = getToken();
      
      // Fetch admin stats
      const statsResponse = await fetch('http://localhost:8000/api/bookings/admin/stats/', {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (statsResponse.ok) {
        const data = await statsResponse.json();
        const statsData = data.data || data;
        setStats(statsData);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching overview stats:', error);
      setLoading(false);
    }
  };

  const handleCardClick = async (cardType) => {
    setSelectedCard(cardType);
    setDetailsLoading(true);
    await fetchCardDetails(cardType);
  };

  const fetchCardDetails = async (cardType) => {
    try {
      const token = getToken();
      let endpoint = '';
      
      switch (cardType) {
        case 'users':
          endpoint = 'http://localhost:8000/api/bookings/admin/users/';
          break;
        case 'managers':
          endpoint = 'http://localhost:8000/api/bookings/admin/users/?role=manager';
          break;
        case 'customers':
          endpoint = 'http://localhost:8000/api/bookings/admin/users/?role=customer';
          break;
        case 'drivers':
          endpoint = 'http://localhost:8000/api/bookings/admin/drivers/';
          break;
        case 'bookings':
          endpoint = 'http://localhost:8000/api/bookings/all_bookings/';
          break;
        case 'pending_bookings':
          endpoint = 'http://localhost:8000/api/bookings/all_bookings/?status=pending';
          break;
        case 'confirmed_bookings':
          endpoint = 'http://localhost:8000/api/bookings/all_bookings/?status=confirmed';
          break;
        case 'completed_bookings':
          endpoint = 'http://localhost:8000/api/bookings/all_bookings/?status=completed';
          break;
        case 'revenue':
          endpoint = 'http://localhost:8000/api/bookings/admin/payments/';
          break;
        case 'cars':
          endpoint = 'http://localhost:8000/api/cars/manager/';
          break;
        default:
          break;
      }

      if (endpoint) {
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          const details = Array.isArray(data) ? data : (data.data || []);
          setDetailsData(details);
        }
      }
    } catch (error) {
      console.error(`Error fetching ${cardType} details:`, error);
      setDetailsData([]);
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedCard(null);
    setDetailsData([]);
  };

  if (loading) {
    return <div className="loading">Loading overview data...</div>;
  }

  return (
    <div className="admin-overview">
      <h2>📊 Dashboard Overview</h2>

      {/* KPI Cards - All Clickable */}
      <div className="kpi-grid">
        {/* User Management KPIs */}
        <div className="kpi-section">
          <h3>👥 User Management</h3>
          <div className="kpi-row">
            <div 
              className="kpi-card clickable-card" 
              onClick={() => handleCardClick('users')}
              style={{ cursor: 'pointer' }}
            >
              <div className="kpi-value">{stats.totalUsers?.toLocaleString() || 0}</div>
              <div className="kpi-label">Total Users</div>
              <div className="card-hint">Click for details</div>
            </div>
            <div 
              className="kpi-card clickable-card" 
              onClick={() => handleCardClick('customers')}
              style={{ cursor: 'pointer' }}
            >
              <div className="kpi-value">{stats.totalCustomers?.toLocaleString() || 0}</div>
              <div className="kpi-label">Customers</div>
              <div className="card-hint">Click for details</div>
            </div>
            <div 
              className="kpi-card clickable-card" 
              onClick={() => handleCardClick('managers')}
              style={{ cursor: 'pointer' }}
            >
              <div className="kpi-value">{stats.totalManagers || 0}</div>
              <div className="kpi-label">Managers</div>
              <div className="card-hint">Click for details</div>
            </div>
            <div 
              className="kpi-card clickable-card" 
              onClick={() => handleCardClick('drivers')}
              style={{ cursor: 'pointer' }}
            >
              <div className="kpi-value">{stats.totalDrivers || 0}</div>
              <div className="kpi-label">Drivers</div>
              <div className="card-hint">Click for details</div>
            </div>
          </div>
        </div>

        {/* Booking KPIs */}
        <div className="kpi-section">
          <h3>📅 Booking Status</h3>
          <div className="kpi-row">
            <div 
              className="kpi-card clickable-card" 
              onClick={() => handleCardClick('bookings')}
              style={{ cursor: 'pointer' }}
            >
              <div className="kpi-value">{stats.totalBookings?.toLocaleString() || 0}</div>
              <div className="kpi-label">Total Bookings</div>
              <div className="card-hint">Click for details</div>
            </div>
            <div 
              className="kpi-card status-pending clickable-card" 
              onClick={() => handleCardClick('pending_bookings')}
              style={{ cursor: 'pointer' }}
            >
              <div className="kpi-value">{stats.pendingBookings || 0}</div>
              <div className="kpi-label">Pending</div>
              <div className="card-hint">Click for details</div>
            </div>
            <div 
              className="kpi-card status-approved clickable-card" 
              onClick={() => handleCardClick('confirmed_bookings')}
              style={{ cursor: 'pointer' }}
            >
              <div className="kpi-value">{stats.confirmedBookings?.toLocaleString() || 0}</div>
              <div className="kpi-label">Confirmed</div>
              <div className="card-hint">Click for details</div>
            </div>
            <div 
              className="kpi-card status-completed clickable-card" 
              onClick={() => handleCardClick('completed_bookings')}
              style={{ cursor: 'pointer' }}
            >
              <div className="kpi-value">{stats.completedBookings?.toLocaleString() || 0}</div>
              <div className="kpi-label">Completed</div>
              <div className="card-hint">Click for details</div>
            </div>
          </div>
        </div>

        {/* Revenue KPIs */}
        <div className="kpi-section">
          <h3>💰 Revenue</h3>
          <div className="kpi-row">
            <div className="kpi-card">
              <div className="kpi-value">₹{(stats.totalRevenue / 100000).toFixed(1)}L</div>
              <div className="kpi-label">Total Revenue</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-value">₹{(stats.monthlyRevenue / 1000).toFixed(0)}K</div>
              <div className="kpi-label">This Month</div>
            </div>
            <div 
              className="kpi-card status-completed clickable-card" 
              onClick={() => handleCardClick('revenue')}
              style={{ cursor: 'pointer' }}
            >
              <div className="kpi-value">₹{(stats.completedPayments / 100000).toFixed(1)}L</div>
              <div className="kpi-label">Completed Payments</div>
              <div className="card-hint">Click for details</div>
            </div>
            <div className="kpi-card status-pending">
              <div className="kpi-value">₹{(stats.pendingPayments / 1000).toFixed(0)}K</div>
              <div className="kpi-label">Pending</div>
            </div>
          </div>
        </div>

        {/* Vehicle KPIs */}
        <div className="kpi-section">
          <h3>🚗 Fleet Management</h3>
          <div className="kpi-row">
            <div 
              className="kpi-card clickable-card" 
              onClick={() => handleCardClick('cars')}
              style={{ cursor: 'pointer' }}
            >
              <div className="kpi-value">{stats.totalCars || 0}</div>
              <div className="kpi-label">Total Cars</div>
              <div className="card-hint">Click for details</div>
            </div>
            <div className="kpi-card status-approved">
              <div className="kpi-value">{stats.availableCars || 0}</div>
              <div className="kpi-label">Available</div>
            </div>
            <div className="kpi-card status-pending">
              <div className="kpi-value">{stats.rentedCars || 0}</div>
              <div className="kpi-label">Rented</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-value">✓</div>
              <div className="kpi-label">All Systems</div>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedCard && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>✕</button>
            
            <div className="detail-modal">
              <h2>{getModalTitle(selectedCard)}</h2>
              <p className="modal-subtitle">Total Records: {detailsData.length}</p>

              {detailsLoading ? (
                <p className="loading-text">Loading details...</p>
              ) : detailsData.length > 0 ? (
                <div className="detail-list">
                  {detailsData.slice(0, 20).map((item) => (
                    <div key={item.id} className="detail-item">
                      {renderDetailItem(item, selectedCard)}
                    </div>
                  ))}
                  {detailsData.length > 20 && (
                    <p className="no-data" style={{ textAlign: 'center', marginTop: '1rem' }}>
                      Showing 20 of {detailsData.length} records
                    </p>
                  )}
                </div>
              ) : (
                <p className="no-data">No data available</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  function getModalTitle(cardType) {
    const titles = {
      users: '👥 All Users',
      customers: '👤 Customers',
      managers: '🏢 Managers',
      drivers: '🚗 Drivers',
      bookings: '📅 All Bookings',
      pending_bookings: '⏳ Pending Bookings',
      confirmed_bookings: '✓ Confirmed Bookings',
      completed_bookings: '✔️ Completed Bookings',
      revenue: '💳 All Revenue Transactions',
      cars: '🚗 All Vehicles',
    };
    return titles[cardType] || 'Details';
  }

  function renderDetailItem(item, cardType) {
    if (cardType === 'users' || cardType === 'customers' || cardType === 'managers') {
      return (
        <>
          <div className="detail-item-header">
            <h4>{item.first_name} {item.last_name}</h4>
            <span className={`status-badge status-${item.is_active ? 'active' : 'inactive'}`}>
              {item.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="detail-item-info">
            <p><strong>Email:</strong> {item.email}</p>
            <p><strong>Username:</strong> {item.username}</p>
            <p><strong>Role:</strong> {item.role}</p>
            <p><strong>Joined:</strong> {new Date(item.date_joined).toLocaleDateString()}</p>
          </div>
        </>
      );
    } else if (cardType === 'drivers') {
      return (
        <>
          <div className="detail-item-header">
            <h4>{item.user?.first_name} {item.user?.last_name}</h4>
            <span className={`status-badge status-${item.is_active ? 'active' : 'inactive'}`}>
              {item.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="detail-item-info">
            <p><strong>License:</strong> {item.license_number}</p>
            <p><strong>Email:</strong> {item.user?.email}</p>
            <p><strong>Experience:</strong> {item.experience_years} years</p>
            <p><strong>Rating:</strong> ⭐ {item.average_rating || 'N/A'}</p>
          </div>
        </>
      );
    } else if (cardType === 'bookings' || cardType === 'pending_bookings' || cardType === 'confirmed_bookings' || cardType === 'completed_bookings') {
      return (
        <>
          <div className="detail-item-header">
            <h4>Booking #{item.id}</h4>
            <span className={`status-badge status-${item.status}`}>{item.status}</span>
          </div>
          <div className="detail-item-info">
            <p><strong>Type:</strong> {item.booking_type}</p>
            <p><strong>Route:</strong> {item.pickup_location} → {item.dropoff_location}</p>
            <p><strong>Date:</strong> {item.pickup_date} at {item.pickup_time}</p>
            <p><strong>Duration:</strong> {item.number_of_days} days</p>
            <p><strong>Amount:</strong> ₹{item.total_amount}</p>
            <p><strong>Payment:</strong> {item.payment_merchant_status || 'Pending'}</p>
          </div>
        </>
      );
    } else if (cardType === 'revenue') {
      return (
        <>
          <div className="detail-item-header">
            <h4>Transaction #{item.id}</h4>
            <span className={`status-badge status-${item.payment_status}`}>{item.payment_status}</span>
          </div>
          <div className="detail-item-info">
            <p><strong>Amount:</strong> ₹{item.amount}</p>
            <p><strong>Booking:</strong> #{item.booking}</p>
            <p><strong>Payment Method:</strong> {item.payment_method}</p>
            <p><strong>Date:</strong> {new Date(item.created_at).toLocaleDateString()}</p>
          </div>
        </>
      );
    } else if (cardType === 'cars') {
      return (
        <>
          <div className="detail-item-header">
            <h4>{item.year} {item.make} {item.model}</h4>
            <span className={`status-badge status-${item.status}`}>{item.status}</span>
          </div>
          <div className="detail-item-info">
            <p><strong>Reg:</strong> {item.registration_number}</p>
            <p><strong>Daily Rate:</strong> ₹{item.daily_rate}</p>
            <p><strong>Mileage:</strong> {item.mileage} km</p>
          </div>
        </>
      );
    }
  }
};

export default AdminOverview;
