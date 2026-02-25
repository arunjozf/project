import React, { useState } from 'react';
import './ManagerDashboard.css';
import ManagerSidebar from '../../components/ManagerSidebar';
import BookingsManagement from './BookingsManagement';
import VehiclesManagement from './VehiclesManagement';
import MaintenanceManagement from './MaintenanceManagement';
import DriversManagement from './DriversManagement';
import DashboardOverview from './DashboardOverview';

const ManagerDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'bookings':
        return <BookingsManagement />;
      case 'vehicles':
        return <VehiclesManagement />;
      case 'maintenance':
        return <MaintenanceManagement />;
      case 'drivers':
        return <DriversManagement />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="manager-dashboard">
      <ManagerSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="manager-content">
        <div className="manager-header">
          <h1>Manager Dashboard</h1>
          <div className="manager-user-info">
            <span>Welcome, {user?.first_name || 'Manager'}</span>
            {onLogout && <button className="logout-btn" onClick={onLogout}>Logout</button>}
          </div>
        </div>
        <div className="manager-body">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
