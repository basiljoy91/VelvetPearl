const express = require('express');
const router = express.Router();
const { getFleet, createFleet } = require('../controllers/fleetController');
const { protectAdmin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protectAdmin, getFleet)
  .post(protectAdmin, createFleet); // Fleet creation usually restricted to admins

module.exports = router;
