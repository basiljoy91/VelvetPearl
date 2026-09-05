import { getApiBaseUrl } from './apiBase';

const API_BASE_URL = getApiBaseUrl();
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

const downloadFileResponse = async (res, fallbackName) => {
  if (!res.ok) {
    await handleResponse(res);
  }

  const blob = await res.blob();
  const disposition = res.headers.get('content-disposition') || '';
  const fileNameMatch = disposition.match(/filename="?([^"]+)"?/i);
  const fileName = fileNameMatch?.[1] || fallbackName;
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
};

const buildQueryString = (params = {}) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    query.set(key, value);
  });

  const serialized = query.toString();
  return serialized ? `?${serialized}` : '';
};

// ─────────────────────────────────────────────
// ENQUIRIES
// ─────────────────────────────────────────────

export const getEnquiries = async (filters = {}) => {
  const res = await fetch(`${API}/admin/enquiries${buildQueryString(filters)}`, { headers: authHeaders() });
  const data = await handleResponse(res);
  return data.data || [];
};

export const getEnquiryById = async (id) => {
  const res = await fetch(`${API}/admin/enquiries/${id}`, { headers: authHeaders() });
  const data = await handleResponse(res);
  return data.data;
};

export const addEnquiry = async (enquiryData) => {
  const res = await fetch(`${API}/enquiries`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(enquiryData),
  });
  const data = await handleResponse(res);
  return data.data;
};

export const updateEnquiryStatus = async (id, status) => {
  const res = await fetch(`${API}/admin/enquiries/${id}/status`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });
  return handleResponse(res);
};

export const updateEnquiryNotes = async (id, adminNotes) => {
  const res = await fetch(`${API}/admin/enquiries/${id}/notes`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ admin_notes: adminNotes }),
  });
  return handleResponse(res);
};

export const assignVehicleToEnquiry = async (id, vehicleAssignment) => {
  const res = await fetch(`${API}/admin/enquiries/${id}/assign-vehicle`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(vehicleAssignment),
  });
  return handleResponse(res);
};

export const assignRoomToEnquiry = async (id, roomAssignment) => {
  const res = await fetch(`${API}/admin/enquiries/${id}/assign-room`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(roomAssignment),
  });
  return handleResponse(res);
};

export const assignPackageToEnquiry = async (id, packageAssignment) => {
  const res = await fetch(`${API}/admin/enquiries/${id}/assign-package`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(packageAssignment),
  });
  return handleResponse(res);
};

export const updateEnquiryQuote = async (id, quoteAmount) => {
  const res = await fetch(`${API}/admin/enquiries/${id}/quote`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ quote_amount: quoteAmount }),
  });
  return handleResponse(res);
};

export const updateEnquiry = async (id, enquiryData) => {
  const res = await fetch(`${API}/admin/enquiries/${id}/enquiry`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(enquiryData),
  });
  return handleResponse(res);
};

export const deleteEnquiryRecord = async (id) => {
  const res = await fetch(`${API}/admin/enquiries/${id}/archive`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({}),
  });
  return handleResponse(res);
};

export const archiveEnquiryRecord = async (id, archivedReason = '') => {
  const res = await fetch(`${API}/admin/enquiries/${id}/archive`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ archived_reason: archivedReason }),
  });
  return handleResponse(res);
};

export const assignDriverToEnquiry = async (id, driverAssignment) => {
  const res = await fetch(`${API}/admin/enquiries/${id}/assign-driver`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(driverAssignment),
  });
  return handleResponse(res);
};

// Backward-compatible aliases while the rest of the UI catches up.
export const getBookings = getEnquiries;
export const addBooking = addEnquiry;
export const updateBookingStatus = updateEnquiryStatus;
export const updateBookingEnquiry = updateEnquiry;
export const deleteBookingRecord = deleteEnquiryRecord;
export const assignDriverToBooking = assignDriverToEnquiry;

// ─────────────────────────────────────────────
// LOCATIONS AND ROUTES
// ─────────────────────────────────────────────

export const searchLocations = async (query) => {
  const res = await fetch(`${API}/locations/search${buildQueryString({ q: query })}`, { headers: authHeaders() });
  const data = await handleResponse(res);
  return data.data || [];
};

export const estimateRoute = async ({ pickup, drop }) => {
  const res = await fetch(`${API}/routes/estimate`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ pickup, drop }),
  });
  const data = await handleResponse(res);
  return data.data;
};

export const getPopularRoutes = async () => {
  const res = await fetch(`${API}/routes/popular`, { headers: authHeaders() });
  const data = await handleResponse(res);
  return data.data || [];
};

export const getAdminPopularRoutes = async (includeInactive = true) => {
  const res = await fetch(`${API}/admin/routes/popular${buildQueryString({ include_inactive: includeInactive ? 'true' : '' })}`, { headers: authHeaders() });
  const data = await handleResponse(res);
  return data.data || [];
};

export const addPopularRoute = async (routeData) => {
  const res = await fetch(`${API}/admin/routes/popular`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(routeData),
  });
  const data = await handleResponse(res);
  return data.data;
};

export const updatePopularRoute = async (id, routeData) => {
  const res = await fetch(`${API}/admin/routes/popular/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(routeData),
  });
  const data = await handleResponse(res);
  return data.data;
};

export const deletePopularRoute = async (id) => {
  const res = await fetch(`${API}/admin/routes/popular/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
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

// ─────────────────────────────────────────────
// INVOICES
// ─────────────────────────────────────────────

export const getInvoices = async (filters = {}) => {
  const res = await fetch(`${API}/admin/invoices${buildQueryString(filters)}`, { headers: authHeaders() });
  const data = await handleResponse(res);
  return data.data || [];
};

export const getInvoiceById = async (id) => {
  const res = await fetch(`${API}/admin/invoices/${id}`, { headers: authHeaders() });
  const data = await handleResponse(res);
  return data.data;
};

export const saveInvoice = async (invoiceData) => {
  const isUpdate = Boolean(invoiceData.id);
  const res = await fetch(`${API}/admin/invoices${isUpdate ? `/${invoiceData.id}` : ''}`, {
    method: isUpdate ? 'PATCH' : 'POST',
    headers: authHeaders(),
    body: JSON.stringify(invoiceData),
  });
  const data = await handleResponse(res);
  return data.data;
};

export const duplicateInvoice = async (id) => {
  const res = await fetch(`${API}/admin/invoices/${id}/duplicate`, {
    method: 'POST',
    headers: authHeaders(),
  });
  const data = await handleResponse(res);
  return data.data;
};

export const sendInvoiceEmail = async (id, payload = {}) => {
  const res = await fetch(`${API}/admin/invoices/${id}/send-email`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await handleResponse(res);
  return data.data;
};

export const shareInvoiceWhatsApp = async (id, payload = {}) => {
  const res = await fetch(`${API}/admin/invoices/${id}/share-whatsapp`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await handleResponse(res);
  return data.data;
};

export const getInvoicePdfUrl = (id) => `${API}/admin/invoices/${id}/pdf`;

export const downloadInvoicePdf = async (id) => {
  const res = await fetch(getInvoicePdfUrl(id), { headers: authHeaders() });
  return downloadFileResponse(res, `invoice-${id}.pdf`);
};

// ─────────────────────────────────────────────
// QUOTATIONS
// ─────────────────────────────────────────────

export const getQuotations = async (filters = {}) => {
  const res = await fetch(`${API}/admin/quotations${buildQueryString(filters)}`, { headers: authHeaders() });
  const data = await handleResponse(res);
  return data.data || [];
};

export const getQuotationById = async (id) => {
  const res = await fetch(`${API}/admin/quotations/${id}`, { headers: authHeaders() });
  const data = await handleResponse(res);
  return data.data;
};

export const saveQuotation = async (quotationData) => {
  const isUpdate = Boolean(quotationData.id);
  const res = await fetch(`${API}/admin/quotations${isUpdate ? `/${quotationData.id}` : ''}`, {
    method: isUpdate ? 'PATCH' : 'POST',
    headers: authHeaders(),
    body: JSON.stringify(quotationData),
  });
  const data = await handleResponse(res);
  return data.data;
};

export const duplicateQuotation = async (id) => {
  const res = await fetch(`${API}/admin/quotations/${id}/duplicate`, {
    method: 'POST',
    headers: authHeaders(),
  });
  const data = await handleResponse(res);
  return data.data;
};

export const sendQuotationEmail = async (id, payload = {}) => {
  const res = await fetch(`${API}/admin/quotations/${id}/send-email`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await handleResponse(res);
  return data.data;
};

export const shareQuotationWhatsApp = async (id, payload = {}) => {
  const res = await fetch(`${API}/admin/quotations/${id}/share-whatsapp`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await handleResponse(res);
  return data.data;
};

export const convertQuotationToInvoice = async (id) => {
  const res = await fetch(`${API}/admin/quotations/${id}/convert-to-invoice`, {
    method: 'POST',
    headers: authHeaders(),
  });
  const data = await handleResponse(res);
  return data.data;
};

export const getQuotationPdfUrl = (id) => `${API}/admin/quotations/${id}/pdf`;

export const downloadQuotationPdf = async (id) => {
  const res = await fetch(getQuotationPdfUrl(id), { headers: authHeaders() });
  return downloadFileResponse(res, `quotation-${id}.pdf`);
};
