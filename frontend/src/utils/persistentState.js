/**
 * Persistent State Manager
 * Handles persistent state storage and recovery
 */

const STORAGE_VERSION = '1.0';
const STORAGE_KEY_PREFIX = 'autornexus_';

/**
 * Save dashboard state to localStorage
 * @param {string} dashboardType - 'user' | 'manager' | 'admin'
 * @param {Object} state - Dashboard state to persist
 */
export const saveDashboardState = (dashboardType, state) => {
  try {
    const key = `${STORAGE_KEY_PREFIX}dashboard_${dashboardType}`;
    const stateData = {
      version: STORAGE_VERSION,
      timestamp: Date.now(),
      data: state
    };
    localStorage.setItem(key, JSON.stringify(stateData));
    console.log(`[PersistentState] Saved ${dashboardType} dashboard state`);
  } catch (error) {
    console.error(`[PersistentState] Error saving dashboard state:`, error);
  }
};

/**
 * Retrieve dashboard state from localStorage
 * @param {string} dashboardType - 'user' | 'manager' | 'admin'
 * @returns {Object|null}
 */
export const loadDashboardState = (dashboardType) => {
  try {
    const key = `${STORAGE_KEY_PREFIX}dashboard_${dashboardType}`;
    const stored = localStorage.getItem(key);
    
    if (!stored) {
      return null;
    }
    
    const stateData = JSON.parse(stored);
    
    // Validate version
    if (stateData.version !== STORAGE_VERSION) {
      console.log(`[PersistentState] Dashboard state version mismatch, clearing cache`);
      localStorage.removeItem(key);
      return null;
    }
    
    // State persists indefinitely until logout or manual clearing
    console.log(`[PersistentState] Loaded ${dashboardType} dashboard state`);
    return stateData.data;
  } catch (error) {
    console.error(`[PersistentState] Error loading dashboard state:`, error);
    return null;
  }
};

/**
 * Clear dashboard state from localStorage
 * @param {string} dashboardType - 'user' | 'manager' | 'admin'
 */
export const clearDashboardState = (dashboardType) => {
  try {
    const key = `${STORAGE_KEY_PREFIX}dashboard_${dashboardType}`;
    localStorage.removeItem(key);
    console.log(`[PersistentState] Cleared ${dashboardType} dashboard state`);
  } catch (error) {
    console.error(`[PersistentState] Error clearing dashboard state:`, error);
  }
};

/**
 * Save app navigation state
 * @param {Object} navState - Navigation state with currentPage, selectedRole, etc.
 */
export const saveNavigationState = (navState) => {
  try {
    const key = `${STORAGE_KEY_PREFIX}nav_state`;
    const stateData = {
      version: STORAGE_VERSION,
      timestamp: Date.now(),
      data: navState
    };
    localStorage.setItem(key, JSON.stringify(stateData));
    console.log(`[PersistentState] Saved navigation state`);
  } catch (error) {
    console.error(`[PersistentState] Error saving navigation state:`, error);
  }
};

/**
 * Load navigation state from localStorage
 * @returns {Object|null}
 */
export const loadNavigationState = () => {
  try {
    const key = `${STORAGE_KEY_PREFIX}nav_state`;
    const stored = localStorage.getItem(key);
    
    if (!stored) {
      return null;
    }
    
    const stateData = JSON.parse(stored);
    
    if (stateData.version !== STORAGE_VERSION) {
      localStorage.removeItem(key);
      return null;
    }
    
    // State persists indefinitely until logout
    console.log(`[PersistentState] Loaded navigation state`);
    return stateData.data;
  } catch (error) {
    console.error(`[PersistentState] Error loading navigation state:`, error);
    return null;
  }
};

/**
 * Clear all app state from localStorage
 */
export const clearAllAppState = () => {
  try {
    const keysToRemove = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log(`[PersistentState] Cleared all app state`);
  } catch (error) {
    console.error(`[PersistentState] Error clearing all app state:`, error);
  }
};

/**
 * Check if user session is still valid
 * @returns {boolean}
 */
export const isSessionValid = () => {
  try {
    const authToken = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (!authToken || !userData) {
      return false;
    }
    
    // Basic validation - could be enhanced with token expiration check
    const user = JSON.parse(userData);
    return !!(user.email && user.role);
  } catch (error) {
    console.error(`[PersistentState] Error validating session:`, error);
    return false;
  }
};

/**
 * Get session info for debugging
 * @returns {Object}
 */
export const getSessionInfo = () => {
  try {
    const authToken = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    return {
      hasToken: !!authToken,
      hasUserData: !!userData,
      tokenLength: authToken ? authToken.length : 0,
      user: userData ? JSON.parse(userData) : null,
      timestamp: Date.now()
    };
  } catch (error) {
    console.error(`[PersistentState] Error getting session info:`, error);
    return null;
  }
};
