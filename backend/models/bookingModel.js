const db = require('../config/db');

const Booking = {
  // Get all bookings
  getAll: async () => {
    try {
      const { rows } = await db.query('SELECT * FROM bookings ORDER BY created_at DESC');
      return rows;
    } catch (error) {
      throw error;
    }
  },

  // Get a single booking by ID
  getById: async (id) => {
    try {
      const { rows } = await db.query('SELECT * FROM bookings WHERE id = $1', [id]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  },

  // Create a new booking
  create: async (bookingData) => {
    try {
      const { id, customer, phone, service, details, schedule } = bookingData;
      const query = `
        INSERT INTO bookings (id, customer, phone, service, details, schedule, status, amount)
        VALUES ($1, $2, $3, $4, $5, $6, 'Pending', 'TBD')
      `;
      const result = await db.query(query, [id, customer, phone, service, details, schedule]);
      return result;
    } catch (error) {
      throw error;
    }
  },

  // Update booking status
  updateStatus: async (id, status) => {
    try {
      const result = await db.query('UPDATE bookings SET status = $1 WHERE id = $2', [status, id]);
      return result;
    } catch (error) {
      throw error;
    }
  },

  // Delete booking
  delete: async (id) => {
    try {
      const result = await db.query('DELETE FROM bookings WHERE id = $1', [id]);
      return result;
    } catch (error) {
      throw error;
    }
  },

  // Assign a driver to a booking
  assignDriver: async (id, driverId, driverName) => {
    try {
      const query = `
        UPDATE bookings 
        SET driver_id = $1, driver_name = $2 
        WHERE id = $3
      `;
      const result = await db.query(query, [driverId, driverName, id]);
      return result;
    } catch (error) {
      throw error;
    }
  }
};

module.exports = Booking;
