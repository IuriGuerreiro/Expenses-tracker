import { Router } from 'express';
import { body } from 'express-validator';
import {
  get2FAStatus,
  enable2FA,
  confirmEnable2FA,
  disable2FA,
} from '../controllers/settingsController';
import { validate } from '../middleware/validation';
import { authMiddleware } from '../middleware/auth';
import {
  twoFactorSettingsLimiter,
  twoFactorCodeGenerationLimiter,
  twoFactorVerificationLimiter,
} from '../middleware/rateLimiters';

const router = Router();

// All settings routes require authentication
router.use(authMiddleware);

// Validation rules
const enable2FAValidation = [
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
];

const confirmEnable2FAValidation = [
  body('code')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('Code must be a 6-digit number'),
];

const disable2FAValidation = [
  body('password').notEmpty().withMessage('Password is required'),
];

// Routes
router.get('/2fa', get2FAStatus);
router.post(
  '/2fa/enable',
  twoFactorCodeGenerationLimiter,
  twoFactorSettingsLimiter,
  enable2FAValidation,
  validate,
  enable2FA
);
router.post(
  '/2fa/confirm-enable',
  twoFactorVerificationLimiter,
  twoFactorSettingsLimiter,
  confirmEnable2FAValidation,
  validate,
  confirmEnable2FA
);
router.post(
  '/2fa/disable',
  twoFactorSettingsLimiter,
  disable2FAValidation,
  validate,
  disable2FA
);

export default router;
