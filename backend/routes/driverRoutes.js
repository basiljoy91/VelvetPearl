const express = require('express');
const router = express.Router();
const { getDrivers, createDriver } = require('../controllers/driverController');
const { protectAdmin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protectAdmin, getDrivers)
  .post(protectAdmin, createDriver); // In a real app, maybe creating drivers is admin only

module.exports = router;
