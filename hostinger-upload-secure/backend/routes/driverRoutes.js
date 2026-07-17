const express = require('express');
const router = express.Router();
const { getDrivers, createDriver, updateDriver, deleteDriver } = require('../controllers/driverController');
const { protectAdmin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protectAdmin, getDrivers)
  .post(protectAdmin, createDriver);

router.route('/:id')
  .put(protectAdmin, updateDriver)
  .delete(protectAdmin, deleteDriver);

module.exports = router;
