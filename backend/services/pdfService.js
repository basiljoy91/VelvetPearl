const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const GeneratedDocument = require('../models/generatedDocumentModel');

const DOCUMENT_DIR = process.env.GENERATED_DOCUMENTS_DIR
  ? path.resolve(process.env.GENERATED_DOCUMENTS_DIR)
  : path.resolve(__dirname, '..', 'storage', 'generated-documents');

const BRAND = {
  name: process.env.BUSINESS_NAME || 'Velvet Pearl',
  phone: process.env.BUSINESS_PHONE || '+91 78450 39353',
  email: process.env.BUSINESS_EMAIL || 'velvetpearl2026@gmail.com',
  address: process.env.BUSINESS_ADDRESS || 'Chennai, Tamil Nadu, India',
  website: process.env.BUSINESS_WEBSITE || 'velvetpearl.in',
  yellow: '#EFBF04',
  blue: '#2249DB',
  black: '#0A0A0A',
  gray: '#555555',
};

const ensureDocumentDir = () => {
  fs.mkdirSync(DOCUMENT_DIR, { recursive: true });
};

const money = (value) => `INR ${Number(value || 0).toLocaleString('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})}`;

const cleanFilePart = (value) => String(value || 'document').replace(/[^a-z0-9_-]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase();

const writePdf = (doc, filePath) => new Promise((resolve, reject) => {
  const stream = fs.createWriteStream(filePath);
  stream.on('finish', resolve);
  stream.on('error', reject);
  doc.pipe(stream);
  doc.end();
});

const addHeader = (doc, title, number, dateLabel, dateValue) => {
  doc.rect(0, 0, doc.page.width, 92).fill(BRAND.black);
  doc.fillColor(BRAND.yellow).fontSize(25).font('Helvetica-Bold').text(BRAND.name, 48, 30);
  doc.fillColor('#FFFFFF').fontSize(9).font('Helvetica').text(BRAND.address, 48, 59, { width: 260 });
  doc.fillColor('#FFFFFF').fontSize(26).font('Helvetica-Bold').text(title, 360, 28, { align: 'right', width: 185 });
  doc.fillColor(BRAND.yellow).fontSize(10).text(number, 360, 59, { align: 'right', width: 185 });
  doc.fillColor(BRAND.gray).fontSize(9).text(`${dateLabel}: ${dateValue || '-'}`, 360, 76, { align: 'right', width: 185 });
};

const addPartyBlock = (doc, label, lines, x, y, width) => {
  doc.fillColor(BRAND.yellow).fontSize(9).font('Helvetica-Bold').text(label.toUpperCase(), x, y);
  doc.fillColor('#111111').fontSize(10).font('Helvetica-Bold').text(lines[0] || '-', x, y + 17, { width });
  doc.fillColor('#333333').fontSize(9).font('Helvetica').text(lines.slice(1).filter(Boolean).join('\n'), x, y + 33, { width, lineGap: 3 });
};

const addSummaryBox = (doc, rows, y) => {
  const x = 48;
  const width = doc.page.width - 96;
  doc.roundedRect(x, y, width, 72, 6).fill('#F6F6F6');
  const columnWidth = width / rows.length;

  rows.forEach((row, index) => {
    const left = x + (index * columnWidth);
    doc.fillColor('#666666').fontSize(8).font('Helvetica-Bold').text(row.label.toUpperCase(), left + 16, y + 17, { width: columnWidth - 32 });
    doc.fillColor('#111111').fontSize(12).font('Helvetica-Bold').text(row.value || '-', left + 16, y + 35, { width: columnWidth - 32 });
  });
};

const addItemsTable = (doc, items = [], startY) => {
  const x = 48;
  const width = doc.page.width - 96;
  let y = startY;

  doc.rect(x, y, width, 28).fill(BRAND.black);
  doc.fillColor('#FFFFFF').fontSize(9).font('Helvetica-Bold');
  doc.text('S.No', x + 10, y + 9, { width: 40 });
  doc.text('Item & Description', x + 58, y + 9, { width: 250 });
  doc.text('Qty', x + 330, y + 9, { width: 45, align: 'right' });
  doc.text('Rate', x + 385, y + 9, { width: 70, align: 'right' });
  doc.text('Amount', x + 465, y + 9, { width: 58, align: 'right' });
  y += 28;

  items.forEach((item, index) => {
    const rowHeight = Math.max(38, doc.heightOfString(item.description, { width: 245 }) + 22);
    if (y + rowHeight > 700) {
      doc.addPage();
      y = 56;
    }

    doc.rect(x, y, width, rowHeight).strokeColor('#DDDDDD').stroke();
    doc.fillColor('#111111').fontSize(9).font('Helvetica');
    doc.text(String(index + 1), x + 12, y + 12, { width: 35 });
    doc.text(item.description, x + 58, y + 12, { width: 245 });
    doc.text(Number(item.quantity || 0).toFixed(2), x + 330, y + 12, { width: 45, align: 'right' });
    doc.text(money(item.unit_price || item.rate), x + 385, y + 12, { width: 70, align: 'right' });
    doc.text(money(item.amount), x + 465, y + 12, { width: 58, align: 'right' });
    y += rowHeight;
  });

  return y + 16;
};

const addTotals = (doc, rows, startY) => {
  const x = 330;
  let y = startY;

  rows.forEach((row, index) => {
    const isTotal = index === rows.length - 1;
    doc.rect(x, y, 215, 26).fill(isTotal ? BRAND.black : '#F2F2F2');
    doc.fillColor(isTotal ? '#FFFFFF' : '#333333').fontSize(isTotal ? 11 : 9).font(isTotal ? 'Helvetica-Bold' : 'Helvetica');
    doc.text(row.label, x + 14, y + 8, { width: 95 });
    doc.text(row.value, x + 110, y + 8, { width: 90, align: 'right' });
    y += 27;
  });

  return y;
};

const addFooter = (doc) => {
  const y = doc.page.height - 60;
  doc.strokeColor('#DDDDDD').moveTo(48, y).lineTo(doc.page.width - 48, y).stroke();
  doc.fillColor('#777777').fontSize(8).font('Helvetica').text(`${BRAND.name} | ${BRAND.phone} | ${BRAND.email} | ${BRAND.website}`, 48, y + 12, {
    align: 'center',
    width: doc.page.width - 96,
  });
};

const buildPublicUrl = (publicBaseUrl, token) => {
  if (!publicBaseUrl || !token) return null;
  return `${String(publicBaseUrl).replace(/\/$/, '')}/api/documents/${token}`;
};

const generateInvoicePdf = async (invoice, { generatedBy = null, publicBaseUrl = '' } = {}) => {
  ensureDocumentDir();
  const fileName = `${cleanFilePart(invoice.invoice_number)}.pdf`;
  const filePath = path.join(DOCUMENT_DIR, fileName);
  const doc = new PDFDocument({ size: 'A4', margin: 48, bufferPages: true });

  addHeader(doc, 'Invoice', invoice.invoice_number, 'Invoice Date', invoice.invoice_date);
  addPartyBlock(doc, 'Bill To', [
    invoice.customer_name,
    invoice.customer_phone,
    invoice.customer_email,
    invoice.customer_address,
  ], 48, 122, 230);
  addPartyBlock(doc, 'From', [
    BRAND.name,
    BRAND.phone,
    BRAND.email,
    BRAND.address,
  ], 330, 122, 215);
  addSummaryBox(doc, [
    { label: 'Booking Ref', value: invoice.booking_reference || invoice.enquiry_id || '-' },
    { label: 'Payment', value: invoice.payment_status || 'unpaid' },
    { label: 'Status', value: invoice.status || 'draft' },
  ], 230);

  doc.fillColor('#111111').fontSize(12).font('Helvetica-Bold').text('Trip Details', 48, 325);
  doc.fillColor('#333333').fontSize(9).font('Helvetica').text([
    invoice.pickup && `Pickup: ${invoice.pickup}`,
    invoice.dropoff && `Drop: ${invoice.dropoff}`,
    invoice.trip_details,
    invoice.vehicle_details && `Vehicle: ${invoice.vehicle_details}`,
    invoice.driver_details && `Driver: ${invoice.driver_details}`,
  ].filter(Boolean).join('\n'), 48, 345, { width: 497, lineGap: 4 });

  const tableY = Math.max(405, doc.y + 18);
  const totalsY = addItemsTable(doc, invoice.items, tableY);
  const additionalChargeRows = (invoice.additional_charges || []).map((charge) => ({
    label: charge.label || 'Additional charge',
    value: money(charge.amount),
  }));
  const afterTotalsY = addTotals(doc, [
    { label: 'Subtotal', value: money(invoice.subtotal_amount) },
    { label: 'Tax', value: money(invoice.tax_amount) },
    ...additionalChargeRows,
    { label: 'Discount', value: money(invoice.discount_amount) },
    { label: 'Total', value: money(invoice.total_amount) },
  ], totalsY);

  doc.fillColor('#333333').fontSize(9).font('Helvetica-Bold').text('Notes / Terms', 48, afterTotalsY + 20);
  doc.fillColor('#555555').fontSize(8).font('Helvetica').text([invoice.notes, invoice.terms].filter(Boolean).join('\n\n') || 'Thank you for choosing Velvet Pearl.', 48, afterTotalsY + 36, { width: 497, lineGap: 3 });
  addFooter(doc);

  await writePdf(doc, filePath);
  const stat = fs.statSync(filePath);
  const generatedDocument = await GeneratedDocument.create({
    documentType: 'invoice',
    documentId: invoice.id,
    documentNumber: invoice.invoice_number,
    fileName,
    filePath,
    fileSize: stat.size,
    generatedBy,
  });

  return {
    ...generatedDocument,
    public_url: buildPublicUrl(publicBaseUrl, generatedDocument?.public_token),
  };
};

const generateQuotationPdf = async (quotation, { generatedBy = null, publicBaseUrl = '' } = {}) => {
  ensureDocumentDir();
  const fileName = `${cleanFilePart(quotation.quote_number)}.pdf`;
  const filePath = path.join(DOCUMENT_DIR, fileName);
  const doc = new PDFDocument({ size: 'A4', margin: 48, bufferPages: true });

  addHeader(doc, 'Quote', quotation.quote_number, 'Quote Date', quotation.quote_date);
  addPartyBlock(doc, 'Bill To', [
    quotation.client_name,
    quotation.client_phone,
    quotation.client_email,
    quotation.client_address,
  ], 48, 122, 245);
  addPartyBlock(doc, 'From', [
    BRAND.name,
    BRAND.phone,
    BRAND.email,
    BRAND.address,
  ], 330, 122, 215);

  doc.fillColor(BRAND.yellow).fontSize(9).font('Helvetica-Bold').text('SUBJECT', 48, 230);
  doc.fillColor('#111111').fontSize(14).font('Helvetica-Bold').text(quotation.subject || 'Travel service quotation', 48, 248, { width: 497 });
  addSummaryBox(doc, [
    { label: 'Valid Until', value: quotation.valid_until || '-' },
    { label: 'Vehicle', value: quotation.vehicle_type || '-' },
    { label: 'Status', value: quotation.status || 'draft' },
  ], 292);

  doc.fillColor('#111111').fontSize(12).font('Helvetica-Bold').text('Service Summary', 48, 390);
  doc.fillColor('#333333').fontSize(9).font('Helvetica').text([
    quotation.pickup && `Pickup: ${quotation.pickup}`,
    quotation.dropoff && `Drop: ${quotation.dropoff}`,
    quotation.service_summary,
  ].filter(Boolean).join('\n'), 48, 410, { width: 497, lineGap: 4 });

  const tableY = Math.max(465, doc.y + 18);
  const totalsY = addItemsTable(doc, quotation.items, tableY);
  const afterTotalsY = addTotals(doc, [
    { label: 'Subtotal', value: money(quotation.subtotal_amount) },
    { label: 'Tax', value: money(quotation.tax_amount) },
    { label: 'Discount', value: money(quotation.discount_amount) },
    { label: 'Total', value: money(quotation.total_amount) },
  ], totalsY);

  doc.fillColor('#111111').fontSize(9).font('Helvetica-Bold').text('Total In Words', 48, afterTotalsY + 18);
  doc.fillColor('#333333').fontSize(9).font('Helvetica').text(quotation.total_in_words || '', 48, afterTotalsY + 34, { width: 497 });
  doc.fillColor('#333333').fontSize(9).font('Helvetica-Bold').text('Terms / Notes', 48, afterTotalsY + 64);
  doc.fillColor('#555555').fontSize(8).font('Helvetica').text([quotation.terms, quotation.notes].filter(Boolean).join('\n\n') || 'Quotation is subject to availability and manual confirmation.', 48, afterTotalsY + 80, { width: 497, lineGap: 3 });
  addFooter(doc);

  await writePdf(doc, filePath);
  const stat = fs.statSync(filePath);
  const generatedDocument = await GeneratedDocument.create({
    documentType: 'quotation',
    documentId: quotation.id,
    documentNumber: quotation.quote_number,
    fileName,
    filePath,
    fileSize: stat.size,
    generatedBy,
  });

  return {
    ...generatedDocument,
    public_url: buildPublicUrl(publicBaseUrl, generatedDocument?.public_token),
  };
};

module.exports = {
  generateInvoicePdf,
  generateQuotationPdf,
};
