import React, { useState, useEffect } from "react";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Fleet from "./pages/Fleet";
import LocalCars from "./pages/LocalCars";
import Services from "./pages/Services";
import About from "./pages/About";
import Contact from "./pages/Contact";
import TermsAndConditions from "./pages/TermsAndConditions";
import OnDemandTaxi from "./pages/OnDemandTaxi";
import UserDashboard from "./pages/UserDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import BookingPage from "./pages/BookingPage";
import RoleSelection from "./pages/RoleSelection";
import UsedCarsPage from "./pages/UsedCarsPage";
import { isManager, isAdmin } from "./utils/roleCheck";
import { getToken, getUserData, removeToken, removeUserData, authAPI } from "./utils/api";
import { isSessionValid, getSessionInfo, clearAllAppState, loadNavigationState, saveNavigationState } from "./utils/persistentState";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [currentPage, setCurrentPage] = useState("Home");
  const [bookingCarType, setBookingCarType] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize authentication on app load
  useEffect(() => {
    console.log("[App] Initializing application...");
    
    // Check if user has valid session
    if (isSessionValid()) {
      console.log("[App] Valid session found. Restoring previous navigation state...");
      
      // Get user data
      const userDataStr = localStorage.getItem('userData');
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        setUser(userData);
        setIsLoggedIn(true);
        
        // Set role
        if (userData.role === 'manager') {
          setSelectedRole('manager');
        } else if (userData.role === 'admin') {
          setSelectedRole('admin');
        } else {
          setSelectedRole('customer');
        }
      }
      
      // Restore previous navigation state
      const navState = loadNavigationState();
      if (navState && navState.currentPage) {
        console.log("[App] Restoring page:", navState.currentPage);
        setCurrentPage(navState.currentPage);
      } else {
        setCurrentPage("Dashboard");
      }
    } else {
      console.log("[App] No valid session. Starting with Home page.");
      setCurrentPage("Home");
    }
    
    setLoading(false);
  }, []);

  // Save current page to localStorage whenever it changes
  useEffect(() => {
    if (isLoggedIn && currentPage !== "Home") {
      saveNavigationState({
        currentPage,
        selectedRole,
        timestamp: Date.now()
      });
      console.log("[App] Page changed to:", currentPage, "- Saved to localStorage");
    }
  }, [currentPage, isLoggedIn, selectedRole]);

  const handleLoginSuccess = (userData) => {
    console.log("[App] handleLoginSuccess called with userData:", userData);
    
    // Ensure userData has required fields
    if (!userData || !userData.role) {
      console.error("[App] Invalid userData received:", userData);
      return;
    }

    console.log("[App] User role from backend:", userData.role);
    
    setUser(userData);
    setIsLoggedIn(true);
    setShowLoginForm(false);

    // Automatically set role based on user's role from backend and redirect to dashboard
    if (userData.role === 'manager') {
      console.log("[App] Admin logged in. Redirecting to Manager Dashboard.");
      setSelectedRole('manager');
      setCurrentPage("Dashboard"); // Go to Manager Dashboard
    } else if (userData.role === 'admin') {
      console.log("[App] Admin logged in. Redirecting to Admin Dashboard.");
      setSelectedRole('admin');
      setCurrentPage("Dashboard"); // Go to Admin Dashboard
    } else {
      console.log("[App] Customer logged in. Redirecting to User Dashboard.");
      setSelectedRole('customer');
      setCurrentPage("Dashboard"); // Go to User Dashboard
    }
  };

  const handleSignupSuccess = (userData) => {
    console.log("[App] handleSignupSuccess called with userData:", userData);
    
    // Ensure userData has required fields
    if (!userData || !userData.role) {
      console.error("[App] Invalid userData received:", userData);
      return;
    }

    console.log("[App] New user role from backend:", userData.role);
    
    setUser(userData);
    setIsLoggedIn(true);
    setShowSignup(false);
    setShowLoginForm(false);

    // Automatically set role based on user's role from backend and redirect to dashboard
    if (userData.role === 'manager') {
      console.log("[App] Manager registered. Redirecting to Manager Dashboard.");
      setSelectedRole('manager');
      setCurrentPage("Dashboard"); // Go to Manager Dashboard
    } else if (userData.role === 'admin') {
      console.log("[App] Admin registered. Redirecting to Admin Dashboard.");
      setSelectedRole('admin');
      setCurrentPage("Dashboard"); // Go to Admin Dashboard
    } else {
      console.log("[App] Customer registered. Redirecting to User Dashboard.");
      setSelectedRole('customer');
      setCurrentPage("Dashboard"); // Go to User Dashboard
    }
  };

  const handleLogout = async () => {
    try {
      const token = getToken();
      if (token) {
        await authAPI.logout(token);
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear all authentication and app state
      removeToken();
      removeUserData();
      clearAllAppState();
      
      // Reset app state
      setIsLoggedIn(false);
      setUser(null);
      setSelectedRole(null);
      setCurrentPage("Home"); // Always return to home page on logout
      setShowLoginForm(false);
      setShowSignup(false);
      
      // Clear all localStorage to ensure no persistence
      localStorage.clear();
      
      console.log("[App] Logout complete. All data cleared. Redirected to home page.");
    }
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  const toggleForm = () => {
    setShowSignup(!showSignup);
  };

  const handleBookNow = () => {
    setShowLoginForm(true);
    setShowSignup(false);
  };

  const handleLogin = () => {
    setShowLoginForm(true);
    setShowSignup(false);
  };

  const handleRegister = () => {
    setShowLoginForm(true);
    setShowSignup(true);
  };

  const handleBookingCarType = (carType) => {
    setBookingCarType(carType);
  };

  const closeBookingPage = () => {
    setBookingCarType(null);
  };

  const handleBookingSubmit = (bookingData) => {
    console.log("Booking submitted:", bookingData);
    alert("Booking confirmed! You will receive a confirmation email shortly.");
    setBookingCarType(null);
  };

  const closeLoginForm = () => {
    setShowLoginForm(false);
    setShowSignup(false);
  };

  const handleNavigate = (section) => {
    setCurrentPage(section);
    setShowLoginForm(false);
  };

  // If booking page is shown, display BookingPage
  if (bookingCarType) {
    return (
      <BookingPage
        carType={bookingCarType}
        onBack={closeBookingPage}
        onBookingSubmit={handleBookingSubmit}
      />
    );
  }

  // If login form is shown, display Login/Signup
  if (showLoginForm) {
    return showSignup ? (
      <Signup onSignupSuccess={handleSignupSuccess} onToggleForm={toggleForm} onBack={closeLoginForm} />
    ) : (
      <Login onLoginSuccess={handleLoginSuccess} onSignupClick={toggleForm} onBack={closeLoginForm} />
    );
  }

  // If user is logged in but no role selected, auto-redirect based on their role
  if (isLoggedIn && !selectedRole) {
    // This should not happen as we set selectedRole in handleLoginSuccess and handleSignupSuccess
    // But keeping as fallback
    console.log("[App] User logged in but no role selected. Showing RoleSelection.");
    return <RoleSelection onRoleSelect={handleRoleSelect} onLogout={handleLogout} />;
  }

  // If user selected manager role, show manager interface
  if (isLoggedIn && selectedRole === "manager") {
    console.log("[App] Rendering manager interface. Current page:", currentPage);
    if (currentPage === "Dashboard") {
      return <ManagerDashboard user={user} onLogout={handleLogout} />;
    }
    // Show home page and other pages with navbar for manager
    return (
      <>
        <Navbar
          user={user}
          onLogout={handleLogout}
          onBookNow={handleBookNow}
          onNavigate={handleNavigate}
          onRoleSelect={handleRoleSelect}
          onLogin={handleLogin}
          onRegister={handleRegister}
        />
        {(() => {
          switch (currentPage) {
            case "Home":
              return <Home user={user} onLogout={handleLogout} onBookNow={handleBookNow} onNavigate={handleNavigate} onBookingCarType={handleBookingCarType} onLogin={handleLogin} onRegister={handleRegister} onRoleSelect={handleRoleSelect} />;
            case "Fleet":
              return <Fleet onBookNow={handleBookNow} onBookingCarType={handleBookingCarType} />;
            case "LocalCars":
              return <LocalCars onBookNow={handleBookNow} onBookingCarType={handleBookingCarType} />;
            case "Services":
              return <Services />;
            case "OnDemandTaxi":
              return <OnDemandTaxi onBookNow={handleBookNow} onBookingCarType={handleBookingCarType} />;
            case "About":
              return <About />;
            case "Contact":
              return <Contact />;
            case "TermsAndConditions":
              return <TermsAndConditions />;
            case "UsedCars":
              return <UsedCarsPage />;
            default:
              return <Home user={user} onLogout={handleLogout} onBookNow={handleBookNow} onNavigate={handleNavigate} onBookingCarType={handleBookingCarType} onLogin={handleLogin} onRegister={handleRegister} onRoleSelect={handleRoleSelect} />;
          }
        })()}
      </>
    );
  }

  // If user selected admin role, show admin interface
  if (isLoggedIn && selectedRole === "admin") {
    console.log("[App] Rendering admin interface. Current page:", currentPage);
    if (currentPage === "Dashboard") {
      return <AdminDashboard user={user} onLogout={handleLogout} />;
    }
    // Show home page and other pages with navbar for admin
    return (
      <>
        <Navbar
          user={user}
          onLogout={handleLogout}
          onBookNow={handleBookNow}
          onNavigate={handleNavigate}
          onRoleSelect={handleRoleSelect}
          onLogin={handleLogin}
          onRegister={handleRegister}
        />
        {(() => {
          switch (currentPage) {
            case "Home":
              return <Home user={user} onLogout={handleLogout} onBookNow={handleBookNow} onNavigate={handleNavigate} onBookingCarType={handleBookingCarType} onLogin={handleLogin} onRegister={handleRegister} onRoleSelect={handleRoleSelect} />;
            case "Fleet":
              return <Fleet onBookNow={handleBookNow} onBookingCarType={handleBookingCarType} />;
            case "LocalCars":
              return <LocalCars onBookNow={handleBookNow} onBookingCarType={handleBookingCarType} />;
            case "Services":
              return <Services />;
            case "OnDemandTaxi":
              return <OnDemandTaxi onBookNow={handleBookNow} onBookingCarType={handleBookingCarType} />;
            case "About":
              return <About />;
            case "Contact":
              return <Contact />;
            case "TermsAndConditions":
              return <TermsAndConditions />;
            case "UsedCars":
              return <UsedCarsPage />;
            default:
              return <Home user={user} onLogout={handleLogout} onBookNow={handleBookNow} onNavigate={handleNavigate} onBookingCarType={handleBookingCarType} onLogin={handleLogin} onRegister={handleRegister} onRoleSelect={handleRoleSelect} />;
          }
        })()}
      </>
    );
  }

  // If user selected customer role, show user dashboard (with Navbar)
  if (isLoggedIn && selectedRole === "customer") {
    console.log("[App] Rendering customer interface. Current page:", currentPage);
    return (
      <>
        {currentPage !== "Dashboard" && (
          <Navbar
            user={user}
            onLogout={handleLogout}
            onBookNow={handleBookNow}
            onNavigate={handleNavigate}
            onRoleSelect={handleRoleSelect}
            onLogin={handleLogin}
            onRegister={handleRegister}
          />
        )}
        {currentPage === "Dashboard" ? (
          <UserDashboard user={user} onLogout={handleLogout} />
        ) : (
          (function renderPageForCustomer() {
            switch (currentPage) {
              case "Home":
                return <Home user={user} onLogout={handleLogout} onBookNow={handleBookNow} onNavigate={handleNavigate} onBookingCarType={handleBookingCarType} onLogin={handleLogin} onRegister={handleRegister} onRoleSelect={handleRoleSelect} />;
              case "Fleet":
                return <Fleet onBookNow={handleBookNow} onBookingCarType={handleBookingCarType} />;
              case "LocalCars":
                return <LocalCars onBookNow={handleBookNow} onBookingCarType={handleBookingCarType} />;
              case "Services":
                return <Services />;
              case "OnDemandTaxi":
                return <OnDemandTaxi onBookNow={handleBookNow} onBookingCarType={handleBookingCarType} />;
              case "About":
                return <About />;
              case "Contact":
                return <Contact />;
              case "TermsAndConditions":
                return <TermsAndConditions />;
              case "UsedCars":
                return <UsedCarsPage />;
              default:
                return <UserDashboard user={user} onLogout={handleLogout} />;
            }
          })()
        )}
      </>
    );
  }

  // If user selected user role (legacy), show regular pages with navbar
  if (isLoggedIn && selectedRole === "user") {
    // Continue with regular customer interface
    const renderPage = () => {
      switch (currentPage) {
        case "Home":
          return <Home onBookNow={handleBookNow} onNavigate={handleNavigate} onBookingCarType={handleBookingCarType} onLogin={handleLogin} onRegister={handleRegister} onRoleSelect={handleRoleSelect} />;
        case "Fleet":
          return <Fleet onBookNow={handleBookNow} onBookingCarType={handleBookingCarType} />;
        case "LocalCars":
          return <LocalCars onBookNow={handleBookNow} onBookingCarType={handleBookingCarType} />;
        case "Services":
          return <Services />;
        case "OnDemandTaxi":
          return <OnDemandTaxi onBookNow={handleBookNow} onBookingCarType={handleBookingCarType} />;
        case "About":
          return <About />;
        case "Contact":
          return <Contact />;
        case "TermsAndConditions":
          return <TermsAndConditions />;
        case "UsedCars":
          return <UsedCarsPage />;
        default:
          return <Home onBookNow={handleBookNow} onNavigate={handleNavigate} onBookingCarType={handleBookingCarType} />;
      }
    };

    return (
      <>
        <Navbar
          user={user}
          onLogout={handleLogout}
          onBookNow={handleBookNow}
          onNavigate={handleNavigate}
          onRoleSelect={handleRoleSelect}
          onLogin={handleLogin}
          onRegister={handleRegister}
        />
        {renderPage()}
      </>
    );
  }

  // Default: Render current page with Navbar (for logged out users)
  console.log("[App] Rendering public interface. Current page:", currentPage, "Is logged in:", isLoggedIn);
  const renderPage = () => {
    switch (currentPage) {
      case "Home":
        return <Home user={user} onLogout={handleLogout} onBookNow={handleBookNow} onNavigate={handleNavigate} onBookingCarType={handleBookingCarType} onLogin={handleLogin} onRegister={handleRegister} onRoleSelect={handleRoleSelect} />;
      case "Fleet":
        return <Fleet onBookNow={handleBookNow} onBookingCarType={handleBookingCarType} />;
      case "LocalCars":
        return <LocalCars onBookNow={handleBookNow} onBookingCarType={handleBookingCarType} />;
      case "Services":
        return <Services />;
      case "OnDemandTaxi":
        return <OnDemandTaxi onBookNow={handleBookNow} onBookingCarType={handleBookingCarType} />;
      case "About":
        return <About />;
      case "Contact":
        return <Contact />;
      case "TermsAndConditions":
        return <TermsAndConditions />;
      case "UsedCars":
        return <UsedCarsPage />;
      default:
        return <Home user={user} onLogout={handleLogout} onBookNow={handleBookNow} onNavigate={handleNavigate} onBookingCarType={handleBookingCarType} onLogin={handleLogin} onRegister={handleRegister} onRoleSelect={handleRoleSelect} />;
    }
  };

  return (
    <>
      <Navbar
        user={user}
        onLogout={handleLogout}
        onBookNow={handleBookNow}
        onNavigate={handleNavigate}
        onRoleSelect={handleRoleSelect}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />
      {renderPage()}
    </>
  );
};

export default App;
