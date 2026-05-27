const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const API = `${API_BASE_URL}/api`;

// Helper: adds JWT token for admin-protected routes
const authHeaders = () => {
  const token = localStorage.getItem('adminToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

const handleResponse = async (res) => {
  const contentType = res.headers.get('content-type');

  if (contentType && contentType.includes('application/json')) {
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
    return data;
  }

  const text = await res.text();
  throw new Error(text || `Server returned a non-JSON response (${res.status}). Check backend status.`);
};

// ─────────────────────────────────────────────
// BOOKINGS
// ─────────────────────────────────────────────

export const getBookings = async () => {
  const res = await fetch(`${API}/bookings`, { headers: authHeaders() });
  const data = await handleResponse(res);
  return data.data || [];
};

export const addBooking = async (bookingData) => {
  const res = await fetch(`${API}/bookings`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(bookingData),
  });
  const data = await handleResponse(res);
  return data.data;
};

export const updateBookingStatus = async (id, status) => {
  const res = await fetch(`${API}/bookings/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });
  return handleResponse(res);
};

export const deleteBookingRecord = async (id) => {
  const res = await fetch(`${API}/bookings/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return handleResponse(res);
};

export const assignDriverToBooking = async (id, driverAssignment) => {
  const res = await fetch(`${API}/bookings/${id}/assign-driver`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(driverAssignment),
  });
  return handleResponse(res);
};

// ─────────────────────────────────────────────
// DRIVERS
// ─────────────────────────────────────────────

export const getDrivers = async () => {
  const res = await fetch(`${API}/drivers`, { headers: authHeaders() });
  const data = await handleResponse(res);
  return data.data || [];
};

export const addDriver = async (driverData) => {
  const res = await fetch(`${API}/drivers`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(driverData),
  });
  const data = await handleResponse(res);
  return data.data;
};

// ─────────────────────────────────────────────
// FLEET
// ─────────────────────────────────────────────

export const getFleet = async () => {
  const res = await fetch(`${API}/fleet`, { headers: authHeaders() });
  const data = await handleResponse(res);
  return data.data || [];
};

export const addFleet = async (fleetData) => {
  const res = await fetch(`${API}/fleet`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(fleetData),
  });
  const data = await handleResponse(res);
  return data.data;
};

// ─────────────────────────────────────────────
// ANALYTICS
// ─────────────────────────────────────────────

export const getAnalytics = async () => {
  const res = await fetch(`${API}/admin/analytics`, { headers: authHeaders() });
  const data = await handleResponse(res);
  return data.data || {};
};
