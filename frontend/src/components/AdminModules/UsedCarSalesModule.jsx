import React, { useState } from 'react';
import './ModuleStyles.css';

const UsedCarSalesModule = ({ user }) => {
  // Available cars from UserDashboard
  const availableCars = [
    {
      id: 1,
      make: 'Maruti',
      model: 'Swift',
      year: 2022,
      price: '₹6,50,000',
      mileage: '45,000 km',
      description: 'Well maintained, single owner',
      condition: 'used',
      image: '/images/swift.jpg',
      listings: 3,
      inquiries: 2,
      testDrives: 1,
      sellerName: 'Sharma Auto Sales',
      reviews: 4.5
    },
    {
      id: 2,
      make: 'Honda',
      model: 'City',
      year: 2021,
      price: '₹8,75,000',
      mileage: '62,000 km',
      description: 'Excellent condition, full service history',
      condition: 'used',
      image: '/images/city.jpg',
      listings: 5,
      inquiries: 4,
      testDrives: 3,
      sellerName: 'Premium Cars India',
      reviews: 4.7
    },
    {
      id: 3,
      make: 'Hyundai',
      model: 'Creta',
      year: 2020,
      price: '₹10,50,000',
      mileage: '78,000 km',
      description: 'SUV with all features, accident free',
      condition: 'used',
      image: '/images/creta.jpg',
      listings: 4,
      inquiries: 3,
      testDrives: 2,
      sellerName: 'Rajesh Motors',
      reviews: 4.3
    },
    {
      id: 4,
      make: 'Toyota',
      model: 'Innova',
      year: 2019,
      price: '₹13,25,000',
      mileage: '95,000 km',
      description: '7-seater family SUV, excellent condition',
      condition: 'used',
      image: '/images/innova.jpg',
      listings: 2,
      inquiries: 1,
      testDrives: 1,
      sellerName: 'Family Cars LLC',
      reviews: 4.6
    }
  ];

  const [inquiries, setInquiries] = useState([
    {
      id: 'INQUIRY001',
      customerName: 'Sharma Family',
      customerEmail: 'sharma@example.com',
      phone: '9876543210',
      carModel: 'Maruti Swift 2022',
      registrationNum: 'DL01AB1234',
      budget: '₹6,50,000',
      expectedPrice: '₹7,50,000',
      status: 'inquiry',
      testDriveScheduled: null,
      negotiationStatus: null,
      createdDate: '2024-01-20',
      lastUpdate: '2024-01-25 10:30'
    },
    {
      id: 'INQUIRY002',
      customerName: 'Rajesh Kumar',
      customerEmail: 'rajesh@example.com',
      phone: '9876543211',
      carModel: 'Honda City 2021',
      registrationNum: 'DL02CD5678',
      budget: '₹8,00,000',
      expectedPrice: '₹8,75,000',
      status: 'test_drive_scheduled',
      testDriveScheduled: '2024-01-28 14:00',
      negotiationStatus: null,
      createdDate: '2024-01-18',
      lastUpdate: '2024-01-24 15:45'
    },
    {
      id: 'INQUIRY003',
      customerName: 'Priya Singh',
      customerEmail: 'priya@example.com',
      phone: '9876543212',
      carModel: 'Hyundai Creta 2020',
      registrationNum: 'DL03EF9012',
      budget: '₹9,50,000',
      expectedPrice: '₹10,50,000',
      status: 'test_drive_completed',
      testDriveScheduled: '2024-01-22 11:00',
      negotiationStatus: 'in_progress',
      createdDate: '2024-01-17',
      lastUpdate: '2024-01-25 09:15'
    },
    {
      id: 'INQUIRY004',
      customerName: 'Vikram Patel',
      customerEmail: 'vikram@example.com',
      phone: '9876543213',
      carModel: 'Toyota Innova 2019',
      registrationNum: 'DL04GH3456',
      budget: '₹12,00,000',
      expectedPrice: '₹13,25,000',
      status: 'negotiation_complete',
      testDriveScheduled: '2024-01-15 10:00',
      negotiationStatus: 'agreed',
      createdDate: '2024-01-10',
      lastUpdate: '2024-01-25 11:20'
    },
    {
      id: 'INQUIRY005',
      customerName: 'Anjali Mishra',
      customerEmail: 'anjali@example.com',
      phone: '9876543214',
      carModel: 'Maruti Alto 2021',
      registrationNum: 'DL05IJ7890',
      budget: '₹3,50,000',
      expectedPrice: '₹3,80,000',
      status: 'sold',
      testDriveScheduled: '2024-01-12 15:30',
      negotiationStatus: 'completed',
      createdDate: '2024-01-08',
      lastUpdate: '2024-01-25 08:45'
    }
  ]);

  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [testDriveDate, setTestDriveDate] = useState('');
  const [activeView, setActiveView] = useState('inventory'); // 'inventory', 'inquiries'
  const [selectedCar, setSelectedCar] = useState(null);
  const [showCarDetailModal, setShowCarDetailModal] = useState(false);

  // Filter logic
  const filteredInquiries = inquiries.filter(inquiry => {
    const statusMatch = filterStatus === 'all' || inquiry.status === filterStatus;
    const searchMatch = inquiry.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        inquiry.carModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        inquiry.phone.includes(searchTerm) ||
                        inquiry.registrationNum.includes(searchTerm);
    return statusMatch && searchMatch;
  });

  // Statistics
  const stats = {
    totalInquiries: inquiries.length,
    activeInquiries: inquiries.filter(i => 
      ['inquiry', 'test_drive_scheduled', 'test_drive_completed', 'negotiation_complete'].includes(i.status)
    ).length,
    testDrivesScheduled: inquiries.filter(i => 
      ['test_drive_scheduled', 'test_drive_completed'].includes(i.status)
    ).length,
    soldCars: inquiries.filter(i => i.status === 'sold').length,
    totalSalesValue: inquiries
      .filter(i => i.status === 'sold')
      .reduce((sum, i) => {
        const price = parseInt(i.expectedPrice.replace(/[₹,]/g, ''));
        return sum + price;
      }, 0)
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      'inquiry': '#3498db',           // Blue
      'test_drive_scheduled': '#f39c12', // Orange
      'test_drive_completed': '#9b59b6',  // Purple
      'negotiation_complete': '#27ae60',  // Green
      'sold': '#2c3e50'                  // Dark
    };
    return colors[status] || '#666';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'inquiry': 'New Inquiry',
      'test_drive_scheduled': 'Test Drive Scheduled',
      'test_drive_completed': 'Test Drive Completed',
      'negotiation_complete': 'Ready for Sale',
      'sold': 'Sold'
    };
    return labels[status] || status;
  };

  const handleScheduleTestDrive = (inquiryId) => {
    if (!testDriveDate) {
      alert('Please select a date and time');
      return;
    }
    setInquiries(inquiries.map(i =>
      i.id === inquiryId ? {
        ...i,
        status: 'test_drive_scheduled',
        testDriveScheduled: testDriveDate,
        lastUpdate: new Date().toLocaleString()
      } : i
    ));
    setTestDriveDate('');
    setShowScheduleModal(false);
    alert('Test drive scheduled successfully!');
  };

  const handleCompleteTestDrive = (inquiryId) => {
    setInquiries(inquiries.map(i =>
      i.id === inquiryId ? {
        ...i,
        status: 'test_drive_completed',
        lastUpdate: new Date().toLocaleString()
      } : i
    ));
    alert('Test drive marked as completed!');
  };

  const handleStartNegotiation = (inquiryId) => {
    setInquiries(inquiries.map(i =>
      i.id === inquiryId ? {
        ...i,
        status: 'negotiation_complete',
        negotiationStatus: 'in_progress',
        lastUpdate: new Date().toLocaleString()
      } : i
    ));
    alert('Negotiation started!');
  };

  const handleMarkSold = (inquiryId) => {
    if (window.confirm('Mark this vehicle as SOLD? This action cannot be undone.')) {
      setInquiries(inquiries.map(i =>
        i.id === inquiryId ? {
          ...i,
          status: 'sold',
          negotiationStatus: 'completed',
          lastUpdate: new Date().toLocaleString()
        } : i
      ));
      alert('Vehicle marked as sold!');
    }
  };

  const handleRejectInquiry = (inquiryId) => {
    if (window.confirm('Reject this inquiry? Customer will be notified.')) {
      setInquiries(inquiries.filter(i => i.id !== inquiryId));
      alert('Inquiry rejected!');
    }
  };

  return (
    <div className="admin-module">
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '28px', marginBottom: '10px' }}>🏎️ Used Car Sales & Inventory</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>Manage car inventory and track vehicle inquiries, test drives, negotiations, and sales</p>

        {/* View Tabs */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '25px',
          borderBottom: '2px solid #ecf0f1',
          paddingBottom: '0'
        }}>
          <button
            onClick={() => setActiveView('inventory')}
            style={{
              padding: '12px 20px',
              border: 'none',
              backgroundColor: 'transparent',
              borderBottom: activeView === 'inventory' ? '3px solid #D40000' : 'none',
              color: activeView === 'inventory' ? '#D40000' : '#7f8c8d',
              fontSize: '14px',
              fontWeight: activeView === 'inventory' ? '700' : '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            🚗 Available Inventory
          </button>
          <button
            onClick={() => setActiveView('inquiries')}
            style={{
              padding: '12px 20px',
              border: 'none',
              backgroundColor: 'transparent',
              borderBottom: activeView === 'inquiries' ? '3px solid #D40000' : 'none',
              color: activeView === 'inquiries' ? '#D40000' : '#7f8c8d',
              fontSize: '14px',
              fontWeight: activeView === 'inquiries' ? '700' : '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            📋 Customer Inquiries
          </button>
        </div>

        {/* Statistics Cards - Dynamic based on view */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          {activeView === 'inventory' ? (
            <>
              <div className="kpi-card">
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>🚗</div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#2c3e50' }}>{availableCars.length}</div>
                <div style={{ fontSize: '13px', color: '#7f8c8d', marginTop: '5px' }}>Total Listings</div>
              </div>
              <div className="kpi-card">
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>📊</div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#3498db' }}>{availableCars.reduce((sum, car) => sum + car.inquiries, 0)}</div>
                <div style={{ fontSize: '13px', color: '#7f8c8d', marginTop: '5px' }}>Total Inquiries</div>
              </div>
              <div className="kpi-card">
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>🚗</div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#f39c12' }}>{availableCars.reduce((sum, car) => sum + car.testDrives, 0)}</div>
                <div style={{ fontSize: '13px', color: '#7f8c8d', marginTop: '5px' }}>Test Drives</div>
              </div>
              <div className="kpi-card">
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>⭐</div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#f39c12' }}>{(availableCars.reduce((sum, car) => sum + car.reviews, 0) / availableCars.length).toFixed(1)}</div>
                <div style={{ fontSize: '13px', color: '#7f8c8d', marginTop: '5px' }}>Avg Rating</div>
              </div>
            </>
          ) : (
            <>
              <div className="kpi-card">
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>📋</div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#2c3e50' }}>{stats.totalInquiries}</div>
                <div style={{ fontSize: '13px', color: '#7f8c8d', marginTop: '5px' }}>Total Inquiries</div>
              </div>
              <div className="kpi-card">
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>🔄</div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#3498db' }}>{stats.activeInquiries}</div>
                <div style={{ fontSize: '13px', color: '#7f8c8d', marginTop: '5px' }}>Active Pipeline</div>
              </div>
              <div className="kpi-card">
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>🚗</div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#f39c12' }}>{stats.testDrivesScheduled}</div>
                <div style={{ fontSize: '13px', color: '#7f8c8d', marginTop: '5px' }}>Test Drives</div>
              </div>
              <div className="kpi-card">
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>✅</div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#27ae60' }}>{stats.soldCars}</div>
                <div style={{ fontSize: '13px', color: '#7f8c8d', marginTop: '5px' }}>Vehicles Sold</div>
              </div>
              <div className="kpi-card">
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>💰</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#27ae60' }}>₹{(stats.totalSalesValue / 100000).toFixed(1)}L</div>
                <div style={{ fontSize: '13px', color: '#7f8c8d', marginTop: '5px' }}>Sales Revenue</div>
              </div>
            </>
          )}
        </div>

        {/* INVENTORY VIEW */}
        {activeView === 'inventory' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              {availableCars.map((car) => (
                <div
                  key={car.id}
                  style={{
                    backgroundColor: 'white',
                    border: '1px solid #ecf0f1',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                  }}
                >
                  <div style={{
                    backgroundColor: '#f5f5f5',
                    height: '180px',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                  }}>
                    <img
                      src={car.image}
                      alt={`${car.make} ${car.model}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block'
                      }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      backgroundColor: '#D40000',
                      color: 'white',
                      padding: '5px 12px',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      fontWeight: 'bold'
                    }}>
                      {car.year}
                    </div>
                  </div>
                  <div style={{ padding: '18px' }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '1.15rem', color: '#2c3e50', fontWeight: '700' }}>
                      {car.make} {car.model}
                    </h3>
                    <p style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: '#666', minHeight: '35px' }}>
                      {car.description}
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                      <div>
                        <div style={{ fontSize: '11px', color: '#7f8c8d', marginBottom: '3px' }}>Mileage</div>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#2c3e50' }}>{car.mileage}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: '#7f8c8d', marginBottom: '3px' }}>Price</div>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#D40000' }}>{car.price}</div>
                      </div>
                    </div>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 1fr',
                      gap: '8px',
                      paddingTop: '12px',
                      borderTop: '1px solid #ecf0f1',
                      marginBottom: '12px'
                    }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '12px', color: '#7f8c8d' }}>Inquiries</div>
                        <div style={{ fontSize: '16px', fontWeight: '700', color: '#3498db' }}>{car.inquiries}</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '12px', color: '#7f8c8d' }}>Test Drives</div>
                        <div style={{ fontSize: '16px', fontWeight: '700', color: '#f39c12' }}>{car.testDrives}</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '12px', color: '#7f8c8d' }}>Rating</div>
                        <div style={{ fontSize: '16px', fontWeight: '700', color: '#f39c12' }}>⭐ {car.reviews}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedCar(car);
                        setShowCarDetailModal(true);
                      }}
                      style={{
                        width: '100%',
                        padding: '10px',
                        backgroundColor: '#D40000',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '13px',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#B30000'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#D40000'}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* INQUIRIES VIEW */}
        {activeView === 'inquiries' && (
          <div>
            {/* Controls */}
            <div style={{
          display: 'flex',
          gap: '15px',
          marginBottom: '20px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <input
            type="text"
            placeholder="Search by customer, car model, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              minWidth: '250px',
              padding: '10px 15px',
              border: '1px solid #bdc3c7',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: '10px 15px',
              border: '1px solid #bdc3c7',
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: 'white'
            }}
          >
            <option value="all">All Status</option>
            <option value="inquiry">New Inquiry</option>
            <option value="test_drive_scheduled">Test Drive Scheduled</option>
            <option value="test_drive_completed">Test Drive Completed</option>
            <option value="negotiation_complete">Ready for Sale</option>
            <option value="sold">Sold</option>
          </select>
        </div>

        {/* Inquiries Table */}
        <div style={{
          overflowX: 'auto',
          border: '1px solid #ecf0f1',
          borderRadius: '8px'
        }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Inquiry ID</th>
                <th>Customer</th>
                <th>Car Model</th>
                <th>Budget / Expected Price</th>
                <th>Status</th>
                <th>Test Drive</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInquiries.length > 0 ? (
                filteredInquiries.map((inquiry) => (
                  <tr key={inquiry.id}>
                    <td><strong>{inquiry.id}</strong></td>
                    <td>{inquiry.customerName}<br/><small style={{ color: '#666' }}>{inquiry.phone}</small></td>
                    <td>{inquiry.carModel}<br/><small style={{ color: '#666' }}>{inquiry.registrationNum}</small></td>
                    <td>{inquiry.budget}<br/><strong>₹{(parseInt(inquiry.expectedPrice.replace(/[₹,]/g, ''))/100000).toFixed(1)}L</strong></td>
                    <td>
                      <span style={{
                        padding: '6px 12px',
                        backgroundColor: getStatusBadgeColor(inquiry.status),
                        color: 'white',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '600',
                        display: 'block'
                      }}>
                        {getStatusLabel(inquiry.status)}
                      </span>
                    </td>
                    <td>
                      {inquiry.testDriveScheduled ? (
                        <small style={{ color: '#666' }}>📅 {inquiry.testDriveScheduled}</small>
                      ) : (
                        <small style={{ color: '#999' }}>Not scheduled</small>
                      )}
                    </td>
                    <td><small>{inquiry.createdDate}</small></td>
                    <td>
                      <button
                        onClick={() => {
                          setSelectedInquiry(inquiry);
                          setShowDetailModal(true);
                        }}
                        style={{
                          padding: '5px 10px',
                          backgroundColor: '#3498db',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          marginRight: '5px'
                        }}
                      >
                        View
                      </button>
                      {inquiry.status === 'inquiry' && (
                        <button
                          onClick={() => {
                            setSelectedInquiry(inquiry);
                            setShowScheduleModal(true);
                          }}
                          style={{
                            padding: '5px 10px',
                            backgroundColor: '#f39c12',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Schedule
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                    No inquiries found matching your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
          </div>
        )}
      </div>

      {/* Car Detail Modal */}
      {showCarDetailModal && selectedCar && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '30px',
            maxWidth: '700px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ marginBottom: '20px', fontSize: '22px', fontWeight: '700' }}>🏎️ {selectedCar.make} {selectedCar.model} - Details</h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '20px',
              marginBottom: '25px'
            }}>
              <div style={{
                gridColumn: '1 / -1',
                backgroundColor: '#f8f9fa',
                padding: '15px',
                borderRadius: '8px'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>💰 <strong style={{ color: '#D40000' }}>{selectedCar.price}</strong></div>
                <div style={{ fontSize: '13px', color: '#7f8c8d' }}>Listed Price • Mileage: {selectedCar.mileage} • Year: {selectedCar.year}</div>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#7f8c8d', display: 'block', marginBottom: '5px' }}>Make</label>
                <div style={{ fontSize: '14px', fontWeight: '600' }}>{selectedCar.make}</div>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#7f8c8d', display: 'block', marginBottom: '5px' }}>Model</label>
                <div style={{ fontSize: '14px', fontWeight: '600' }}>{selectedCar.model}</div>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#7f8c8d', display: 'block', marginBottom: '5px' }}>Year</label>
                <div style={{ fontSize: '14px' }}>{selectedCar.year}</div>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#7f8c8d', display: 'block', marginBottom: '5px' }}>Condition</label>
                <div style={{ fontSize: '14px', textTransform: 'capitalize' }}>{selectedCar.condition}</div>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#7f8c8d', display: 'block', marginBottom: '5px' }}>Mileage</label>
                <div style={{ fontSize: '14px' }}>{selectedCar.mileage}</div>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#7f8c8d', display: 'block', marginBottom: '5px' }}>Seller</label>
                <div style={{ fontSize: '14px' }}>{selectedCar.sellerName}</div>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '12px', color: '#7f8c8d', display: 'block', marginBottom: '5px' }}>Description</label>
                <div style={{ fontSize: '14px', backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '6px' }}>{selectedCar.description}</div>
              </div>

              <div style={{
                gridColumn: '1 / -1',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '15px',
                paddingTop: '15px',
                borderTop: '1px solid #ecf0f1'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: '700', color: '#3498db' }}>{selectedCar.listings}</div>
                  <div style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '5px' }}>Listings</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: '700', color: '#f39c12' }}>{selectedCar.inquiries}</div>
                  <div style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '5px' }}>Inquiries</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: '700', color: '#9b59b6' }}>{selectedCar.testDrives}</div>
                  <div style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '5px' }}>Test Drives</div>
                </div>
              </div>

              <div style={{
                gridColumn: '1 / -1',
                backgroundColor: '#fffacd',
                padding: '12px',
                borderRadius: '6px',
                borderLeft: '4px solid #f39c12'
              }}>
                <strong style={{ color: '#f39c12' }}>⭐ Rating: {selectedCar.reviews}/5</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowCarDetailModal(false)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#ecf0f1',
                  color: '#2c3e50',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowCarDetailModal(false);
                  setActiveView('inquiries');
                }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#D40000',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                View Inquiries
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedInquiry && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '30px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ marginBottom: '20px', fontSize: '20px' }}>🏎️ Inquiry Details</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#7f8c8d', display: 'block', marginBottom: '5px' }}>Inquiry ID</label>
                <div style={{ fontSize: '16px', fontWeight: '600' }}>{selectedInquiry.id}</div>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#7f8c8d', display: 'block', marginBottom: '5px' }}>Status</label>
                <span style={{
                  padding: '6px 12px',
                  backgroundColor: getStatusBadgeColor(selectedInquiry.status),
                  color: 'white',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600',
                  display: 'inline-block'
                }}>
                  {getStatusLabel(selectedInquiry.status)}
                </span>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#7f8c8d', display: 'block', marginBottom: '5px' }}>Customer Name</label>
                <div style={{ fontSize: '14px' }}>{selectedInquiry.customerName}</div>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#7f8c8d', display: 'block', marginBottom: '5px' }}>Phone</label>
                <div style={{ fontSize: '14px' }}>{selectedInquiry.phone}</div>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#7f8c8d', display: 'block', marginBottom: '5px' }}>Email</label>
                <div style={{ fontSize: '14px' }}>{selectedInquiry.customerEmail}</div>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#7f8c8d', display: 'block', marginBottom: '5px' }}>Car Model</label>
                <div style={{ fontSize: '14px' }}>{selectedInquiry.carModel}</div>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#7f8c8d', display: 'block', marginBottom: '5px' }}>Registration Number</label>
                <div style={{ fontSize: '14px' }}>{selectedInquiry.registrationNum}</div>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#7f8c8d', display: 'block', marginBottom: '5px' }}>Customer Budget</label>
                <div style={{ fontSize: '14px' }}>{selectedInquiry.budget}</div>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#7f8c8d', display: 'block', marginBottom: '5px' }}>Expected Price</label>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#27ae60' }}>{selectedInquiry.expectedPrice}</div>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#7f8c8d', display: 'block', marginBottom: '5px' }}>Test Drive</label>
                <div style={{ fontSize: '14px' }}>
                  {selectedInquiry.testDriveScheduled ? selectedInquiry.testDriveScheduled : 'Not scheduled'}
                </div>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#7f8c8d', display: 'block', marginBottom: '5px' }}>Created Date</label>
                <div style={{ fontSize: '14px' }}>{selectedInquiry.createdDate}</div>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#7f8c8d', display: 'block', marginBottom: '5px' }}>Last Update</label>
                <div style={{ fontSize: '14px' }}>{selectedInquiry.lastUpdate}</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <strong style={{ display: 'block', marginBottom: '10px' }}>Quick Actions:</strong>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {selectedInquiry.status === 'inquiry' && (
                  <button
                    onClick={() => {
                      handleScheduleTestDrive(selectedInquiry.id);
                      setShowDetailModal(false);
                    }}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#f39c12',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Schedule Test Drive
                  </button>
                )}
                {selectedInquiry.status === 'test_drive_completed' && (
                  <button
                    onClick={() => {
                      handleStartNegotiation(selectedInquiry.id);
                      setShowDetailModal(false);
                    }}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#9b59b6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Start Negotiation
                  </button>
                )}
                {(selectedInquiry.status === 'test_drive_completed' || selectedInquiry.status === 'negotiation_complete') && (
                  <button
                    onClick={() => {
                      handleMarkSold(selectedInquiry.id);
                      setShowDetailModal(false);
                    }}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#27ae60',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Mark as Sold
                  </button>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowDetailModal(false)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#ecf0f1',
                  color: '#2c3e50',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Test Drive Modal */}
      {showScheduleModal && selectedInquiry && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '30px',
            maxWidth: '400px',
            width: '90%'
          }}>
            <h3 style={{ marginBottom: '20px', fontSize: '20px' }}>📅 Schedule Test Drive</h3>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '12px', color: '#7f8c8d', display: 'block', marginBottom: '5px' }}>Customer</label>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>{selectedInquiry.customerName}</div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '12px', color: '#7f8c8d', display: 'block', marginBottom: '5px' }}>Car Model</label>
              <div style={{ fontSize: '14px' }}>{selectedInquiry.carModel}</div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '12px', color: '#7f8c8d', display: 'block', marginBottom: '5px' }}>Date & Time *</label>
              <input
                type="datetime-local"
                value={testDriveDate}
                onChange={(e) => setTestDriveDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #bdc3c7',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowScheduleModal(false);
                  setTestDriveDate('');
                }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#ecf0f1',
                  color: '#2c3e50',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleScheduleTestDrive(selectedInquiry.id)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#f39c12',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsedCarSalesModule;
