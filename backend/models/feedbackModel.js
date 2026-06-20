const db = require('../config/db');

const baseSelect = `
  SELECT
    id,
    customer_name,
    location,
    rating,
    message,
    status,
    admin_notes,
    submitted_at,
    reviewed_at,
    updated_at
  FROM feedback
`;

const Feedback = {
  create: async ({ customer_name, location, rating, message }) => {
    const { rows } = await db.query(
      `
        INSERT INTO feedback (customer_name, location, rating, message)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `,
      [customer_name, location || null, rating, message]
    );

    return rows[0];
  },

  getPublicApproved: async () => {
    const { rows } = await db.query(
      `
        ${baseSelect}
        WHERE status = 'accepted'
        ORDER BY reviewed_at DESC NULLS LAST, submitted_at DESC
        LIMIT 24
      `
    );

    return rows;
  },

  getAll: async () => {
    const { rows } = await db.query(
      `
        ${baseSelect}
        ORDER BY
          CASE status
            WHEN 'pending' THEN 1
            WHEN 'accepted' THEN 2
            ELSE 3
          END,
          submitted_at DESC
      `
    );

    return rows;
  },

  updateStatus: async (id, status, adminNotes = null) => {
    const { rows } = await db.query(
      `
        UPDATE feedback
        SET status = $1,
            admin_notes = $2,
            reviewed_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING *
      `,
      [status, adminNotes || null, id]
    );

    return rows[0] || null;
  },

  deleteById: async (id) => {
    const { rows } = await db.query(
      `
        DELETE FROM feedback
        WHERE id = $1
        RETURNING *
      `,
      [id]
    );

    return rows[0] || null;
  },
};

module.exports = Feedback;
