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
      const { rows } = await db.query('SELECT COUNT(*) AS count FROM admins');
      return Number(rows[0]?.count || 0);
    } catch (error) {
      throw error;
    }
  },

  // Create an admin
  create: async (email, hashedPassword, isMainAdmin = false, role = null) => {
    try {
      const result = await db.query(
        'INSERT INTO admins (email, password, is_main_admin, role) VALUES ($1, $2, $3, $4)',
        [email, hashedPassword, isMainAdmin, role || (isMainAdmin ? 'main_admin' : 'admin')]
      );
      return result.insertId ?? null;
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
  },

  // ---- Setup Key Management ----
  saveSetupKey: async (tokenHash, createdBy, expiresAt) => {
    try {
      await db.query(
        'INSERT INTO admin_setup_keys (token_hash, created_by, expires_at) VALUES ($1, $2, $3)',
        [tokenHash, createdBy, expiresAt]
      );
    } catch (error) {
      throw error;
    }
  },

  findValidSetupKey: async (tokenHash) => {
    try {
      const { rows } = await db.query(
        'SELECT * FROM admin_setup_keys WHERE token_hash = $1 AND used = false AND expires_at > NOW()',
        [tokenHash]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  },

  invalidateSetupKey: async (keyId) => {
    try {
      await db.query('UPDATE admin_setup_keys SET used = true WHERE id = $1', [keyId]);
    } catch (error) {
      throw error;
    }
  }
};

module.exports = Admin;
