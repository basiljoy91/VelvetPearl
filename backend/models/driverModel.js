const db = require('../config/db');

const Driver = {
  getAll: async () => {
    try {
      const [rows] = await db.execute('SELECT * FROM drivers ORDER BY created_at DESC');
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
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      const [result] = await db.execute(query, [id, name, phone, rating, experience, status]);
      return result;
    } catch (error) {
      throw error;
    }
  }
};

module.exports = Driver;
