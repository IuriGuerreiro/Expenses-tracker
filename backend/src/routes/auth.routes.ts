import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, logout, getMe, verify2FA } from '../controllers/authController';
import { validate } from '../middleware/validation';
import { authMiddleware } from '../middleware/auth';
import { authLimiter, twoFactorVerificationLimiter } from '../middleware/rateLimiters';

const router = Router();

// Validation rules
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage('Password must contain at least one special character'),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const verify2FAValidation = [
  body('tempToken').notEmpty().withMessage('Temporary token is required'),
  body('code')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('Code must be a 6-digit number'),
];

// Routes
router.post('/register', authLimiter, registerValidation, validate, register);
router.post('/login', authLimiter, loginValidation, validate, login);
router.post('/verify-2fa', twoFactorVerificationLimiter, verify2FAValidation, validate, verify2FA);
router.post('/logout', logout);
router.get('/me', authMiddleware, getMe);

export default router;
