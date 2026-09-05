const express = require('express');
const {
  createPopularRoute,
  deletePopularRoute,
  listPopularRoutes,
  updatePopularRoute,
} = require('../controllers/routeController');
const { protectAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protectAdmin);
router.get('/popular', listPopularRoutes);
router.post('/popular', createPopularRoute);
router.patch('/popular/:id', updatePopularRoute);
router.delete('/popular/:id', deletePopularRoute);

module.exports = router;
