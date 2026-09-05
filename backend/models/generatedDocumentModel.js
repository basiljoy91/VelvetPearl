const crypto = require('crypto');
const db = require('../config/db');

const serializeGeneratedDocument = (row = {}) => ({
  id: row.id,
  document_type: row.document_type,
  document_id: row.document_id,
  document_number: row.document_number,
  file_name: row.file_name,
  file_path: row.file_path,
  mime_type: row.mime_type,
  file_size: row.file_size,
  public_token: row.public_token,
  public_url: row.public_url,
  generated_by: row.generated_by,
  created_at: row.created_at,
});

const GeneratedDocument = {
  serialize: serializeGeneratedDocument,

  create: async ({
    documentType,
    documentId,
    documentNumber,
    fileName,
    filePath,
    mimeType = 'application/pdf',
    fileSize = null,
    publicUrl = null,
    generatedBy = null,
  }) => {
    const publicToken = crypto.randomBytes(24).toString('hex');
    const result = await db.query(
      `
        INSERT INTO generated_documents (
          document_type,
          document_id,
          document_number,
          file_name,
          file_path,
          mime_type,
          file_size,
          public_token,
          public_url,
          generated_by
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        documentType,
        documentId,
        documentNumber,
        fileName,
        filePath,
        mimeType,
        fileSize,
        publicToken,
        publicUrl,
        generatedBy,
      ]
    );

    const { rows } = await db.query('SELECT * FROM generated_documents WHERE id = ?', [result.insertId]);
    return rows[0] ? serializeGeneratedDocument(rows[0]) : null;
  },

  getLatest: async (documentType, documentId) => {
    const { rows } = await db.query(
      `
        SELECT *
        FROM generated_documents
        WHERE document_type = ?
          AND document_id = ?
        ORDER BY created_at DESC, id DESC
        LIMIT 1
      `,
      [documentType, documentId]
    );

    return rows[0] ? serializeGeneratedDocument(rows[0]) : null;
  },

  getByToken: async (token) => {
    const { rows } = await db.query(
      'SELECT * FROM generated_documents WHERE public_token = ? LIMIT 1',
      [token]
    );

    return rows[0] ? serializeGeneratedDocument(rows[0]) : null;
  },
};

module.exports = GeneratedDocument;
