const express = require('express');
const router = express.Router();
const { getBookings, createBooking, updateBookingStatus, deleteBooking, assignDriver } = require('../controllers/bookingController');
const { protectAdmin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protectAdmin, getBookings)
  .post(createBooking);

// IMPORTANT: Specific routes must come BEFORE the generic /:id route
router.route('/:id/assign-driver')
  .put(protectAdmin, assignDriver);

router.route('/:id')
  .put(protectAdmin, updateBookingStatus)
  .delete(protectAdmin, deleteBooking);

module.exports = router;
