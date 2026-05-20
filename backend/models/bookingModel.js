const db = require('../config/db');

const Booking = {
  // Get all bookings
  getAll: async () => {
    try {
      const [rows] = await db.execute('SELECT * FROM bookings ORDER BY created_at DESC');
      return rows;
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
        VALUES (?, ?, ?, ?, ?, ?, 'Pending', 'TBD')
      `;
      const [result] = await db.execute(query, [id, customer, phone, service, details, schedule]);
      return result;
    } catch (error) {
      throw error;
    }
  },

  // Update booking status
  updateStatus: async (id, status) => {
    try {
      const [result] = await db.execute('UPDATE bookings SET status = ? WHERE id = ?', [status, id]);
      return result;
    } catch (error) {
      throw error;
    }
  },

  // Delete booking
  delete: async (id) => {
    try {
      const [result] = await db.execute('DELETE FROM bookings WHERE id = ?', [id]);
      return result;
    } catch (error) {
      throw error;
    }
  }
};

module.exports = Booking;
