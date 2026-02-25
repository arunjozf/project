import React, { useState, useEffect } from 'react';
import { getToken } from '../../utils/api';
import './ModuleStyles.css';

const ComplaintsModule = ({ user }) => {
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchComplaints();
  }, []);

  useEffect(() => {
    filterComplaints();
  }, [complaints, filterStatus, filterPriority, searchTerm]);

  const fetchComplaints = async () => {
    try {
      const token = getToken();
      // API will be created: http://localhost:8000/api/complaints/

      // Mock data
      setComplaints([
        {
          id: 1,
          customer: 'John Doe',
          category: 'driver_behavior',
          text: 'Driver was rude and took wrong route',
          priority: 'high',
          status: 'open',
          date: '2024-02-10',
          assignedTo: null,
        },
        {
          id: 2,
          customer: 'Jane Smith',
          category: 'vehicle_condition',
          text: 'Car had damaged seat',
          priority: 'medium',
          status: 'in_progress',
          date: '2024-02-08',
          assignedTo: 'Manager 1',
        },
        {
          id: 3,
          customer: 'Ahmed Hassan',
          category: 'billing_issue',
          text: 'Charged extra amount not agreed',
          priority: 'high',
          status: 'open',
          date: '2024-02-09',
          assignedTo: null,
        },
        {
          id: 4,
          customer: 'Maria Garcia',
          category: 'service_quality',
          text: 'Trip took longer than expected',
          priority: 'low',
          status: 'resolved',
          date: '2024-02-05',
          assignedTo: 'Manager 2',
        },
        {
          id: 5,
          customer: 'Robert Johnson',
          category: 'lost_item',
          text: 'Left wallet in car',
          priority: 'medium',
          status: 'in_progress',
          date: '2024-02-07',
          assignedTo: 'Manager 1',
        },
      ]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      setLoading(false);
    }
  };

  const filterComplaints = () => {
    let filtered = complaints;

    if (filterStatus !== 'all') {
      filtered = filtered.filter(c => c.status === filterStatus);
    }

    if (filterPriority !== 'all') {
      filtered = filtered.filter(c => c.priority === filterPriority);
    }

    if (searchTerm) {
      filtered = filtered.filter(c =>
        c.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.text.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredComplaints(filtered);
  };

  const getComplaintStats = () => {
    return {
      total: complaints.length,
      open: complaints.filter(c => c.status === 'open').length,
      inProgress: complaints.filter(c => c.status === 'in_progress').length,
      resolved: complaints.filter(c => c.status === 'resolved').length,
      criticalHigh: complaints.filter(c => c.priority === 'high' || c.priority === 'critical').length,
    };
  };

  const handleViewDetails = (complaint) => {
    setSelectedComplaint(complaint);
    setShowDetailModal(true);
  };

  const handleAssignComplaint = (complaintId) => {
    alert('Assigning complaint ' + complaintId);
  };

  const handleResolveComplaint = (complaintId) => {
    alert('Marking complaint ' + complaintId + ' as resolved');
  };

  if (loading) {
    return <div className="loading">Loading complaints...</div>;
  }

  const stats = getComplaintStats();

  return (
    <div className="admin-module complaints">
      <h2>📋 Complaint Management</h2>

      {/* Filters */}
      <div className="module-filters">
        <input
          type="text"
          placeholder="Search complaints..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="filter-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <select
          className="filter-select"
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
        >
          <option value="all">All Priority</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Complaints Table */}
      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Category</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Date</th>
              <th>Assigned To</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredComplaints.map(complaint => (
              <tr key={complaint.id}>
                <td>#{complaint.id}</td>
                <td>{complaint.customer}</td>
                <td>
                  <span className="role-badge" style={{ background: '#f8d7da' }}>
                    {complaint.category.replace(/_/g, ' ')}
                  </span>
                </td>
                <td>
                  <span
                    className="role-badge"
                    style={{
                      background: complaint.priority === 'high' || complaint.priority === 'critical' ? '#f8d7da' : '#fff3cd',
                    }}
                  >
                    {complaint.priority}
                  </span>
                </td>
                <td>
                  <span className={`status-badge status-${complaint.status}`}>
                    {complaint.status.replace(/_/g, ' ')}
                  </span>
                </td>
                <td>{complaint.date}</td>
                <td>{complaint.assignedTo || 'Unassigned'}</td>
                <td>
                  <button className="action-btn" onClick={() => handleViewDetails(complaint)}>
                    View
                  </button>
                  {!complaint.assignedTo && complaint.status === 'open' && (
                    <button className="action-btn btn-warning" onClick={() => handleAssignComplaint(complaint.id)}>
                      Assign
                    </button>
                  )}
                  {complaint.status !== 'resolved' && (
                    <button className="action-btn btn-success" onClick={() => handleResolveComplaint(complaint.id)}>
                      Resolve
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Statistics */}
      <div className="module-stats">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Complaints</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.open}</div>
          <div className="stat-label">Open Issues</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.inProgress}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.criticalHigh}</div>
          <div className="stat-label">High Priority</div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedComplaint && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Complaint #{selectedComplaint.id} Details</h3>
            <div className="form-group">
              <label>Customer:</label>
              <input type="text" defaultValue={selectedComplaint.customer} disabled />
            </div>
            <div className="form-group">
              <label>Category:</label>
              <input type="text" defaultValue={selectedComplaint.category} disabled />
            </div>
            <div className="form-group">
              <label>Priority:</label>
              <input type="text" defaultValue={selectedComplaint.priority} disabled />
            </div>
            <div className="form-group">
              <label>Complaint:</label>
              <textarea defaultValue={selectedComplaint.text} disabled />
            </div>
            <div className="form-group">
              <label>Resolution Notes:</label>
              <textarea placeholder="Add resolution notes or customer response..."></textarea>
            </div>
            <div className="modal-actions">
              <button className="btn btn-success" onClick={() => {
                alert('Resolution saved!');
                setShowDetailModal(false);
              }}>
                Mark Resolved
              </button>
              <button className="btn btn-secondary" onClick={() => setShowDetailModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintsModule;
