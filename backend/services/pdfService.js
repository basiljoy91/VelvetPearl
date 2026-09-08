const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const DOCUMENT_DIR = process.env.GENERATED_DOCUMENTS_DIR
  ? path.resolve(process.env.GENERATED_DOCUMENTS_DIR)
  : path.resolve(__dirname, '..', 'storage', 'generated-documents');

const PAGE = { margin: 42, footerTop: 770 };
const BRAND = {
  name: process.env.BUSINESS_NAME || 'Velvet Pearl',
  phone: process.env.BUSINESS_PHONE || '+91 79045 39353',
  email: process.env.BUSINESS_EMAIL || 'velvetpearl2026@gmail.com',
  address: process.env.BUSINESS_ADDRESS || 'Chennai, Tamil Nadu, India',
  website: process.env.BUSINESS_WEBSITE || 'velvetpearl.in',
  taxId: process.env.BUSINESS_GSTIN || '',
  dark: '#101113',
  ink: '#1C2330',
  muted: '#697386',
  line: '#DDE3EA',
  soft: '#F4F7FA',
  lime: '#9AD915',
  cyan: '#08BCE8',
  blue: '#2249DB',
};

const LOGO_CANDIDATES = [
  process.env.BUSINESS_LOGO_PATH && path.resolve(process.env.BUSINESS_LOGO_PATH),
  path.resolve(__dirname, '..', '..', 'src', 'assets', 'branding', 'velvet-pearl', 'velvet-pearl-nav-wordmark.png'),
  path.resolve(__dirname, '..', '..', 'public', 'branding', 'velvet-pearl-monogram.png'),
].filter(Boolean);

const ensureDocumentDir = () => fs.mkdirSync(DOCUMENT_DIR, { recursive: true });
const cleanFilePart = (value) => String(value || 'document').replace(/[^a-z0-9_-]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase();
const prettify = (value) => String(value || '').replace(/[_-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
const valueOrBlank = (value) => (value === undefined || value === null ? '' : String(value).trim());
const compact = (rows) => rows.filter((row) => valueOrBlank(row?.value));

const money = (value) => `INR ${Number(value || 0).toLocaleString('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})}`;

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
};

const formatDuration = (value) => {
  if (!value) return '';
  if (String(value).match(/[a-z]/i)) return String(value);
  const minutes = Number(value);
  if (!Number.isFinite(minutes)) return String(value);
  const hours = Math.floor(minutes / 60);
  const remainder = Math.round(minutes % 60);
  return [hours ? `${hours} hr` : '', remainder ? `${remainder} min` : ''].filter(Boolean).join(' ');
};

const writePdf = (doc, filePath) => new Promise((resolve, reject) => {
  const stream = fs.createWriteStream(filePath);
  stream.on('finish', resolve);
  stream.on('error', reject);
  doc.pipe(stream);
  doc.end();
});

const resolveLogoPath = () => LOGO_CANDIDATES.find((candidate) => fs.existsSync(candidate));

const getServiceLabel = (type) => ({
  cab: 'Cab / Taxi Service',
  room: 'Room / Stay Service',
  tour: 'Tour Package',
  custom: 'Custom / Event Travel',
  general: 'Travel Service',
}[String(type || '').toLowerCase()] || 'Travel Service');

const getServiceRows = (document, kind) => {
  const details = document.service_details_json || {};
  const serviceType = String(document.service_type || 'cab').toLowerCase();
  const summary = kind === 'invoice' ? document.trip_details : document.service_summary;
  const vehicle = kind === 'invoice' ? document.vehicle_details : document.vehicle_type;

  if (serviceType === 'cab') {
    return compact([
      { label: 'Pickup', value: document.pickup },
      { label: 'Drop', value: document.dropoff },
      { label: 'Journey date', value: (details.journey_date || details.pickup_date) ? formatDate(details.journey_date || details.pickup_date) : '' },
      { label: 'Pickup time', value: details.pickup_time },
      { label: 'Trip type', value: prettify(details.trip_type) },
      { label: 'Passengers', value: details.passengers },
      { label: 'Vehicle', value: vehicle },
      { label: 'Driver', value: document.driver_details },
      { label: 'Distance', value: (details.distance_km || details.route_estimate?.distance_km) ? `${details.distance_km || details.route_estimate.distance_km} km` : '' },
      { label: 'Duration', value: formatDuration(details.duration || details.route_estimate?.duration_text || details.route_estimate?.duration_minutes) },
      { label: 'Trip notes', value: summary },
    ]);
  }

  if (serviceType === 'room') {
    return compact([
      { label: 'Hotel / Property', value: details.property_name || details.hotel_name },
      { label: 'Destination', value: details.destination || details.location_preference },
      { label: 'Check-in', value: details.check_in ? formatDate(details.check_in) : '' },
      { label: 'Check-out', value: details.check_out ? formatDate(details.check_out) : '' },
      { label: 'Guests', value: details.guests },
      { label: 'Rooms', value: details.room_count },
      { label: 'Room type', value: details.room_type },
      { label: 'Meal plan', value: details.meal_plan },
      { label: 'Confirmation no.', value: details.confirmation_number },
      { label: 'Stay notes', value: summary },
    ]);
  }

  if (serviceType === 'tour') {
    return compact([
      { label: 'Package / Tour', value: details.package_name },
      { label: 'Destination(s)', value: details.destination || document.dropoff },
      { label: 'Start date', value: (details.start_date || details.travel_window_start) ? formatDate(details.start_date || details.travel_window_start) : '' },
      { label: 'End date', value: (details.end_date || details.travel_window_end) ? formatDate(details.end_date || details.travel_window_end) : '' },
      { label: 'Travellers', value: details.travellers || details.group_size },
      { label: 'Duration', value: details.duration },
      { label: 'Transport', value: details.transport || vehicle },
      { label: 'Accommodation', value: details.accommodation },
      { label: 'Pickup point', value: document.pickup },
      { label: 'Tour summary', value: summary },
    ]);
  }

  if (serviceType === 'custom') {
    return compact([
      { label: 'Service / Event', value: details.service_name || details.custom_category || details.event_type },
      { label: 'Location', value: details.location },
      { label: 'Service date', value: (details.service_date || details.travel_window_start) ? formatDate(details.service_date || details.travel_window_start) : '' },
      { label: 'Service time', value: details.service_time },
      { label: 'Group size', value: details.group_size || details.guests },
      { label: 'Venue / Reference', value: details.venue_reference },
      { label: 'Scope of service', value: summary },
    ]);
  }

  return compact([
    { label: 'Service', value: details.service_name || getServiceLabel(serviceType) },
    { label: 'Service date', value: details.service_date ? formatDate(details.service_date) : '' },
    { label: 'Description', value: summary },
  ]);
};

const drawPageHeader = (doc, meta, continued = false) => {
  const width = doc.page.width;
  doc.rect(0, 0, width, 112).fill(BRAND.dark);
  doc.rect(0, 108, width, 4).fill(BRAND.blue);
  doc.rect(0, 108, width * 0.58, 4).fill(BRAND.cyan);
  doc.rect(0, 108, width * 0.3, 4).fill(BRAND.lime);

  const logoPath = resolveLogoPath();
  if (logoPath) {
    try {
      doc.image(logoPath, PAGE.margin, 24, { fit: [180, 38], align: 'left', valign: 'center' });
    } catch {
      doc.fillColor(BRAND.lime).font('Helvetica-Bold').fontSize(22).text(BRAND.name, PAGE.margin, 30);
    }
  } else {
    doc.fillColor(BRAND.lime).font('Helvetica-Bold').fontSize(22).text(BRAND.name, PAGE.margin, 30);
  }

  doc.fillColor('#C7CED8').font('Helvetica').fontSize(7.5).text(
    [BRAND.address, BRAND.phone, BRAND.email].filter(Boolean).join('  |  '),
    PAGE.margin,
    73,
    { width: 330, lineGap: 2 }
  );

  doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(24).text(meta.title, 360, 25, { width: 193, align: 'right' });
  doc.fillColor(BRAND.lime).fontSize(10).text(meta.number, 360, 57, { width: 193, align: 'right' });
  doc.fillColor('#C7CED8').font('Helvetica').fontSize(8).text(`${meta.dateLabel}: ${formatDate(meta.dateValue)}`, 360, 75, { width: 193, align: 'right' });
  if (continued) doc.fillColor('#8F9AAA').fontSize(7).text('CONTINUED', 360, 91, { width: 193, align: 'right' });
  return 132;
};

const ensureSpace = (doc, y, required, meta) => {
  if (y + required <= PAGE.footerTop - 8) return y;
  doc.addPage();
  return drawPageHeader(doc, meta, true);
};

const drawSectionTitle = (doc, title, y) => {
  doc.fillColor(BRAND.blue).font('Helvetica-Bold').fontSize(8).text(String(title).toUpperCase(), PAGE.margin, y, { characterSpacing: 0.7 });
  doc.strokeColor(BRAND.line).lineWidth(0.7).moveTo(PAGE.margin + 112, y + 5).lineTo(doc.page.width - PAGE.margin, y + 5).stroke();
  return y + 18;
};

const partyHeight = (doc, lines, width) => {
  const filtered = lines.filter(Boolean);
  return Math.max(70, 28 + filtered.reduce((height, line, index) => (
    height + doc.font(index === 0 ? 'Helvetica-Bold' : 'Helvetica').fontSize(index === 0 ? 10.5 : 8.5).heightOfString(String(line), { width: width - 28 }) + 3
  ), 0));
};

const drawPartyCards = (doc, customer, meta, y) => {
  const gap = 14;
  const width = (doc.page.width - (PAGE.margin * 2) - gap) / 2;
  const customerLines = [customer.name, customer.phone, customer.email, customer.address];
  const businessLines = [BRAND.name, BRAND.address, BRAND.phone, BRAND.email, BRAND.taxId && `GSTIN: ${BRAND.taxId}`];
  const height = Math.max(partyHeight(doc, customerLines, width), partyHeight(doc, businessLines, width));

  [[PAGE.margin, 'BILL TO', customerLines], [PAGE.margin + width + gap, 'FROM', businessLines]].forEach(([x, label, lines]) => {
    doc.roundedRect(x, y, width, height, 5).fillAndStroke(BRAND.soft, BRAND.line);
    doc.fillColor(BRAND.blue).font('Helvetica-Bold').fontSize(7.5).text(label, x + 12, y + 10, { characterSpacing: 0.6 });
    let lineY = y + 25;
    lines.filter(Boolean).forEach((line, index) => {
      const font = index === 0 ? 'Helvetica-Bold' : 'Helvetica';
      const size = index === 0 ? 10.5 : 8.5;
      doc.fillColor(index === 0 ? BRAND.ink : BRAND.muted).font(font).fontSize(size);
      const lineHeight = doc.heightOfString(String(line), { width: width - 28 });
      doc.text(String(line), x + 12, lineY, { width: width - 24, lineGap: 1.5 });
      lineY += lineHeight + 3;
    });
  });

  return y + height + 16;
};

const drawMetaStrip = (doc, rows, y) => {
  const width = doc.page.width - (PAGE.margin * 2);
  const columnWidth = width / rows.length;
  doc.roundedRect(PAGE.margin, y, width, 44, 5).fill(BRAND.ink);
  rows.forEach((row, index) => {
    const x = PAGE.margin + (columnWidth * index) + 14;
    if (index) doc.strokeColor('#3A4555').moveTo(PAGE.margin + (columnWidth * index), y + 9).lineTo(PAGE.margin + (columnWidth * index), y + 35).stroke();
    doc.fillColor('#9EA8B7').font('Helvetica-Bold').fontSize(6.5).text(row.label.toUpperCase(), x, y + 9, { width: columnWidth - 28, characterSpacing: 0.35 });
    doc.fillColor('#FFFFFF').fontSize(9).text(valueOrBlank(row.value) || '-', x, y + 23, { width: columnWidth - 28, ellipsis: true });
  });
  return y + 56;
};

const drawKeyValueGrid = (doc, rows, y, meta) => {
  let currentY = y;
  const gap = 10;
  const width = (doc.page.width - (PAGE.margin * 2) - gap) / 2;
  for (let index = 0; index < rows.length; index += 2) {
    const pair = rows.slice(index, index + 2);
    const heights = pair.map((row) => 16 + doc.font('Helvetica').fontSize(8).heightOfString(valueOrBlank(row.value), { width: width - 92, lineGap: 1.5 }));
    const rowHeight = Math.max(31, ...heights);
    currentY = ensureSpace(doc, currentY, rowHeight + 5, meta);

    pair.forEach((row, pairIndex) => {
      const x = PAGE.margin + (pairIndex * (width + gap));
      doc.roundedRect(x, currentY, width, rowHeight, 4).fillAndStroke('#FFFFFF', BRAND.line);
      doc.fillColor(BRAND.muted).font('Helvetica-Bold').fontSize(6.5).text(row.label.toUpperCase(), x + 10, currentY + 11, { width: 72, characterSpacing: 0.2 });
      doc.fillColor(BRAND.ink).font('Helvetica').fontSize(8).text(valueOrBlank(row.value), x + 84, currentY + 10, { width: width - 94, lineGap: 1.5 });
    });
    currentY += rowHeight + 5;
  }
  return currentY + 4;
};

const ITEM_COLUMNS = [
  { key: 'index', label: '#', width: 28, align: 'left' },
  { key: 'description', label: 'Description', width: 216, align: 'left' },
  { key: 'quantity', label: 'Qty', width: 40, align: 'right' },
  { key: 'rate', label: 'Rate', width: 72, align: 'right' },
  { key: 'tax', label: 'Tax', width: 62, align: 'right' },
  { key: 'amount', label: 'Amount', width: 93, align: 'right' },
];

const drawItemsHeader = (doc, y) => {
  let x = PAGE.margin;
  doc.rect(PAGE.margin, y, 511, 28).fill(BRAND.ink);
  ITEM_COLUMNS.forEach((column) => {
    doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(7.5).text(column.label, x + 7, y + 10, { width: column.width - 14, align: column.align });
    x += column.width;
  });
  return y + 28;
};

const drawItemsTable = (doc, items, y, meta) => {
  let currentY = drawItemsHeader(doc, y);
  (items || []).forEach((item, index) => {
    const description = valueOrBlank(item.description) || 'Travel service';
    const descriptionHeight = doc.font('Helvetica').fontSize(8.5).heightOfString(description, { width: 202, lineGap: 2 });
    const rowHeight = Math.max(36, descriptionHeight + 16);
    if (currentY + rowHeight > PAGE.footerTop - 12) {
      doc.addPage();
      currentY = drawPageHeader(doc, meta, true);
      currentY = drawItemsHeader(doc, currentY);
    }

    const values = {
      index: String(index + 1),
      description,
      quantity: Number(item.quantity || 0).toFixed(2),
      rate: money(item.unit_price ?? item.rate),
      tax: item.tax_rate ? `${Number(item.tax_rate).toFixed(2)}%` : '-',
      amount: money(item.amount ?? (Number(item.quantity || 0) * Number(item.unit_price || item.rate || 0))),
    };
    doc.rect(PAGE.margin, currentY, 511, rowHeight).fillAndStroke(index % 2 ? '#F8FAFC' : '#FFFFFF', BRAND.line);
    let x = PAGE.margin;
    ITEM_COLUMNS.forEach((column) => {
      doc.fillColor(BRAND.ink).font(column.key === 'amount' ? 'Helvetica-Bold' : 'Helvetica').fontSize(column.key === 'amount' ? 8 : 8.5).text(values[column.key], x + 7, currentY + 11, { width: column.width - 14, align: column.align, lineGap: 2 });
      x += column.width;
    });
    currentY += rowHeight;
  });
  return currentY + 14;
};

const getTotalRows = (document, kind) => {
  const additional = kind === 'invoice' ? (document.additional_charges || []) : [];
  return [
    { label: 'Subtotal', value: money(document.subtotal_amount) },
    { label: 'Tax', value: money(document.tax_amount) },
    ...additional.map((charge) => ({ label: charge.label || 'Additional charge', value: money(charge.amount) })),
    ...(Number(document.discount_amount || 0) ? [{ label: 'Discount', value: `- ${money(document.discount_amount)}` }] : []),
    { label: 'Total', value: money(document.total_amount), total: true },
  ];
};

const drawTotalsBox = (doc, rows, y) => {
  const boxHeight = rows.length * 23;
  const x = 318;
  const width = 235;
  rows.forEach((row, index) => {
    const top = y + (index * 23);
    doc.rect(x, top, width, 23).fill(row.total ? BRAND.ink : (index % 2 ? '#F8FAFC' : BRAND.soft));
    doc.fillColor(row.total ? '#FFFFFF' : BRAND.muted).font(row.total ? 'Helvetica-Bold' : 'Helvetica').fontSize(row.total ? 9.5 : 8).text(row.label, x + 13, top + 7, { width: 95 });
    doc.fillColor(row.total ? BRAND.lime : BRAND.ink).font('Helvetica-Bold').text(row.value, x + 108, top + 7, { width: 114, align: 'right' });
  });
  return boxHeight;
};

const drawTotals = (doc, document, kind, y, meta) => {
  const rows = getTotalRows(document, kind);
  const boxHeight = rows.length * 23;
  let currentY = ensureSpace(doc, y, boxHeight + 16, meta);
  drawTotalsBox(doc, rows, currentY);
  currentY += boxHeight + 16;

  if (kind === 'quotation' && document.total_in_words) {
    const wordsHeight = doc.font('Helvetica').fontSize(8).heightOfString(document.total_in_words, { width: 280, lineGap: 2 });
    currentY = ensureSpace(doc, currentY, wordsHeight + 30, meta);
    doc.fillColor(BRAND.muted).font('Helvetica-Bold').fontSize(6.8).text('TOTAL IN WORDS', PAGE.margin, currentY, { characterSpacing: 0.4 });
    doc.fillColor(BRAND.ink).font('Helvetica').fontSize(8).text(document.total_in_words, PAGE.margin, currentY + 14, { width: 280, lineGap: 2 });
    currentY += wordsHeight + 18;
  }
  return currentY;
};

const drawClosingColumns = (doc, document, kind, y) => {
  const totalRows = getTotalRows(document, kind);
  const totalsHeight = totalRows.length * 23;
  const notes = [document.notes, document.terms].filter(Boolean).join('\n\n') || (kind === 'invoice'
    ? 'Thank you for choosing Velvet Pearl.'
    : 'This quotation is subject to availability and confirmation.');
  const leftWidth = 228;
  const notesHeight = doc.font('Helvetica').fontSize(7.5).heightOfString(notes, { width: leftWidth, lineGap: 2 });
  const words = kind === 'quotation' ? valueOrBlank(document.total_in_words) : '';
  const wordsHeight = words ? doc.heightOfString(words, { width: leftWidth, lineGap: 2 }) : 0;
  const leftHeight = (words ? wordsHeight + 27 : 0) + notesHeight + 24;
  const required = Math.max(totalsHeight, leftHeight);
  if (y + required > PAGE.footerTop - 8) return null;

  let leftY = y;
  if (words) {
    doc.fillColor(BRAND.muted).font('Helvetica-Bold').fontSize(6.5).text('TOTAL IN WORDS', PAGE.margin, leftY, { width: leftWidth, characterSpacing: 0.3 });
    doc.fillColor(BRAND.ink).font('Helvetica').fontSize(7.5).text(words, PAGE.margin, leftY + 13, { width: leftWidth, lineGap: 2 });
    leftY += wordsHeight + 27;
  }
  doc.fillColor(BRAND.blue).font('Helvetica-Bold').fontSize(6.5).text(kind === 'invoice' ? 'NOTES AND PAYMENT TERMS' : 'TERMS, INCLUSIONS AND NOTES', PAGE.margin, leftY, { width: leftWidth, characterSpacing: 0.3 });
  doc.fillColor(BRAND.muted).font('Helvetica').fontSize(7.5).text(notes, PAGE.margin, leftY + 13, { width: leftWidth, lineGap: 2 });
  drawTotalsBox(doc, totalRows, y);
  return y + required + 10;
};

const drawNotes = (doc, document, kind, y, meta) => {
  const text = [document.notes, document.terms].filter(Boolean).join('\n\n') || (kind === 'invoice'
    ? 'Thank you for choosing Velvet Pearl.'
    : 'This quotation is subject to availability and confirmation.');
  const textHeight = doc.font('Helvetica').fontSize(8).heightOfString(text, { width: 487, lineGap: 3 });
  let currentY = ensureSpace(doc, y, textHeight + 50, meta);
  currentY = drawSectionTitle(doc, kind === 'invoice' ? 'Notes and payment terms' : 'Terms, inclusions and notes', currentY);
  doc.roundedRect(PAGE.margin, currentY, 511, textHeight + 18, 4).fill(BRAND.soft);
  doc.fillColor(BRAND.muted).font('Helvetica').fontSize(8).text(text, PAGE.margin + 10, currentY + 9, { width: 491, lineGap: 3 });
  return currentY + textHeight + 30;
};

const addPageFooters = (doc, number) => {
  const range = doc.bufferedPageRange();
  for (let index = range.start; index < range.start + range.count; index += 1) {
    doc.switchToPage(index);
    doc.strokeColor(BRAND.line).lineWidth(0.6).moveTo(PAGE.margin, 780).lineTo(doc.page.width - PAGE.margin, 780).stroke();
    doc.fillColor(BRAND.muted).font('Helvetica').fontSize(7).text(`${BRAND.website}  |  ${BRAND.phone}  |  ${BRAND.email}`, PAGE.margin, 790, { width: 390, lineBreak: false });
    doc.fillColor(BRAND.ink).font('Helvetica-Bold').text(`${number}  |  Page ${index - range.start + 1} of ${range.count}`, 420, 790, { width: 133, align: 'right', lineBreak: false });
  }
};

const buildPdf = (document, kind, filePath) => {
  const isInvoice = kind === 'invoice';
  const meta = {
    title: isInvoice ? 'INVOICE' : 'QUOTATION',
    number: isInvoice ? document.invoice_number : document.quote_number,
    dateLabel: isInvoice ? 'Invoice date' : 'Quote date',
    dateValue: isInvoice ? document.invoice_date : document.quote_date,
  };
  const customer = {
    name: isInvoice ? document.customer_name : document.client_name,
    phone: isInvoice ? document.customer_phone : document.client_phone,
    email: isInvoice ? document.customer_email : document.client_email,
    address: isInvoice ? document.customer_address : document.client_address,
  };
  const doc = new PDFDocument({ size: 'A4', margin: PAGE.margin, bufferPages: true, info: { Title: `${meta.number} - ${BRAND.name}`, Author: BRAND.name } });
  let y = drawPageHeader(doc, meta);
  y = drawPartyCards(doc, customer, meta, y);
  y = drawMetaStrip(doc, isInvoice ? [
    { label: 'Service', value: getServiceLabel(document.service_type) },
    { label: 'Booking reference', value: document.booking_reference || document.enquiry_id || '-' },
    { label: 'Due date', value: formatDate(document.due_date) },
    { label: 'Payment', value: prettify(document.payment_status || 'unpaid') },
  ] : [
    { label: 'Service', value: getServiceLabel(document.service_type) },
    { label: 'Subject', value: document.subject || 'Travel service quotation' },
    { label: 'Valid until', value: formatDate(document.valid_until) },
    { label: 'Status', value: prettify(document.status || 'draft') },
  ], y);

  y = ensureSpace(doc, y, 80, meta);
  y = drawSectionTitle(doc, 'Service details', y);
  y = drawKeyValueGrid(doc, getServiceRows(document, kind), y, meta);
  y = ensureSpace(doc, y, 74, meta);
  y = drawSectionTitle(doc, isInvoice ? 'Charges' : 'Proposed charges', y);
  y = drawItemsTable(doc, document.items, y, meta);
  const compactClosingY = drawClosingColumns(doc, document, kind, y);
  if (compactClosingY === null) {
    y = drawTotals(doc, document, kind, y, meta);
    drawNotes(doc, document, kind, y, meta);
  }
  addPageFooters(doc, meta.number);
  return writePdf(doc, filePath);
};

const renderInvoicePdfFile = async (invoice, filePath) => buildPdf(invoice, 'invoice', filePath);
const renderQuotationPdfFile = async (quotation, filePath) => buildPdf(quotation, 'quotation', filePath);

const buildPublicUrl = (publicBaseUrl, token) => {
  if (!publicBaseUrl || !token) return null;
  return `${String(publicBaseUrl).replace(/\/$/, '')}/api/documents/${token}`;
};

const persistGeneratedDocument = async ({ documentType, documentId, documentNumber, fileName, filePath, generatedBy, publicBaseUrl }) => {
  const GeneratedDocument = require('../models/generatedDocumentModel');
  const stat = fs.statSync(filePath);
  const generatedDocument = await GeneratedDocument.create({ documentType, documentId, documentNumber, fileName, filePath, fileSize: stat.size, generatedBy });
  return { ...generatedDocument, public_url: buildPublicUrl(publicBaseUrl, generatedDocument?.public_token) };
};

const generateInvoicePdf = async (invoice, { generatedBy = null, publicBaseUrl = '' } = {}) => {
  ensureDocumentDir();
  const fileName = `${cleanFilePart(invoice.invoice_number)}.pdf`;
  const filePath = path.join(DOCUMENT_DIR, fileName);
  await renderInvoicePdfFile(invoice, filePath);
  return persistGeneratedDocument({ documentType: 'invoice', documentId: invoice.id, documentNumber: invoice.invoice_number, fileName, filePath, generatedBy, publicBaseUrl });
};

const generateQuotationPdf = async (quotation, { generatedBy = null, publicBaseUrl = '' } = {}) => {
  ensureDocumentDir();
  const fileName = `${cleanFilePart(quotation.quote_number)}.pdf`;
  const filePath = path.join(DOCUMENT_DIR, fileName);
  await renderQuotationPdfFile(quotation, filePath);
  return persistGeneratedDocument({ documentType: 'quotation', documentId: quotation.id, documentNumber: quotation.quote_number, fileName, filePath, generatedBy, publicBaseUrl });
};

module.exports = {
  generateInvoicePdf,
  generateQuotationPdf,
  renderInvoicePdfFile,
  renderQuotationPdfFile,
};
