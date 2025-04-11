import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../types/custom.js';

/**
 * Custom error handler middleware
 * @param err Error object
 * @param req Express request object
 * @param res Express response object
 * @param next Express next function
 */
const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', err);

  // Default error status and message
  let statusCode = 500;
  let message = 'Internal Server Error';

  // Check if it's a custom AppError
  if ((err as AppError).statusCode !== undefined) {
    statusCode = (err as AppError).statusCode || 500;
    message = err.message;
  }

  // MongoDB duplicate key error
  if ((err as any).code === 11000) {
    statusCode = 409;
    message = 'Duplicate field value entered';
  }

  // MongoDB validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

export default errorHandler; 