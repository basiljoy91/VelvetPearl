const nextDocumentNumber = async (client, documentType, prefix) => {
  const documentYear = new Date().getFullYear();

  await client.query(
    `
      INSERT INTO document_counters (document_type, document_year, last_number)
      VALUES (?, ?, LAST_INSERT_ID(1))
      ON DUPLICATE KEY UPDATE last_number = LAST_INSERT_ID(last_number + 1)
    `,
    [documentType, documentYear]
  );

  const { rows } = await client.query('SELECT LAST_INSERT_ID() AS next_number');
  const nextNumber = Number(rows[0]?.next_number || 1);
  return `${prefix}-${documentYear}-${String(nextNumber).padStart(5, '0')}`;
};

module.exports = {
  nextDocumentNumber,
};
