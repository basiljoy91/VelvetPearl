const express = require('express');
const router = express.Router();
const { getRecommendations } = require('../controllers/tripController');

// Public route to get trip recommendations
router.post('/recommendations', getRecommendations);

module.exports = router;
