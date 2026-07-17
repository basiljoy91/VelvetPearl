const { VALID_STATUSES, normalizeEnquiryType } = require('../controllers/bookingController');

const recentSubmissionCache = new Map();

const PHONE_REGEX = /^\+?[0-9]{8,15}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONTACT_METHODS = new Set(['whatsapp', 'phone', 'email']);
const CONTROL_CHAR_REGEX = /[\u0000-\u001f\u007f-\u009f]/g;
const HTML_TAG_REGEX = /<[^>]*>/g;

const FIELD_LIMITS = {
  customer_name: 120,
  phone_number: 20,
  whatsapp_number: 20,
  email: 160,
  preferred_contact_method: 20,
  source_page: 50,
  requirement_notes: 2000,
  details: 2000,
  message: 2000,
  summary: 2000,
  pickup: 200,
  dropoff: 200,
  luggage: 120,
  vehicle_preference: 80,
  special_requests: 1000,
  destination: 150,
  package_name: 150,
  trip_duration: 120,
  duration: 120,
  duration_label: 120,
  must_visit_places: 500,
  notes: 1200,
  custom_category: 100,
  location: 200,
  pickup_city: 200,
  pickup_location: 200,
  services_needed: 300,
  room_type: 100,
  budget: 120,
};

const cleanString = (value, maxLength) => {
  if (value === undefined || value === null) return '';
  return String(value)
    .replace(HTML_TAG_REGEX, ' ')
    .replace(CONTROL_CHAR_REGEX, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
};

const sanitizeValue = (key, value) => {
  if (typeof value === 'string') {
    return cleanString(value, FIELD_LIMITS[key] || 500);
  }

  if (Array.isArray(value)) {
    return value
      .slice(0, 20)
      .map((item) => sanitizeValue(key, item))
      .filter(Boolean);
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).slice(0, 60).map(([childKey, childValue]) => [childKey, sanitizeValue(childKey, childValue)])
    );
  }

  return value;
};

const fail = (res, message, status = 400) => res.status(status).json({ success: false, message });

const validatePhone = (value) => PHONE_REGEX.test(String(value || '').replace(/\s+/g, ''));

const validateEmail = (value) => !value || EMAIL_REGEX.test(String(value).trim());

const validateRequiredDetails = (enquiryType, details = {}) => {
  if (enquiryType === 'cab') {
    return Boolean(details.pickup && details.dropoff && details.passengers);
  }

  if (enquiryType === 'room') {
    return Boolean(details.check_in && details.check_out && (details.guests || details.adults) && details.room_count);
  }

  if (enquiryType === 'tour') {
    return Boolean(details.destination && (details.travel_window_start || details.duration || details.trip_duration) && (details.group_size || details.adults));
  }

  if (enquiryType === 'custom') {
    return Boolean(details.location || details.event_type || details.custom_category || details.requirement_notes || details.notes || details.requirement_details);
  }

  return Boolean(details.message || details.summary);
};

const validatePublicEnquirySubmission = (req, res, next) => {
  const body = req.body || {};
  const enquiryType = normalizeEnquiryType(body.enquiry_type || body.service_type || body.service);
  const details = sanitizeValue('service_details_json', body.service_details_json || body.enquiry_details || {});
  const customerName = cleanString(body.customer_name || body.customer || body.full_name, 120);
  const phoneNumber = cleanString(body.phone_number || body.phone, 20);
  const whatsappNumber = cleanString(body.whatsapp_number || phoneNumber, 20);
  const email = cleanString(body.email, 160);
  const preferredContactMethod = cleanString(body.preferred_contact_method || 'whatsapp', 20).toLowerCase();
  const sourcePage = cleanString(body.source_page || enquiryType, 50);
  const requirementNotes = cleanString(body.requirement_notes || body.details, 1200);
  const honeypot = cleanString(body.website || body.company, 120);

  if (honeypot) {
    return fail(res, 'Spam submission rejected.');
  }

  if (!customerName || customerName.length < 2) {
    return fail(res, 'Full name is required.');
  }

  if (!validatePhone(phoneNumber)) {
    return fail(res, 'A valid phone number is required.');
  }

  if (!validatePhone(whatsappNumber)) {
    return fail(res, 'A valid WhatsApp number is required.');
  }

  if (!validateEmail(email)) {
    return fail(res, 'Please provide a valid email address.');
  }

  if (!CONTACT_METHODS.has(preferredContactMethod)) {
    return fail(res, 'Preferred contact method must be WhatsApp, phone, or email.');
  }

  if (!validateRequiredDetails(enquiryType, details) && !requirementNotes) {
    return fail(res, 'Please provide the required enquiry details.');
  }

  const consentToContact = body.consent_to_contact === true || String(body.consent_to_contact).toLowerCase() === 'true';

  if (!consentToContact) {
    return fail(res, 'Consent to contact is required to submit an enquiry.');
  }

  req.body = {
    ...sanitizeValue('body', body),
    enquiry_type: enquiryType,
    customer_name: customerName,
    phone_number: phoneNumber.replace(/\s+/g, ''),
    whatsapp_number: whatsappNumber.replace(/\s+/g, ''),
    email,
    preferred_contact_method: preferredContactMethod,
    source_page: sourcePage,
    requirement_notes: requirementNotes || undefined,
    consent_to_contact: true,
    service_details_json: details,
    enquiry_details: details,
  };

  return next();
};

const checkEnquirySpam = (req, res, next) => {
  const body = req.body || {};
  const key = `${req.ip || 'unknown'}:${body.phone_number || ''}:${body.enquiry_type || ''}`;
  const now = Date.now();
  const cooldownMs = Number(process.env.ENQUIRY_SPAM_COOLDOWN_MS || 30 * 1000);
  const lastSeen = recentSubmissionCache.get(key);

  if (lastSeen && now - lastSeen < cooldownMs) {
    return fail(res, 'Please wait a bit before submitting another enquiry.', 429);
  }

  recentSubmissionCache.set(key, now);
  return next();
};

const validateAdminStatusUpdate = (req, res, next) => {
  if (!VALID_STATUSES.includes(req.body?.status)) {
    return fail(res, 'Invalid enquiry status.');
  }
  return next();
};

const validateAdminNotesUpdate = (req, res, next) => {
  req.body.admin_notes = cleanString(req.body?.admin_notes, 3000);
  return next();
};

const validateAssignmentPayload = (...keys) => {
  return (req, res, next) => {
    const hasValue = keys.some((key) => cleanString(req.body?.[key], 255));
    if (!hasValue) {
      return fail(res, `One of the following fields is required: ${keys.join(', ')}`);
    }

    keys.forEach((key) => {
      if (req.body?.[key] !== undefined) {
        req.body[key] = cleanString(req.body[key], 255);
      }
    });

    return next();
  };
};

const validateQuotePayload = (req, res, next) => {
  req.body.quote_amount = cleanString(req.body?.quote_amount, 100);
  if (!req.body.quote_amount) {
    return fail(res, 'Quote amount is required.');
  }
  return next();
};

module.exports = {
  validatePublicEnquirySubmission,
  checkEnquirySpam,
  validateAdminStatusUpdate,
  validateAdminNotesUpdate,
  validateAssignmentPayload,
  validateQuotePayload,
};
