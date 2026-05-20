const express = require('express');
const router = express.Router();
const { getBookings, createBooking, updateBookingStatus, deleteBooking } = require('../controllers/bookingController');
const { protectAdmin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protectAdmin, getBookings)
  .post(createBooking);

router.route('/:id')
  .put(protectAdmin, updateBookingStatus)
  .delete(protectAdmin, deleteBooking);

module.exports = router;
