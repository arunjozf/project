import React, { useState } from 'react';
import './VehiclesManagement.css';

const VehiclesManagement = () => {
  const [vehicles, setVehicles] = useState([
    {
      id: 1,
      licensePlate: 'TX-2024-001',
      make: 'Toyota',
      model: 'Prius',
      year: 2022,
      type: 'Sedan',
      status: 'Active',
      mileage: '12,450 km',
      lastService: '2026-01-15',
      driver: 'Mike Johnson',
      color: 'White',
    },
    {
      id: 2,
      licensePlate: 'TX-2024-002',
      make: 'Honda',
      model: 'Civic',
      year: 2021,
      type: 'Sedan',
      status: 'Active',
      mileage: '24,800 km',
      lastService: '2025-12-20',
      driver: 'Sarah Connor',
      color: 'Blue',
    },
    {
      id: 3,
      licensePlate: 'TX-2024-003',
      make: 'Ford',
      model: 'Focus',
      year: 2023,
      type: 'Hatchback',
      status: 'Maintenance',
      mileage: '8,300 km',
      lastService: '2026-01-10',
      driver: 'Unassigned',
      color: 'Silver',
    },
  ]);

  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleViewDetails = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowModal(true);
  };

  const handleStatusChange = (vehicleId, newStatus) => {
    setVehicles(
      vehicles.map((v) =>
        v.id === vehicleId ? { ...v, status: newStatus } : v
      )
    );
  };

  return (
    <div className="vehicles-management">
      <div className="management-header">
        <h2>Vehicle Management</h2>
        <button className="btn btn-primary">+ Add Vehicle</button>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Search by license plate, make, or model..."
          className="search-input"
        />
        <select className="filter-select">
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Maintenance">Maintenance</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      <div className="vehicles-table-container">
        <table className="vehicles-table">
          <thead>
            <tr>
              <th>License Plate</th>
              <th>Vehicle</th>
              <th>Type</th>
              <th>Year</th>
              <th>Mileage</th>
              <th>Status</th>
              <th>Driver</th>
              <th>Last Service</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((vehicle) => (
              <tr key={vehicle.id}>
                <td>
                  <span className="license-plate">{vehicle.licensePlate}</span>
                </td>
                <td>
                  <div className="vehicle-info">
                    <strong>{vehicle.make}</strong>
                    <small>{vehicle.model}</small>
                  </div>
                </td>
                <td>{vehicle.type}</td>
                <td>{vehicle.year}</td>
                <td>{vehicle.mileage}</td>
                <td>
                  <select
                    className={`status-select status-${vehicle.status.toLowerCase()}`}
                    value={vehicle.status}
                    onChange={(e) => handleStatusChange(vehicle.id, e.target.value)}
                  >
                    <option value="Active">Active</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </td>
                <td>{vehicle.driver}</td>
                <td>
                  <small>{vehicle.lastService}</small>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-action btn-view"
                      onClick={() => handleViewDetails(vehicle)}
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

      {showModal && selectedVehicle && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Vehicle Details</h3>
              <button
                className="close-btn"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <span className="label">License Plate:</span>
                <span className="value">{selectedVehicle.licensePlate}</span>
              </div>
              <div className="detail-row">
                <span className="label">Make:</span>
                <span className="value">{selectedVehicle.make}</span>
              </div>
              <div className="detail-row">
                <span className="label">Model:</span>
                <span className="value">{selectedVehicle.model}</span>
              </div>
              <div className="detail-row">
                <span className="label">Year:</span>
                <span className="value">{selectedVehicle.year}</span>
              </div>
              <div className="detail-row">
                <span className="label">Type:</span>
                <span className="value">{selectedVehicle.type}</span>
              </div>
              <div className="detail-row">
                <span className="label">Color:</span>
                <span className="value">{selectedVehicle.color}</span>
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

export default VehiclesManagement;
