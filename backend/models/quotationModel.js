const db = require('../config/db');
const GeneratedDocument = require('./generatedDocumentModel');
const DocumentDeliveryLog = require('./documentDeliveryLogModel');
const { nextDocumentNumber } = require('../services/documentNumberService');
const { calculateDocumentTotals, numberToIndianWords } = require('../utils/documentMath');

const QUOTATION_STATUSES = ['draft', 'sent', 'accepted', 'rejected', 'expired'];

const emptyToNull = (value) => (value === undefined || value === '' ? null : value);
const todayIso = () => new Date().toISOString().slice(0, 10);
const validStatus = (value, fallback) => (QUOTATION_STATUSES.includes(value) ? value : fallback);

const serializeItem = (row = {}) => ({
  id: row.id,
  quotation_id: row.quotation_id,
  description: row.description,
  quantity: Number(row.quantity || 0),
  unit_price: Number(row.unit_price || 0),
  rate: Number(row.unit_price || 0),
  tax_rate: Number(row.tax_rate || 0),
  tax_amount: Number(row.tax_amount || 0),
  amount: Number(row.amount || 0),
  sort_order: Number(row.sort_order || 0),
});

const serializeQuotation = (row = {}, items = [], deliveryLogs = [], generatedDocument = null) => ({
  id: row.id,
  quote_number: row.quote_number,
  enquiry_id: row.enquiry_id,
  status: row.status,
  quote_date: row.quote_date,
  valid_until: row.valid_until,
  client_name: row.client_name,
  client_phone: row.client_phone,
  client_email: row.client_email,
  client_address: row.client_address,
  subject: row.subject,
  pickup: row.pickup,
  dropoff: row.dropoff,
  service_summary: row.service_summary,
  vehicle_type: row.vehicle_type,
  subtotal_amount: Number(row.subtotal_amount || 0),
  tax_amount: Number(row.tax_amount || 0),
  discount_amount: Number(row.discount_amount || 0),
  total_amount: Number(row.total_amount || 0),
  total_in_words: row.total_in_words,
  terms: row.terms,
  notes: row.notes,
  created_by: row.created_by,
  created_at: row.created_at,
  updated_at: row.updated_at,
  items,
  delivery_logs: deliveryLogs,
  generated_document: generatedDocument,
});

const insertItems = async (client, quotationId, items) => {
  for (const item of items) {
    await client.query(
      `
        INSERT INTO quotation_items (
          quotation_id,
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
        quotationId,
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

const buildQuotationPayload = (payload = {}) => {
  const totals = calculateDocumentTotals({
    items: payload.items,
    discountAmount: payload.discount_amount,
  });

  return {
    ...payload,
    status: validStatus(payload.status, 'draft'),
    quote_date: payload.quote_date || todayIso(),
    valid_until: emptyToNull(payload.valid_until),
    client_name: String(payload.client_name || 'Client').trim(),
    client_phone: emptyToNull(payload.client_phone),
    client_email: emptyToNull(payload.client_email),
    client_address: emptyToNull(payload.client_address),
    subject: emptyToNull(payload.subject),
    pickup: emptyToNull(payload.pickup),
    dropoff: emptyToNull(payload.dropoff),
    service_summary: emptyToNull(payload.service_summary),
    vehicle_type: emptyToNull(payload.vehicle_type),
    subtotal_amount: totals.subtotal_amount,
    tax_amount: totals.tax_amount,
    discount_amount: totals.discount_amount,
    total_amount: totals.total_amount,
    total_in_words: payload.total_in_words || numberToIndianWords(totals.total_amount),
    terms: emptyToNull(payload.terms),
    notes: emptyToNull(payload.notes),
    items: totals.items,
  };
};

const Quotation = {
  statuses: QUOTATION_STATUSES,
  serialize: serializeQuotation,

  list: async (filters = {}) => {
    const clauses = [];
    const values = [];

    if (filters.status && filters.status !== 'all') {
      clauses.push('status = ?');
      values.push(filters.status);
    }

    if (filters.search) {
      clauses.push("(LOWER(quote_number) LIKE ? OR LOWER(client_name) LIKE ? OR LOWER(COALESCE(subject, '')) LIKE ?)");
      const search = `%${String(filters.search).toLowerCase()}%`;
      values.push(search, search, search);
    }

    const { rows } = await db.query(
      `
        SELECT *
        FROM quotations
        ${clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''}
        ORDER BY quote_date DESC, id DESC
      `,
      values
    );

    return rows.map((row) => serializeQuotation(row));
  },

  getById: async (id) => {
    const { rows } = await db.query('SELECT * FROM quotations WHERE id = ?', [id]);
    if (!rows[0]) return null;

    const { rows: itemRows } = await db.query(
      'SELECT * FROM quotation_items WHERE quotation_id = ? ORDER BY sort_order ASC, id ASC',
      [id]
    );
    const deliveryLogs = await DocumentDeliveryLog.listForDocument('quotation', id);
    const generatedDocument = await GeneratedDocument.getLatest('quotation', id);
    return serializeQuotation(rows[0], itemRows.map(serializeItem), deliveryLogs, generatedDocument);
  },

  create: async (payload = {}, createdBy = null) => {
    const client = await db.connect();

    try {
      await client.beginTransaction();
      const quoteNumber = payload.quote_number || await nextDocumentNumber(client, 'quotation', 'QT');
      const quotation = buildQuotationPayload(payload);
      const result = await client.query(
        `
          INSERT INTO quotations (
            quote_number,
            enquiry_id,
            status,
            quote_date,
            valid_until,
            client_name,
            client_phone,
            client_email,
            client_address,
            subject,
            pickup,
            dropoff,
            service_summary,
            vehicle_type,
            subtotal_amount,
            tax_amount,
            discount_amount,
            total_amount,
            total_in_words,
            terms,
            notes,
            created_by
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          quoteNumber,
          emptyToNull(quotation.enquiry_id),
          quotation.status,
          quotation.quote_date,
          quotation.valid_until,
          quotation.client_name,
          quotation.client_phone,
          quotation.client_email,
          quotation.client_address,
          quotation.subject,
          quotation.pickup,
          quotation.dropoff,
          quotation.service_summary,
          quotation.vehicle_type,
          quotation.subtotal_amount,
          quotation.tax_amount,
          quotation.discount_amount,
          quotation.total_amount,
          quotation.total_in_words,
          quotation.terms,
          quotation.notes,
          createdBy,
        ]
      );

      await insertItems(client, result.insertId, quotation.items);
      await client.commit();
      return Quotation.getById(result.insertId);
    } catch (error) {
      await client.rollback();
      throw error;
    } finally {
      client.release();
    }
  },

  update: async (id, payload = {}) => {
    const current = await Quotation.getById(id);
    if (!current) return null;

    const client = await db.connect();

    try {
      await client.beginTransaction();
      const quotation = buildQuotationPayload({ ...current, ...payload, items: payload.items || current.items });

      await client.query(
        `
          UPDATE quotations
          SET
            quote_number = ?,
            enquiry_id = ?,
            status = ?,
            quote_date = ?,
            valid_until = ?,
            client_name = ?,
            client_phone = ?,
            client_email = ?,
            client_address = ?,
            subject = ?,
            pickup = ?,
            dropoff = ?,
            service_summary = ?,
            vehicle_type = ?,
            subtotal_amount = ?,
            tax_amount = ?,
            discount_amount = ?,
            total_amount = ?,
            total_in_words = ?,
            terms = ?,
            notes = ?
          WHERE id = ?
        `,
        [
          quotation.quote_number || current.quote_number,
          emptyToNull(quotation.enquiry_id),
          quotation.status,
          quotation.quote_date,
          quotation.valid_until,
          quotation.client_name,
          quotation.client_phone,
          quotation.client_email,
          quotation.client_address,
          quotation.subject,
          quotation.pickup,
          quotation.dropoff,
          quotation.service_summary,
          quotation.vehicle_type,
          quotation.subtotal_amount,
          quotation.tax_amount,
          quotation.discount_amount,
          quotation.total_amount,
          quotation.total_in_words,
          quotation.terms,
          quotation.notes,
          id,
        ]
      );

      await client.query('DELETE FROM quotation_items WHERE quotation_id = ?', [id]);
      await insertItems(client, id, quotation.items);
      await client.commit();
      return Quotation.getById(id);
    } catch (error) {
      await client.rollback();
      throw error;
    } finally {
      client.release();
    }
  },

  duplicate: async (id, createdBy = null) => {
    const current = await Quotation.getById(id);
    if (!current) return null;

    return Quotation.create({
      ...current,
      id: undefined,
      quote_number: undefined,
      status: 'draft',
      notes: current.notes ? `Duplicated from ${current.quote_number}\n\n${current.notes}` : `Duplicated from ${current.quote_number}`,
    }, createdBy);
  },

  updateStatus: async (id, status) => {
    if (!QUOTATION_STATUSES.includes(status)) return 0;
    const result = await db.query('UPDATE quotations SET status = ? WHERE id = ?', [status, id]);
    return result.rowCount;
  },
};

module.exports = Quotation;
