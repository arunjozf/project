import React, { useState } from "react";
import "../styles/Login.css";
import { authAPI, saveToken, saveUserData } from "../utils/api";

const Signup = ({ onSignupSuccess, onToggleForm, onBack }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "customer",
    agreeTerms: false,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("Please fill in all required fields (First Name, Last Name, Email, Password)");
      setLoading(false);
      return;
    }

    if (!formData.role || formData.role === "") {
      setError("Please select a role (Customer or Manager)");
      setLoading(false);
      return;
    }

    // Validate that only allowed roles are submitted
    if (!['customer', 'manager'].includes(formData.role)) {
      setError(`Role '${formData.role}' is not allowed for self-registration. Please select Customer or Manager.`);
      setLoading(false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (!formData.agreeTerms) {
      setError("Please agree to the terms and conditions");
      setLoading(false);
      return;
    }

    // Log data being sent for debugging
    console.log('[Signup] Submitting registration with data:', {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      role: formData.role,
      agreeTerms: formData.agreeTerms,
      password: '***',
      confirmPassword: '***'
    });

    // Send data to backend
    try {
      const signupData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: formData.role,
      };

      console.log('[Signup] Sending request to API with:', signupData);
      
      const response = await authAPI.signup(signupData);

      console.log('[Signup] Success response:', response);
      setSuccess("Account created successfully! Logging you in...");
      
      // Extract user data from response (backend wraps in { status, data: {...} })
      const userData = response.data || response;
      
      console.log('[Signup] Extracted userData:', userData);
      
      // Validate required fields
      if (!userData.token) {
        setError("No token received from server");
        console.error("[Signup] Invalid response - missing token. Full response:", response);
        return;
      }

      if (!userData.email) {
        setError("Invalid user data received from server");
        console.error("[Signup] Invalid response - missing email. Full response:", response);
        return;
      }

      if (!userData.role) {
        setError("Invalid user role received from server");
        console.error("[Signup] Invalid response - missing role. Full response:", response);
        return;
      }
      
      // Store auth data
      console.log('[Signup] Saving token and user data');
      saveToken(userData.token);
      saveUserData(userData);

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "customer",
        agreeTerms: false,
      });

      // Redirect after delay
      setTimeout(() => {
        console.log('[Signup] Calling onSignupSuccess with data:', userData);
        if (onSignupSuccess) {
          onSignupSuccess(userData);
        }
        if (onToggleForm) {
          onToggleForm();
        }
      }, 1500);
    } catch (err) {
      // Handle error response from backend
      console.error("[Signup] Full error object:", err);
      console.error("[Signup] Error details:", {
        status: err.status,
        statusText: err.statusText,
        errors: err.errors,
        message: err.message,
      });
      
      let errorMessage = "Signup failed";
      
      if (err.errors) {
        // Handle object errors (from Django validation)
        if (typeof err.errors === "object") {
          const errorArray = Object.entries(err.errors)
            .map(([key, value]) => {
              if (Array.isArray(value)) {
                return `${key}: ${value.join(", ")}`;
              }
              return `${key}: ${value}`;
            });
          errorMessage = errorArray.join(" | ");
        } else {
          errorMessage = err.errors;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      console.error("[Signup] Setting error message:", errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header" style={{ position: "relative" }}>
          
          <h1>Create Account</h1>
          <p>Join us today and start exploring</p>
        </div>

        {error && <div className="login-error">{error}</div>}
        {success && <div className="login-success">{success}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Select Your Role *</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "12px 15px",
                border: "2px solid #e0e0e0",
                borderRadius: "8px",
                fontSize: "16px",
                fontFamily: "'Poppins', sans-serif",
                backgroundColor: "#fff",
                cursor: "pointer",
              }}
            >
              <option value="">-- Select a Role --</option>
              <option value="customer">🚗 Customer - Book Rides & Services</option>
              <option value="manager">📊 Manager - Manage Fleet & Bookings</option>
            </select>
            <p style={{ fontSize: "12px", color: "#666", marginTop: "6px" }}>
              Admin registration requires system authorization.
            </p>
          </div>

          <label className="terms-checkbox">
            <input
              type="checkbox"
              name="agreeTerms"
              checked={formData.agreeTerms}
              onChange={handleChange}
            />
            <span>I agree to the Terms & Conditions and Privacy Policy</span>
          </label>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="signup-link">
          Already have an account? <a onClick={onToggleForm} style={{ cursor: "pointer" }}>Sign in</a>
        </p>

        <div style={{ marginTop: "15px", display: "flex", gap: "10px" }}>
          <button type="button" onClick={onBack} className="login-btn" style={{ flex: 1, backgroundColor: "#999" }}>
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signup;
