const resolveEnv = (...names) => {
  for (const name of names) {
    const value = String(process.env[name] || '').trim();
    if (value) return value;
  }

  return '';
};

const assistantWebhookUrl = resolveEnv('N8N_CHATBOT_WEBHOOK_URL', 'VITE_N8N_CHATBOT_WEBHOOK_URL');
const eventsWebhookUrl = resolveEnv('N8N_CHATBOT_EVENTS_WEBHOOK_URL', 'VITE_N8N_CHATBOT_EVENTS_WEBHOOK_URL');
const chatbotProxyEnabled = String(
  process.env.CHATBOT_PROXY_ENABLED || process.env.VITE_CHATBOT_USE_N8N || ''
).toLowerCase() === 'true';

const readUpstreamPayload = async (response) => {
  const contentType = String(response.headers.get('content-type') || '').toLowerCase();
  const text = await response.text();

  if (!text) {
    return {
      contentType: 'application/json',
      body: {},
    };
  }

  if (contentType.includes('application/json')) {
    try {
      return {
        contentType: 'application/json',
        body: JSON.parse(text),
      };
    } catch {
      return {
        contentType: 'application/json',
        body: { reply_text: text },
      };
    }
  }

  return {
    contentType: 'application/json',
    body: { reply_text: text },
  };
};

const ensureProxyReady = (url) => {
  if (!chatbotProxyEnabled) {
    const error = new Error('Chatbot proxy is disabled.');
    error.status = 503;
    throw error;
  }

  if (!url) {
    const error = new Error('Chatbot webhook URL is not configured.');
    error.status = 503;
    throw error;
  }
};

const postJson = async (url, payload) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload || {}),
  });

  const upstream = await readUpstreamPayload(response);

  return {
    ok: response.ok,
    status: response.status,
    ...upstream,
  };
};

const proxyAssistantRequest = async (req, res) => {
  try {
    ensureProxyReady(assistantWebhookUrl);

    const upstream = await postJson(assistantWebhookUrl, req.body);

    if (!upstream.ok) {
      console.error('n8n assistant webhook returned an error response.', {
        status: upstream.status,
        body: upstream.body,
      });
    }

    return res.status(upstream.status).json(upstream.body);
  } catch (error) {
    console.error('Failed to proxy chatbot assistant request.', error);
    return res.status(error.status || 502).json({
      success: false,
      message: error.status ? error.message : 'Failed to reach the chatbot automation service.',
    });
  }
};

const proxyChatbotEvent = async (req, res) => {
  try {
    ensureProxyReady(eventsWebhookUrl);

    const upstream = await postJson(eventsWebhookUrl, req.body);

    if (!upstream.ok) {
      console.error('n8n chatbot event webhook returned an error response.', {
        status: upstream.status,
        body: upstream.body,
      });
    }

    return res.status(upstream.status).json(upstream.body);
  } catch (error) {
    console.error('Failed to proxy chatbot event.', error);
    return res.status(error.status || 502).json({
      success: false,
      message: error.status ? error.message : 'Failed to reach the chatbot analytics automation service.',
    });
  }
};

module.exports = {
  proxyAssistantRequest,
  proxyChatbotEvent,
};
