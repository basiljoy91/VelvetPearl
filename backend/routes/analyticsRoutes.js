const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protectAdmin } = require('../middleware/authMiddleware');

router.get('/analytics', protectAdmin, analyticsController.getAnalytics);

module.exports = router;
