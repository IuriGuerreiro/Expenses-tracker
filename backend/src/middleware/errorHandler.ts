import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';

/**
 * Centralized error handling middleware
 * Transforms errors to standard API response format
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log error server-side (never expose to client)
  console.error('Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  // Handle custom AppError instances
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        code: err.code,
      },
    });
    return;
  }

  // Handle unknown errors
  res.status(500).json({
    success: false,
    error: {
      message: process.env.NODE_ENV === 'development'
        ? err.message
        : 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR',
    },
  });
}
