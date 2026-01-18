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
  // Define allowed origins first to use in both CORS and CSP
  const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
  const allowedOrigins = [
    CLIENT_URL,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://192.168.3.21:5173',
    'http://192.168.3.21:3000',
    'http://192.168.3.21:3010',
  ];

  // Helmet for secure HTTP headers (with CSP disabled to manually control it)
  app.use(
    helmet({
      contentSecurityPolicy: false, // Disable auto CSP to prevent upgrade-insecure-requests
      hsts: false, // Disable HSTS
      crossOriginOpenerPolicy: false, // Disable COOP
      crossOriginEmbedderPolicy: false, // Disable COEP
      crossOriginResourcePolicy: false, // Disable CORP
      originAgentCluster: false, // Disable Origin-Agent-Cluster header
    })
  );

  // Manually set CSP without upgrade-insecure-requests
  app.use((req, res, next) => {
    const csp = [
      "default-src 'self'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "script-src 'self'",
      "img-src 'self' data: https:",
      `connect-src 'self' ${allowedOrigins.join(' ')}`,
      "base-uri 'self'",
      "font-src 'self' https://fonts.gstatic.com data:",
      "form-action 'self'",
      "frame-ancestors 'self'",
      "object-src 'none'",
      "script-src-attr 'none'",
    ].join(';');
    res.setHeader('Content-Security-Policy', csp);
    next();
  });

  // Explicitly set HSTS to 0 to clear browser cache
  app.use((req, res, next) => {
    res.setHeader('Strict-Transport-Security', 'max-age=0');
    next();
  });

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
