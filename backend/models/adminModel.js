const db = require('../config/db');

const Admin = {
  // Find an admin by ID
  findById: async (id) => {
    try {
      const [rows] = await db.execute('SELECT * FROM admins WHERE id = ?', [id]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  },
  // Find an admin by email
  findByEmail: async (email) => {
    try {
      const [rows] = await db.execute('SELECT * FROM admins WHERE email = ?', [email]);
      return rows[0]; // Return the first match if exists
    } catch (error) {
      throw error;
    }
  },

  // Count total admins
  countAdmins: async () => {
    try {
      const [rows] = await db.execute('SELECT COUNT(*) as count FROM admins');
      return rows[0].count;
    } catch (error) {
      throw error;
    }
  },

  // Create an admin
  create: async (email, hashedPassword) => {
    try {
      const [result] = await db.execute('INSERT INTO admins (email, password) VALUES (?, ?)', [email, hashedPassword]);
      return result.insertId;
    } catch (error) {
      throw error;
    }
  },

  // Save reset token
  saveResetToken: async (email, tokenHash, expiry) => {
    try {
      await db.execute('UPDATE admins SET reset_token = ?, reset_token_expiry = ? WHERE email = ?', [tokenHash, expiry, email]);
    } catch (error) {
      throw error;
    }
  },

  // Find by valid reset token
  findByResetToken: async (tokenHash) => {
    try {
      const [rows] = await db.execute('SELECT * FROM admins WHERE reset_token = ? AND reset_token_expiry > NOW()', [tokenHash]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  },

  // Update password and clear token
  updatePassword: async (adminId, newHashedPassword) => {
    try {
      await db.execute('UPDATE admins SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?', [newHashedPassword, adminId]);
    } catch (error) {
      throw error;
    }
  }
};

module.exports = Admin;
