import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  getToken, 
  saveToken, 
  removeToken, 
  getUserData, 
  saveUserData, 
  removeUserData,
  authAPI 
} from './api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = getToken();
    const storedUser = getUserData();

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      saveToken(response.data.token);
      saveUserData(response.data);
      setToken(response.data.token);
      setUser(response.data);
      setIsAuthenticated(true);
      return response.data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const signup = async (userData) => {
    try {
      const response = await authAPI.signup(userData);
      saveToken(response.data.token);
      saveUserData(response.data);
      setToken(response.data.token);
      setUser(response.data);
      setIsAuthenticated(true);
      return response.data;
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await authAPI.logout(token);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      removeToken();
      removeUserData();
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const getCurrentUser = async () => {
    if (!token) return null;
    try {
      const response = await authAPI.getCurrentUser(token);
      setUser(response.data);
      saveUserData(response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to get current user:', error);
      // If token is invalid, clear auth
      if (error.status === 401) {
        logout();
      }
      return null;
    }
  };

  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    login,
    signup,
    logout,
    getCurrentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
