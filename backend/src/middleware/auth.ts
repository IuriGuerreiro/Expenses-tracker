import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { AuthenticationError } from '../utils/errors';

/**
 * Authentication middleware
 * Verifies JWT token from cookie or Authorization header
 * Attaches userId to req.user for downstream use
 */
export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    // Check for token in Authorization header or cookie
    let token: string | undefined;

    // Try Authorization header first (Bearer token)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    // Try cookie if no header token
    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      throw new AuthenticationError('No authentication token provided');
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      throw new AuthenticationError('Invalid or expired token');
    }

    // Attach user to request
    req.user = { userId: decoded.userId };
    next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      res.status(error.statusCode).json({
        success: false,
        error: {
          message: error.message,
          code: error.code,
        },
      });
    } else {
      res.status(401).json({
        success: false,
        error: {
          message: 'Authentication failed',
          code: 'AUTHENTICATION_ERROR',
        },
      });
    }
  }
}
