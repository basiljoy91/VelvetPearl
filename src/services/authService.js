export const loginAdmin = (email, password) => {
  if (email === 'admin@velvetpearl.com' && password === 'password123') {
    localStorage.setItem('adminToken', 'mock-jwt-token-12345');
    return true;
  }
  return false;
};

export const logoutAdmin = () => {
  localStorage.removeItem('adminToken');
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('adminToken');
};
