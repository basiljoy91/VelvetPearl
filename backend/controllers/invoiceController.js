const fs = require('fs');
const Booking = require('../models/bookingModel');
const Invoice = require('../models/invoiceModel');
const DocumentDeliveryLog = require('../models/documentDeliveryLogModel');
const { generateInvoicePdf } = require('../services/pdfService');
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

const formatDuration = (minutes) => {
  const total = Number(minutes || 0);
  if (!total) return '';
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  return [hours ? `${hours}h` : '', mins ? `${mins}m` : ''].filter(Boolean).join(' ');
};

const buildInvoiceFromEnquiry = (enquiry = {}) => {
  const details = parseJson(enquiry.service_details_json, {});
  const routeEstimate = details.route_estimate || {};
  const tripParts = [
    details.trip_type,
    details.pickup_date || enquiry.travel_date,
    details.pickup_time || enquiry.travel_time,
    routeEstimate.distance_km && `${routeEstimate.distance_km} km`,
    routeEstimate.duration_minutes && formatDuration(routeEstimate.duration_minutes),
  ].filter(Boolean);

  return {
    enquiry_id: enquiry.id,
    customer_name: enquiry.customer_name,
    customer_phone: enquiry.phone_number,
    customer_email: enquiry.email,
    booking_reference: enquiry.reference_id,
    pickup: details.pickup || details.pickup_location?.label || '',
    dropoff: details.dropoff || details.drop_location?.label || '',
    trip_details: tripParts.join(' | ') || enquiry.requirement_notes,
    vehicle_details: details.vehicle_preference || enquiry.assigned_vehicle_id || '',
    driver_details: enquiry.assigned_driver_name || enquiry.assigned_driver_id || '',
    service_details_json: details,
    items: [
      {
        description: enquiry.requirement_notes || 'Cab booking service',
        quantity: 1,
        unit_price: enquiry.quote_amount || 0,
        tax_rate: 0,
      },
    ],
    terms: 'Final invoice is based on confirmed route, timing, parking, tolls, permits, and agreed service details.',
  };
};

const enrichCreatePayload = async (payload = {}) => {
  if (!payload.enquiry_id) return payload;
  if (payload.customer_name && payload.items?.length) return payload;

  const enquiry = await Booking.getById(payload.enquiry_id);
  if (!enquiry) return payload;

  return {
    ...buildInvoiceFromEnquiry(enquiry),
    ...payload,
    service_details_json: payload.service_details_json || buildInvoiceFromEnquiry(enquiry).service_details_json,
    items: payload.items?.length ? payload.items : buildInvoiceFromEnquiry(enquiry).items,
  };
};

const listInvoices = async (req, res, next) => {
  try {
    const invoices = await Invoice.list({ status: req.query.status, search: req.query.search });
    return res.status(200).json({ success: true, data: invoices });
  } catch (error) {
    return next(error);
  }
};

const getInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.getById(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found.' });
    return res.status(200).json({ success: true, data: invoice });
  } catch (error) {
    return next(error);
  }
};

const createInvoice = async (req, res, next) => {
  try {
    const payload = await enrichCreatePayload(req.body);
    const invoice = await Invoice.create(payload, req.adminId || null);
    return res.status(201).json({ success: true, data: invoice });
  } catch (error) {
    return next(error);
  }
};

const updateInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.update(req.params.id, req.body);
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found.' });
    return res.status(200).json({ success: true, data: invoice });
  } catch (error) {
    return next(error);
  }
};

const duplicateInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.duplicate(req.params.id, req.adminId || null);
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found.' });
    return res.status(201).json({ success: true, data: invoice });
  } catch (error) {
    return next(error);
  }
};

const cancelInvoice = async (req, res, next) => {
  try {
    const rowCount = await Invoice.cancel(req.params.id);
    if (!rowCount) return res.status(404).json({ success: false, message: 'Invoice not found.' });
    return res.status(200).json({ success: true, message: 'Invoice cancelled.' });
  } catch (error) {
    return next(error);
  }
};

const createPdf = async (req, invoice) => generateInvoicePdf(invoice, {
  generatedBy: req.adminId || null,
  publicBaseUrl: getPublicBaseUrl(req),
});

const downloadInvoicePdf = async (req, res, next) => {
  try {
    const invoice = await Invoice.getById(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found.' });

    const document = await createPdf(req, invoice);
    await DocumentDeliveryLog.create({
      documentType: 'invoice',
      documentId: invoice.id,
      documentNumber: invoice.invoice_number,
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

const sendInvoiceEmail = async (req, res, next) => {
  try {
    const invoice = await Invoice.getById(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found.' });

    const document = await createPdf(req, invoice);
    const recipient = req.body?.to || invoice.customer_email;
    const info = await sendDocumentEmail({
      to: recipient,
      subject: req.body?.subject || `${invoice.invoice_number} from Velvet Pearl`,
      text: req.body?.message || `Please find attached invoice ${invoice.invoice_number}.`,
      attachmentPath: document.file_path,
      attachmentName: document.file_name,
    });

    await Invoice.update(invoice.id, { ...invoice, status: invoice.status === 'draft' ? 'sent' : invoice.status });
    await DocumentDeliveryLog.create({
      documentType: 'invoice',
      documentId: invoice.id,
      documentNumber: invoice.invoice_number,
      deliveryMethod: 'email',
      recipient,
      status: 'success',
      message: 'Invoice email sent.',
      performedBy: req.adminId || null,
      metadata: { ...info, generated_document_id: document.id },
    });

    return res.status(200).json({ success: true, data: { sent: true, email: info, document } });
  } catch (error) {
    return next(error);
  }
};

const shareInvoiceWhatsApp = async (req, res, next) => {
  try {
    const invoice = await Invoice.getById(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found.' });

    const document = await createPdf(req, invoice);
    const publicUrl = document.public_url || `${getPublicBaseUrl(req).replace(/\/$/, '')}/api/documents/${document.public_token}`;
    const phone = String(req.body?.phone || invoice.customer_phone || '').replace(/\D/g, '');
    const message = encodeURIComponent(req.body?.message || `Hi ${invoice.customer_name}, here is your Velvet Pearl invoice ${invoice.invoice_number}: ${publicUrl}`);
    const whatsappUrl = phone ? `https://wa.me/${phone}?text=${message}` : `https://wa.me/?text=${message}`;

    await Invoice.update(invoice.id, { ...invoice, status: invoice.status === 'draft' ? 'sent' : invoice.status });
    await DocumentDeliveryLog.create({
      documentType: 'invoice',
      documentId: invoice.id,
      documentNumber: invoice.invoice_number,
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

module.exports = {
  listInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  duplicateInvoice,
  cancelInvoice,
  downloadInvoicePdf,
  sendInvoiceEmail,
  shareInvoiceWhatsApp,
};
