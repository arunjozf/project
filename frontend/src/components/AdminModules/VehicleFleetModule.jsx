import React, { useState, useEffect } from 'react';
import { getToken } from '../../utils/api';
import './ModuleStyles.css';

const VehicleFleetModule = ({ user }) => {
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    filterVehicles();
  }, [vehicles, filterType, searchTerm]);

  const fetchVehicles = async () => {
    try {
      const token = getToken();
      // API will be created: http://localhost:8000/api/cars/

      // Mock data - Complete fleet (16 vehicles)
      // 8 Premium Fleet Cars + 8 Local/Affordable Cars
      setVehicles([
        // PREMIUM FLEET (8 cars)
        {
          id: 1,
          registration: 'DL-01-TS-001',
          brand: 'Tesla',
          model: 'Model S',
          type: 'premium',
          year: 2024,
          capacity: 5,
          status: 'available',
          location: 'Delhi',
          dailyPrice: 5980,
          kmTravelled: 500,
          lastMaintenance: '2025-02-10',
        },
        {
          id: 2,
          registration: 'MH-01-BM-001',
          brand: 'BMW',
          model: 'X7',
          type: 'premium',
          year: 2023,
          capacity: 7,
          status: 'rented',
          location: 'Mumbai',
          dailyPrice: 4980,
          kmTravelled: 8500,
          lastMaintenance: '2025-01-10',
        },
        {
          id: 3,
          registration: 'BG-01-PS-001',
          brand: 'Porsche',
          model: '911',
          type: 'premium',
          year: 2024,
          capacity: 2,
          status: 'available',
          location: 'Bangalore',
          dailyPrice: 7980,
          kmTravelled: 250,
          lastMaintenance: '2025-02-05',
        },
        {
          id: 4,
          registration: 'CH-01-MB-001',
          brand: 'Mercedes',
          model: 'E-Class',
          type: 'premium',
          year: 2023,
          capacity: 5,
          status: 'available',
          location: 'Chennai',
          dailyPrice: 5580,
          kmTravelled: 6000,
          lastMaintenance: '2025-01-20',
        },
        {
          id: 5,
          registration: 'HY-01-RR-001',
          brand: 'Range',
          model: 'Rover',
          type: 'premium',
          year: 2023,
          capacity: 7,
          status: 'available',
          location: 'Hyderabad',
          dailyPrice: 6580,
          kmTravelled: 10000,
          lastMaintenance: '2025-02-01',
        },
        {
          id: 6,
          registration: 'PU-01-AU-001',
          brand: 'Audi',
          model: 'A8',
          type: 'premium',
          year: 2024,
          capacity: 5,
          status: 'reserved',
          location: 'Pune',
          dailyPrice: 5780,
          kmTravelled: 2000,
          lastMaintenance: '2025-02-08',
        },
        {
          id: 7,
          registration: 'DL-02-LM-001',
          brand: 'Lamborghini',
          model: 'Huracán',
          type: 'premium',
          year: 2024,
          capacity: 2,
          status: 'maintenance',
          location: 'Delhi',
          dailyPrice: 11980,
          kmTravelled: 150,
          lastMaintenance: '2025-02-12',
        },
        {
          id: 8,
          registration: 'MH-02-RR-001',
          brand: 'Rolls',
          model: 'Phantom',
          type: 'premium',
          year: 2023,
          capacity: 5,
          status: 'rented',
          location: 'Mumbai',
          dailyPrice: 15980,
          kmTravelled: 2000,
          lastMaintenance: '2025-01-15',
        },
        // LOCAL/AFFORDABLE CARS (8 cars)
        {
          id: 9,
          registration: 'DL-03-MS-001',
          brand: 'Maruti',
          model: 'Swift',
          type: 'local',
          year: 2023,
          capacity: 5,
          status: 'available',
          location: 'Delhi',
          dailyPrice: 1500,
          kmTravelled: 12000,
          lastMaintenance: '2025-01-15',
        },
        {
          id: 10,
          registration: 'MH-03-MW-001',
          brand: 'Maruti',
          model: 'Wagon R',
          type: 'local',
          year: 2023,
          capacity: 5,
          status: 'available',
          location: 'Mumbai',
          dailyPrice: 1800,
          kmTravelled: 8000,
          lastMaintenance: '2025-01-20',
        },
        {
          id: 11,
          registration: 'BG-02-MA-001',
          brand: 'Maruti',
          model: 'Alto',
          type: 'local',
          year: 2024,
          capacity: 4,
          status: 'available',
          location: 'Bangalore',
          dailyPrice: 1200,
          kmTravelled: 1500,
          lastMaintenance: '2025-02-05',
        },
        {
          id: 12,
          registration: 'HY-02-HI-001',
          brand: 'Hyundai',
          model: 'i20',
          type: 'local',
          year: 2023,
          capacity: 5,
          status: 'available',
          location: 'Hyderabad',
          dailyPrice: 1400,
          kmTravelled: 5000,
          lastMaintenance: '2025-01-25',
        },
        {
          id: 13,
          registration: 'PU-02-TX-001',
          brand: 'Tata',
          model: 'Nexon',
          type: 'local',
          capacity: 5,
          year: 2023,
          status: 'available',
          location: 'Pune',
          dailyPrice: 1700,
          kmTravelled: 20000,
          lastMaintenance: '2025-02-03',
        },
        {
          id: 14,
          registration: 'CH-02-HC-001',
          brand: 'Hyundai',
          model: 'Creta',
          type: 'local',
          year: 2024,
          capacity: 5,
          status: 'available',
          location: 'Chennai',
          dailyPrice: 1980,
          kmTravelled: 2000,
          lastMaintenance: '2025-02-05',
        },
        {
          id: 15,
          registration: 'BG-03-TI-001',
          brand: 'Toyota',
          model: 'Innova Crysta',
          type: 'local',
          year: 2022,
          capacity: 8,
          status: 'maintenance',
          location: 'Bangalore',
          dailyPrice: 2480,
          kmTravelled: 45000,
          lastMaintenance: '2025-02-10',
        },
        {
          id: 16,
          registration: 'DL-04-SE-001',
          brand: 'Suzuki',
          model: 'Ertiga',
          type: 'local',
          year: 2023,
          capacity: 7,
          status: 'available',
          location: 'Delhi',
          dailyPrice: 2180,
          kmTravelled: 18000,
          lastMaintenance: '2025-01-30',
        },
      ]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setLoading(false);
    }
  };

  const filterVehicles = () => {
    let filtered = vehicles;

    if (filterType !== 'all') {
      filtered = filtered.filter(v => v.type === filterType);
    }

    if (searchTerm) {
      filtered = filtered.filter(v =>
        v.registration.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.model.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredVehicles(filtered);
  };

  const getVehicleStats = () => {
    return {
      total: vehicles.length,
      available: vehicles.filter(v => v.status === 'available').length,
      rented: vehicles.filter(v => v.status === 'rented').length,
      maintenance: vehicles.filter(v => v.status === 'maintenance').length,
      reserved: vehicles.filter(v => v.status === 'reserved').length,
    };
  };

  const handleScheduleMaintenance = (vehicleId) => {
    alert('Maintenance scheduling for vehicle ' + vehicleId);
  };

  const handleUpdateStatus = (vehicle) => {
    setSelectedVehicle(vehicle);
    setFormData({
      registration: vehicle.registration,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      type: vehicle.type,
      capacity: vehicle.capacity,
      status: vehicle.status,
      dailyPrice: vehicle.dailyPrice,
      kmTravelled: vehicle.kmTravelled,
      lastMaintenance: vehicle.lastMaintenance,
      location: vehicle.location || '',
    });
    setShowUpdateModal(true);
  };

  const handleUpdateFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' || name === 'capacity' || name === 'dailyPrice' || name === 'kmTravelled' ? parseInt(value) : value
    }));
  };

  const handleSaveUpdate = () => {
    if (selectedVehicle) {
      const updatedVehicles = vehicles.map(v => 
        v.id === selectedVehicle.id 
          ? { ...v, ...formData }
          : v
      );
      setVehicles(updatedVehicles);
      setShowUpdateModal(false);
      setSelectedVehicle(null);
      alert('Vehicle updated successfully!');
    }
  };

  if (loading) {
    return <div className="loading">Loading vehicles...</div>;
  }

  const stats = getVehicleStats();

  return (
    <div className="admin-module vehicle-fleet">
      <h2>🚗 Car Inventory Management</h2>

      {/* Filters */}
      <div className="module-filters">
        <input
          type="text"
          placeholder="Search by registration, brand, or model..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="filter-select"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">All Vehicles</option>
          <option value="premium">Premium Fleet</option>
          <option value="local">Affordable Cars</option>
          <option value="taxi">On Demand Taxi</option>
        </select>
      </div>

      {/* Vehicles Table */}
      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Registration</th>
              <th>Brand/Model</th>
              <th>Type</th>
              <th>Year</th>
              <th>Capacity</th>
              <th>Daily Price</th>
              <th>Status</th>
              <th>Km Travelled</th>
              <th>Last Maintenance</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVehicles.map(vehicle => (
              <tr key={vehicle.id}>
                <td>{vehicle.registration}</td>
                <td>{vehicle.brand} {vehicle.model}</td>
                <td>
                  <span className="role-badge" style={{ background: '#e7f3ff' }}>
                    {vehicle.type.charAt(0).toUpperCase() + vehicle.type.slice(1)}
                  </span>
                </td>
                <td>{vehicle.year}</td>
                <td>{vehicle.capacity} seats</td>
                <td>₹{vehicle.dailyPrice.toLocaleString()}</td>
                <td>
                  <span className={`status-badge status-${vehicle.status}`}>
                    {vehicle.status}
                  </span>
                </td>
                <td>{vehicle.kmTravelled.toLocaleString()} km</td>
                <td>{vehicle.lastMaintenance}</td>
                <td>
                  <button
                    className="action-btn"
                    onClick={() => handleScheduleMaintenance(vehicle.id)}
                  >
                    Maintenance
                  </button>
                  <button
                    className="action-btn"
                    onClick={() => handleUpdateStatus(vehicle.id)}
                  >
                    Update
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Fleet Statistics */}
      <div className="module-stats">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Vehicles</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.available}</div>
          <div className="stat-label">Available</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.rented}</div>
          <div className="stat-label">Currently Rented</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.maintenance}</div>
          <div className="stat-label">Under Maintenance</div>
        </div>
      </div>

      {/* Add Vehicle Modal */}
      {showAddVehicleModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Add New Vehicle</h3>
            <div className="form-group">
              <label>Registration Number:</label>
              <input type="text" placeholder="E.g., DL-01-AB-1234" />
            </div>
            <div className="form-group">
              <label>Brand:</label>
              <input type="text" placeholder="E.g., Maruti" />
            </div>
            <div className="form-group">
              <label>Model:</label>
              <input type="text" placeholder="E.g., Swift" />
            </div>
            <div className="form-group">
              <label>Year:</label>
              <input type="number" placeholder="2024" />
            </div>
            <div className="form-group">
              <label>Type:</label>
              <select>
                <option>-- Select Type --</option>
                <option value="local">Local</option>
                <option value="premium">Premium</option>
                <option value="suv">SUV</option>
                <option value="luxury">Luxury</option>
                <option value="taxi">Taxi</option>
              </select>
            </div>
            <div className="form-group">
              <label>Daily Price (₹):</label>
              <input type="number" placeholder="1500" />
            </div>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={() => {
                alert('Vehicle added successfully!');
                setShowAddVehicleModal(false);
              }}>
                Add Vehicle
              </button>
              <button className="btn btn-secondary" onClick={() => setShowAddVehicleModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Vehicle Modal */}
      {showUpdateModal && selectedVehicle && (
        <div className="modal-overlay">
          <div className="modal-content update-vehicle-modal">
            <div className="modal-header">
              <h3>Update Vehicle - {selectedVehicle.registration}</h3>
              <button className="close-btn" onClick={() => setShowUpdateModal(false)}>✕</button>
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label>Registration Number:</label>
                <input 
                  type="text" 
                  name="registration"
                  value={formData.registration || ''}
                  onChange={handleUpdateFormChange}
                />
              </div>
              
              <div className="form-group">
                <label>Brand:</label>
                <input 
                  type="text" 
                  name="brand"
                  value={formData.brand || ''}
                  onChange={handleUpdateFormChange}
                />
              </div>
              
              <div className="form-group">
                <label>Model:</label>
                <input 
                  type="text" 
                  name="model"
                  value={formData.model || ''}
                  onChange={handleUpdateFormChange}
                />
              </div>
              
              <div className="form-group">
                <label>Year:</label>
                <input 
                  type="number" 
                  name="year"
                  value={formData.year || ''}
                  onChange={handleUpdateFormChange}
                />
              </div>
              
              <div className="form-group">
                <label>Vehicle Type:</label>
                <select 
                  name="type"
                  value={formData.type || 'local'}
                  onChange={handleUpdateFormChange}
                >
                  <option value="local">Local</option>
                  <option value="premium">Premium</option>
                  <option value="suv">SUV</option>
                  <option value="luxury">Luxury</option>
                  <option value="taxi">Taxi</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Seating Capacity:</label>
                <input 
                  type="number" 
                  name="capacity"
                  value={formData.capacity || ''}
                  onChange={handleUpdateFormChange}
                />
              </div>
              
              <div className="form-group">
                <label>Daily Price (₹):</label>
                <input 
                  type="number" 
                  name="dailyPrice"
                  value={formData.dailyPrice || ''}
                  onChange={handleUpdateFormChange}
                />
              </div>
              
              <div className="form-group">
                <label>Status:</label>
                <select 
                  name="status"
                  value={formData.status || 'available'}
                  onChange={handleUpdateFormChange}
                >
                  <option value="available">Available</option>
                  <option value="rented">Rented</option>
                  <option value="reserved">Reserved</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Location:</label>
                <input 
                  type="text" 
                  name="location"
                  placeholder="Enter city/location"
                  value={formData.location || ''}
                  onChange={handleUpdateFormChange}
                />
              </div>
              
              <div className="form-group">
                <label>KM Travelled:</label>
                <input 
                  type="number" 
                  name="kmTravelled"
                  value={formData.kmTravelled || ''}
                  onChange={handleUpdateFormChange}
                />
              </div>
              
              <div className="form-group">
                <label>Last Maintenance Date:</label>
                <input 
                  type="date" 
                  name="lastMaintenance"
                  value={formData.lastMaintenance || ''}
                  onChange={handleUpdateFormChange}
                />
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn btn-primary" onClick={handleSaveUpdate}>
                Save Changes
              </button>
              <button className="btn btn-secondary" onClick={() => setShowUpdateModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleFleetModule;
