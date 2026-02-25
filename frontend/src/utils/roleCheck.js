/**
 * Role checking utilities
 */

export const isManager = (user) => {
  return user && (user.role === 'manager' || user.role === 'admin');
};

export const isDriver = (user) => {
  return user && (user.role === 'driver' || user.role === 'admin');
};

export const isCustomer = (user) => {
  return user && (user.role === 'customer' || user.role === 'admin');
};

export const isAdmin = (user) => {
  return user && user.role === 'admin';
};

export const canManageBookings = (user) => {
  return user && (user.role === 'manager' || user.role === 'admin');
};

export const canManageVehicles = (user) => {
  return user && (user.role === 'manager' || user.role === 'admin');
};

export const canAssistDrivers = (user) => {
  return user && (user.role === 'manager' || user.role === 'admin');
};
