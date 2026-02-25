import React, { useState, useEffect } from 'react';
import '../../styles/ManagerModules.css';

const UsedCarListings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    price: '',
    mileage: '',
    condition: 'used',
    description: '',
    image: null,
  });

  useEffect(() => {
    fetchUsedCarListings();
  }, []);

  const fetchUsedCarListings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('[UsedCarListings] No authentication token found');
        alert('❌ Please login first');
        setLoading(false);
        return;
      }
      const response = await fetch('http://localhost:8000/api/cars/', {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setListings(data);
      } else if (response.status === 401) {
        console.error('[UsedCarListings] Unauthorized - token may be invalid');
        alert('❌ Session expired. Please login again.');
      } else {
        console.error('[UsedCarListings] Server error:', response.status);
      }
    } catch (error) {
      console.error('[UsedCarListings] Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' || name === 'price' || name === 'mileage' ? Number(value) : value,
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
      setFormData(prev => ({
        ...prev,
        image: file,
      }));
    }
  };

  const handlePostListing = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.make || !formData.model || !formData.price || !formData.mileage) {
      alert('❌ Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('❌ Please login first');
        setSubmitting(false);
        return;
      }
      
      // Validate image is selected
      if (!formData.image) {
        alert('❌ Please upload a car photo');
        setSubmitting(false);
        return;
      }
      
      // Use FormData for file uploads
      const submitData = new FormData();
      submitData.append('make', formData.make);
      submitData.append('model', formData.model);
      submitData.append('year', formData.year);
      submitData.append('price', formData.price);
      submitData.append('mileage', formData.mileage);
      submitData.append('condition', formData.condition);
      submitData.append('description', formData.description);
      submitData.append('image', formData.image);

      const response = await fetch('http://localhost:8000/api/cars/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
        },
        body: submitData,
      });

      if (response.ok) {
        const newListing = await response.json();
        setListings(prev => [newListing, ...prev]);
        setShowAddForm(false);
        resetForm();
        alert('✅ Listing posted successfully!');
      } else {
        const errorData = await response.json();
        console.error('[UsedCarListings] Error:', errorData);
        alert('❌ Error: ' + (errorData.message || 'Failed to post listing'));
      }
    } catch (error) {
      console.error('[UsedCarListings] Error posting listing:', error);
      alert('❌ Failed to post listing: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      make: '',
      model: '',
      year: new Date().getFullYear(),
      price: '',
      mileage: '',
      condition: 'used',
      description: '',
      image: null,
    });
    setPhotoPreview(null);
  };

  return (
    <div className="module-container">
      <div className="module-header">
        <h2>♻️ Used Car Listings</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? '❌ Cancel' : '➕ Post New Listing'}
        </button>
      </div>

      {showAddForm && (
        <div className="form-container">
          <h3>Post a Used Car for Sale</h3>
          <form onSubmit={handlePostListing}>
            <div className="form-grid">
              <input
                type="text"
                name="make"
                placeholder="Car Make *"
                value={formData.make}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="model"
                placeholder="Car Model *"
                value={formData.model}
                onChange={handleInputChange}
                required
              />
              <input
                type="number"
                name="year"
                placeholder="Year"
                value={formData.year}
                onChange={handleInputChange}
                min={2000}
              />
              <input
                type="number"
                name="price"
                placeholder="Price (₹) *"
                value={formData.price}
                onChange={handleInputChange}
                required
                step="100"
              />
              <input
                type="number"
                name="mileage"
                placeholder="Mileage (km) *"
                value={formData.mileage}
                onChange={handleInputChange}
                required
              />
              <select
                name="condition"
                value={formData.condition}
                onChange={handleInputChange}
              >
                <option value="new">New</option>
                <option value="used">Used</option>
              </select>
            </div>

            {/* Photo Upload Section */}
            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '6px' }}>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>📸 Car Photo:</label>
              
              {/* File Upload */}
              <div>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleFileChange}
                  required
                  style={{
                    padding: '10px',
                    border: '2px dashed #3498db',
                    borderRadius: '6px',
                    width: '100%',
                    boxSizing: 'border-box',
                    cursor: 'pointer',
                    backgroundColor: '#f0f8ff'
                  }}
                />
                <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>📸 Select a car photo (JPG, PNG)</small>
              </div>

              {photoPreview && (
                <div style={{ marginTop: '15px' }}>
                  <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '8px' }}>Preview:</p>
                  <img src={photoPreview} alt="Car preview" style={{ maxWidth: '100%', height: 'auto', borderRadius: '6px', maxHeight: '200px' }} />
                </div>
              )}
            </div>

            <textarea
              name="description"
              placeholder="Car Details and Description (optional)"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
              style={{ marginTop: '15px', width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'inherit' }}
            />
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button 
                type="submit" 
                className="btn btn-success"
                disabled={submitting}
              >
                {submitting ? '⟳ Posting...' : '✅ Post Listing'}
              </button>
              <button 
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setShowAddForm(false);
                  resetForm();
                }}
                disabled={submitting}
              >
                ❌ Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="listings-grid">
        <h3>Your Listings ({listings.length})</h3>
        {loading ? (
          <p className="loading-text">Loading listings...</p>
        ) : listings.length === 0 ? (
          <p className="empty-text">No used car listings yet.</p>
        ) : (
          <div className="cars-grid">
            {listings.map(listing => (
              <div key={listing.id} className="listing-card">
                {(listing.image_url_full || listing.image_url || listing.image) && (
                  <div className="listing-image">
                    <img src={listing.image_url_full || listing.image_url || listing.image} alt={`${listing.make} ${listing.model}`} />
                  </div>
                )}
                {!(listing.image_url_full || listing.image_url || listing.image) && (
                  <div className="listing-image" style={{ backgroundColor: '#ecf0f1', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
                    <span style={{ fontSize: '3rem' }}>🚗</span>
                  </div>
                )}
                <div className="listing-content">
                  <h4>{listing.make} {listing.model}</h4>
                  <p className="listing-meta">
                    <span>📅 {listing.year}</span>
                    <span>🛣️ {listing.mileage}km</span>
                  </p>
                  <p className="listing-price">₹{listing.price.toLocaleString()}</p>
                  <p className="listing-condition">{listing.condition}</p>
                  {listing.description && (
                    <p className="listing-description">{listing.description.slice(0, 100)}...</p>
                  )}
                  <div className="listing-actions">
                    <span className={`status ${listing.status}`}>
                      {listing.status === 'available' && '✅ Available'}
                      {listing.status === 'sold' && '✔️ Sold'}
                      {listing.status === 'pending' && '⏳ Pending'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UsedCarListings;
