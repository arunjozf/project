import React, { useState } from "react";
import "../styles/Login.css";
import { authAPI, saveToken, saveUserData } from "../utils/api";

const Login = ({ onLoginSuccess, onSignupClick, onBack }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const handleForgotPasswordSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    // Simulate API call since backend endpoint is not yet available
    setTimeout(() => {
      setLoading(false);
      alert(`Password reset link has been sent to ${email}`);
      setIsForgotPassword(false);
      setError("");
    }, 1500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Basic validation
    if (!email || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      console.log("[Login] Submitting login request for:", email);
      const response = await authAPI.login({
        email,
        password,
      });

      console.log("[Login] Response received:", response);

      // Extract user data from response
      // Backend response structure: { status: 'success', message: '...', data: {...} }
      const userData = response.data || response;
      
      console.log("[Login] Extracted userData:", userData);
      
      // Validate that we have required fields
      if (!userData.token) {
        setError("No token received from server");
        console.error("[Login] Invalid response - missing token. Full response:", response);
        return;
      }

      if (!userData.email) {
        setError("Invalid user data received from server");
        console.error("[Login] Invalid response - missing email. Full response:", response);
        return;
      }

      if (!userData.role) {
        setError("Invalid user role received from server");
        console.error("[Login] Invalid response - missing role. Full response:", response);
        return;
      }
      
      // Store auth data
      console.log("[Login] Saving token and user data");
      saveToken(userData.token);
      saveUserData(userData);

      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
      }

      console.log("[Login] Login successful. User role:", userData.role);
      
      // Call success callback
      if (onLoginSuccess) {
        console.log("[Login] Calling onLoginSuccess callback");
        onLoginSuccess(userData);
      }

      // Reset form
      setEmail("");
      setPassword("");
      setRememberMe(false);
    } catch (err) {
      const errorMessage = err.errors?.password?.[0] || err.message || "Login failed";
      setError(errorMessage);
      console.error("[Login] Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header" style={{ position: "relative" }}>
          <h1>{isForgotPassword ? "Reset Password" : "Welcome Back"}</h1>
          <p>{isForgotPassword ? "Enter your email to receive recovery instructions" : "Sign in to your account"}</p>
        </div>

        {error && <div className="login-error">{error}</div>}

        {isForgotPassword ? (
          <form onSubmit={handleForgotPasswordSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="reset-email">Email Address</label>
              <input
                type="email"
                id="reset-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoFocus
              />
            </div>
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Sending Link..." : "Send Reset Link"}
            </button>
            <div style={{ textAlign: "center", marginTop: "15px" }}>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); setIsForgotPassword(false); setError(""); }}
                style={{ color: "#666", textDecoration: "none", fontSize: "0.9rem" }}
              >
                Scan back to Login
              </a>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div className="form-options">
              <label className="remember-me">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <a
                href="#"
                className="forgot-password"
                onClick={(e) => { e.preventDefault(); setIsForgotPassword(true); setError(""); }}
              >
                Forgot password?
              </a>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        )}

        <p className="signup-link">
          Don't have an account? <a onClick={onSignupClick} style={{ cursor: "pointer" }}>Sign up</a>
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

export default Login;
