const db = require('../config/db');

const DocumentDeliveryLog = {
  create: async ({
    documentType,
    documentId,
    documentNumber,
    deliveryMethod,
    recipient = null,
    status,
    message = null,
    metadata = {},
    performedBy = null,
  }) => {
    await db.query(
      `
        INSERT INTO document_delivery_logs (
          document_type,
          document_id,
          document_number,
          delivery_method,
          recipient,
          status,
          message,
          metadata_json,
          performed_by
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        documentType,
        documentId,
        documentNumber,
        deliveryMethod,
        recipient,
        status,
        message,
        metadata,
        performedBy,
      ]
    );
  },

  listForDocument: async (documentType, documentId) => {
    const { rows } = await db.query(
      `
        SELECT *
        FROM document_delivery_logs
        WHERE document_type = ?
          AND document_id = ?
        ORDER BY created_at DESC, id DESC
      `,
      [documentType, documentId]
    );

    return rows;
  },
};

module.exports = DocumentDeliveryLog;
