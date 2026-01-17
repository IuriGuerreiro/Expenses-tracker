import { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import express from 'express';

/**
 * Configure security middleware for Express app
 */
export function configureSecurity(app: Express): void {
  // Helmet for secure HTTP headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'", process.env.CLIENT_URL || 'http://localhost:5173'],
          upgradeInsecureRequests: null,
        },
      },
      hsts: false, // Disable HSTS to allow HTTP on local network
      crossOriginOpenerPolicy: false, // Disable COOP for non-secure origins
    })
  );

  // CORS configuration
  const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
  
  // Define allowed origins
  const allowedOrigins = [
    CLIENT_URL,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    // Add your IP here if accessing from another device (e.g., mobile)
    // 'http://192.168.1.X:5173', 
  ];

  app.use(
    cors({
      origin: allowedOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Cookie parser for JWT cookies
  app.use(cookieParser());

  // Body parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // General API rate limiting
  const generalLimiter = rateLimit({
    windowMs: 1 * 1000, // 1 second
    max: 10, // 10 requests per second per IP
    message: {
      success: false,
      error: {
        message: 'Too many requests, please try again later',
        code: 'RATE_LIMIT_EXCEEDED',
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use('/api/', generalLimiter);

  // Strict rate limiting for auth endpoints
  const authLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 5, // 5 requests per minute per IP
    message: {
      success: false,
      error: {
        message: 'Too many authentication attempts, please try again later',
        code: 'AUTH_RATE_LIMIT_EXCEEDED',
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use('/api/v1/auth/login', authLimiter);
  app.use('/api/v1/auth/register', authLimiter);
}
