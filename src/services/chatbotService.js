const CHATBOT_SESSION_STORAGE_KEY = 'velvet_pearl_chatbot_session_id';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const CHATBOT_API_URL = `${API_BASE_URL}/api/chatbot`;
const CHATBOT_USE_N8N = String(import.meta.env.VITE_CHATBOT_USE_N8N || '').toLowerCase() === 'true';
const CHATBOT_AI_ENABLED = String(import.meta.env.VITE_CHATBOT_AI_ENABLED || '').toLowerCase() === 'true';

const jsonHeaders = {
  'Content-Type': 'application/json',
};

const safeJsonParse = async (response) => {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

export function isN8nChatbotEnabled() {
  return CHATBOT_USE_N8N;
}

export function isChatbotAiEnabled() {
  return CHATBOT_AI_ENABLED && isN8nChatbotEnabled();
}

export function getChatbotSessionId() {
  if (typeof window === 'undefined') {
    return 'server-session';
  }

  const existing = window.localStorage.getItem(CHATBOT_SESSION_STORAGE_KEY);
  if (existing) return existing;

  const nextSessionId = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `chat-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  window.localStorage.setItem(CHATBOT_SESSION_STORAGE_KEY, nextSessionId);
  return nextSessionId;
}

export async function requestChatbotAssistantHint({
  message,
  pathname,
  sessionId,
  selectedService,
  currentFieldKey,
  formData,
  handoffContext,
}) {
  if (!isChatbotAiEnabled()) return null;

  try {
    const response = await fetch(`${CHATBOT_API_URL}/assistant`, {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({
        mode: 'assistant_hint',
        source: 'website',
        session_id: sessionId,
        current_page: pathname,
        message,
        context: {
          selected_service: selectedService || null,
          current_field_key: currentFieldKey || null,
          handoff_reason: handoffContext?.reason || null,
          collected_fields: formData || {},
        },
      }),
    });

    if (!response.ok) {
      return null;
    }

    return safeJsonParse(response);
  } catch {
    return null;
  }
}

export async function trackChatbotEvent(eventName, payload = {}) {
  if (!CHATBOT_USE_N8N) return;

  try {
    await fetch(`${CHATBOT_API_URL}/events`, {
      method: 'POST',
      headers: jsonHeaders,
      keepalive: true,
      body: JSON.stringify({
        event_name: eventName,
        source: 'website',
        occurred_at: new Date().toISOString(),
        ...payload,
      }),
    });
  } catch {
    // Analytics must never block the main chatbot flow.
  }
}
