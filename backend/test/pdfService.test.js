const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { renderInvoicePdfFile, renderQuotationPdfFile } = require('../services/pdfService');

const customer = {
  customer_name: 'Basil Joy',
  customer_phone: '+91 79045 39353',
  customer_email: 'guest@example.com',
  customer_address: 'Chennai, Tamil Nadu, India',
};

const items = [
  { description: 'Premium travel service', quantity: 1, unit_price: 4500, tax_rate: 5, amount: 4500 },
];

test('renders branded invoice and quotation PDF files without database access', async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'velvet-pearl-pdf-'));
  const invoicePath = path.join(directory, 'invoice.pdf');
  const quotationPath = path.join(directory, 'quotation.pdf');

  try {
    await renderInvoicePdfFile({
      ...customer,
      invoice_number: 'INV-TEST-00001',
      invoice_date: '2026-09-07',
      due_date: '2026-09-14',
      service_type: 'room',
      booking_reference: 'VP-STAY-101',
      service_details_json: {
        property_name: 'Velvet Pearl Partner Resort',
        destination: 'Ooty',
        check_in: '2026-10-02',
        check_out: '2026-10-05',
        guests: 2,
        room_count: 1,
        room_type: 'Deluxe valley room',
      },
      trip_details: 'Three-night stay with breakfast and private arrival transfer.',
      items,
      subtotal_amount: 4500,
      tax_amount: 225,
      discount_amount: 100,
      total_amount: 4625,
      payment_status: 'pending',
      status: 'draft',
      terms: 'Subject to property confirmation and the cancellation policy shared with the guest.',
    }, invoicePath);

    await renderQuotationPdfFile({
      client_name: customer.customer_name,
      client_phone: customer.customer_phone,
      client_email: customer.customer_email,
      client_address: customer.customer_address,
      quote_number: 'QTN-TEST-00001',
      quote_date: '2026-09-07',
      valid_until: '2026-09-14',
      service_type: 'tour',
      subject: 'Ooty weekend tour proposal',
      service_details_json: {
        package_name: 'Ooty Weekend Escape',
        destination: 'Ooty and Coonoor',
        start_date: '2026-10-02',
        end_date: '2026-10-05',
        travellers: 2,
        duration: '4 days / 3 nights',
      },
      service_summary: 'Private transport, accommodation, sightseeing, and travel coordination.',
      items,
      subtotal_amount: 4500,
      tax_amount: 225,
      discount_amount: 100,
      total_amount: 4625,
      total_in_words: 'Indian Rupee Four Thousand Six Hundred Twenty Five Only',
      status: 'draft',
      terms: 'Rates are subject to availability until the quotation is accepted.',
    }, quotationPath);

    for (const filePath of [invoicePath, quotationPath]) {
      const buffer = fs.readFileSync(filePath);
      assert.equal(buffer.subarray(0, 4).toString(), '%PDF');
      assert.ok(buffer.length > 5000);
    }
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
