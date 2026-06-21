const FEEDBACK_SERVICE_OPTIONS = [
  'Cab Booking',
  'Tour Package',
  'Room / Stay',
  'Custom Trip',
  'Other',
];

const FEEDBACK_STATUS_OPTIONS = [
  'Pending',
  'Approved',
  'Declined',
  'Hidden',
];

const normalizeFeedbackStatus = (value) => {
  const normalized = String(value || '').trim().toLowerCase();

  if (normalized === 'approved') return 'Approved';
  if (normalized === 'declined') return 'Declined';
  if (normalized === 'hidden') return 'Hidden';
  return 'Pending';
};

module.exports = {
  FEEDBACK_SERVICE_OPTIONS,
  FEEDBACK_STATUS_OPTIONS,
  normalizeFeedbackStatus,
};
