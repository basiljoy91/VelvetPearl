const express = require('express');
const router = express.Router();
const userProfileController = require('../controllers/userProfileController');
const { protectAdmin } = require('../middleware/authMiddleware');

router.get('/stats', protectAdmin, userProfileController.getUserStats);
router.get('/', protectAdmin, userProfileController.getAllUsers);
router.get('/:phoneNumber', protectAdmin, userProfileController.getUserProfile);
router.get('/:phoneNumber/bookings/:type', protectAdmin, userProfileController.getUserBookings);

module.exports = router;
