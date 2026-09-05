const express = require('express');
const {
  estimateRoute,
  listPopularRoutes,
} = require('../controllers/routeController');

const router = express.Router();

router.get('/popular', listPopularRoutes);
router.post('/estimate', estimateRoute);

module.exports = router;
