import React, { useState } from "react";
import "./Navbar.css";
import { isManager, isAdmin } from "../utils/roleCheck";

const Navbar = ({ user, onLogout, onBookNow, onNavigate, onRoleSelect, onLogin, onRegister }) => {
  const [activeLink, setActiveLink] = useState("Home");
  const [showFleetMenu, setShowFleetMenu] = useState(false);

  const handleNavClick = (section) => {
    setActiveLink(section);
    setShowFleetMenu(false);
    if (onNavigate) {
      onNavigate(section);
    }
  };

  const handleManagerClick = () => {
    // Navigate to manager dashboard
    if (onNavigate) {
      onNavigate("Dashboard");
    }
  };

  const handleAdminClick = () => {
    // Navigate to admin dashboard
    if (onNavigate) {
      onNavigate("Dashboard");
    }
  };

  const handleFleetClick = (fleetType) => {
    setActiveLink("Fleet");
    setShowFleetMenu(false);
    if (onNavigate) {
      onNavigate(fleetType);
    }
  };

  const handleBookNow = () => {
    if (onBookNow) {
      onBookNow();
    }
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    setActiveLink("Home");
  };

  return (
    <nav className="navbar">
      <div className="logo" onClick={() => handleNavClick("Home")}>AutoNexus</div>

      <ul className="nav-links">
        <li
          className={activeLink === "Home" ? "active" : ""}
          onClick={() => handleNavClick("Home")}
        >
          Home
        </li>
        <li
          className={activeLink === "Fleet" ? "active" : ""}
          onClick={() => setShowFleetMenu(!showFleetMenu)}
        >
          Our Fleet
          {showFleetMenu && (
            <div className="fleet-dropdown">
              <div className="fleet-option" onClick={() => handleFleetClick("Fleet")}>
                Premium Cars
              </div>
              <div className="fleet-option" onClick={() => handleFleetClick("LocalCars")}>
                Local Cars
              </div>
            </div>
          )}
        </li>
        <li
          className={activeLink === "Services" ? "active" : ""}
          onClick={() => handleNavClick("Services")}
        >
          Services
        </li>
        <li
          className={activeLink === "OnDemandTaxi" ? "active" : ""}
          onClick={() => handleNavClick("OnDemandTaxi")}
        >
          Taxi
        </li>
        <li
          className={activeLink === "UsedCars" ? "active" : ""}
          onClick={() => handleNavClick("UsedCars")}
        >
          Used Cars
        </li>
        <li
          className={activeLink === "About" ? "active" : ""}
          onClick={() => handleNavClick("About")}
        >
          About Us
        </li>
        <li
          className={activeLink === "Contact" ? "active" : ""}
          onClick={() => handleNavClick("Contact")}
        >
          Contact
        </li>

        {user ? (
          <>
            <li className="user-profile">👤 {user.email}</li>
            <li className="nav-links-divider">|</li>
            {isManager(user) && (
              <li className="cta manager-btn" onClick={handleManagerClick} title="Go to Manager Dashboard">
                📊 Manager
              </li>
            )}
            {isAdmin(user) && (
              <li className="cta admin-btn" onClick={handleAdminClick} title="Go to Admin Dashboard">
                ⚙️ Admin
              </li>
            )}
            <li className="cta logout-btn" onClick={handleLogout}>
              Logout
            </li>
          </>
        ) : (
          <>
            <li className="cta" onClick={onRegister}>
              Register
            </li>
            <li className="cta" onClick={onLogin}>
              Login
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;