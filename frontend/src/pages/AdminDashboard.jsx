import React, { useState, useEffect } from 'react';
import { getToken } from '../utils/api';
import { saveDashboardState, loadDashboardState } from '../utils/persistentState';
import './AdminDashboard.css';
import AdminSidebar from '../components/AdminSidebar';
// New comprehensive admin modules
import AdminOverview from '../components/AdminModules/AdminOverview';
import UserManagementModule from '../components/AdminModules/UserManagementModule';
import BookingManagementModule from '../components/AdminModules/BookingManagementModule';
import VehicleFleetModule from '../components/AdminModules/VehicleFleetModule';
import RevenueAnalyticsModule from '../components/AdminModules/RevenueAnalyticsModule';
import DriverManagementModule from '../components/AdminModules/DriverManagementModule';
// Legacy imports (kept for backward compatibility)
import UserManagement from '../components/AdminModules/UserManagement';
import SystemMonitoring from '../components/AdminModules/SystemMonitoring';
import CarApprovals from '../components/AdminModules/CarApprovals';
import PaymentControl from '../components/AdminModules/PaymentControl';
import PlatformSettings from '../components/AdminModules/PlatformSettings';

const AdminDashboard = ({ user, onLogout }) => {
  // Try to restore previous state on mount
  const savedState = loadDashboardState('admin');
  
  const [activeTab, setActiveTab] = useState(savedState?.activeModule || 'overview');
  const [systemStats, setSystemStats] = useState(savedState?.systemStats || {
    totalUsers: 0,
    totalManagers: 0,
    totalCustomers: 0,
    totalDrivers: 0,
    totalAdmins: 0,
    totalBookings: 0,
    totalRevenue: 0,
    confirmedBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    platformHealth: 100,
  });
  const [users, setUsers] = useState(savedState?.users || []);
  const [bookings, setBookings] = useState(savedState?.bookings || []);
  const [payments, setPayments] = useState(savedState?.payments || []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = getToken();
    if (token) {
      fetchAdminData();
    }
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const token = getToken();
      console.log('[AdminDashboard] Fetching admin data...');

      let statsData = null;
      let usersData = [];
      let bookingsData = [];
      let paymentsData = [];

      // Fetch system stats
      const statsResponse = await fetch('http://localhost:8000/api/bookings/admin/stats/', {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (statsResponse.ok) {
        const response = await statsResponse.json();
        console.log('[AdminDashboard] Stats loaded:', response);
        statsData = response.data || response;
        setSystemStats(statsData);
      } else {
        console.error('[AdminDashboard] Failed to fetch stats:', statsResponse.status);
      }

      // Fetch users
      const usersResponse = await fetch('http://localhost:8000/api/bookings/admin/users/', {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (usersResponse.ok) {
        const response = await usersResponse.json();
        console.log('[AdminDashboard] Users loaded:', response);
        usersData = response.data || [];
        setUsers(usersData);
      } else {
        console.error('[AdminDashboard] Failed to fetch users:', usersResponse.status);
      }

      // Fetch all bookings
      const bookingsResponse = await fetch('http://localhost:8000/api/bookings/all_bookings/', {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (bookingsResponse.ok) {
        const response = await bookingsResponse.json();
        console.log('[AdminDashboard] Bookings loaded:', response);
        bookingsData = response.data || response || [];
        setBookings(bookingsData);
      } else {
        console.error('[AdminDashboard] Failed to fetch bookings:', bookingsResponse.status);
      }

      // Fetch payments
      const paymentsResponse = await fetch('http://localhost:8000/api/bookings/admin/payments/', {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (paymentsResponse.ok) {
        const response = await paymentsResponse.json();
        console.log('[AdminDashboard] Payments loaded:', response);
        paymentsData = response.data || [];
        setPayments(paymentsData);
      } else {
        console.error('[AdminDashboard] Failed to fetch payments:', paymentsResponse.status);
      }

      // Save state to localStorage for persistence
      const stateToSave = {
        activeModule: 'overview',
        systemStats: statsData,
        users: usersData,
        bookings: bookingsData,
        payments: paymentsData,
        lastFetch: Date.now()
      };
      saveDashboardState('admin', stateToSave);
      
      setError(null);
    } catch (error) {
      console.error('[AdminDashboard] Error fetching data:', error);
      setError('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    try {
      const token = getToken();
      const response = await fetch(`http://localhost:8000/api/bookings/admin/users/${userId}/delete_user/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        alert('User deleted successfully');
        fetchAdminData();
      } else {
        alert('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user');
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
      return;
    }
    try {
      const token = getToken();
      const response = await fetch(`http://localhost:8000/api/bookings/admin/payments/${bookingId}/delete_payment/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        alert('Booking deleted successfully');
        fetchAdminData();
      } else {
        alert('Failed to delete booking');
      }
    } catch (error) {
      console.error('Error deleting booking:', error);
      alert('Error deleting booking');
    }
  };

  const renderModule = () => {
    switch (activeTab) {
      case 'users':
        return <UserManagementModule user={user} />;
      case 'bookings':
        return <BookingManagementModule user={user} />;
      case 'vehicles':
        return <VehicleFleetModule user={user} />;
      case 'revenue':
        return <RevenueAnalyticsModule user={user} />;
      case 'drivers':
        return <DriverManagementModule user={user} />;
      case 'car-approvals':
        return <CarApprovals />;
      case 'cars':
        return <VehicleFleetModule user={user} />;
      case 'payments':
        return <PaymentControl />;
      case 'settings':
        return <PlatformSettings />;
      case 'overview':
      default:
        return (
          <AdminOverview 
            user={user}
          />
        );
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Admin Dashboard...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Error: {error}</h2>
        <button onClick={fetchAdminData}>Retry</button>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="admin-header">
        <div className="admin-header-left">
          <h1>🛡️ Admin Control Panel</h1>
          <p>Platform Administration & Monitoring</p>
        </div>
        <button className="logout-header-btn" onClick={onLogout}>Logout</button>
      </div>

      {/* Main Container */}
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar Navigation */}
        <div className="manager-sidebar" style={{ width: '320px' }}>
          <div className="manager-logo-section">
            <div className="manager-logo">🛡️ Admin</div>
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
                <span className="manager-nav-icon">📊</span>
                <span className="manager-nav-text">Overview</span>
              </button>
            </div>

            {/* Management Section */}
            <div className="manager-nav-section">
              <p className="manager-nav-label">Management</p>
              <button 
                className={`manager-nav-item ${activeTab === 'users' ? 'active' : ''}`}
                onClick={() => setActiveTab('users')}
              >
                <span className="manager-nav-icon">👥</span>
                <span className="manager-nav-text">Users</span>
                {users.length > 0 && <span className="manager-nav-badge">{users.length}</span>}
              </button>
              <button 
                className={`manager-nav-item ${activeTab === 'bookings' ? 'active' : ''}`}
                onClick={() => setActiveTab('bookings')}
              >
                <span className="manager-nav-icon">📋</span>
                <span className="manager-nav-text">Bookings</span>
                {bookings.length > 0 && <span className="manager-nav-badge">{bookings.length}</span>}
              </button>
              <button 
                className={`manager-nav-item ${activeTab === 'drivers' ? 'active' : ''}`}
                onClick={() => setActiveTab('drivers')}
              >
                <span className="manager-nav-icon">👨‍💼</span>
                <span className="manager-nav-text">Drivers</span>
              </button>
              <button 
                className={`manager-nav-item ${activeTab === 'vehicles' ? 'active' : ''}`}
                onClick={() => setActiveTab('vehicles')}
              >
                <span className="manager-nav-icon">🚗</span>
                <span className="manager-nav-text">Fleet</span>
              </button>
            </div>

            {/* Analytics Section */}
            <div className="manager-nav-section">
              <p className="manager-nav-label">Analytics</p>
              <button 
                className={`manager-nav-item ${activeTab === 'revenue' ? 'active' : ''}`}
                onClick={() => setActiveTab('revenue')}
              >
                <span className="manager-nav-icon">💰</span>
                <span className="manager-nav-text">Revenue</span>
              </button>
            </div>

            {/* Settings Section */}
            <div className="manager-nav-section">
              <p className="manager-nav-label">Settings</p>
              <button 
                className={`manager-nav-item ${activeTab === 'payments' ? 'active' : ''}`}
                onClick={() => setActiveTab('payments')}
              >
                <span className="manager-nav-icon">💳</span>
                <span className="manager-nav-text">Payments</span>
              </button>
              <button 
                className={`manager-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                <span className="manager-nav-icon">⚙️</span>
                <span className="manager-nav-text">Settings</span>
              </button>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="manager-main-content" style={{ flex: 1 }}>
          <div className="admin-module-container">
            {renderModule()}
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminCarManagementModule = ({ onBack }) => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    price: '',
    mileage: '',
    condition: 'new',
    description: '',
    image_url: '',
    status: 'available'
  });

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await fetch('http://localhost:8000/api/bookings/admin/car-management/', {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCars(data.data || []);
      }
    } catch (error) {
      console.error('[AdminCarManagement] Error fetching cars:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: (name === 'year' || name === 'price' || name === 'mileage') ? Number(value) : value,
    }));
  };

  const handleSubmitCar = async (e) => {
    e.preventDefault();
   
    const token = getToken();
    const isUpdating = !!editingId;
    const endpoint = isUpdating 
      ? `http://localhost:8000/api/bookings/admin/car-management/${editingId}/`
      : 'http://localhost:8000/api/bookings/admin/car-management/';
    const method = isUpdating ? 'PATCH' : 'POST';

    try {
      const submitData = new FormData();
      submitData.append('make', formData.make);
      submitData.append('model', formData.model);
      submitData.append('year', formData.year);
      submitData.append('price', formData.price);
      submitData.append('mileage', formData.mileage);
      submitData.append('condition', formData.condition);
      submitData.append('description', formData.description);
      submitData.append('status', formData.status);
      if (formData.image_url) {
        submitData.append('image_url', formData.image_url);
      }

      const response = await fetch(endpoint, {
        method: method,
        headers: {
          'Authorization': `Token ${token}`,
        },
        body: submitData,
      });

      if (response.ok) {
        const resultData = await response.json();
        const newCar = resultData.data || resultData;
        if (isUpdating) {
          setCars(prev => prev.map(car => car.id === editingId ? newCar : car));
          setEditingId(null);
          alert('✅ Car updated successfully!');
        } else {
          setCars(prev => [newCar, ...prev]);
          alert('✅ Car added successfully!');
        }
        setShowForm(false);
        resetForm();
        fetchCars();
      } else {
        alert('❌ Error saving car');
      }
    } catch (error) {
      console.error('[AdminCarManagement] Error:', error);
      alert('❌ Failed to save car');
    }
  };

  const handleDeleteCar = async (carId) => {
    if (!window.confirm('Are you sure you want to delete this car?')) return;

    try {
      const token = getToken();
      const response = await fetch(`http://localhost:8000/api/bookings/admin/car-management/${carId}/delete_car/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${token}`,
        },
      });

      if (response.ok) {
        setCars(prev => prev.filter(car => car.id !== carId));
        alert('✅ Car deleted successfully!');
      }
    } catch (error) {
      console.error('[AdminCarManagement] Error:', error);
      alert('❌ Failed to delete car');
    }
  };

  const handleEditCar = (car) => {
    setFormData({
      make: car.make,
      model: car.model,
      year: car.year,
      price: car.price,
      mileage: car.mileage,
      condition: car.condition,
      description: car.description,
      image_url: car.image_url || '',
      status: car.status
    });
    setEditingId(car.id);
    setShowForm(true);
    setPhotoPreview(car.image_url || null);
  };

  const resetForm = () => {
    setFormData({
      make: '',
      model: '',
      year: new Date().getFullYear(),
      price: '',
      mileage: '',
      condition: 'new',
      description: '',
      image_url: '',
      status: 'available'
    });
    setPhotoPreview(null);
    setEditingId(null);
  };

  return (
    <div className="detail-view">
      <div className="detail-header">
        <button className="btn-back" onClick={onBack}>← Back</button>
        <h2>🚗 Car Management ({cars.length} cars)</h2>
        <button className="btn-small" onClick={() => setShowForm(!showForm)}>
          {showForm ? '❌ Cancel' : '➕ Add Car'}
        </button>
      </div>

      {showForm && (
        <div className="detail-view admin-car-form" style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#f9fbff', borderRadius: '8px' }}>
          <h4>{editingId ? 'Edit Car' : 'Add New Car'}</h4>
          <form onSubmit={handleSubmitCar} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <input type="text" name="make" placeholder="Make" value={formData.make} onChange={handleInputChange} required />
            <input type="text" name="model" placeholder="Model" value={formData.model} onChange={handleInputChange} required />
            <input type="number" name="year" placeholder="Year" value={formData.year} onChange={handleInputChange} />
            <input type="number" name="price" placeholder="Price/Day (₹)" value={formData.price} onChange={handleInputChange} required />
            <input type="number" name="mileage" placeholder="Mileage (km)" value={formData.mileage} onChange={handleInputChange} required />
            <select name="condition" value={formData.condition} onChange={handleInputChange}>
              <option value="new">New</option>
              <option value="used">Used</option>
            </select>
            <select name="status" value={formData.status} onChange={handleInputChange}>
              <option value="available">Available</option>
              <option value="sold">Sold</option>
              <option value="pending">Pending</option>
            </select>
            <input type="text" name="image_url" placeholder="Image URL" value={formData.image_url} onChange={handleInputChange} />
            <textarea name="description" placeholder="Description" value={formData.description} onChange={handleInputChange} style={{ gridColumn: '1 / -1' }} rows="3" />
            <button type="submit" className="btn-delete" style={{ gridColumn: '1 / -1' }}>
              ✅ {editingId ? 'Update Car' : 'Add Car'}
            </button>
          </form>
        </div>
      )}

      <div className="detail-table-container">
        {loading ? (
          <p>Loading cars...</p>
        ) : cars.length === 0 ? (
          <p>No cars found</p>
        ) : (
          <div className="cars-admin-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {cars.map((car) => (
              <div key={car.id} className="admin-car-card" style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1rem', backgroundColor: 'white' }}>
                {car.image_url && <img src={car.image_url} alt={`${car.make} ${car.model}`} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '4px', marginBottom: '0.5rem' }} />}
                <h5>{car.year} {car.make} {car.model}</h5>
                <p style={{ margin: '0.25rem 0' }}>💰 ₹{Number(car.price).toLocaleString()}/day</p>
                <p style={{ margin: '0.25rem 0' }}>🛣️ {Number(car.mileage).toLocaleString()} km</p>
                <p style={{ margin: '0.25rem 0' }}><span className={`status-badge status-${car.status}`}>{car.status}</span></p>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button className="btn-delete" onClick={() => handleEditCar(car)} style={{ flex: 1, fontSize: '0.85rem', padding: '0.5rem' }}>✏️ Edit</button>
                  <button className="btn-delete" onClick={() => handleDeleteCar(car.id)} style={{ flex: 1, fontSize: '0.85rem', padding: '0.5rem' }}>🗑️ Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
