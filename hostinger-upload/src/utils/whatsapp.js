export const DEFAULT_WHATSAPP_PHONE = '917845039353';

export function normalizeWhatsAppPhone(phone = '') {
  return String(phone).replace(/\D/g, '');
}

export function buildWhatsAppLink({ phone, message }) {
  const normalizedPhone = normalizeWhatsAppPhone(phone || DEFAULT_WHATSAPP_PHONE);
  const encodedMessage = encodeURIComponent(message || '');
  return `https://wa.me/${normalizedPhone}?text=${encodedMessage}`;
}
