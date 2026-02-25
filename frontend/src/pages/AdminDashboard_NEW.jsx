import React, { useState } from 'react';
import './AdminDashboard.css';
import AdminOverview from './AdminModules/AdminOverview';
import UserManagementModule from './AdminModules/UserManagementModule';
import BookingManagementModule from './AdminModules/BookingManagementModule';
import VehicleFleetModule from './AdminModules/VehicleFleetModule';
import ComplaintsModule from './AdminModules/ComplaintsModule';
import RevenueAnalyticsModule from './AdminModules/RevenueAnalyticsModule';

const AdminDashboard = ({ user, onLogout }) => {
  const [activeModule, setActiveModule] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const modules = [
    { id: 'overview', name: '📊 Dashboard Overview', icon: '📊' },
    { id: 'users', name: '👥 User Management', icon: '👥' },
    { id: 'bookings', name: '📅 Booking Management', icon: '📅' },
    { id: 'vehicles', name: '🚗 Vehicle Fleet', icon: '🚗' },
    { id: 'complaints', name: '📋 Complaints', icon: '📋' },
    { id: 'revenue', name: '💰 Revenue & Analytics', icon: '💰' },
    { id: 'drivers', name: '👨‍💼 Drivers', icon: '👨‍💼' },
    { id: 'maintenance', name: '🔧 Maintenance', icon: '🔧' },
    { id: 'payments', name: '💳 Payments & Refunds', icon: '💳' },
    { id: 'settings', name: '⚙️ System Settings', icon: '⚙️' },
  ];

  const renderModule = () => {
    switch (activeModule) {
      case 'overview':
        return <AdminOverview user={user} />;
      case 'users':
        return <UserManagementModule user={user} />;
      case 'bookings':
        return <BookingManagementModule user={user} />;
      case 'vehicles':
        return <VehicleFleetModule user={user} />;
      case 'complaints':
        return <ComplaintsModule user={user} />;
      case 'revenue':
        return <RevenueAnalyticsModule user={user} />;
      case 'drivers':
        return <div className="admin-module"><h2>👨‍💼 Driver Management</h2><p>Driver management features coming soon...</p></div>;
      case 'maintenance':
        return <div className="admin-module"><h2>🔧 Maintenance Scheduling</h2><p>Maintenance management features coming soon...</p></div>;
      case 'payments':
        return <div className="admin-module"><h2>💳 Payments & Refunds</h2><p>Payment management features coming soon...</p></div>;
      case 'settings':
        return <div className="admin-module"><h2>⚙️ System Settings</h2><p>System settings management coming soon...</p></div>;
      default:
        return <AdminOverview user={user} />;
    }
  };

  return (
    <div className="admin-container">
      {/* Header */}
      <div className="admin-header">
        <div className="header-left">
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            ☰
          </button>
          <h1>🎯 ADMIN DASHBOARD</h1>
        </div>
        <div className="header-right">
          <div className="admin-info">
            <span>Welcome, {user?.email || 'Admin'}</span>
            <button className="logout-btn" onClick={onLogout}>Logout</button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="admin-content">
        {/* Sidebar */}
        <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <div className="sidebar-header">
            <h3>Navigation</h3>
          </div>
          <nav className="sidebar-nav">
            {modules.map(module => (
              <button
                key={module.id}
                className={`nav-item ${activeModule === module.id ? 'active' : ''}`}
                onClick={() => setActiveModule(module.id)}
                title={module.name}
              >
                <span className="nav-icon">{module.icon}</span>
                <span className="nav-text">{module.name}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="admin-main">
          {renderModule()}
        </main>
      </div>

      {/* Footer */}
      <footer className="admin-footer">
        <p>&copy; 2024 Car Rental & Vehicle Service Management System. All rights reserved.</p>
        <p>System Version: 1.0 | Last Updated: February 2024</p>
      </footer>
    </div>
  );
};

export default AdminDashboard;
