const express = require('express');
const router = express.Router();
const { getFleet, createFleet, updateFleet, deleteFleet } = require('../controllers/fleetController');
const { protectAdmin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protectAdmin, getFleet)
  .post(protectAdmin, createFleet);

router.route('/:id')
  .put(protectAdmin, updateFleet)
  .delete(protectAdmin, deleteFleet);

module.exports = router;
