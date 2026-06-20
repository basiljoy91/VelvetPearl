const express = require('express');
const { submitFeedback, getFeedbacks, getStats, updateFeedback, getAccepted } = require('../controllers/feedbackController');
const { protectAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Public route for submitting feedback
router.post('/', submitFeedback);

// Public route for accepted feedbacks
router.get('/accepted', getAccepted);

// Admin protected routes
router.get('/', protectAdmin, getFeedbacks);
router.get('/stats', protectAdmin, getStats);
router.patch('/:id', protectAdmin, updateFeedback);

module.exports = router;
