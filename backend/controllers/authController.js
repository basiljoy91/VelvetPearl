const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Admin = require('../models/adminModel');

// @desc    Admin Login
// @route   POST /api/admin/login
// @access  Public
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide an email and password' });
    }

    // 1. Check if admin exists in DB
    const admin = await Admin.findByEmail(email);

    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    // 2. Compare hashed password using bcrypt
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    // 3. Generate JWT Token
    const token = jwt.sign(
      { id: admin.id, email: admin.email, is_main_admin: admin.is_main_admin },
      process.env.JWT_SECRET,
      { expiresIn: '30d' } // Token expires in 30 days
    );

    // 4. Return success response
    res.status(200).json({
      success: true,
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        is_main_admin: admin.is_main_admin
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// @desc    Admin Signup (Only 1 allowed)
// @route   POST /api/admin/signup
// @access  Public
const signupAdmin = async (req, res) => {
  try {
    const { email, password, setupSecret } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide an email and password' });
    }

    if (setupSecret !== process.env.SETUP_SECRET) {
      return res.status(403).json({ success: false, message: 'Invalid setup secret' });
    }

    const adminCount = await Admin.countAdmins();
    if (adminCount >= 1) {
      return res.status(403).json({ success: false, message: 'Admin already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newAdminId = await Admin.create(email, hashedPassword);

    res.status(201).json({ success: true, message: 'Admin created successfully', adminId: newAdminId });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ success: false, message: 'Server error during signup' });
  }
};

// @desc    Forgot Password
// @route   POST /api/admin/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  return res.status(503).json({ success: false, message: 'Password reset is temporarily disabled.' });
};

// @desc    Reset Password
// @route   POST /api/admin/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  return res.status(503).json({ success: false, message: 'Password reset is temporarily disabled.' });
};

// @desc    Get Current Admin
// @route   GET /api/admin/me
// @access  Private
const getMe = async (req, res) => {
  try {
    // req.adminId and req.isMainAdmin are set by authMiddleware
    res.status(200).json({ success: true, message: 'Token is valid', adminId: req.adminId, isMainAdmin: req.isMainAdmin });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Change Password (Authenticated)
// @route   PUT /api/admin/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const adminId = req.adminId; // Set by authMiddleware
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'Please provide all password fields' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'New password and confirm password must match' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long' });
    }

    if (oldPassword === newPassword) {
      return res.status(400).json({ success: false, message: 'New password must be different from the old password' });
    }

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    const isMatch = await bcrypt.compare(oldPassword, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Old password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await Admin.updatePassword(adminId, hashedPassword);

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Generate Setup Key for New Admin
// @route   POST /api/admin/generate-setup-key
// @access  Private (Main Admin Only)
const generateSetupKey = async (req, res) => {
  try {
    // Generate a secure random token (e.g., 32 chars hex)
    const rawToken = crypto.randomBytes(16).toString('hex');
    
    // Hash the token for storage (to prevent DB compromise from exposing unused keys)
    const salt = await bcrypt.genSalt(10);
    const tokenHash = await bcrypt.hash(rawToken, salt);
    
    // Set expiration to 24 hours from now
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    
    await Admin.saveSetupKey(tokenHash, req.adminId, expiresAt);
    
    res.status(201).json({ 
      success: true, 
      message: 'Setup key generated successfully', 
      setupKey: rawToken, // This is returned only ONCE
      expiresAt 
    });
  } catch (error) {
    console.error('Generate setup key error:', error);
    res.status(500).json({ success: false, message: 'Server error generating setup key' });
  }
};

// @desc    Initialize New Admin via Setup Key
// @route   POST /api/admin/initialize
// @access  Public
const initializeAdmin = async (req, res) => {
  try {
    const { email, password, setupKey } = req.body;
    
    if (!email || !password || !setupKey) {
      return res.status(400).json({ success: false, message: 'Email, password, and setup key are required' });
    }

    // Since we hashed the keys using bcrypt, we must fetch ALL unused valid keys and compare
    const db = require('../config/db');
    const { rows } = await db.query('SELECT * FROM admin_setup_keys WHERE used = false AND expires_at > NOW()');
    
    let validKeyId = null;
    for (const row of rows) {
      const isMatch = await bcrypt.compare(setupKey, row.token_hash);
      if (isMatch) {
        validKeyId = row.id;
        break;
      }
    }
    
    if (!validKeyId) {
      return res.status(401).json({ success: false, message: 'Invalid or expired setup key' });
    }

    // Check if email already exists
    const existingAdmin = await Admin.findByEmail(email);
    if (existingAdmin) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Create the new admin
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newAdminId = await Admin.create(email, hashedPassword, false);

    // Invalidate the setup key
    await Admin.invalidateSetupKey(validKeyId);

    res.status(201).json({ success: true, message: 'Admin account initialized successfully' });
  } catch (error) {
    console.error('Initialize admin error:', error);
    res.status(500).json({ success: false, message: 'Server error initializing admin' });
  }
};

module.exports = {
  loginAdmin,
  signupAdmin,
  forgotPassword,
  resetPassword,
  getMe,
  changePassword,
  generateSetupKey,
  initializeAdmin
};
