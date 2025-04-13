import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import UserProfile from '../models/UserProfile.js';

// Initialize Google OAuth client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Protect routes
export const protect = async (req, res, next) => {
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
      message: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check token expiration
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return res.status(401).json({
        success: false,
        message: 'Token has expired'
      });
    }

    // Get user from the token
    const user = await UserProfile.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Token verification error:', err);
    return res.status(401).json({
      success: false,
      message: err.name === 'TokenExpiredError' ? 'Token has expired' : 'Invalid token'
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