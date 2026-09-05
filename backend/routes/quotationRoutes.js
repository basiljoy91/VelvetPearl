const express = require('express');
const {
  convertQuotationToInvoice,
  createQuotation,
  downloadQuotationPdf,
  duplicateQuotation,
  getQuotation,
  listQuotations,
  sendQuotationEmail,
  shareQuotationWhatsApp,
  updateQuotation,
  updateQuotationStatus,
} = require('../controllers/quotationController');
const { protectAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protectAdmin);
router.get('/', listQuotations);
router.post('/', createQuotation);
router.get('/:id', getQuotation);
router.patch('/:id', updateQuotation);
router.patch('/:id/status', updateQuotationStatus);
router.post('/:id/duplicate', duplicateQuotation);
router.get('/:id/pdf', downloadQuotationPdf);
router.post('/:id/send-email', sendQuotationEmail);
router.post('/:id/share-whatsapp', shareQuotationWhatsApp);
router.post('/:id/convert-to-invoice', convertQuotationToInvoice);

module.exports = router;
