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
      const { id, model, plate, type, status, lastService, photo, age, fuel_status, next_service, condition, notes } = fleetData;
      const query = `
        INSERT INTO fleet (id, model, plate, type, status, "lastService", photo, age, fuel_status, next_service, condition, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `;
      const result = await db.query(query, [id, model, plate, type, status, lastService, photo, age, fuel_status, next_service, condition, notes]);
      return result;
    } catch (error) {
      throw error;
    }
  }
};

module.exports = Fleet;
