import React from 'react';
import '../styles/AdminSidebar.css';

const AdminSidebar = ({ activeModule, onModuleChange, onLogout }) => {
  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  const modules = [
    { id: 'overview', label: 'Dashboard Overview', icon: '📊' },
    { id: 'users', label: 'User Management', icon: '👥' },
    { id: 'bookings', label: 'Booking Management', icon: '📅' },
    { id: 'vehicles', label: 'Vehicle Fleet', icon: '🚗' },
    { id: 'drivers', label: 'Driver Management', icon: '👨‍💼' },
    { id: 'taxi', label: 'Taxi Monitoring', icon: '🚕' },
    { id: 'used_cars', label: 'Used Car Sales', icon: '🏎️' },
    { id: 'complaints', label: 'Complaints', icon: '📋' },
    { id: 'revenue', label: 'Revenue & Analytics', icon: '💰' },
    { id: 'monitoring', label: 'System Monitoring', icon: '🏥' },
    { id: 'car-approvals', label: 'Car Approvals', icon: '✅' },
    { id: 'payments', label: 'Payment Control', icon: '💳' },
    { id: 'settings', label: 'Platform Settings', icon: '⚙️' },
  ];

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">🔐 Admin</h2>
        <p className="sidebar-subtitle">Full Control</p>
      </div>

      <nav className="sidebar-nav">
        <h3 className="nav-section-title">ADMINISTRATION</h3>
        {modules.map((module) => (
          <button
            key={module.id}
            className={`nav-item ${activeModule === module.id ? 'active' : ''}`}
            onClick={() => onModuleChange(module.id)}
          >
            <span className="nav-icon">{module.icon}</span>
            <span className="nav-label">{module.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="settings-btn">
          <span>ℹ️</span> Help & Support
        </button>
        <button className="logout-btn" onClick={handleLogout}>
          <span>🚪</span> Logout
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
