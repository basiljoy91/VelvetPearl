const db = require('../config/db');

const Driver = {
  getAll: async () => {
    try {
      const { rows } = await db.query('SELECT * FROM drivers ORDER BY created_at DESC');
      return rows;
    } catch (error) {
      throw error;
    }
  },

  create: async (driverData) => {
    try {
      const { id, name, phone, rating, experience, status } = driverData;
      const query = `
        INSERT INTO drivers (id, name, phone, rating, experience, status)
        VALUES ($1, $2, $3, $4, $5, $6)
      `;
      const result = await db.query(query, [id, name, phone, rating, experience, status]);
      return result;
    } catch (error) {
      throw error;
    }
  }
};

module.exports = Driver;
