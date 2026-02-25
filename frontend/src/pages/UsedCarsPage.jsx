import React, { useState, useEffect } from 'react';
import { carsAPI, getToken } from '../utils/api';

const UsedCarsPage = ({ defaultShowSellForm = false }) => {
    const token = getToken();
    const isAuthenticated = !!token;
    const userRole = localStorage.getItem('userRole');
    const isAdmin = userRole === 'admin';
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showSellForm, setShowSellForm] = useState(defaultShowSellForm && isAdmin);
    const [formData, setFormData] = useState({
        make: '',
        model: '',
        year: '',
        price: '',
        mileage: '',
        description: '',
        image_url: '',
        condition: 'used',
        car_category: 'affordable' // 'premium' for Premium Fleet, 'affordable' for Affordable Cars
    });

    useEffect(() => {
        if (defaultShowSellForm !== undefined && isAdmin) {
            setShowSellForm(defaultShowSellForm);
        }
    }, [defaultShowSellForm, isAdmin]);

    useEffect(() => {
        fetchCars();
    }, []);

    const fetchCars = async () => {
        try {
            setLoading(true);
            const data = await carsAPI.getAll();
            const carsList = Array.isArray(data) ? data : (data.results || []);
            setCars(carsList);
            setError(null);
        } catch (err) {
            console.error("Error loading cars:", err);
            let msg = 'Failed to load cars. Please try again.';
            if (err.message === 'Failed to fetch' || err.message.includes('NetworkError')) {
                msg = 'Unable to connect to the server. Please ensure the backend is running on port 8000.';
            }
            setError(msg);
            setCars([]);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFormData(prev => ({
            ...prev,
            image: file,
            image_url: ''
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'image' && formData[key]) {
                    data.append('image', formData[key]);
                } else if (key === 'image_url' && formData['image']) {
                    // Skip image_url if we have a file
                } else {
                    data.append(key, formData[key]);
                }
            });

            await carsAPI.create(data, token);
            setShowSellForm(false);
            fetchCars();
            setFormData({
                make: '',
                model: '',
                year: '',
                price: '',
                mileage: '',
                description: '',
                image_url: '',
                image: null,
                condition: 'used',
                car_category: 'affordable'
            });
            alert('Car listed successfully!');
        } catch (err) {
            alert('Failed to list car: ' + (err.message || 'Unknown error'));
        }
    };

    return (
        <div className="container" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ color: '#2c3e50', fontSize: '2.5rem' }}>Used Cars Marketplace</h1>
                {isAdmin && (
                    <button
                        onClick={() => setShowSellForm(!showSellForm)}
                        style={{
                            padding: '0.75rem 1.5rem',
                            backgroundColor: showSellForm ? '#e74c3c' : '#3498db',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            transition: 'background 0.3s'
                        }}
                    >
                        {showSellForm ? 'Cancel Listing' : 'List New Car'}
                    </button>
                )}
            </div>

            {showSellForm && isAdmin && (
                <div className="sell-form" style={{
                    backgroundColor: 'white',
                    padding: '2rem',
                    borderRadius: '10px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    marginBottom: '2rem'
                }}>
                    <h2 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>List New Car</h2>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <label>Make</label>
                            <input type="text" name="make" value={formData.make} onChange={handleInputChange} required style={inputStyle} placeholder="e.g. Toyota" />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <label>Model</label>
                            <input type="text" name="model" value={formData.model} onChange={handleInputChange} required style={inputStyle} placeholder="e.g. Camry" />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <label>Year</label>
                            <input type="number" name="year" value={formData.year} onChange={handleInputChange} required style={inputStyle} placeholder="2020" />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <label>Price ($)</label>
                            <input type="number" name="price" value={formData.price} onChange={handleInputChange} required style={inputStyle} placeholder="25000" />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <label>Mileage (km)</label>
                            <input type="number" name="mileage" value={formData.mileage} onChange={handleInputChange} required style={inputStyle} placeholder="50000" />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <label>Upload Car Image</label>
                            <input type="file" name="image" onChange={handleFileChange} accept="image/*" style={inputStyle} />
                            <small style={{ color: '#7f8c8d' }}>Or paste URL below (optional)</small>
                            <input type="url" name="image_url" value={formData.image_url} onChange={handleInputChange} style={{ ...inputStyle, marginTop: '5px' }} placeholder="https://example.com/car.jpg" />
                        </div>
                        <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column' }}>
                            <label>Description</label>
                            <textarea name="description" value={formData.description} onChange={handleInputChange} style={{ ...inputStyle, minHeight: '100px' }} placeholder="Describe the car's condition, features, etc." />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <label style={{ fontWeight: 'bold', color: '#D40000' }}>📌 Car Section</label>
                            <select name="car_category" value={formData.car_category} onChange={handleInputChange} required style={{...inputStyle, backgroundColor: '#fff', cursor: 'pointer'}}>
                                <option value="affordable">🚗 Affordable Local Cars</option>
                                <option value="premium">🏎️ Premium Fleet</option>
                            </select>
                            <small style={{ color: '#7f8c8d', marginTop: '5px' }}>Choose where this car should appear in Taxi Services</small>
                        </div>
                        <button type="submit" style={{
                            gridColumn: '1 / -1',
                            padding: '1rem',
                            backgroundColor: '#27ae60',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            fontSize: '1.1rem',
                            cursor: 'pointer',
                            marginTop: '1rem'
                        }}>
                            Post Listing
                        </button>
                    </form>
                </div>
            )}

            {error && (
                <div style={{
                    padding: '1rem',
                    backgroundColor: '#fee2e2',
                    color: '#b91c1c',
                    borderRadius: '8px',
                    marginBottom: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    border: '1px solid #fecaca'
                }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    <span>{error}</span>
                </div>
            )}

            {loading ? (
                <div style={{ textAlign: 'center', fontSize: '1.2rem', color: '#7f8c8d' }}>Loading listings...</div>
            ) : (
                <div className="cars-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '2rem'
                }}>
                    {(!Array.isArray(cars) || cars.length === 0) ? (
                        <p style={{ gridColumn: '1/-1', textAlign: 'center', fontSize: '1.2rem', color: '#7f8c8d' }}>
                            No cars available right now. Check back soon!
                        </p>
                    ) : (
                        cars.map(car => (
                            <div key={car.id} style={{
                                backgroundColor: 'white',
                                borderRadius: '10px',
                                overflow: 'hidden',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                transition: 'transform 0.3s',
                                cursor: 'pointer'
                            }}>
                                <div style={{ height: '200px', backgroundColor: '#ecf0f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {car.image_url_full || car.image_url || car.image ? (
                                        <img src={car.image_url_full || car.image_url || car.image} alt={`${car.make} ${car.model}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <span style={{ fontSize: '3rem' }}>🚗</span>
                                    )}
                                </div>
                                <div style={{ padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <h3 style={{ margin: 0, color: '#2c3e50' }}>{car.year} {car.make} {car.model}</h3>
                                        <span style={{ color: '#27ae60', fontWeight: 'bold', fontSize: '1.2rem' }}>${Number(car.price).toLocaleString()}</span>
                                    </div>
                                    <p style={{ color: '#7f8c8d', margin: '0 0 1rem 0' }}>{Number(car.mileage).toLocaleString()} km</p>
                                    <p style={{ color: '#34495e', fontSize: '0.9rem', lineHeight: '1.5', height: '4.5em', overflow: 'hidden' }}>
                                        {car.description || 'No description provided.'}
                                    </p>
                                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #ecf0f1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.8rem', color: '#95a5a6' }}>
                                            Listed by: {car.seller_details?.firstName || 'Admin'}
                                        </span>
                                        <button style={{
                                            padding: '0.5rem 1rem',
                                            backgroundColor: '#3498db',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '3px',
                                            cursor: 'pointer'
                                        }}>
                                            Buy Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

const inputStyle = {
    padding: '0.75rem',
    borderRadius: '5px',
    border: '1px solid #bdc3c7',
    fontSize: '1rem',
    marginTop: '0.25rem'
};

export default UsedCarsPage;
