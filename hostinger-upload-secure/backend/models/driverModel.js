const db = require('../config/db');

const Driver = {
  getAll: async () => {
    try {
      const { rows } = await db.query('SELECT * FROM drivers ORDER BY created_at DESC');
      return rows.map((row) => ({
        ...row,
        status: row.status === 'Inactive' ? 'Unavailable' : row.status,
      }));
    } catch (error) {
      throw error;
    }
  },

  create: async (driverData) => {
    try {
      const { 
        id, name, phone, rating, experience, status, 
        photo, licence_status, address, notes, assigned_vehicle, total_rides 
      } = driverData;
      
      const query = `
        INSERT INTO drivers (id, name, phone, rating, experience, status, photo, licence_status, address, notes, assigned_vehicle, total_rides)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `;
      const result = await db.query(query, [
        id, name, phone, rating, experience, status,
        photo || null,
        licence_status || 'Pending',
        address || null,
        notes || null,
        assigned_vehicle || null,
        total_rides || 0
      ]);
      return result;
    } catch (error) {
      throw error;
    }
  },

  update: async (id, driverData) => {
    try {
      const { 
        name, phone, rating, experience, status, 
        photo, licence_status, address, notes, assigned_vehicle, total_rides 
      } = driverData;
      
      const query = `
        UPDATE drivers 
        SET name = $1, phone = $2, rating = $3, experience = $4, status = $5, photo = $6, licence_status = $7, address = $8, notes = $9, assigned_vehicle = $10, total_rides = $11
        WHERE id = $12
      `;
      const result = await db.query(query, [
        name, phone, rating, experience, status,
        photo || null,
        licence_status || 'Pending',
        address || null,
        notes || null,
        assigned_vehicle || null,
        total_rides || 0,
        id
      ]);
      return result;
    } catch (error) {
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const result = await db.query('DELETE FROM drivers WHERE id = $1', [id]);
      return result;
    } catch (error) {
      throw error;
    }
  }
};

module.exports = Driver;
