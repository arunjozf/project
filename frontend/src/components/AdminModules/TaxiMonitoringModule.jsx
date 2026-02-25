import React, { useState } from 'react';
import './ModuleStyles.css';

const TaxiMonitoringModule = ({ user }) => {
  // Taxi Services from UserDashboard
  const taxiServices = [
    {
      id: 1,
      name: "Economy Taxi",
      description: "Budget-friendly option for daily commutes",
      type: "Economy",
      price: "₹170/km",
      image: "/images/eco_taxi.jpg",
      specs: ["⚡ Instant Pickup", "👥 4 Seats", "🛡️ Safe & Verified Drivers"],
      activeCount: 8,
      totalEarnings: "₹45,200",
      completedTrips: 127
    },
    {
      id: 2,
      name: "Comfort Taxi",
      description: "Comfortable ride with premium features",
      type: "Comfort",
      price: "₹300/km",
      image: "/images/comfort-taxi.jpg",
      specs: ["⚡ Quick Response", "👥 5 Seats", "📱 Real-time Tracking"],
      activeCount: 12,
      totalEarnings: "₹89,450",
      completedTrips: 156
    },
    {
      id: 3,
      name: "Premium Taxi",
      description: "Luxury ride with professional drivers",
      type: "Premium",
      price: "₹425/km",
      image: "/images/premium-taxi.jpg",
      specs: ["⚡ Priority Booking", "👥 5 Seats", "🎵 Premium Music System"],
      activeCount: 6,
      totalEarnings: "₹67,800",
      completedTrips: 94
    },
    {
      id: 4,
      name: "XL Taxi",
      description: "Spacious ride for groups and families",
      type: "XL",
      price: "₹510/km",
      image: "/images/xl-taxi.jpg",
      specs: ["⚡ Group Friendly", "👥 7 Seats", "🧳 Large Luggage Space"],
      activeCount: 5,
      totalEarnings: "₹56,900",
      completedTrips: 72
    },
    {
      id: 5,
      name: "Executive Cab",
      description: "High-end luxury for business travel",
      type: "Executive",
      price: "₹680/km",
      image: "/images/executive-cab.jpg",
      specs: ["⚡ VIP Service", "👥 4 Seats", "🎩 Premium Amenities"],
      activeCount: 3,
      totalEarnings: "₹78,650",
      completedTrips: 58
    }
  ];

  const [activeTaxis, setActiveTaxis] = useState([
    {
      id: 'TX001',
      driver: 'Rajesh Kumar',
      driverId: 1,
      phone: '9876543210',
      location: 'Downtown Market',
      lat: 28.6139,
      lng: 77.2090,
      status: 'on_trip',
      customer: 'Amit Singh',
      pickupLocation: 'Central Station',
      dropOffLocation: 'Airport Terminal 3',
      tripDistance: '28 km',
      tripDuration: '45 mins',
      fare: '₹850',
      startTime: '14:30',
      estimatedEnd: '15:15',
      rating: 4.8
    },
    {
      id: 'TX002',
      driver: 'Priya Singh',
      driverId: 2,
      phone: '9876543211',
      location: 'Airport Road',
      lat: 28.5595,
      lng: 77.1232,
      status: 'available',
      customer: null,
      pickupLocation: 'N/A',
      dropOffLocation: 'N/A',
      tripDistance: '-',
      tripDuration: '-',
      fare: '-',
      startTime: '-',
      estimatedEnd: '-',
      rating: 4.9
    },
    {
      id: 'TX003',
      driver: 'Suresh Gupta',
      driverId: 4,
      phone: '9876543213',
      location: 'Connaught Place',
      lat: 28.6300,
      lng: 77.1891,
      status: 'on_trip',
      customer: 'Priya Sharma',
      pickupLocation: 'Hotel Grand Delhi',
      dropOffLocation: 'Cyber Hub, Gurugram',
      tripDistance: '35 km',
      tripDuration: '50 mins',
      fare: '₹1050',
      startTime: '14:15',
      estimatedEnd: '15:05',
      rating: 4.7
    },
    {
      id: 'TX004',
      driver: 'Neha Sharma',
      driverId: 5,
      phone: '9876543214',
      location: 'Karol Bagh',
      lat: 28.6431,
      lng: 77.1800,
      status: 'available',
      customer: null,
      pickupLocation: 'N/A',
      dropOffLocation: 'N/A',
      tripDistance: '-',
      tripDuration: '-',
      fare: '-',
      startTime: '-',
      estimatedEnd: '-',
      rating: 4.6
    },
    {
      id: 'TX005',
      driver: 'Amit Patel',
      driverId: 3,
      phone: '9876543212',
      location: 'Lajpat Nagar',
      lat: 28.5630,
      lng: 77.2345,
      status: 'on_trip',
      customer: 'Rajiv Kumar',
      pickupLocation: 'Nehru Place',
      dropOffLocation: 'South Extension',
      tripDistance: '12 km',
      tripDuration: '25 mins',
      fare: '₹425',
      startTime: '14:45',
      estimatedEnd: '15:10',
      rating: 4.5
    }
  ]);

  const [pendingRequests, setPendingRequests] = useState([
    { id: 'REQ001', customer: 'Rohan Verma', pickupLocation: 'CP Station', destination: 'Sector 18, Noida', passengers: 2, urgency: 'normal', time: '14:52' },
    { id: 'REQ002', customer: 'Sneha Patel', pickupLocation: 'Dwarka Metro', destination: 'Dwarka Sector 10', passengers: 1, urgency: 'high', time: '14:58' },
    { id: 'REQ003', customer: 'Vivek Kumar', pickupLocation: 'Vaishali', destination: 'Pitampura', passengers: 3, urgency: 'normal', time: '15:01' }
  ]);

  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTaxi, setSelectedTaxi] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [activeView, setActiveView] = useState('monitoring'); // 'monitoring', 'services', 'requests'
  const [selectedService, setSelectedService] = useState(null);
  const [showServiceModal, setShowServiceModal] = useState(false);

  // Filter logic
  const filteredTaxis = activeTaxis.filter(taxi => {
    const statusMatch = filterStatus === 'all' || taxi.status === filterStatus;
    const searchMatch = taxi.id.includes(searchTerm) ||
                        taxi.driver.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        taxi.phone.includes(searchTerm) ||
                        taxi.location.toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && searchMatch;
  });

  // Statistics
  const stats = {
    totalActive: activeTaxis.length,
    onTrip: activeTaxis.filter(t => t.status === 'on_trip').length,
    available: activeTaxis.filter(t => t.status === 'available').length,
    pendingRequests: pendingRequests.length,
    totalRevenue: activeTaxis.reduce((sum, t) => {
      if (t.status === 'on_trip') {
        const fareNum = parseInt(t.fare.replace(/[₹,]/g, ''));
        return sum + fareNum;
      }
      return sum;
    }, 0),
    totalServices: taxiServices.length,
    servicesRevenue: taxiServices.reduce((sum, s) => {
      const earnings = parseInt(s.totalEarnings.replace(/[₹,]/g, ''));
      return sum + earnings;
    }, 0),
    totalServiceTrips: taxiServices.reduce((sum, s) => sum + s.completedTrips, 0),
    activeServiceVehicles: taxiServices.reduce((sum, s) => sum + s.activeCount, 0)
  };

  const handleEndTrip = (taxiId) => {
    setActiveTaxis(activeTaxis.map(t =>
      t.id === taxiId ? { ...t, status: 'available', customer: null, pickupLocation: 'N/A', dropOffLocation: 'N/A' } : t
    ));
    alert('Trip ended successfully!');
  };

  const handleAssignTaxi = (taxiId, requestId) => {
    const request = pendingRequests.find(r => r.id === requestId);
    if (request) {
      setActiveTaxis(activeTaxis.map(t =>
        t.id === taxiId ? {
          ...t,
          status: 'on_trip',
          customer: request.customer,
          pickupLocation: request.pickupLocation,
          dropOffLocation: request.destination,
          fare: '₹' + Math.floor(Math.random() * 500 + 300)
        } : t
      ));
      setPendingRequests(pendingRequests.filter(r => r.id !== requestId));
      alert('Taxi assigned successfully!');
    }
  };

  const handleCancelRequest = (requestId) => {
    if (window.confirm('Cancel this ride request?')) {
      setPendingRequests(pendingRequests.filter(r => r.id !== requestId));
      alert('Request cancelled!');
    }
  };

  return (
    <div className="admin-module">
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '28px', marginBottom: '10px' }}>🚕 Taxi Services & Monitoring</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>Manage taxi services, monitor active taxis, and process ride requests</p>

        {/* View Tabs */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '25px',
          borderBottom: '2px solid #ecf0f1',
          paddingBottom: '0'
        }}>
          <button
            onClick={() => setActiveView('services')}
            style={{
              padding: '12px 20px',
              border: 'none',
              backgroundColor: 'transparent',
              borderBottom: activeView === 'services' ? '3px solid #D40000' : 'none',
              color: activeView === 'services' ? '#D40000' : '#7f8c8d',
              fontSize: '14px',
              fontWeight: activeView === 'services' ? '700' : '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            📋 Service Types
          </button>
          <button
            onClick={() => setActiveView('monitoring')}
            style={{
              padding: '12px 20px',
              border: 'none',
              backgroundColor: 'transparent',
              borderBottom: activeView === 'monitoring' ? '3px solid #D40000' : 'none',
              color: activeView === 'monitoring' ? '#D40000' : '#7f8c8d',
              fontSize: '14px',
              fontWeight: activeView === 'monitoring' ? '700' : '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            🚕 Active Taxis
          </button>
          <button
            onClick={() => setActiveView('requests')}
            style={{
              padding: '12px 20px',
              border: 'none',
              backgroundColor: 'transparent',
              borderBottom: activeView === 'requests' ? '3px solid #D40000' : 'none',
              color: activeView === 'requests' ? '#D40000' : '#7f8c8d',
              fontSize: '14px',
              fontWeight: activeView === 'requests' ? '700' : '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            📞 Ride Requests
          </button>
        </div>

        {/* Statistics Cards - Dynamic based on view */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          {activeView === 'services' ? (
            <>
              <div className="kpi-card">
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>📋</div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#2c3e50' }}>{stats.totalServices}</div>
                <div style={{ fontSize: '13px', color: '#7f8c8d', marginTop: '5px' }}>Service Types</div>
              </div>
              <div className="kpi-card">
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>🚕</div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#3498db' }}>{stats.activeServiceVehicles}</div>
                <div style={{ fontSize: '13px', color: '#7f8c8d', marginTop: '5px' }}>Active Vehicles</div>
              </div>
              <div className="kpi-card">
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>✅</div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#27ae60' }}>{stats.totalServiceTrips.toLocaleString()}</div>
                <div style={{ fontSize: '13px', color: '#7f8c8d', marginTop: '5px' }}>Completed Trips</div>
              </div>
              <div className="kpi-card">
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>💰</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#27ae60' }}>₹{(stats.servicesRevenue / 100000).toFixed(1)}L</div>
                <div style={{ fontSize: '13px', color: '#7f8c8d', marginTop: '5px' }}>Total Revenue</div>
              </div>
            </>
          ) : (
            <>
              <div className="kpi-card">
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>🚕</div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#2c3e50' }}>{stats.totalActive}</div>
                <div style={{ fontSize: '13px', color: '#7f8c8d', marginTop: '5px' }}>Total Taxis</div>
              </div>
              <div className="kpi-card">
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>🔄</div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#3498db' }}>{stats.onTrip}</div>
                <div style={{ fontSize: '13px', color: '#7f8c8d', marginTop: '5px' }}>On Trip</div>
              </div>
              <div className="kpi-card">
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>✅</div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#27ae60' }}>{stats.available}</div>
                <div style={{ fontSize: '13px', color: '#7f8c8d', marginTop: '5px' }}>Available</div>
              </div>
              <div className="kpi-card">
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>📋</div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#f39c12' }}>{stats.pendingRequests}</div>
                <div style={{ fontSize: '13px', color: '#7f8c8d', marginTop: '5px' }}>Pending Requests</div>
              </div>
              <div className="kpi-card">
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>💰</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#27ae60' }}>₹{stats.totalRevenue}</div>
                <div style={{ fontSize: '13px', color: '#7f8c8d', marginTop: '5px' }}>Active Revenue</div>
              </div>
            </>
          )}
        </div>

        {/* SERVICES VIEW */}
        {activeView === 'services' && (
          <div>
            <div style={{ marginBottom: '30px' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '20px'
              }}>
                {taxiServices.map((service) => (
                  <div
                    key={service.id}
                    style={{
                      backgroundColor: 'white',
                      border: '1px solid #ecf0f1',
                      borderRadius: '8px',
                      padding: '22px',
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                      <div>
                        <h3 style={{ margin: '0 0 5px 0', fontSize: '1.15rem', color: '#2c3e50', fontWeight: '700' }}>
                          {service.name}
                        </h3>
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 10px',
                          backgroundColor: 'rgba(212, 0, 0, 0.1)',
                          color: '#D40000',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          fontWeight: '600'
                        }}>
                          {service.type}
                        </span>
                      </div>
                      <div style={{ fontSize: '1.3rem', fontWeight: '700', color: '#D40000' }}>
                        {service.price}
                      </div>
                    </div>
                    <p style={{ margin: '0 0 15px 0', fontSize: '0.9rem', color: '#666', minHeight: '40px' }}>
                      {service.description}
                    </p>
                    <div style={{ marginBottom: '15px' }}>
                      {service.specs.map((spec, idx) => (
                        <span key={idx} style={{ 
                          display: 'block',
                          fontSize: '0.85rem',
                          color: '#555',
                          marginBottom: '5px',
                          paddingLeft: '0'
                        }}>
                          {spec}
                        </span>
                      ))}
                    </div>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '10px',
                      paddingTop: '15px',
                      borderTop: '1px solid #ecf0f1'
                    }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '12px', color: '#7f8c8d', marginBottom: '5px' }}>Active Vehicles</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#3498db' }}>{service.activeCount}</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '12px', color: '#7f8c8d', marginBottom: '5px' }}>Completed Trips</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#27ae60' }}>{service.completedTrips}</div>
                      </div>
                    </div>
                    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #ecf0f1' }}>
                      <div style={{ fontSize: '13px', color: '#666' }}>Total Earnings</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: '700', color: '#27ae60' }}>{service.totalEarnings}</div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedService(service);
                        setShowServiceModal(true);
                      }}
                      style={{
                        width: '100%',
                        marginTop: '15px',
                        padding: '10px 15px',
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
                      Manage Service
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MONITORING VIEW */}
        {activeView === 'monitoring' && (
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
            placeholder="Search by taxi ID, driver, phone, location..."
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
            <option value="available">Available</option>
            <option value="on_trip">On Trip</option>
          </select>
          <button
            onClick={() => setShowMap(!showMap)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px'
            }}
          >
            {showMap ? '🗺️ Hide Map' : '🗺️ View Map'}
          </button>
        </div>

        {/* Active Taxis Table */}
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '15px', color: '#2c3e50' }}>📊 Active Fleet Status</h3>
          <div style={{
            overflowX: 'auto',
            border: '1px solid #ecf0f1',
            borderRadius: '8px'
          }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Taxi ID</th>
                  <th>Driver</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Customer/Trip Info</th>
                  <th>Distance</th>
                  <th>Fare</th>
                  <th>Rating</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTaxis.length > 0 ? (
                  filteredTaxis.map((taxi) => (
                    <tr key={taxi.id}>
                      <td><strong>{taxi.id}</strong></td>
                      <td>{taxi.driver}<br/><small style={{ color: '#666' }}>{taxi.phone}</small></td>
                      <td>{taxi.location}</td>
                      <td>
                        <span style={{
                          padding: '6px 12px',
                          backgroundColor: taxi.status === 'on_trip' ? '#3498db' : '#27ae60',
                          color: 'white',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {taxi.status === 'on_trip' ? '🔄 On Trip' : '✅ Available'}
                        </span>
                      </td>
                      <td>
                        {taxi.status === 'on_trip' ? (
                          <div style={{ fontSize: '13px' }}>
                            <strong>{taxi.customer}</strong><br/>
                            {taxi.pickupLocation} → {taxi.dropOffLocation}
                          </div>
                        ) : (
                          <div style={{ fontSize: '13px', color: '#999' }}>Idle</div>
                        )}
                      </td>
                      <td>{taxi.tripDistance}</td>
                      <td><strong>{taxi.fare}</strong></td>
                      <td>⭐ {taxi.rating}</td>
                      <td>
                        {taxi.status === 'on_trip' ? (
                          <button
                            onClick={() => handleEndTrip(taxi.id)}
                            style={{
                              padding: '5px 10px',
                              backgroundColor: '#e74c3c',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            End Trip
                          </button>
                        ) : (
                          <button
                            onClick={() => setSelectedTaxi(taxi)}
                            style={{
                              padding: '5px 10px',
                              backgroundColor: '#3498db',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Details
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                      No taxis found matching your filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Ride Requests */}
        <div>
          <h3 style={{ fontSize: '18px', marginBottom: '15px', color: '#2c3e50' }}>📋 Pending Ride Requests ({pendingRequests.length})</h3>
          <div style={{
            overflowX: 'auto',
            border: '1px solid #ecf0f1',
            borderRadius: '8px'
          }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Customer</th>
                  <th>Pickup Location</th>
                  <th>Destination</th>
                  <th>Passengers</th>
                  <th>Urgency</th>
                  <th>Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingRequests.length > 0 ? (
                  pendingRequests.map((request) => {
                    const availableTaxi = activeTaxis.find(t => t.status === 'available');
                    return (
                      <tr key={request.id}>
                        <td><strong>{request.id}</strong></td>
                        <td>{request.customer}</td>
                        <td>{request.pickupLocation}</td>
                        <td>{request.destination}</td>
                        <td>👥 {request.passengers}</td>
                        <td>
                          <span style={{
                            padding: '6px 12px',
                            backgroundColor: request.urgency === 'high' ? '#e74c3c' : '#f39c12',
                            color: 'white',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            {request.urgency.toUpperCase()}
                          </span>
                        </td>
                        <td>{request.time}</td>
                        <td>
                          {availableTaxi ? (
                            <button
                              onClick={() => handleAssignTaxi(availableTaxi.id, request.id)}
                              style={{
                                padding: '5px 10px',
                                backgroundColor: '#27ae60',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                marginRight: '5px'
                              }}
                            >
                              Assign
                            </button>
                          ) : null}
                          <button
                            onClick={() => handleCancelRequest(request.id)}
                            style={{
                              padding: '5px 10px',
                              backgroundColor: '#95a5a6',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Cancel
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                      ✅ No pending requests - All customers matched!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      )}

        {/* REQUESTS VIEW */}
        {activeView === 'requests' && (
          <div>
            <h3 style={{ fontSize: '18px', marginBottom: '15px', color: '#2c3e50' }}>📋 Pending Ride Requests ({pendingRequests.length})</h3>
            <div style={{
              overflowX: 'auto',
              border: '1px solid #ecf0f1',
              borderRadius: '8px'
            }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Request ID</th>
                    <th>Customer</th>
                    <th>Pickup Location</th>
                    <th>Destination</th>
                    <th>Passengers</th>
                    <th>Urgency</th>
                    <th>Time</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRequests.length > 0 ? (
                    pendingRequests.map((request) => {
                      const availableTaxi = activeTaxis.find(t => t.status === 'available');
                      return (
                        <tr key={request.id}>
                          <td><strong>{request.id}</strong></td>
                          <td>{request.customer}</td>
                          <td>{request.pickupLocation}</td>
                          <td>{request.destination}</td>
                          <td>👥 {request.passengers}</td>
                          <td>
                            <span style={{
                              padding: '6px 12px',
                              backgroundColor: request.urgency === 'high' ? '#e74c3c' : '#f39c12',
                              color: 'white',
                              borderRadius: '20px',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}>
                              {request.urgency.toUpperCase()}
                            </span>
                          </td>
                          <td>{request.time}</td>
                          <td>
                            {availableTaxi ? (
                              <button
                                onClick={() => handleAssignTaxi(availableTaxi.id, request.id)}
                                style={{
                                  padding: '5px 10px',
                                  backgroundColor: '#27ae60',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '12px',
                                  marginRight: '5px'
                                }}
                              >
                                Assign
                              </button>
                            ) : null}
                            <button
                              onClick={() => handleCancelRequest(request.id)}
                              style={{
                                padding: '5px 10px',
                                backgroundColor: '#95a5a6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              Cancel
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                        ✅ No pending requests - All customers matched!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Map View (Placeholder) */}
      {showMap && (
        <div style={{
          marginTop: '30px',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #ecf0f1'
        }}>
          <h3 style={{ marginTop: 0 }}>🗺️ Real-Time Fleet Map</h3>
          <div style={{
            width: '100%',
            height: '400px',
            backgroundColor: '#e8eaf6',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#666',
            marginBottom: '20px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '48px', marginBottom: '10px' }}>🗺️</p>
              <p>Google Maps Integration Ready</p>
              <p style={{ fontSize: '12px', color: '#999' }}>
                {activeTaxis.length} taxis tracked | {activeTaxis.filter(t => t.status === 'on_trip').length} active trips
              </p>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px'
          }}>
            {activeTaxis.map((taxi) => (
              <div key={taxi.id} style={{
                padding: '15px',
                backgroundColor: 'white',
                borderRadius: '8px',
                border: '1px solid #ecf0f1'
              }}>
                <div style={{ fontWeight: '600', marginBottom: '8px' }}>{taxi.id} - {taxi.driver}</div>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>📍 {taxi.location}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>Status: {taxi.status}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedTaxi && (
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
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ marginBottom: '20px' }}>🚕 Taxi Details</h3>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ color: '#666', fontSize: '12px' }}>Taxi ID:</label>
              <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{selectedTaxi.id}</div>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ color: '#666', fontSize: '12px' }}>Driver:</label>
              <div>{selectedTaxi.driver}</div>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ color: '#666', fontSize: '12px' }}>Rating:</label>
              <div>⭐ {selectedTaxi.rating}</div>
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setSelectedTaxi(null)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#ecf0f1',
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

      {/* Service Management Modal */}
      {showServiceModal && selectedService && (
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
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ marginBottom: '20px', color: '#D40000' }}>⚙️ Manage {selectedService.name}</h3>
            <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#7f8c8d', marginBottom: '5px' }}>Active Vehicles</div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#3498db' }}>{selectedService.activeCount}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#7f8c8d', marginBottom: '5px' }}>Completed Trips</div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#27ae60' }}>{selectedService.completedTrips}</div>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ fontSize: '12px', color: '#7f8c8d', marginBottom: '5px' }}>Total Earnings</div>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: '#27ae60' }}>{selectedService.totalEarnings}</div>
                </div>
              </div>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#7f8c8d', marginBottom: '5px' }}>Price per KM:</label>
              <input type="text" defaultValue={selectedService.price} style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #bdc3c7',
                borderRadius: '6px'
              }} />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#7f8c8d', marginBottom: '5px' }}>Status:</label>
              <select style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #bdc3c7',
                borderRadius: '6px'
              }}>
                <option>Active</option>
                <option>Paused</option>
                <option>Maintenance</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowServiceModal(false)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#ecf0f1',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Service updated!');
                  setShowServiceModal(false);
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
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaxiMonitoringModule;
