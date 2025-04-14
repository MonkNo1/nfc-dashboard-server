import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import UserProfile from '../models/UserProfile.js';

// Initialize Google OAuth client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Protect routes
export const protect = async (req, res, next) => {
  try {
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized to access this route' 
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
    
    // Find or create user profile
    let userProfile = await UserProfile.findOne({ googleId: payload.sub });
    
    // If user doesn't exist, create a new one
    if (!userProfile) {
      userProfile = await UserProfile.create({
        googleId: payload.sub,
        name: payload.name,
        email: payload.email,
        avatar: payload.picture,
        isOwner: false // Default to not owner until claimed
      });
    }
    
    // Add user info to request
    req.user = {
      id: userProfile._id,
      googleId: userProfile.googleId,
      email: userProfile.email,
      name: userProfile.name,
      avatar: userProfile.avatar,
      isOwner: userProfile.isOwner
    };
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ 
      success: false, 
      message: error.message || 'Not authorized to access this route'
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
    const token = req.headers['admin-token'];
    
    if (!token || token !== process.env.ADMIN_TOKEN) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized as admin'
      });
    }
    
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during admin authentication'
    });
  }
}; 