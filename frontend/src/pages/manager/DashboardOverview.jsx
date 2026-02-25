import React from 'react';
import './DashboardOverview.css';

const DashboardOverview = () => {
  // Mock data
  const stats = [
    { label: 'Total Bookings', value: '1,234', trend: '+12%', icon: '📅' },
    { label: 'Active Vehicles', value: '45', trend: '+5%', icon: '🚗' },
    { label: 'Maintenance Jobs', value: '8', trend: '-2%', icon: '🔧' },
    { label: 'Active Drivers', value: '32', trend: '+8%', icon: '👨‍✈️' },
  ];

  const recentBookings = [
    { id: 1, customer: 'John Doe', vehicle: 'Toyota Prius', status: 'Completed', date: '2026-01-28' },
    { id: 2, customer: 'Jane Smith', vehicle: 'Honda Civic', status: 'In Progress', date: '2026-01-29' },
    { id: 3, customer: 'Bob Johnson', vehicle: 'Ford Focus', status: 'Scheduled', date: '2026-01-30' },
  ];

  return (
    <div className="dashboard-overview">
      <div className="stats-grid">
        {stats.map((stat, idx) => (
          <div key={idx} className="stat-card">
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-content">
              <p className="stat-label">{stat.label}</p>
              <h3 className="stat-value">{stat.value}</h3>
              <span className={`stat-trend ${stat.trend.startsWith('+') ? 'positive' : 'negative'}`}>
                {stat.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-section">
        <h2>Recent Bookings</h2>
        <table className="bookings-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Vehicle</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {recentBookings.map((booking) => (
              <tr key={booking.id}>
                <td>{booking.customer}</td>
                <td>{booking.vehicle}</td>
                <td>
                  <span className={`status-badge status-${booking.status.toLowerCase().replace(' ', '-')}`}>
                    {booking.status}
                  </span>
                </td>
                <td>{booking.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardOverview;
