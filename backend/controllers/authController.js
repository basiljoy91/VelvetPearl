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
      { id: admin.id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: '30d' } // Token expires in 30 days
    );

    // 4. Return success response
    res.status(200).json({
      success: true,
      token,
      admin: {
        id: admin.id,
        email: admin.email
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
    // req.adminId is set by authMiddleware
    res.status(200).json({ success: true, message: 'Token is valid', adminId: req.adminId });
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

module.exports = {
  loginAdmin,
  signupAdmin,
  forgotPassword,
  resetPassword,
  getMe,
  changePassword
};
