const db = require('../config/db');
const GeneratedDocument = require('./generatedDocumentModel');
const DocumentDeliveryLog = require('./documentDeliveryLogModel');
const { nextDocumentNumber } = require('../services/documentNumberService');
const { calculateDocumentTotals } = require('../utils/documentMath');

const INVOICE_STATUSES = ['draft', 'sent', 'paid', 'cancelled'];
const PAYMENT_STATUSES = ['unpaid', 'partial', 'paid', 'refunded'];

const parseJson = (value, fallback = null) => {
  if (!value) return fallback;
  if (typeof value === 'object') return value;

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const todayIso = () => new Date().toISOString().slice(0, 10);
const emptyToNull = (value) => (value === undefined || value === '' ? null : value);
const validStatus = (value, fallback, allowed) => (allowed.includes(value) ? value : fallback);

const serializeInvoice = (row = {}, items = [], deliveryLogs = [], generatedDocument = null) => ({
  id: row.id,
  invoice_number: row.invoice_number,
  enquiry_id: row.enquiry_id,
  status: row.status,
  invoice_date: row.invoice_date,
  due_date: row.due_date,
  customer_name: row.customer_name,
  customer_phone: row.customer_phone,
  customer_email: row.customer_email,
  customer_address: row.customer_address,
  booking_reference: row.booking_reference,
  pickup: row.pickup,
  dropoff: row.dropoff,
  trip_details: row.trip_details,
  vehicle_details: row.vehicle_details,
  driver_details: row.driver_details,
  service_details_json: parseJson(row.service_details_json, {}),
  tax_rows: parseJson(row.tax_rows_json, []),
  discount_amount: Number(row.discount_amount || 0),
  additional_charges: parseJson(row.additional_charges_json, []),
  subtotal_amount: Number(row.subtotal_amount || 0),
  tax_amount: Number(row.tax_amount || 0),
  total_amount: Number(row.total_amount || 0),
  payment_status: row.payment_status,
  notes: row.notes,
  terms: row.terms,
  created_by: row.created_by,
  created_at: row.created_at,
  updated_at: row.updated_at,
  items,
  delivery_logs: deliveryLogs,
  generated_document: generatedDocument,
});

const serializeItem = (row = {}) => ({
  id: row.id,
  invoice_id: row.invoice_id,
  description: row.description,
  quantity: Number(row.quantity || 0),
  unit_price: Number(row.unit_price || 0),
  rate: Number(row.unit_price || 0),
  tax_rate: Number(row.tax_rate || 0),
  tax_amount: Number(row.tax_amount || 0),
  amount: Number(row.amount || 0),
  sort_order: Number(row.sort_order || 0),
});

const insertItems = async (client, invoiceId, items) => {
  for (const item of items) {
    await client.query(
      `
        INSERT INTO invoice_items (
          invoice_id,
          description,
          quantity,
          unit_price,
          tax_rate,
          tax_amount,
          amount,
          sort_order
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        invoiceId,
        item.description,
        item.quantity,
        item.unit_price,
        item.tax_rate,
        item.tax_amount,
        item.amount,
        item.sort_order,
      ]
    );
  }
};

const buildInvoicePayload = (payload = {}) => {
  const totals = calculateDocumentTotals({
    items: payload.items,
    taxRows: payload.tax_rows,
    discountAmount: payload.discount_amount,
    additionalCharges: payload.additional_charges,
  });

  return {
    ...payload,
    status: validStatus(payload.status, 'draft', INVOICE_STATUSES),
    payment_status: validStatus(payload.payment_status, 'unpaid', PAYMENT_STATUSES),
    invoice_date: payload.invoice_date || todayIso(),
    due_date: emptyToNull(payload.due_date),
    customer_name: String(payload.customer_name || 'Customer').trim(),
    customer_phone: emptyToNull(payload.customer_phone),
    customer_email: emptyToNull(payload.customer_email),
    customer_address: emptyToNull(payload.customer_address),
    booking_reference: emptyToNull(payload.booking_reference),
    pickup: emptyToNull(payload.pickup),
    dropoff: emptyToNull(payload.dropoff),
    trip_details: emptyToNull(payload.trip_details),
    vehicle_details: emptyToNull(payload.vehicle_details),
    driver_details: emptyToNull(payload.driver_details),
    service_details_json: payload.service_details_json || {},
    tax_rows_json: totals.tax_rows,
    discount_amount: totals.discount_amount,
    additional_charges_json: totals.additional_charges,
    subtotal_amount: totals.subtotal_amount,
    tax_amount: totals.tax_amount,
    total_amount: totals.total_amount,
    notes: emptyToNull(payload.notes),
    terms: emptyToNull(payload.terms),
    items: totals.items,
  };
};

const Invoice = {
  statuses: INVOICE_STATUSES,
  serialize: serializeInvoice,

  list: async (filters = {}) => {
    const clauses = [];
    const values = [];

    if (filters.status && filters.status !== 'all') {
      clauses.push('status = ?');
      values.push(filters.status);
    }

    if (filters.search) {
      clauses.push("(LOWER(invoice_number) LIKE ? OR LOWER(customer_name) LIKE ? OR LOWER(COALESCE(booking_reference, '')) LIKE ?)");
      const search = `%${String(filters.search).toLowerCase()}%`;
      values.push(search, search, search);
    }

    const { rows } = await db.query(
      `
        SELECT *
        FROM invoices
        ${clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''}
        ORDER BY invoice_date DESC, id DESC
      `,
      values
    );

    return rows.map((row) => serializeInvoice(row));
  },

  getById: async (id) => {
    const { rows } = await db.query('SELECT * FROM invoices WHERE id = ?', [id]);
    if (!rows[0]) return null;

    const { rows: itemRows } = await db.query(
      'SELECT * FROM invoice_items WHERE invoice_id = ? ORDER BY sort_order ASC, id ASC',
      [id]
    );
    const deliveryLogs = await DocumentDeliveryLog.listForDocument('invoice', id);
    const generatedDocument = await GeneratedDocument.getLatest('invoice', id);
    return serializeInvoice(rows[0], itemRows.map(serializeItem), deliveryLogs, generatedDocument);
  },

  create: async (payload = {}, createdBy = null) => {
    const client = await db.connect();

    try {
      await client.beginTransaction();
      const invoiceNumber = payload.invoice_number || await nextDocumentNumber(client, 'invoice', 'INV');
      const invoice = buildInvoicePayload(payload);
      const result = await client.query(
        `
          INSERT INTO invoices (
            invoice_number,
            enquiry_id,
            status,
            invoice_date,
            due_date,
            customer_name,
            customer_phone,
            customer_email,
            customer_address,
            booking_reference,
            pickup,
            dropoff,
            trip_details,
            vehicle_details,
            driver_details,
            service_details_json,
            tax_rows_json,
            discount_amount,
            additional_charges_json,
            subtotal_amount,
            tax_amount,
            total_amount,
            payment_status,
            notes,
            terms,
            created_by
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          invoiceNumber,
          emptyToNull(invoice.enquiry_id),
          invoice.status,
          invoice.invoice_date,
          invoice.due_date,
          invoice.customer_name,
          invoice.customer_phone,
          invoice.customer_email,
          invoice.customer_address,
          invoice.booking_reference,
          invoice.pickup,
          invoice.dropoff,
          invoice.trip_details,
          invoice.vehicle_details,
          invoice.driver_details,
          invoice.service_details_json,
          invoice.tax_rows_json,
          invoice.discount_amount,
          invoice.additional_charges_json,
          invoice.subtotal_amount,
          invoice.tax_amount,
          invoice.total_amount,
          invoice.payment_status,
          invoice.notes,
          invoice.terms,
          createdBy,
        ]
      );

      await insertItems(client, result.insertId, invoice.items);
      await client.commit();
      return Invoice.getById(result.insertId);
    } catch (error) {
      await client.rollback();
      throw error;
    } finally {
      client.release();
    }
  },

  update: async (id, payload = {}) => {
    const current = await Invoice.getById(id);
    if (!current) return null;

    const client = await db.connect();

    try {
      await client.beginTransaction();
      const invoice = buildInvoicePayload({
        ...current,
        ...payload,
        items: payload.items || current.items,
        tax_rows: payload.tax_rows || current.tax_rows,
        additional_charges: payload.additional_charges || current.additional_charges,
      });

      await client.query(
        `
          UPDATE invoices
          SET
            invoice_number = ?,
            enquiry_id = ?,
            status = ?,
            invoice_date = ?,
            due_date = ?,
            customer_name = ?,
            customer_phone = ?,
            customer_email = ?,
            customer_address = ?,
            booking_reference = ?,
            pickup = ?,
            dropoff = ?,
            trip_details = ?,
            vehicle_details = ?,
            driver_details = ?,
            service_details_json = ?,
            tax_rows_json = ?,
            discount_amount = ?,
            additional_charges_json = ?,
            subtotal_amount = ?,
            tax_amount = ?,
            total_amount = ?,
            payment_status = ?,
            notes = ?,
            terms = ?
          WHERE id = ?
        `,
        [
          invoice.invoice_number || current.invoice_number,
          emptyToNull(invoice.enquiry_id),
          invoice.status,
          invoice.invoice_date,
          invoice.due_date,
          invoice.customer_name,
          invoice.customer_phone,
          invoice.customer_email,
          invoice.customer_address,
          invoice.booking_reference,
          invoice.pickup,
          invoice.dropoff,
          invoice.trip_details,
          invoice.vehicle_details,
          invoice.driver_details,
          invoice.service_details_json,
          invoice.tax_rows_json,
          invoice.discount_amount,
          invoice.additional_charges_json,
          invoice.subtotal_amount,
          invoice.tax_amount,
          invoice.total_amount,
          invoice.payment_status,
          invoice.notes,
          invoice.terms,
          id,
        ]
      );

      await client.query('DELETE FROM invoice_items WHERE invoice_id = ?', [id]);
      await insertItems(client, id, invoice.items);
      await client.commit();
      return Invoice.getById(id);
    } catch (error) {
      await client.rollback();
      throw error;
    } finally {
      client.release();
    }
  },

  duplicate: async (id, createdBy = null) => {
    const current = await Invoice.getById(id);
    if (!current) return null;

    return Invoice.create({
      ...current,
      id: undefined,
      invoice_number: undefined,
      status: 'draft',
      payment_status: 'unpaid',
      notes: current.notes ? `Duplicated from ${current.invoice_number}\n\n${current.notes}` : `Duplicated from ${current.invoice_number}`,
    }, createdBy);
  },

  cancel: async (id) => {
    const result = await db.query('UPDATE invoices SET status = ? WHERE id = ?', ['cancelled', id]);
    return result.rowCount;
  },
};

module.exports = Invoice;
