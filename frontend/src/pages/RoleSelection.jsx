import React from "react";
import "./RoleSelection.css";

const RoleSelection = ({ onRoleSelect, onLogout }) => {
  return (
    <div className="role-selection-container">
      <div className="role-selection-content">
        <div className="role-header">
          <h1>Welcome to TaxiHub</h1>
          <p>Select your role to continue</p>
        </div>

        <div className="role-cards">
          <div className="role-card user-card" onClick={() => onRoleSelect("user")}>
            <div className="role-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <h2>User</h2>
            <p>Book rides and enjoy our taxi services</p>
            <button className="role-btn">Enter as User</button>
          </div>

          <div className="role-card manager-card" onClick={() => onRoleSelect("manager")}>
            <div className="role-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
            </div>
            <h2>Manager</h2>
            <p>Manage bookings, vehicles, and drivers</p>
            <button className="role-btn">Enter as Manager</button>
          </div>

          <div className="role-card admin-card" onClick={() => onRoleSelect("admin")}>
            <div className="role-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"></path>
                <path d="M12 12c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z"></path>
              </svg>
            </div>
            <h2>Admin</h2>
            <p>Manage system, users, and analytics</p>
            <button className="role-btn">Enter as Admin</button>
          </div>
        </div>

        <div className="role-footer">
          <button className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
