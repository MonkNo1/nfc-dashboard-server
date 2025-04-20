import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import UserProfile from '../models/UserProfile.js';

// Initialize Google OAuth client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Protect routes
export const protect = async (req, res, next) => {
  try {
    if (!req.user || !req.user.googleId) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication'
    });
  }
};

// Verify Google token
export const verifyGoogleToken = async (req, res, next) => {
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
    }).catch(error => {
      console.error('Google token verification failed:', error);
      throw new Error('Invalid Google token');
    });
    
    const payload = ticket.getPayload();
    
    // Check token expiration
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return res.status(401).json({
        success: false,
        message: 'Google token has expired'
      });
    }
    
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
      message: error.message || 'Invalid token'
    });
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