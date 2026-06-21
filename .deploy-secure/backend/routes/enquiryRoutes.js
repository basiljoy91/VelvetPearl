const express = require('express');
const { submitEnquiry } = require('../controllers/bookingController');
const { publicEnquiryRateLimit } = require('../middleware/rateLimitMiddleware');
const { validatePublicEnquirySubmission, checkEnquirySpam } = require('../middleware/enquiryValidation');

const router = express.Router();

router.post(
  '/',
  publicEnquiryRateLimit,
  validatePublicEnquirySubmission,
  checkEnquirySpam,
  submitEnquiry
);

module.exports = router;
