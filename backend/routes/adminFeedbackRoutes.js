const express = require('express');
const {
  listAdminFeedback,
  getAdminFeedbackById,
  updateAdminFeedback,
} = require('../controllers/feedbackController');
const { protectAdmin } = require('../middleware/authMiddleware');
const { validateAdminFeedbackUpdate } = require('../middleware/feedbackValidation');

const router = express.Router();

router.use(protectAdmin);

router.get('/', listAdminFeedback);
router.get('/:id', getAdminFeedbackById);
router.patch('/:id', validateAdminFeedbackUpdate, updateAdminFeedback);

module.exports = router;
