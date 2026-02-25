import React from 'react';
import './ManagerSidebar.css';

const ManagerSidebar = ({ activeModule, onModuleChange, onLogout }) => {
  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  const modules = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'cars', label: 'Car Management', icon: '🚗' },
    { id: 'bookings', label: 'Booking Approvals', icon: '🎫' },
    { id: 'drivers', label: 'Driver Allocation', icon: '👥' },
    { id: 'taxi', label: 'Taxi Management', icon: '🚕' },
    { id: 'used-cars', label: 'Used Car Listings', icon: '♻️' },
    { id: 'reports', label: 'Reports & Analytics', icon: '📈' },
  ];

  return (
    <aside className="manager-sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">Manager Panel</h2>
        <p className="sidebar-subtitle">Operational Control</p>
      </div>

      <nav className="sidebar-nav">
        <h3 className="nav-section-title">MODULES</h3>
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
          <span>⚙️</span> Settings
        </button>
        <button className="logout-btn" onClick={handleLogout}>
          <span>🚪</span> Logout
        </button>
      </div>
    </aside>
  );
};

export default ManagerSidebar;
