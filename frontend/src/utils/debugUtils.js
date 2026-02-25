/**
 * Debug Utilities for State Persistence
 * Use these functions in browser console for debugging
 */

import { getSessionInfo, loadDashboardState } from './persistentState';
import { getToken, getUserData } from './api';

/**
 * Display all auth and session data
 */
export const debugSession = () => {
  console.group('=== DEBUG SESSION INFO ===');
  
  const sessionInfo = getSessionInfo();
  console.log('Session Info:', sessionInfo);
  
  const token = getToken();
  console.log('Auth Token:', token ? `${token.substring(0, 20)}...` : 'NOT SET');
  
  const userData = getUserData();
  console.log('User Data:', userData);
  
  // Check all localStorage keys related to app
  console.group('All App Storage Keys:');
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.includes('autornexus_') || key === 'authToken' || key === 'userData') {
      const value = localStorage.getItem(key);
      const size = (new Blob([value]).size / 1024).toFixed(2);
      console.log(`${key}: ${size}KB`);
    }
  }
  console.groupEnd();
  
  console.groupEnd();
};

/**
 * Display specific dashboard state
 * @param {string} dashboardType - 'user' | 'manager' | 'admin'
 */
export const debugDashboard = (dashboardType = 'user') => {
  console.group(`=== DEBUG ${dashboardType.toUpperCase()} DASHBOARD ===`);
  
  const state = loadDashboardState(dashboardType);
  if (state) {
    console.log('Cached State:', state);
    
    if (state.lastFetch) {
      const age = (Date.now() - state.lastFetch) / 1000;
      console.log(`Cache age: ${age.toFixed(1)} seconds`);
    }
  } else {
    console.log('No cached state found');
  }
  
  console.groupEnd();
};

/**
 * Show storage usage statistics
 */
export const debugStorage = () => {
  console.group('=== STORAGE STATISTICS ===');
  
  let totalSize = 0;
  const storageBreakdown = {};
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const value = localStorage.getItem(key);
    const size = new Blob([value]).size;
    const sizeKB = (size / 1024).toFixed(2);
    
    totalSize += size;
    
    if (key.includes('autornexus_')) {
      storageBreakdown['App Data'] = (storageBreakdown['App Data'] || 0) + size;
    } else {
      storageBreakdown[key] = size;
    }
  }
  
  console.log('Storage Breakdown:');
  Object.entries(storageBreakdown).forEach(([type, bytes]) => {
    console.log(`  ${type}: ${(bytes / 1024).toFixed(2)}KB`);
  });
  
  console.log(`Total Used: ${(totalSize / 1024).toFixed(2)}KB`);
  console.log(`Available: ~${(5 * 1024).toFixed(2)}KB (typical limit)`);
  console.log(`Usage: ${((totalSize / (5 * 1024 * 1024)) * 100).toFixed(2)}%`);
  
  console.groupEnd();
};

/**
 * Clear all app state and logout
 * @warning This simulates a logout without API call
 */
export const debugClearState = () => {
  if (!confirm('Clear all app state? This will log you out.')) {
    return;
  }
  
  const keysToRemove = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.includes('autornexus_') || key === 'authToken' || key === 'userData') {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`Removed: ${key}`);
  });
  
  console.log('✓ All app state cleared');
  console.log('⟳ Refresh page to see home screen');
};

/**
 * Export all stored data as JSON for backup
 */
export const debugExportState = () => {
  const exportData = {};
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.includes('autornexus_') || key === 'authToken' || key === 'userData') {
      exportData[key] = localStorage.getItem(key);
    }
  }
  
  const json = JSON.stringify(exportData, null, 2);
  console.log('=== EXPORTED STATE ===');
  console.log(json);
  
  // Copy to clipboard
  navigator.clipboard.writeText(json).then(() => {
    console.log('✓ Copied to clipboard');
  });
  
  return exportData;
};

/**
 * Import state JSON
 * @param {string} json - JSON string to import
 */
export const debugImportState = (json) => {
  try {
    const data = JSON.parse(json);
    
    Object.entries(data).forEach(([key, value]) => {
      localStorage.setItem(key, value);
      console.log(`Restored: ${key}`);
    });
    
    console.log('✓ State imported successfully');
    console.log('⟳ Refresh page to apply');
  } catch (error) {
    console.error('Invalid JSON:', error);
  }
};

/**
 * Run comprehensive diagnostics
 */
export const debugDiagnostics = () => {
  console.group('=== COMPREHENSIVE DIAGNOSTICS ===');
  
  // Check browser capabilities
  console.group('Browser Capabilities:');
  console.log('localStorage available:', !!window.localStorage);
  console.log('localStorage.length:', localStorage.length);
  console.log('sessionStorage available:', !!window.sessionStorage);
  console.log('IndexedDB available:', !!window.indexedDB);
  console.groupEnd();
  
  // Session info
  console.group('Session Status:');
  debugSession();
  console.groupEnd();
  
  // Dashboard states
  console.group('Dashboard States:');
  ['user', 'manager', 'admin'].forEach(type => {
    const state = loadDashboardState(type);
    console.log(`${type}:`, state ? 'CACHED' : 'NOT CACHED');
  });
  console.groupEnd();
  
  // Storage stats
  console.group('Storage Usage:');
  debugStorage();
  console.groupEnd();
  
  console.groupEnd();
  console.log('✓ Diagnostics complete');
};

/**
 * Help text
 */
export const debugHelp = () => {
  console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║                    DEBUG UTILITIES - AVAILABLE FUNCTIONS                   ║
╚═══════════════════════════════════════════════════════════════════════════╝

SESSION & AUTH:
  debugSession()                 - Show auth token, user data, session info
  
DASHBOARD STATE:
  debugDashboard('user')         - Show user dashboard cache
  debugDashboard('manager')      - Show manager dashboard cache
  debugDashboard('admin')        - Show admin dashboard cache
  
STORAGE:
  debugStorage()                 - Show localStorage usage statistics
  
STATE MANAGEMENT:
  debugExportState()             - Export all app state as JSON
  debugImportState(json)         - Import state from JSON
  debugClearState()              - Clear all app state & logout (⚠️ dangerous)
  
DIAGNOSTICS:
  debugDiagnostics()             - Run complete system diagnostics
  
HELP:
  debugHelp()                    - Show this help text

EXAMPLES:
  > debugSession()
  > debugDashboard('user')
  > debugStorage()
  > debugDiagnostics()
  > const state = debugExportState();
  > debugImportState(JSON.stringify(state));
  `);
};

// Auto-show help on module load (comment out if needed)
if (typeof window !== 'undefined') {
  window.debugHelp = debugHelp;
  window.debugSession = debugSession;
  window.debugDashboard = debugDashboard;
  window.debugStorage = debugStorage;
  window.debugClearState = debugClearState;
  window.debugExportState = debugExportState;
  window.debugImportState = debugImportState;
  window.debugDiagnostics = debugDiagnostics;
  
  console.log('🔧 Debug utilities loaded. Type "debugHelp()" for more info.');
}
