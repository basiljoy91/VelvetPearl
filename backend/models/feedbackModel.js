const db = require('../config/db');
const {
  FEEDBACK_STATUS_OPTIONS,
  normalizeFeedbackStatus,
} = require('../utils/feedbackConfig');

const FEEDBACK_REFERENCE_PREFIX = 'FDBK';

const buildReferenceId = (year, sequence) => (
  `${FEEDBACK_REFERENCE_PREFIX}-${year}-${String(sequence).padStart(4, '0')}`
);

const buildAdminFilters = (filters = {}) => {
  const clauses = [];
  const values = [];
  let index = 1;

  if (filters.status && filters.status !== 'all') {
    clauses.push(`status = $${index++}`);
    values.push(normalizeFeedbackStatus(filters.status));
  }

  if (filters.featured === 'featured') {
    clauses.push(`featured = $${index++}`);
    values.push(true);
  }

  if (filters.featured === 'standard') {
    clauses.push(`featured = $${index++}`);
    values.push(false);
  }

  if (filters.search) {
    clauses.push(`(
      LOWER(reference_id) LIKE $${index}
      OR LOWER(customer_name) LIKE $${index}
      OR LOWER(display_name) LIKE $${index}
      OR LOWER(city) LIKE $${index}
      OR LOWER(display_city) LIKE $${index}
      OR LOWER(service_used) LIKE $${index}
      OR LOWER(display_service_used) LIKE $${index}
    )`);
    values.push(`%${String(filters.search).trim().toLowerCase()}%`);
    index += 1;
  }

  return {
    whereClause: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '',
    values,
  };
};

const sanitizeLimit = (value, fallback = 12, max = 24) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.min(Math.round(parsed), max);
};

const Feedback = {
  getPublic: async ({ limit } = {}) => {
    const normalizedLimit = sanitizeLimit(limit, 12, 24);
    const { rows } = await db.query(
      `
        SELECT
          id,
          reference_id,
          display_name AS customer_name,
          display_city AS city,
          display_service_used AS service_used,
          rating,
          display_message AS feedback_message,
          featured,
          approved_at,
          created_at
        FROM feedback_entries
        WHERE status = 'Approved'
        ORDER BY featured DESC, approved_at DESC, created_at DESC, id DESC
        LIMIT $1
      `,
      [normalizedLimit]
    );

    return rows;
  },

  getAll: async (filters = {}) => {
    const { whereClause, values } = buildAdminFilters(filters);
    const { rows } = await db.query(
      `
        SELECT *
        FROM feedback_entries
        ${whereClause}
        ORDER BY FIELD(status, 'Pending', 'Approved', 'Hidden', 'Declined'), featured DESC, created_at DESC, id DESC
      `,
      values
    );

    return rows;
  },

  getById: async (id) => {
    const { rows } = await db.query(
      'SELECT * FROM feedback_entries WHERE id = $1',
      [id]
    );

    return rows[0] || null;
  },

  create: async (feedbackData) => {
    const client = await db.connect();

    try {
      await client.beginTransaction();

      const year = new Date().getFullYear();

      await client.query(
        `
          INSERT INTO feedback_counters (feedback_year, last_number)
          VALUES ($1, LAST_INSERT_ID(1))
          ON DUPLICATE KEY UPDATE last_number = LAST_INSERT_ID(last_number + 1)
        `,
        [year]
      );

      const counterResult = await client.query('SELECT LAST_INSERT_ID() AS last_number');
      const sequence = Number(counterResult.rows[0]?.last_number || 1);
      const referenceId = buildReferenceId(year, sequence);

      const insertResult = await client.query(
        `
          INSERT INTO feedback_entries (
            reference_id,
            customer_name,
            display_name,
            city,
            display_city,
            service_used,
            display_service_used,
            rating,
            feedback_message,
            display_message,
            contact_number,
            email,
            trip_month,
            publish_consent,
            source_page,
            status,
            featured,
            admin_notes,
            approved_at,
            declined_at,
            approved_by_admin_id,
            last_reviewed_by_admin_id
          )
          VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
            $11, $12, $13, $14, $15, 'Pending', false, NULL, NULL, NULL, NULL, NULL
          )
        `,
        [
          referenceId,
          feedbackData.customer_name,
          feedbackData.display_name || feedbackData.customer_name,
          feedbackData.city,
          feedbackData.display_city || feedbackData.city,
          feedbackData.service_used,
          feedbackData.display_service_used || feedbackData.service_used,
          feedbackData.rating,
          feedbackData.feedback_message,
          feedbackData.display_message || feedbackData.feedback_message,
          feedbackData.contact_number || null,
          feedbackData.email || null,
          feedbackData.trip_month || null,
          feedbackData.publish_consent === true,
          feedbackData.source_page || 'feedback',
        ]
      );

      await client.commit();
      return Feedback.getById(insertResult.insertId);
    } catch (error) {
      await client.rollback();
      throw error;
    } finally {
      client.release();
    }
  },

  updateReview: async (id, changes = {}, adminId = null) => {
    const current = await Feedback.getById(id);
    if (!current) return null;

    const nextStatus = changes.status ? normalizeFeedbackStatus(changes.status) : current.status;
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    let approvedAt = current.approved_at;
    let declinedAt = current.declined_at;
    let approvedByAdminId = current.approved_by_admin_id;

    if (nextStatus === 'Approved' && current.status !== 'Approved') {
      approvedAt = now;
      declinedAt = null;
      approvedByAdminId = adminId || current.approved_by_admin_id || null;
    }

    if (nextStatus === 'Declined' && current.status !== 'Declined') {
      declinedAt = now;
      if (current.status !== 'Approved') {
        approvedAt = null;
        approvedByAdminId = null;
      }
    }

    if (nextStatus === 'Pending') {
      approvedAt = null;
      declinedAt = null;
      approvedByAdminId = null;
    }

    if (nextStatus === 'Hidden') {
      declinedAt = null;
    }

    await db.query(
      `
        UPDATE feedback_entries
        SET
          display_name = $1,
          display_city = $2,
          display_service_used = $3,
          display_message = $4,
          status = $5,
          featured = $6,
          admin_notes = $7,
          approved_at = $8,
          declined_at = $9,
          approved_by_admin_id = $10,
          last_reviewed_by_admin_id = $11,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $12
      `,
      [
        changes.display_name ?? current.display_name,
        changes.display_city ?? current.display_city,
        changes.display_service_used ?? current.display_service_used,
        changes.display_message ?? current.display_message,
        nextStatus,
        changes.featured ?? current.featured,
        changes.admin_notes ?? current.admin_notes,
        approvedAt,
        declinedAt,
        approvedByAdminId,
        adminId || current.last_reviewed_by_admin_id || null,
        id,
      ]
    );

    return Feedback.getById(id);
  },
};

module.exports = Feedback;
