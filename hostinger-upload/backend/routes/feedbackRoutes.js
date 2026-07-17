const express = require('express');
const {
  listPublicFeedback,
  submitFeedback,
} = require('../controllers/feedbackController');
const { publicFeedbackRateLimit } = require('../middleware/rateLimitMiddleware');
const { validatePublicFeedbackSubmission } = require('../middleware/feedbackValidation');

const router = express.Router();

router.get('/', listPublicFeedback);
router.post('/', publicFeedbackRateLimit, validatePublicFeedbackSubmission, submitFeedback);

module.exports = router;
