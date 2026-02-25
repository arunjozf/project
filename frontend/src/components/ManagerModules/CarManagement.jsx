import React, { useState, useEffect } from 'react';
import '../../styles/ManagerModules.css';
import { getToken } from '../../utils/api';

const CarManagement = () => {
  const [cars, setCars] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
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
    image: null,
    car_category: 'affordable', // 'premium' or 'affordable'
  });

  useEffect(() => {
    fetchManagerCars();
  }, []);

  const fetchManagerCars = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await fetch('http://localhost:8000/api/manager/car-management/', {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('[CarManagement] Cars loaded:', data);
        setCars(data.data || []);
      } else {
        console.error('[CarManagement] Failed to fetch cars:', response.status);
      }
    } catch (error) {
      console.error('[CarManagement] Error fetching cars:', error);
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
      formData.image_file = file;
    }
  };

  const handleAddOrUpdateCar = async (e) => {
    e.preventDefault();
    
    const token = getToken();
    const isUpdating = !!editingId;
    const endpoint = isUpdating 
      ? `http://localhost:8000/api/manager/car-management/${editingId}/`
      : 'http://localhost:8000/api/manager/car-management/';
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
      submitData.append('car_category', formData.car_category);
      
      // Handle image - prioritize file upload over URL
      if (formData.image) {
        submitData.append('image', formData.image);
      } else if (formData.image_url) {
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
        setShowAddForm(false);
        resetForm();
        fetchManagerCars();
      } else {
        const errorData = await response.json();
        console.error('[CarManagement] Error:', errorData);
        alert('❌ Error: ' + (errorData.message || 'Failed to save car'));
      }
    } catch (error) {
      console.error('[CarManagement] Error submitting car:', error);
      alert('❌ Failed to save car');
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
      image: null,
      car_category: car.car_category || 'affordable',
    });
    setEditingId(car.id);
    setShowAddForm(true);
    setPhotoPreview(car.image || car.image_url || null);
  };

  const handleDeleteCar = async (carId) => {
    if (!window.confirm('Are you sure you want to delete this car?')) return;

    try {
      const token = getToken();
      const response = await fetch(`http://localhost:8000/api/manager/car-management/${carId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${token}`,
        },
      });

      if (response.ok) {
        setCars(prev => prev.filter(car => car.id !== carId));
        alert('✅ Car deleted successfully!');
        fetchManagerCars();
      } else {
        alert('❌ Error deleting car');
      }
    } catch (error) {
      console.error('[CarManagement] Error deleting car:', error);
      alert('❌ Failed to delete car');
    }
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
      image: null,
      car_category: 'affordable',
    });
    setPhotoPreview(null);
    setEditingId(null);
  };

  return (
    <div className="module-container">
      <div className="module-header">
        <h2>🚗 Car Management</h2>
        <button
          className="btn btn-primary"
          onClick={() => {
            if (showAddForm) {
              resetForm();
            }
            setShowAddForm(!showAddForm);
          }}
        >
          {showAddForm ? '❌ Cancel' : '➕ Add New Car'}
        </button>
      </div>

      {showAddForm && (
        <div className="form-container car-form-container">
          <h3>{editingId ? 'Edit Car' : 'Add New Car to Your Fleet'}</h3>
          <form onSubmit={handleAddOrUpdateCar}>
            <div className="form-grid">
              <div>
                <label>Make *</label>
                <input
                  type="text"
                  name="make"
                  placeholder="e.g., Toyota"
                  value={formData.make}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label>Model *</label>
                <input
                  type="text"
                  name="model"
                  placeholder="e.g., Fortuner"
                  value={formData.model}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label>Year *</label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  min={2000}
                  max={new Date().getFullYear()}
                />
              </div>
              <div>
                <label>Daily Price (₹) *</label>
                <input
                  type="number"
                  name="price"
                  placeholder="e.g., 2500"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  step="100"
                />
              </div>
              <div>
                <label>Mileage (km) *</label>
                <input
                  type="number"
                  name="mileage"
                  placeholder="e.g., 50000"
                  value={formData.mileage}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label>Condition *</label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleInputChange}
                >
                  <option value="new">New</option>
                  <option value="used">Used</option>
                </select>
              </div>
              <div>
                <label style={{ fontWeight: 'bold', color: '#D40000' }}>📌 Car Category *</label>
                <select
                  name="car_category"
                  value={formData.car_category}
                  onChange={handleInputChange}
                  style={{ borderColor: '#D40000' }}
                >
                  <option value="affordable">🚗 Affordable Local Cars</option>
                  <option value="premium">🏎️ Premium Fleet</option>
                </select>
              </div>
            </div>
            
            <div className="photo-upload-section">
              <label style={{ fontWeight: 'bold' }}>📸 Car Photo:</label>
              
              {/* File Upload */}
              <div style={{ marginBottom: '15px' }}>
                <label htmlFor="photo-file" style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#666' }}>Upload Image File:</label>
                <input
                  type="file"
                  id="photo-file"
                  name="image"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{
                    padding: '10px',
                    border: '2px dashed #ccc',
                    borderRadius: '6px',
                    width: '100%',
                    boxSizing: 'border-box',
                    cursor: 'pointer'
                  }}
                />
              </div>

              {/* OR Divider */}
              <div style={{ textAlign: 'center', margin: '12px 0', color: '#999', fontSize: '0.85rem' }}>
                — OR —
              </div>

              {/* URL Input */}
              <div>
                <label htmlFor="photo-url" style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#666' }}>Enter Image URL:</label>
                <input
                  type="text"
                  id="photo-url"
                  name="image_url"
                  placeholder="https://example.com/car.jpg"
                  value={formData.image_url}
                  onChange={handleInputChange}
                  style={{
                    padding: '10px',
                    border: '2px solid #ddd',
                    borderRadius: '6px',
                    width: '100%',
                    boxSizing: 'border-box',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              {photoPreview && (
                <div className="photo-preview" style={{ marginTop: '15px' }}>
                  <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '8px' }}>Preview:</p>
                  <img src={photoPreview} alt="Car preview" style={{ maxWidth: '100%', height: 'auto', borderRadius: '6px', maxHeight: '200px' }} />
                </div>
              )}
            </div>

            <div>
              <label>Description</label>
              <textarea
                name="description"
                placeholder="Car features, condition notes, etc."
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-success">
                ✅ {editingId ? 'Update Car' : 'Add Car to Fleet'}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => {
                  resetForm();
                  setShowAddForm(false);
                }}
              >
                ❌ Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="cars-list">
        <h3>Your Fleet ({cars.length} cars)</h3>
        {loading ? (
          <p className="loading-text">Loading cars...</p>
        ) : cars.length === 0 ? (
          <p className="empty-text">No cars added yet. Click "Add New Car" to get started!</p>
        ) : (
          <div className="cars-grid">
            {cars.map((car) => (
              <div key={car.id} className="car-card">
                {car.image_url && (
                  <div className="car-image">
                    <img src={car.image_url} alt={`${car.make} ${car.model}`} />
                  </div>
                )}
                <div className="car-info">
                  <h4>{car.year} {car.make} {car.model}</h4>
                  <p className="car-price">💰 ₹{Number(car.price).toLocaleString()}/day</p>
                  <p className="car-mileage">🛣️ {Number(car.mileage).toLocaleString()} km</p>
                  <p className="car-condition">
                    <span className={`badge condition-${car.condition}`}>{car.condition}</span>
                  </p>
                  {car.description && (
                    <p className="car-description">{car.description}</p>
                  )}
                </div>
                <div className="car-actions">
                  <button 
                    className="btn btn-edit" 
                    onClick={() => handleEditCar(car)}
                  >
                    ✏️ Edit
                  </button>
                  <button 
                    className="btn btn-danger" 
                    onClick={() => handleDeleteCar(car.id)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CarManagement;
