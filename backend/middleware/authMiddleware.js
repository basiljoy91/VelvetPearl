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
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.adminId = decoded.id; // Attach admin id to request
    req.isMainAdmin = decoded.is_main_admin; // Attach main admin flag
    next();
  } catch (error) {
    console.error('JWT Verification Error:', error.message);
    return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
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
