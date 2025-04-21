import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import UserProfile from '../models/UserProfile.js';

// Initialize Google OAuth client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Protect routes
export const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
      });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || '');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }
};

// Verify Google token
export const verifyGoogleToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ message: 'No authorization header' });
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }

    // Verify the token with Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      res.status(401).json({ message: 'Invalid token' });
      return;
    }

    // Add the verified email to the request
    req.user = { email: payload.email };
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Check ownership by Google ID
export const checkGoogleOwnership = async (req, res, next) => {
  try {
    if (!req.user || !req.user.googleId) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized - Google ID required'
      });
    }
    
    // Add googleId to request for controllers to use
    req.googleId = req.user.googleId;
    next();
  } catch (error) {
    console.error('Ownership check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during ownership check'
    });
  }
};

// Admin middleware
export const adminAuth = (req, res, next) => {
  try {
    const adminToken = req.headers['admin-token'];
    
    if (!adminToken) {
      return res.status(403).json({
        success: false,
        message: 'Admin token is required',
      });
    }
    
    if (adminToken !== process.env.ADMIN_TOKEN) {
      return res.status(403).json({
        success: false,
        message: 'Invalid admin token',
      });
    }
    
    next();
  } catch (error) {
    console.error('Admin authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during admin authentication',
    });
  }
};

// Check if user is admin
export const isAdmin = async (req, res, next) => {
  try {
    if (!req.user || !req.user.googleId) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
    
    // Find user by Google ID
    const user = await UserProfile.findOne({ googleId: req.user.googleId });
    
    if (!user || !user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized as admin'
      });
    }
    
    next();
  } catch (error) {
    console.error('Admin check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during admin check'
    });
  }
};

// Authorize user based on role
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    
    next();
  };
};

export const checkOwnership = (req, res, next) => {
  const { deviceId } = req.body;
  
  if (!deviceId) {
    res.status(400).json({
      success: false,
      message: 'Device ID required',
    });
    return;
  }
  
  req.deviceId = deviceId;
  next();
}; 