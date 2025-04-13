const jwt = require('jsonwebtoken');
const UserProfile = require('../models/UserProfile');

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
    
    // Add user to request object
    req.user = decoded;
    
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }
};

// Verify Google token
exports.verifyGoogleToken = async (req, res, next) => {
  try {
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided' 
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify the token with Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    
    // Add user info to request
    req.user = {
      googleId: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture
    };
    
    next();
  } catch (error) {
    console.error('Google token verification error:', error);
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    });
  }
};

// Check ownership by Google ID
exports.checkGoogleOwnership = async (req, res, next) => {
  try {
    if (!req.user || !req.user.googleId) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized - Google ID required',
      });
    }
    
    // Add googleId to request for controllers to use
    req.googleId = req.user.googleId;
    next();
  } catch (error) {
    console.error('Ownership check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during ownership check',
    });
  }
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