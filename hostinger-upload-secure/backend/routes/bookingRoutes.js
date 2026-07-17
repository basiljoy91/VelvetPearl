const express = require('express');
const router = express.Router();
const {
  getBookings,
  createBooking,
  updateBookingStatus,
  updateBookingEnquiry,
  deleteBooking,
  assignDriver,
} = require('../controllers/bookingController');
const { protectAdmin } = require('../middleware/authMiddleware');
const { publicEnquiryRateLimit } = require('../middleware/rateLimitMiddleware');
const { validatePublicEnquirySubmission, checkEnquirySpam } = require('../middleware/enquiryValidation');

router.route('/')
  .get(protectAdmin, getBookings)
  .post(publicEnquiryRateLimit, validatePublicEnquirySubmission, checkEnquirySpam, createBooking);

// IMPORTANT: Specific routes must come BEFORE the generic /:id route
router.route('/:id/assign-driver')
  .put(protectAdmin, assignDriver);

router.route('/:id/enquiry')
  .put(protectAdmin, updateBookingEnquiry);

router.route('/:id')
  .put(protectAdmin, updateBookingStatus)
  .delete(protectAdmin, deleteBooking);

module.exports = router;
