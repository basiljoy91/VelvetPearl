const express = require('express');
const {
  listApprovedFeedback,
  listAdminFeedback,
  reviewFeedback,
  submitFeedback,
  deleteFeedback,
} = require('../controllers/feedbackController');
const { protectAdmin } = require('../middleware/authMiddleware');
const { publicEnquiryRateLimit } = require('../middleware/rateLimitMiddleware');

const router = express.Router();

router.get('/approved', listApprovedFeedback);
router.post('/', publicEnquiryRateLimit, submitFeedback);
router.get('/admin', protectAdmin, listAdminFeedback);
router.patch('/admin/:id/review', protectAdmin, reviewFeedback);
router.delete('/admin/:id', protectAdmin, deleteFeedback);

module.exports = router;
