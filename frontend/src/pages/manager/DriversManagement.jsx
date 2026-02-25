import React, { useState } from 'react';
import './DriversManagement.css';

const DriversManagement = () => {
  const [drivers, setDrivers] = useState([
    {
      id: 1,
      name: 'Mike Johnson',
      phone: '+1-555-0201',
      email: 'mike@example.com',
      licenseNo: 'DL123456',
      licenseExpiry: '2027-05-15',
      status: 'Active',
      vehicle: 'Toyota Prius',
      licensePlate: 'TX-2024-001',
      joinDate: '2023-06-10',
      rating: 4.8,
      totalRides: 542,
    },
    {
      id: 2,
      name: 'Sarah Connor',
      phone: '+1-555-0202',
      email: 'sarah@example.com',
      licenseNo: 'DL123457',
      licenseExpiry: '2026-12-20',
      status: 'Active',
      vehicle: 'Honda Civic',
      licensePlate: 'TX-2024-002',
      joinDate: '2023-08-15',
      rating: 4.9,
      totalRides: 628,
    },
  ]);

  const [selectedDriver, setSelectedDriver] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleViewDetails = (driver) => {
    setSelectedDriver(driver);
    setShowModal(true);
  };

  const handleStatusChange = (driverId, newStatus) => {
    setDrivers(
      drivers.map((d) =>
        d.id === driverId ? { ...d, status: newStatus } : d
      )
    );
  };

  return (
    <div className="drivers-management">
      <div className="management-header">
        <h2>Driver Management</h2>
        <button className="btn btn-primary">+ Add Driver</button>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Search by name, phone, or license number..."
          className="search-input"
        />
        <select className="filter-select">
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="On Leave">On Leave</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      <div className="drivers-table-container">
        <table className="drivers-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>License No.</th>
              <th>Status</th>
              <th>Vehicle</th>
              <th>Rating</th>
              <th>Total Rides</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((driver) => (
              <tr key={driver.id}>
                <td>{driver.name}</td>
                <td>{driver.phone}</td>
                <td>
                  <span className="license-no">{driver.licenseNo}</span>
                </td>
                <td>
                  <select
                    className={`status-select status-${driver.status.toLowerCase().replace(' ', '-')}`}
                    value={driver.status}
                    onChange={(e) => handleStatusChange(driver.id, e.target.value)}
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </td>
                <td>
                  <div className="vehicle-info">
                    <span>{driver.vehicle}</span>
                    <small>{driver.licensePlate}</small>
                  </div>
                </td>
                <td>
                  <span className="rating">⭐ {driver.rating}</span>
                </td>
                <td>{driver.totalRides}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-action btn-view"
                      onClick={() => handleViewDetails(driver)}
                      title="View Details"
                    >
                      👁️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && selectedDriver && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Driver Details</h3>
              <button
                className="close-btn"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="driver-profile">
                <div className="profile-avatar">👨‍✔️</div>
                <h4>{selectedDriver.name}</h4>
              </div>
              
              <div className="detail-row">
                <span className="label">Phone:</span>
                <span className="value">{selectedDriver.phone}</span>
              </div>
              <div className="detail-row">
                <span className="label">Email:</span>
                <span className="value">{selectedDriver.email}</span>
              </div>
              <div className="detail-row">
                <span className="label">License No.:</span>
                <span className="value">{selectedDriver.licenseNo}</span>
              </div>
              <div className="detail-row">
                <span className="label">Status:</span>
                <span className={`badge status-${selectedDriver.status.toLowerCase().replace(' ', '-')}`}>
                  {selectedDriver.status}
                </span>
              </div>
              <div className="detail-row">
                <span className="label">Rating:</span>
                <span className="value">⭐ {selectedDriver.rating}</span>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriversManagement;
