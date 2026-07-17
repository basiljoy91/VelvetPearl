export const FEEDBACK_SERVICE_OPTIONS = [
  'Cab Booking',
  'Tour Package',
  'Room / Stay',
  'Custom Trip',
  'Other',
];

export const FEEDBACK_STATUS_OPTIONS = [
  'Pending',
  'Approved',
  'Declined',
  'Hidden',
];

export const getFeedbackStatusClasses = (status) => {
  switch (status) {
    case 'Approved':
      return 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/20';
    case 'Declined':
      return 'bg-rose-500/15 text-rose-300 border border-rose-400/20';
    case 'Hidden':
      return 'bg-white/10 text-gray-200 border border-white/10';
    case 'Pending':
    default:
      return 'bg-amber-500/15 text-amber-300 border border-amber-400/20';
  }
};

export const formatTripMonthLabel = (value) => {
  if (!value) return 'Not shared';

  const date = new Date(`${value}-01T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  });
};
