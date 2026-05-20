const API_URL = 'http://localhost:5000/api/admin';

// Helper for safe JSON parsing
const safeFetch = async (url, options) => {
  const res = await fetch(url, options);
  const contentType = res.headers.get('content-type');
  
  if (!contentType || !contentType.includes('application/json')) {
    const text = await res.text();
    console.error('Non-JSON response:', text);
    throw new Error('Received non-JSON response from backend. Check API URL or Server status.');
  }
  
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  
  return data;
};

export const loginAdmin = async (email, password) => {
  try {
    const data = await safeFetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (data.success) {
      localStorage.setItem('adminToken', data.token);
      return data;
    }
    throw new Error('Login failed');
  } catch (err) {
    throw err;
  }
};

export const signupAdmin = async (email, password) => {
  try {
    const data = await safeFetch(`${API_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return data;
  } catch (err) {
    throw err;
  }
};

export const forgotPassword = async (email) => {
  try {
    const data = await safeFetch(`${API_URL}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return data;
  } catch (err) {
    throw err;
  }
};

export const resetPassword = async (token, newPassword) => {
  try {
    const data = await safeFetch(`${API_URL}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    });
    return data;
  } catch (err) {
    throw err;
  }
};

export const changePassword = async (oldPassword, newPassword, confirmPassword) => {
  const token = localStorage.getItem('adminToken');
  if (!token) throw new Error('Not authenticated');
  
  try {
    const data = await safeFetch(`${API_URL}/change-password`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({ oldPassword, newPassword, confirmPassword }),
    });
    return data;
  } catch (err) {
    throw err;
  }
};

export const verifyToken = async () => {
  const token = localStorage.getItem('adminToken');
  if (!token) return false;
  try {
    const data = await safeFetch(`${API_URL}/me`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    return !!data.success;
  } catch {
    return false;
  }
};

export const logoutAdmin = () => {
  localStorage.removeItem('adminToken');
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('adminToken');
};
