const jwt = require('jsonwebtoken');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  // Check if auth header exists and starts with Bearer
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Extract token from Bearer token
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }
};

// Check owner by device ID
exports.checkOwnership = (req, res, next) => {
  const { deviceId } = req.body;
  
  if (!deviceId) {
    return res.status(400).json({
      success: false,
      message: 'Device ID required',
    });
  }
  
  // Add deviceId to request for controllers to use
  req.deviceId = deviceId;
  next();
};

// Admin middleware
exports.adminAuth = (req, res, next) => {
  // For demo purposes, we're using a simple token check
  const adminToken = req.headers['admin-token'];
  
  if (!adminToken || adminToken !== process.env.ADMIN_TOKEN) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required',
    });
  }
  
  next();
}; 