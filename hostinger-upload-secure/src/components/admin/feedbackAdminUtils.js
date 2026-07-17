export const feedbackInputClassName = 'w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none transition focus:border-[#EFBF04]/50';
export const feedbackLabelClassName = 'text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500';

export const buildFeedbackDraft = (feedback = {}) => ({
  display_name: feedback.display_name || feedback.customer_name || '',
  display_city: feedback.display_city || feedback.city || '',
  display_service_used: feedback.display_service_used || feedback.service_used || 'Cab Booking',
  display_message: feedback.display_message || feedback.feedback_message || '',
  status: feedback.status || 'Pending',
  featured: Boolean(feedback.featured),
  admin_notes: feedback.admin_notes || '',
});

export const formatFeedbackDateTime = (value) => {
  if (!value) return 'Not shared';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

export const getFeedbackSnippet = (value = '', maxLength = 150) => {
  const normalized = String(value || '').trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength).trim()}...`;
};
