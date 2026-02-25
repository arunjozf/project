import React, { useState, useEffect } from 'react';
import { getToken } from '../../utils/api';
import './ModuleStyles.css';

const UserManagementModule = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, filterRole, searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await fetch('http://localhost:8000/api/bookings/admin/users/', {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const usersData = Array.isArray(data) ? data : (data.data || []);
        setUsers(usersData);
      } else {
        console.error('Failed to fetch users:', response.status);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (filterRole !== 'all') {
      filtered = filtered.filter(u => u.role === filterRole);
    }

    if (searchTerm) {
      filtered = filtered.filter(u =>
        (u.first_name + ' ' + u.last_name).toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  };

  const handleDeleteUser = async (userId) => {
    const userToDelete = users.find(u => u.id === userId);
    const userName = `${userToDelete.first_name} ${userToDelete.last_name}`;
    
    if (!window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeleting(true);
      const token = getToken();
      const response = await fetch(`http://localhost:8000/api/bookings/admin/users/${userId}/delete_user/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        alert(`✅ User "${userName}" has been deleted successfully`);
        setUsers(prev => prev.filter(u => u.id !== userId));
      } else {
        const errorData = await response.json();
        alert(`❌ Failed to delete user: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('❌ Error deleting user. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const handleEditUser = (userData) => {
    setSelectedUser(userData);
    setShowModal(true);
  };

  const handleSaveUserChanges = async () => {
    try {
      const token = getToken();
      const response = await fetch(`http://localhost:8000/api/bookings/admin/users/${selectedUser.id}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: selectedUser.role,
          is_active: selectedUser.is_active,
        }),
      });

      if (response.ok) {
        alert('✅ User changes saved successfully');
        fetchUsers();
        setShowModal(false);
      } else {
        alert('❌ Failed to save user changes');
      }
    } catch (error) {
      console.error('Error saving user changes:', error);
      alert('❌ Error saving user changes');
    }
  };

  const renderUserName = (user) => {
    return `${user.first_name} ${user.last_name}`;
  };

  const getRoleBadge = (role) => {
    const roleLabel = role ? role.charAt(0).toUpperCase() + role.slice(1) : 'User';
    return roleLabel;
  };

  if (loading) {
    return <div className="loading">Loading user data...</div>;
  }

  return (
    <div className="admin-module user-management">
      <h2>👤 User Management</h2>

      {/* Filters & Search */}
      <div className="module-filters">
        <input
          type="text"
          placeholder="Search users by name, email or username..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="filter-select"
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
        >
          <option value="all">All Roles</option>
          <option value="customer">Customers</option>
          <option value="manager">Managers</option>
          <option value="driver">Drivers</option>
          <option value="admin">Admins</option>
        </select>
        <button className="btn btn-primary" disabled>➕ Add New User</button>
      </div>

      {/* Users Table */}
      <div className="table-container">
        {filteredUsers.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Mail</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u.id}>
                  <td>
                    <strong>{u.email}</strong>
                  </td>
                  <td>
                    <span className={`status-badge status-${u.is_active ? 'active' : 'inactive'}`}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="action-btn" 
                      onClick={() => handleEditUser(u)}
                      disabled={deleting}
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      className="action-btn btn-danger" 
                      onClick={() => handleDeleteUser(u.id)}
                      disabled={deleting}
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-data-message">
            <p>No users found matching your search criteria</p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="module-stats">
        <div className="stat-card">
          <div className="stat-value">{users.length}</div>
          <div className="stat-label">Total Users</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{users.filter(u => u.is_active).length}</div>
          <div className="stat-label">Active Users</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{users.filter(u => u.role === 'manager').length}</div>
          <div className="stat-label">Managers</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{users.filter(u => u.role === 'driver').length}</div>
          <div className="stat-label">Drivers</div>
        </div>
      </div>

      {/* Edit User Modal */}
      {showModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            <h3>Edit User: {renderUserName(selectedUser)}</h3>
            
            <div className="form-group">
              <label>Email:</label>
              <input type="email" value={selectedUser.email} disabled style={{ backgroundColor: '#f5f5f5' }} />
            </div>
            
            <div className="form-group">
              <label>Username:</label>
              <input type="text" value={selectedUser.username} disabled style={{ backgroundColor: '#f5f5f5' }} />
            </div>

            <div className="form-group">
              <label>Role:</label>
              <select 
                value={selectedUser.role || 'customer'}
                onChange={(e) => setSelectedUser({...selectedUser, role: e.target.value})}
              >
                <option value="customer">Customer</option>
                <option value="manager">Manager</option>
                <option value="driver">Driver</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="form-group">
              <label>Status:</label>
              <select 
                value={selectedUser.is_active ? 'active' : 'inactive'}
                onChange={(e) => setSelectedUser({...selectedUser, is_active: e.target.value === 'active'})}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="modal-actions">
              <button className="btn btn-primary" onClick={handleSaveUserChanges}>✅ Save Changes</button>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementModule;
