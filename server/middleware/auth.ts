import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        email: string;
        id?: string;
      };
      deviceId?: string;
    }
  }
}

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const verifyGoogleToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
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

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

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

    const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as { id: string; email: string };
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }
};

export const checkOwnership = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
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