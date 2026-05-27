const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const API_URL = `${API_BASE_URL}/api/admin`;

const getAuthToken = () => {
  const token = localStorage.getItem('adminToken');
  if (!token) throw new Error('Not authenticated');
  return token;
};

// Helper for safe JSON parsing
const safeFetch = async (url, options) => {
  const res = await fetch(url, options);
  const contentType = res.headers.get('content-type');

  if (contentType && contentType.includes('application/json')) {
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }

    return data;
  }

  const text = await res.text();
  console.error(`Non-JSON response (${res.status}):`, text);
  throw new Error(
    text || `Backend returned a non-JSON response with status ${res.status}. Check the backend server and proxy port.`
  );
};

export const loginAdmin = async (email, password) => {
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
};

export const signupAdmin = async (email, password, setupSecret) => {
  return await safeFetch(`${API_URL}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, setupSecret }),
  });
};


export const changePassword = async (oldPassword, newPassword, confirmPassword) => {
  const token = getAuthToken();

  return await safeFetch(`${API_URL}/change-password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ oldPassword, newPassword, confirmPassword }),
  });
};

export const getAdminProfile = async () => {
  const token = getAuthToken();
  const data = await safeFetch(`${API_URL}/me`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });

  return {
    adminId: data.adminId,
    isMainAdmin: !!data.isMainAdmin,
  };
};

export const generateAdminSetupKey = async () => {
  const token = getAuthToken();
  return await safeFetch(`${API_URL}/generate-setup-key`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
};

export const verifyToken = async () => {
  const token = localStorage.getItem('adminToken');
  if (!token) return { valid: false };
  try {
    const data = await safeFetch(`${API_URL}/me`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    return { valid: !!data.success, isMainAdmin: data.isMainAdmin };
  } catch {
    return { valid: false };
  }
};

export const generateSetupKey = async () => {
  const token = localStorage.getItem('adminToken');
  if (!token) throw new Error('Not authenticated');

  return await safeFetch(`${API_URL}/generate-setup-key`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const initializeAdmin = async (email, password, setupKey) => {
  return await safeFetch(`${API_URL}/initialize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, setupKey }),
  });
};

export const logoutAdmin = () => {
  localStorage.removeItem('adminToken');
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('adminToken');
};
