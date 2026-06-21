const express = require('express');
const {
  proxyAssistantRequest,
  proxyChatbotEvent,
} = require('../controllers/chatbotController');
const { createRateLimiter } = require('../middleware/rateLimitMiddleware');

const router = express.Router();

const chatbotRateLimit = createRateLimiter({
  windowMs: Number(process.env.CHATBOT_RATE_LIMIT_WINDOW_MS || 5 * 60 * 1000),
  maxRequests: Number(process.env.CHATBOT_RATE_LIMIT_MAX || 40),
  keyPrefix: 'chatbot',
  message: 'Too many chatbot requests. Please wait a moment before trying again.',
});

router.post('/assistant', chatbotRateLimit, proxyAssistantRequest);
router.post('/events', chatbotRateLimit, proxyChatbotEvent);

module.exports = router;
