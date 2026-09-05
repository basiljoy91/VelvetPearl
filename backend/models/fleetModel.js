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
      const { 
        id, model, plate, type, status, lastService, photo, age, fuel_status, next_service, condition, notes,
        insurance_provider, insurance_policy, insurance_start, insurance_expiry, insurance_status, insurance_doc
      } = fleetData;
      
      const query = `
        INSERT INTO fleet (
          id, model, plate, type, status, \`lastService\`, photo, age, fuel_status, next_service, \`condition\`, notes,
          insurance_provider, insurance_policy, insurance_start, insurance_expiry, insurance_status, insurance_doc
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      `;
      const result = await db.query(query, [
        id, model, plate, type, status, lastService, photo, age, fuel_status, next_service, condition, notes,
        insurance_provider, insurance_policy, insurance_start, insurance_expiry, insurance_status, insurance_doc
      ]);
      return result;
    } catch (error) {
      throw error;
    }
  },

  update: async (id, fleetData) => {
    try {
      const { 
        model, plate, type, status, lastService, photo, age, fuel_status, next_service, condition, notes,
        insurance_provider, insurance_policy, insurance_start, insurance_expiry, insurance_status, insurance_doc
      } = fleetData;
      
      const query = `
        UPDATE fleet
        SET 
          model = $1, plate = $2, type = $3, status = $4, \`lastService\` = $5, photo = $6, age = $7, fuel_status = $8, next_service = $9, \`condition\` = $10, notes = $11,
          insurance_provider = $12, insurance_policy = $13, insurance_start = $14, insurance_expiry = $15, insurance_status = $16, insurance_doc = $17
        WHERE id = $18
      `;
      const result = await db.query(query, [
        model, plate, type, status, lastService, photo, age, fuel_status, next_service, condition, notes,
        insurance_provider, insurance_policy, insurance_start, insurance_expiry, insurance_status, insurance_doc,
        id
      ]);
      return result;
    } catch (error) {
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const result = await db.query('DELETE FROM fleet WHERE id = $1', [id]);
      return result;
    } catch (error) {
      throw error;
    }
  }
};

module.exports = Fleet;
