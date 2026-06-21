const {
  FEEDBACK_SERVICE_OPTIONS,
  FEEDBACK_STATUS_OPTIONS,
  normalizeFeedbackStatus,
} = require('../utils/feedbackConfig');

const CONTACT_NUMBER_REGEX = /^[+0-9\s()-]{8,20}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TRIP_MONTH_REGEX = /^\d{4}-\d{2}$/;
const CONTROL_CHAR_REGEX = /[\u0000-\u001f\u007f-\u009f]/g;
const HTML_TAG_REGEX = /<[^>]*>/g;

const FIELD_LIMITS = {
  customer_name: 120,
  city: 120,
  service_used: 80,
  feedback_message: 2200,
  contact_number: 20,
  email: 160,
  trip_month: 7,
  display_name: 120,
  display_city: 120,
  display_service_used: 80,
  display_message: 2200,
  admin_notes: 2200,
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

const parseBoolean = (value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
  }
  return false;
};

const fail = (res, message, status = 400) => res.status(status).json({ success: false, message });

const validatePublicFeedbackSubmission = (req, res, next) => {
  const body = req.body || {};
  const customerName = cleanString(body.customer_name || body.full_name, FIELD_LIMITS.customer_name);
  const city = cleanString(body.city, FIELD_LIMITS.city);
  const serviceUsed = cleanString(body.service_used || body.service, FIELD_LIMITS.service_used);
  const feedbackMessage = cleanString(body.feedback_message || body.message, FIELD_LIMITS.feedback_message);
  const contactNumber = cleanString(body.contact_number || body.phone_number || body.phone, FIELD_LIMITS.contact_number);
  const email = cleanString(body.email, FIELD_LIMITS.email);
  const tripMonth = cleanString(body.trip_month || body.travel_month, FIELD_LIMITS.trip_month);
  const honeypot = cleanString(body.website || body.company, 120);
  const rating = Number(body.rating);
  const publishConsent = parseBoolean(body.publish_consent);

  if (honeypot) {
    return fail(res, 'Spam submission rejected.');
  }

  if (!customerName || customerName.length < 2) {
    return fail(res, 'Full name is required.');
  }

  if (!city || city.length < 2) {
    return fail(res, 'City is required.');
  }

  if (!FEEDBACK_SERVICE_OPTIONS.includes(serviceUsed)) {
    return fail(res, 'Please choose a valid service.');
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return fail(res, 'Please choose a rating between 1 and 5.');
  }

  if (!feedbackMessage || feedbackMessage.length < 10) {
    return fail(res, 'Please share a little more detail in your feedback.');
  }

  if (contactNumber && !CONTACT_NUMBER_REGEX.test(contactNumber)) {
    return fail(res, 'Please provide a valid phone or WhatsApp number.');
  }

  if (email && !EMAIL_REGEX.test(email)) {
    return fail(res, 'Please provide a valid email address.');
  }

  if (tripMonth && !TRIP_MONTH_REGEX.test(tripMonth)) {
    return fail(res, 'Please provide a valid trip month.');
  }

  if (!publishConsent) {
    return fail(res, 'Publish consent is required before submitting feedback.');
  }

  req.body = {
    customer_name: customerName,
    city,
    service_used: serviceUsed,
    rating,
    feedback_message: feedbackMessage,
    contact_number: contactNumber || '',
    email,
    trip_month: tripMonth,
    publish_consent: true,
    source_page: cleanString(body.source_page || 'feedback', 50),
  };

  return next();
};

const validateAdminFeedbackUpdate = (req, res, next) => {
  const body = req.body || {};
  const normalized = {};
  let hasAllowedField = false;

  if (body.status !== undefined) {
    const status = normalizeFeedbackStatus(body.status);
    if (!FEEDBACK_STATUS_OPTIONS.includes(status)) {
      return fail(res, 'Invalid feedback status.');
    }
    normalized.status = status;
    hasAllowedField = true;
  }

  if (body.featured !== undefined) {
    normalized.featured = parseBoolean(body.featured);
    hasAllowedField = true;
  }

  if (body.display_name !== undefined) {
    normalized.display_name = cleanString(body.display_name, FIELD_LIMITS.display_name);
    if (!normalized.display_name || normalized.display_name.length < 2) {
      return fail(res, 'Display name is required.');
    }
    hasAllowedField = true;
  }

  if (body.display_city !== undefined) {
    normalized.display_city = cleanString(body.display_city, FIELD_LIMITS.display_city);
    if (!normalized.display_city || normalized.display_city.length < 2) {
      return fail(res, 'Display city is required.');
    }
    hasAllowedField = true;
  }

  if (body.display_service_used !== undefined) {
    normalized.display_service_used = cleanString(body.display_service_used, FIELD_LIMITS.display_service_used);
    if (!FEEDBACK_SERVICE_OPTIONS.includes(normalized.display_service_used)) {
      return fail(res, 'Please choose a valid display service.');
    }
    hasAllowedField = true;
  }

  if (body.display_message !== undefined) {
    normalized.display_message = cleanString(body.display_message, FIELD_LIMITS.display_message);
    if (!normalized.display_message || normalized.display_message.length < 10) {
      return fail(res, 'Display feedback must be at least 10 characters.');
    }
    hasAllowedField = true;
  }

  if (body.admin_notes !== undefined) {
    normalized.admin_notes = cleanString(body.admin_notes, FIELD_LIMITS.admin_notes);
    hasAllowedField = true;
  }

  if (!hasAllowedField) {
    return fail(res, 'No valid feedback fields were provided.');
  }

  req.body = normalized;
  return next();
};

module.exports = {
  validatePublicFeedbackSubmission,
  validateAdminFeedbackUpdate,
};
