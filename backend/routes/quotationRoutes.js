const express = require('express');
const router = express.Router();
const quotationController = require('../controllers/quotationController');
const { protectAdmin } = require('../middleware/authMiddleware');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Public route for creating quotation
router.post('/', quotationController.createQuotation);

// Admin routes
router.get('/', protectAdmin, quotationController.getQuotations);
router.patch('/:id/status', protectAdmin, quotationController.updateStatus);
router.post('/:id/details', protectAdmin, quotationController.saveDetails);
router.post('/verify', protectAdmin, upload.single('pdf'), quotationController.verifyQuotation);

module.exports = router;
