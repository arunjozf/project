/**
 * API Service Module
 * Handles all HTTP requests to the backend API
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// =====================
// Auth Endpoints
// =====================

export const authAPI = {
  /**
   * Register a new user
   * @param {Object} userData - { firstName, lastName, email, password, confirmPassword, role }
   * @returns {Promise<Object>}
   */
  signup: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/users/signup/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  /**
   * Login user
   * @param {Object} credentials - { email, password }
   * @returns {Promise<Object>}
   */
  login: async (credentials) => {
    console.log('[API] Sending login request:', {
      url: `${API_BASE_URL}/users/login/`,
      email: credentials.email,
      passwordLength: credentials.password ? credentials.password.length : 0,
      credentialsKeys: Object.keys(credentials)
    });
    
    const response = await fetch(`${API_BASE_URL}/users/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    return handleResponse(response);
  },

  /**
   * Logout user
   * @param {string} token - Auth token
   * @returns {Promise<Object>}
   */
  logout: async (token) => {
    const response = await fetch(`${API_BASE_URL}/users/logout/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
    });
    return handleResponse(response);
  },

  /**
   * Get current user profile
   * @param {string} token - Auth token
   * @returns {Promise<Object>}
   */
  getCurrentUser: async (token) => {
    const response = await fetch(`${API_BASE_URL}/users/me/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
    });
    return handleResponse(response);
  },
};

// =====================
// Booking Endpoints
// =====================

export const bookingAPI = {
  /**
   * Create a new booking
   * @param {Object} bookingData - Booking details
   * @param {string} token - Auth token
   * @returns {Promise<Object>}
   */
  createBooking: async (bookingData, token) => {
    const response = await fetch(`${API_BASE_URL}/bookings/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      body: JSON.stringify(bookingData),
    });
    return handleResponse(response);
  },

  /**
   * Get all bookings for current user
   * @param {string} token - Auth token
   * @returns {Promise<Object>}
   */
  getUserBookings: async (token) => {
    const response = await fetch(`${API_BASE_URL}/bookings/my_bookings/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
    });
    return handleResponse(response);
  },

  /**
   * Get a specific booking
   * @param {number} bookingId - Booking ID
   * @param {string} token - Auth token
   * @returns {Promise<Object>}
   */
  getBooking: async (bookingId, token) => {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
    });
    return handleResponse(response);
  },

  /**
   * Update a booking
   * @param {number} bookingId - Booking ID
   * @param {Object} bookingData - Updated booking details
   * @param {string} token - Auth token
   * @returns {Promise<Object>}
   */
  updateBooking: async (bookingId, bookingData, token) => {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      body: JSON.stringify(bookingData),
    });
    return handleResponse(response);
  },

  /**
   * Cancel a booking
   * @param {number} bookingId - Booking ID
   * @param {string} token - Auth token
   * @returns {Promise<Object>}
   */
  cancelBooking: async (bookingId, token) => {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      body: JSON.stringify({ status: 'cancelled' }),
    });
    return handleResponse(response);
  },

  /**
   * Update booking payment status
   * @param {number} bookingId - Booking ID
   * @param {Object} paymentData - Payment details { payment_status, payment_method, total_amount }
   * @param {string} token - Auth token
   * @returns {Promise<Object>}
   */
  updateBookingPayment: async (bookingId, paymentData, token) => {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      body: JSON.stringify(paymentData),
    });
    return handleResponse(response);
  },

  /**
   * Get all bookings (admin/manager only)
   * @param {string} token - Auth token
   * @returns {Promise<Object>}
   */
  getAllBookings: async (token) => {
    const response = await fetch(`${API_BASE_URL}/bookings/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
    });
    return handleResponse(response);
  },

  /**
   * Update booking status
   * @param {number} bookingId - Booking ID
   * @param {string} status - New status
   * @param {string} token - Auth token
   * @returns {Promise<Object>}
   */
  updateBookingStatus: async (bookingId, status, token) => {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/update_status/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    return handleResponse(response);
  },

  /**
   * Create Razorpay payment order
   * @param {number} bookingId - Booking ID
   * @param {string} token - Auth token
   * @returns {Promise<Object>}
   */
  createPaymentOrder: async (bookingId, token) => {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/create_payment_order/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
    });
    return handleResponse(response);
  },

  /**
   * Verify Razorpay payment
   * @param {number} bookingId - Booking ID
   * @param {Object} paymentData - Payment verification data
   * @param {string} token - Auth token
   * @returns {Promise<Object>}
   */
  verifyPayment: async (bookingId, paymentData, token) => {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/verify_payment/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      body: JSON.stringify(paymentData),
    });
    return handleResponse(response);
  },

  /**
   * Assign a driver to a booking
   * @param {number} bookingId - Booking ID
   * @param {number} driverId - Driver ID to assign
   * @param {string} token - Auth token
   * @returns {Promise<Object>}
   */
  assignDriver: async (bookingId, driverId, token) => {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/assign_driver/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      body: JSON.stringify({ driver_id: driverId }),
    });
    return handleResponse(response);
  },

  /**
   * Get available drivers for assignment
   * @param {string} token - Auth token
   * @param {string} pickupDate - Pickup date in YYYY-MM-DD format (required)
   * @param {number} numberOfDays - Number of days for booking (default: 1)
   * @returns {Promise<Object>}
   */
  getAvailableDrivers: async (token, pickupDate = null, numberOfDays = 1) => {
    // Use today's date if not provided
    const dateToUse = pickupDate || new Date().toISOString().split('T')[0];
    const queryParams = new URLSearchParams({
      pickup_date: dateToUse,
      number_of_days: numberOfDays
    });
    
    const response = await fetch(`${API_BASE_URL}/bookings/available_drivers/?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
    });
    return handleResponse(response);
  },
};

// =====================
// Car Sales Endpoints
// =====================

export const carsAPI = {
  /**
   * Get all available cars
   * @param {Object} params - Query params (search, ordering)
   * @returns {Promise<Object>}
   */
  getAll: async (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.search) searchParams.append('search', params.search);
    if (params.ordering) searchParams.append('ordering', params.ordering);

    const queryString = searchParams.toString();
    const url = `${API_BASE_URL}/cars/${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response);
  },

  /**
   * Create a new car listing
   * @param {Object} carData - Car details
   * @param {string} token - Auth token
   * @returns {Promise<Object>}
   */
  create: async (carData, token) => {
    const isFormData = carData instanceof FormData;

    const headers = {
      'Authorization': `Token ${token}`,
    };

    // Only set Content-Type to application/json if sending JSON
    // If FormData, let the browser set Content-Type with boundary
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_BASE_URL}/cars/`, {
      method: 'POST',
      headers: headers,
      body: isFormData ? carData : JSON.stringify(carData),
    });
    return handleResponse(response);
  },

  /**
   * Get user's own listings
   * @param {string} token - Auth token
   * @returns {Promise<Object>}
   */
  getMyListings: async (token) => {
    const response = await fetch(`${API_BASE_URL}/cars/my_listings/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
    });
    return handleResponse(response);
  },

  /**
   * Get car details
   * @param {number} id - Car ID
   * @returns {Promise<Object>}
   */
  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/cars/${id}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response);
  },
};

// =====================
// Helper Functions
// =====================

/**
 * Handle API response
 * @param {Response} response - Fetch response object
 * @returns {Promise<Object>}
 */
async function handleResponse(response) {
  let data;
  try {
    data = await response.json();
  } catch (e) {
    data = {};
  }

  // Log all responses for debugging
  console.log('[API Response]', {
    url: response.url,
    status: response.status,
    ok: response.ok,
    statusText: response.statusText,
    response: data
  });

  if (!response.ok) {
    const error = {
      status: response.status,
      statusText: response.statusText,
      ...data,
    };
    // Ensure there is a `message` property for consistent error display
    error.message = error.message || error.detail || error.error || error.statusText || "Request failed";
    
    // Log the error for debugging
    console.error('[API Error]', {
      endpoint: response.url,
      status: response.status,
      error: error
    });
    
    throw error;
  }

  return data;
}

/**
 * Save authentication token to localStorage
 * @param {string} token - Auth token
 */
export const saveToken = (token) => {
  localStorage.setItem('authToken', token);
};

/**
 * Get authentication token from localStorage
 * @returns {string|null}
 */
export const getToken = () => {
  return localStorage.getItem('authToken');
};

/**
 * Remove authentication token from localStorage
 */
export const removeToken = () => {
  localStorage.removeItem('authToken');
};

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  return !!getToken();
};

/**
 * Save user data to localStorage
 * @param {Object} userData - User object
 */
export const saveUserData = (userData) => {
  localStorage.setItem('userData', JSON.stringify(userData));
};

/**
 * Get user data from localStorage
 * @returns {Object|null}
 */
export const getUserData = () => {
  const userData = localStorage.getItem('userData');
  return userData ? JSON.parse(userData) : null;
};

/**
 * Remove user data from localStorage
 */
export const removeUserData = () => {
  localStorage.removeItem('userData');
};

/**
 * Clear all auth data
 */
export const clearAuthData = () => {
  removeToken();
  removeUserData();
};
