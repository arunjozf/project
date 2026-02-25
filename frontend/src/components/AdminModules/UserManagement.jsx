import React, { useState, useEffect } from 'react';
import { getToken } from '../../utils/api';
import '../../styles/AdminModules.css';

const UserManagement = ({ users: propsUsers = [], onUsersUpdate }) => {
  const [users, setUsers] = useState(propsUsers);
  const [loading, setLoading] = useState(false);
  const [filterRole, setFilterRole] = useState('all');

  useEffect(() => {
    // Update from props if provided
    if (propsUsers && propsUsers.length > 0) {
      setUsers(propsUsers);
    } else if (users.length === 0) {
      // Fetch if no props provided
      fetchAllUsers();
    }
  }, [propsUsers]);

  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      const token = getToken() || localStorage.getItem('authToken');
      console.log('[UserManagement] Fetching users with token:', token?.substring(0, 10) + '...');
      
      const response = await fetch('http://localhost:8000/api/bookings/admin/users/', {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('[UserManagement] Users loaded:', data);
        setUsers(data.data || data || []);
      } else {
        console.error('[UserManagement] Failed to fetch users:', response.status);
      }
    } catch (error) {
      console.error('[UserManagement] Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async (userId) => {
    try {
      const token = getToken() || localStorage.getItem('authToken');
      const response = await fetch(
        `http://localhost:8000/api/bookings/admin/users/${userId}/`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action: 'block' }),
        }
      );

      if (response.ok) {
        setUsers(prev =>
          prev.map(u =>
            u.id === userId ? { ...u, is_active: false } : u
          )
        );
        alert('✅ User blocked successfully!');
        if (onUsersUpdate) onUsersUpdate();
      } else {
        alert('❌ Failed to block user');
      }
    } catch (error) {
      console.error('[UserManagement] Error blocking user:', error);
      alert('Error: ' + error.message);
    }
  };

  const handleUnblockUser = async (userId) => {
    try {
      const token = getToken() || localStorage.getItem('authToken');
      const response = await fetch(
        `http://localhost:8000/api/bookings/admin/users/${userId}/`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action: 'unblock' }),
        }
      );

      if (response.ok) {
        setUsers(prev =>
          prev.map(u =>
            u.id === userId ? { ...u, is_active: true } : u
          )
        );
        alert('✅ User unblocked successfully!');
        if (onUsersUpdate) onUsersUpdate();
      } else {
        alert('❌ Failed to unblock user');
      }
    } catch (error) {
      console.error('[UserManagement] Error unblocking user:', error);
      alert('Error: ' + error.message);
    }
  };

  const filteredUsers = users.filter(user =>
    filterRole === 'all' || user.role === filterRole
  );

  return (
    <div className="admin-module-container">
      <div className="module-header">
        <h2>👥 User Management</h2>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Users ({users.length})</option>
          <option value="customer">Customers ({users.filter(u => u.role === 'customer').length})</option>
          <option value="manager">Managers ({users.filter(u => u.role === 'manager').length})</option>
          <option value="driver">Drivers ({users.filter(u => u.role === 'driver').length})</option>
          <option value="admin">Admins ({users.filter(u => u.role === 'admin').length})</option>
        </select>
      </div>

      {loading ? (
        <p className="loading-text">Loading users...</p>
      ) : filteredUsers.length === 0 ? (
        <p className="empty-text">No users found with selected filter.</p>
      ) : (
        <div className="users-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>#{user.id}</td>
                  <td>
                    <strong>{user.first_name} {user.last_name}</strong>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge role-${user.role}`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </td>
                  <td>{user.phone_number || '-'}</td>
                  <td>
                    <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                      {user.is_active ? '✅ Active' : '❌ Blocked'}
                    </span>
                  </td>
                  <td>{new Date(user.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      {user.is_active ? (
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleBlockUser(user.id)}
                        >
                          🚫 Block
                        </button>
                      ) : (
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => handleUnblockUser(user.id)}
                        >
                          ✅ Unblock
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
