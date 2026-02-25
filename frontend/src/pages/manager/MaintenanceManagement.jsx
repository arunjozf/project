import React, { useState } from 'react';
import './MaintenanceManagement.css';

const MaintenanceManagement = () => {
  const [maintenance, setMaintenance] = useState([
    {
      id: 1,
      maintenanceNo: 'MT001',
      vehicle: 'Toyota Prius',
      licensePlate: 'TX-2024-001',
      type: 'Regular Service',
      status: 'Completed',
      scheduledDate: '2026-01-25',
      completedDate: '2026-01-26',
      cost: '$150.00',
      technician: 'John Smith',
      description: 'Oil change, filter replacement, inspection',
    },
    {
      id: 2,
      maintenanceNo: 'MT002',
      vehicle: 'Honda Civic',
      licensePlate: 'TX-2024-002',
      type: 'Tire Rotation',
      status: 'In Progress',
      scheduledDate: '2026-01-28',
      completedDate: null,
      cost: '$80.00',
      technician: 'Mike Johnson',
      description: 'Tire rotation and balancing',
    },
  ]);

  const [selectedMaintenance, setSelectedMaintenance] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleViewDetails = (item) => {
    setSelectedMaintenance(item);
    setShowModal(true);
  };

  const handleStatusChange = (id, newStatus) => {
    setMaintenance(
      maintenance.map((m) =>
        m.id === id ? { ...m, status: newStatus } : m
      )
    );
  };

  return (
    <div className="maintenance-management">
      <div className="management-header">
        <h2>Maintenance Management</h2>
        <button className="btn btn-primary">+ Schedule Maintenance</button>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Search by maintenance no., vehicle, or license plate..."
          className="search-input"
        />
        <select className="filter-select">
          <option value="">All Status</option>
          <option value="Scheduled">Scheduled</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      <div className="maintenance-table-container">
        <table className="maintenance-table">
          <thead>
            <tr>
              <th>Maintenance No.</th>
              <th>Vehicle</th>
              <th>License Plate</th>
              <th>Type</th>
              <th>Status</th>
              <th>Scheduled Date</th>
              <th>Technician</th>
              <th>Cost</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {maintenance.map((item) => (
              <tr key={item.id}>
                <td>
                  <span className="maintenance-no">{item.maintenanceNo}</span>
                </td>
                <td>{item.vehicle}</td>
                <td>
                  <span className="license-plate">{item.licensePlate}</span>
                </td>
                <td>{item.type}</td>
                <td>
                  <select
                    className={`status-select status-${item.status.toLowerCase().replace(' ', '-')}`}
                    value={item.status}
                    onChange={(e) => handleStatusChange(item.id, e.target.value)}
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </td>
                <td>
                  <small>{item.scheduledDate}</small>
                </td>
                <td>{item.technician}</td>
                <td>{item.cost}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-action btn-view"
                      onClick={() => handleViewDetails(item)}
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

      {showModal && selectedMaintenance && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Maintenance Details</h3>
              <button
                className="close-btn"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <span className="label">Maintenance No.:</span>
                <span className="value">{selectedMaintenance.maintenanceNo}</span>
              </div>
              <div className="detail-row">
                <span className="label">Vehicle:</span>
                <span className="value">{selectedMaintenance.vehicle}</span>
              </div>
              <div className="detail-row">
                <span className="label">Type:</span>
                <span className="value">{selectedMaintenance.type}</span>
              </div>
              <div className="detail-row">
                <span className="label">Status:</span>
                <span className={`badge status-${selectedMaintenance.status.toLowerCase().replace(' ', '-')}`}>
                  {selectedMaintenance.status}
                </span>
              </div>
              <div className="detail-row">
                <span className="label">Cost:</span>
                <span className="value">{selectedMaintenance.cost}</span>
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

export default MaintenanceManagement;
