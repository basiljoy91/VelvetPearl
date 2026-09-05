const fs = require('fs');
const Booking = require('../models/bookingModel');
const Invoice = require('../models/invoiceModel');
const Quotation = require('../models/quotationModel');
const DocumentDeliveryLog = require('../models/documentDeliveryLogModel');
const { generateQuotationPdf } = require('../services/pdfService');
const { sendDocumentEmail } = require('../services/emailService');

const parseJson = (value, fallback = {}) => {
  if (!value) return fallback;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const getPublicBaseUrl = (req) => (
  process.env.PUBLIC_APP_URL
  || process.env.VITE_SITE_URL
  || `${req.protocol}://${req.get('host')}`
);

const buildQuotationFromEnquiry = (enquiry = {}) => {
  const details = parseJson(enquiry.service_details_json, {});
  const pickup = details.pickup || details.pickup_location?.label || details.pickup_city || '';
  const dropoff = details.dropoff || details.drop_location?.label || details.destination || details.package_name || '';

  return {
    enquiry_id: enquiry.id,
    client_name: enquiry.customer_name,
    client_phone: enquiry.phone_number,
    client_email: enquiry.email,
    subject: `${String(enquiry.enquiry_type || 'Travel').toUpperCase()} enquiry ${enquiry.reference_id || ''}`.trim(),
    pickup,
    dropoff,
    service_summary: enquiry.requirement_notes || [pickup, dropoff].filter(Boolean).join(' to '),
    vehicle_type: details.vehicle_preference || '',
    items: [
      {
        description: enquiry.requirement_notes || 'Travel service quotation',
        quantity: 1,
        unit_price: enquiry.quote_amount || 0,
        tax_rate: 0,
      },
    ],
    terms: 'Quotation is subject to vehicle availability, route review, tolls, parking, permits, and final confirmation.',
  };
};

const enrichCreatePayload = async (payload = {}) => {
  if (!payload.enquiry_id) return payload;
  if (payload.client_name && payload.items?.length) return payload;

  const enquiry = await Booking.getById(payload.enquiry_id);
  if (!enquiry) return payload;

  const defaults = buildQuotationFromEnquiry(enquiry);
  return {
    ...defaults,
    ...payload,
    items: payload.items?.length ? payload.items : defaults.items,
  };
};

const listQuotations = async (req, res, next) => {
  try {
    const quotations = await Quotation.list({ status: req.query.status, search: req.query.search });
    return res.status(200).json({ success: true, data: quotations });
  } catch (error) {
    return next(error);
  }
};

const getQuotation = async (req, res, next) => {
  try {
    const quotation = await Quotation.getById(req.params.id);
    if (!quotation) return res.status(404).json({ success: false, message: 'Quotation not found.' });
    return res.status(200).json({ success: true, data: quotation });
  } catch (error) {
    return next(error);
  }
};

const createQuotation = async (req, res, next) => {
  try {
    const payload = await enrichCreatePayload(req.body);
    const quotation = await Quotation.create(payload, req.adminId || null);
    return res.status(201).json({ success: true, data: quotation });
  } catch (error) {
    return next(error);
  }
};

const updateQuotation = async (req, res, next) => {
  try {
    const quotation = await Quotation.update(req.params.id, req.body);
    if (!quotation) return res.status(404).json({ success: false, message: 'Quotation not found.' });
    return res.status(200).json({ success: true, data: quotation });
  } catch (error) {
    return next(error);
  }
};

const duplicateQuotation = async (req, res, next) => {
  try {
    const quotation = await Quotation.duplicate(req.params.id, req.adminId || null);
    if (!quotation) return res.status(404).json({ success: false, message: 'Quotation not found.' });
    return res.status(201).json({ success: true, data: quotation });
  } catch (error) {
    return next(error);
  }
};

const updateQuotationStatus = async (req, res, next) => {
  try {
    const rowCount = await Quotation.updateStatus(req.params.id, req.body?.status);
    if (!rowCount) return res.status(404).json({ success: false, message: 'Quotation not found or invalid status.' });
    const quotation = await Quotation.getById(req.params.id);
    return res.status(200).json({ success: true, data: quotation });
  } catch (error) {
    return next(error);
  }
};

const createPdf = async (req, quotation) => generateQuotationPdf(quotation, {
  generatedBy: req.adminId || null,
  publicBaseUrl: getPublicBaseUrl(req),
});

const downloadQuotationPdf = async (req, res, next) => {
  try {
    const quotation = await Quotation.getById(req.params.id);
    if (!quotation) return res.status(404).json({ success: false, message: 'Quotation not found.' });

    const document = await createPdf(req, quotation);
    await DocumentDeliveryLog.create({
      documentType: 'quotation',
      documentId: quotation.id,
      documentNumber: quotation.quote_number,
      deliveryMethod: 'download',
      status: 'success',
      message: 'PDF generated for download.',
      performedBy: req.adminId || null,
      metadata: { generated_document_id: document.id },
    });

    if (!fs.existsSync(document.file_path)) {
      return res.status(404).json({ success: false, message: 'Generated PDF file was not found.' });
    }

    return res.download(document.file_path, document.file_name);
  } catch (error) {
    return next(error);
  }
};

const sendQuotationEmail = async (req, res, next) => {
  try {
    const quotation = await Quotation.getById(req.params.id);
    if (!quotation) return res.status(404).json({ success: false, message: 'Quotation not found.' });

    const document = await createPdf(req, quotation);
    const recipient = req.body?.to || quotation.client_email;
    const info = await sendDocumentEmail({
      to: recipient,
      subject: req.body?.subject || `${quotation.quote_number} from Velvet Pearl`,
      text: req.body?.message || `Please find attached quotation ${quotation.quote_number}.`,
      attachmentPath: document.file_path,
      attachmentName: document.file_name,
    });

    await Quotation.update(quotation.id, { ...quotation, status: quotation.status === 'draft' ? 'sent' : quotation.status });
    await DocumentDeliveryLog.create({
      documentType: 'quotation',
      documentId: quotation.id,
      documentNumber: quotation.quote_number,
      deliveryMethod: 'email',
      recipient,
      status: 'success',
      message: 'Quotation email sent.',
      performedBy: req.adminId || null,
      metadata: { ...info, generated_document_id: document.id },
    });

    return res.status(200).json({ success: true, data: { sent: true, email: info, document } });
  } catch (error) {
    return next(error);
  }
};

const shareQuotationWhatsApp = async (req, res, next) => {
  try {
    const quotation = await Quotation.getById(req.params.id);
    if (!quotation) return res.status(404).json({ success: false, message: 'Quotation not found.' });

    const document = await createPdf(req, quotation);
    const publicUrl = document.public_url || `${getPublicBaseUrl(req).replace(/\/$/, '')}/api/documents/${document.public_token}`;
    const phone = String(req.body?.phone || quotation.client_phone || '').replace(/\D/g, '');
    const message = encodeURIComponent(req.body?.message || `Hi ${quotation.client_name}, here is your Velvet Pearl quotation ${quotation.quote_number}: ${publicUrl}`);
    const whatsappUrl = phone ? `https://wa.me/${phone}?text=${message}` : `https://wa.me/?text=${message}`;

    await Quotation.update(quotation.id, { ...quotation, status: quotation.status === 'draft' ? 'sent' : quotation.status });
    await DocumentDeliveryLog.create({
      documentType: 'quotation',
      documentId: quotation.id,
      documentNumber: quotation.quote_number,
      deliveryMethod: 'whatsapp',
      recipient: phone || null,
      status: 'prepared',
      message: 'WhatsApp share link prepared.',
      performedBy: req.adminId || null,
      metadata: { public_url: publicUrl, generated_document_id: document.id },
    });

    return res.status(200).json({ success: true, data: { whatsapp_url: whatsappUrl, public_url: publicUrl, document } });
  } catch (error) {
    return next(error);
  }
};

const convertQuotationToInvoice = async (req, res, next) => {
  try {
    const quotation = await Quotation.getById(req.params.id);
    if (!quotation) return res.status(404).json({ success: false, message: 'Quotation not found.' });

    const invoice = await Invoice.create({
      enquiry_id: quotation.enquiry_id,
      customer_name: quotation.client_name,
      customer_phone: quotation.client_phone,
      customer_email: quotation.client_email,
      customer_address: quotation.client_address,
      booking_reference: quotation.quote_number,
      pickup: quotation.pickup,
      dropoff: quotation.dropoff,
      trip_details: quotation.service_summary,
      vehicle_details: quotation.vehicle_type,
      items: quotation.items,
      discount_amount: quotation.discount_amount,
      notes: `Created from quotation ${quotation.quote_number}.`,
      terms: quotation.terms,
    }, req.adminId || null);

    await Quotation.updateStatus(quotation.id, quotation.status === 'draft' || quotation.status === 'sent' ? 'accepted' : quotation.status);
    return res.status(201).json({ success: true, data: invoice });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listQuotations,
  getQuotation,
  createQuotation,
  updateQuotation,
  duplicateQuotation,
  updateQuotationStatus,
  downloadQuotationPdf,
  sendQuotationEmail,
  shareQuotationWhatsApp,
  convertQuotationToInvoice,
};
