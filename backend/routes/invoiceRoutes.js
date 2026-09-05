const express = require('express');
const {
  cancelInvoice,
  createInvoice,
  downloadInvoicePdf,
  duplicateInvoice,
  getInvoice,
  listInvoices,
  sendInvoiceEmail,
  shareInvoiceWhatsApp,
  updateInvoice,
} = require('../controllers/invoiceController');
const { protectAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protectAdmin);
router.get('/', listInvoices);
router.post('/', createInvoice);
router.get('/:id', getInvoice);
router.patch('/:id', updateInvoice);
router.delete('/:id', cancelInvoice);
router.post('/:id/duplicate', duplicateInvoice);
router.get('/:id/pdf', downloadInvoicePdf);
router.post('/:id/send-email', sendInvoiceEmail);
router.post('/:id/share-whatsapp', shareInvoiceWhatsApp);

module.exports = router;
