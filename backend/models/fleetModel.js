const db = require('../config/db');

const Fleet = {
  getAll: async () => {
    try {
      const [rows] = await db.execute('SELECT * FROM fleet ORDER BY created_at DESC');
      return rows;
    } catch (error) {
      throw error;
    }
  },

  create: async (fleetData) => {
    try {
      const { id, model, plate, type, status, lastService } = fleetData;
      const query = `
        INSERT INTO fleet (id, model, plate, type, status, lastService)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      const [result] = await db.execute(query, [id, model, plate, type, status, lastService]);
      return result;
    } catch (error) {
      throw error;
    }
  }
};

module.exports = Fleet;
