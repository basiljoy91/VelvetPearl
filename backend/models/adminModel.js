const db = require('../config/db');

const Admin = {
  // Find an admin by ID
  findById: async (id) => {
    try {
      const { rows } = await db.query('SELECT * FROM admins WHERE id = $1', [id]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  },
  // Find an admin by email
  findByEmail: async (email) => {
    try {
      const { rows } = await db.query('SELECT * FROM admins WHERE email = $1', [email]);
      return rows[0]; // Return the first match if exists
    } catch (error) {
      throw error;
    }
  },

  // Count total admins
  countAdmins: async () => {
    try {
      const { rows } = await db.query('SELECT COUNT(*)::int AS count FROM admins');
      return rows[0].count;
    } catch (error) {
      throw error;
    }
  },

  // Create an admin
  create: async (email, hashedPassword) => {
    try {
      const { rows } = await db.query(
        'INSERT INTO admins (email, password) VALUES ($1, $2) RETURNING id',
        [email, hashedPassword]
      );
      return rows[0].id;
    } catch (error) {
      throw error;
    }
  },

  // Save reset token
  saveResetToken: async (email, tokenHash, expiry) => {
    try {
      await db.query('UPDATE admins SET reset_token = $1, reset_token_expiry = $2 WHERE email = $3', [
        tokenHash,
        expiry,
        email
      ]);
    } catch (error) {
      throw error;
    }
  },

  // Find by valid reset token
  findByResetToken: async (tokenHash) => {
    try {
      const { rows } = await db.query(
        'SELECT * FROM admins WHERE reset_token = $1 AND reset_token_expiry > NOW()',
        [tokenHash]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  },

  // Update password and clear token
  updatePassword: async (adminId, newHashedPassword) => {
    try {
      await db.query(
        'UPDATE admins SET password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2',
        [newHashedPassword, adminId]
      );
    } catch (error) {
      throw error;
    }
  }
};

module.exports = Admin;
