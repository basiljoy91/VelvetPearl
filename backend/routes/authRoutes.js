const express = require('express');
const router = express.Router();
const { loginAdmin, signupAdmin, forgotPassword, resetPassword, getMe, changePassword, generateSetupKey, initializeAdmin } = require('../controllers/authController');
const { protectAdmin, protectMainAdmin } = require('../middleware/authMiddleware');
const { adminAuthRateLimit } = require('../middleware/rateLimitMiddleware');

// Route: POST /api/admin/login
router.post('/login', adminAuthRateLimit, loginAdmin);

// Route: POST /api/admin/signup
router.post('/signup', adminAuthRateLimit, signupAdmin);

// Route: POST /api/admin/forgot-password
router.post('/forgot-password', forgotPassword);

// Route: POST /api/admin/reset-password
router.post('/reset-password', resetPassword);

// Route: GET /api/admin/me
router.get('/me', protectAdmin, getMe);

// Route: PUT /api/admin/change-password
router.put('/change-password', protectAdmin, changePassword);

// Route: POST /api/admin/generate-setup-key
router.post('/generate-setup-key', protectAdmin, protectMainAdmin, generateSetupKey);

// Route: POST /api/admin/initialize
router.post('/initialize', adminAuthRateLimit, initializeAdmin);

module.exports = router;
