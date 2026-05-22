const db = require('../config/db');

const Fleet = {
  getAll: async () => {
    try {
      const { rows } = await db.query('SELECT * FROM fleet ORDER BY created_at DESC');
      return rows;
    } catch (error) {
      throw error;
    }
  },

  create: async (fleetData) => {
    try {
      const { id, model, plate, type, status, lastService } = fleetData;
      const query = `
        INSERT INTO fleet (id, model, plate, type, status, "lastService")
        VALUES ($1, $2, $3, $4, $5, $6)
      `;
      const result = await db.query(query, [id, model, plate, type, status, lastService]);
      return result;
    } catch (error) {
      throw error;
    }
  }
};

module.exports = Fleet;
