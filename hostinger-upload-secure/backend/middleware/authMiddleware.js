const jwt = require('jsonwebtoken');

// Middleware to protect admin routes
const protectAdmin = (req, res, next) => {
  let token;

  // Check if token exists in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role || (decoded.is_main_admin ? 'main_admin' : 'admin'),
      isMainAdmin: Boolean(decoded.is_main_admin || decoded.role === 'main_admin'),
    };
    req.adminId = req.admin.id;
    req.adminRole = req.admin.role;
    req.isMainAdmin = req.admin.isMainAdmin;
    return next();
  } catch (error) {
    console.error('JWT Verification Error:', error.message);
    const message = error.name === 'TokenExpiredError'
      ? 'Session expired. Please sign in again.'
      : 'Not authorized, token failed';

    return res.status(401).json({ success: false, message });
  }
};

// Middleware to protect Main Admin routes specifically
const protectMainAdmin = (req, res, next) => {
  if (req.isMainAdmin) {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Forbidden. Main Admin access required.' });
  }
};

module.exports = { protectAdmin, protectMainAdmin };
