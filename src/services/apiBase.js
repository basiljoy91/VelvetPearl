const configuredApiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

const isLocalHostname = (hostname = '') => (
  hostname === 'localhost'
  || hostname === '127.0.0.1'
  || hostname === '::1'
);

export const getApiBaseUrl = () => {
  if (!configuredApiBaseUrl) {
    return '';
  }

  if (import.meta.env.DEV || typeof window === 'undefined') {
    return configuredApiBaseUrl;
  }

  const currentHostname = window.location.hostname;

  // In production we prefer same-origin requests so Hostinger preview domains
  // and the main domain both talk to the colocated backend without CORS issues.
  if (!isLocalHostname(currentHostname)) {
    return '';
  }

  return configuredApiBaseUrl;
};

