import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { generateAndSendCode, validateCode } from '../services/twoFactorService';
import { comparePassword } from '../utils/bcrypt';
import { AuthenticationError } from '../utils/errors';

/**
 * Get 2FA status for current user
 * GET /api/v1/settings/2fa
 */
export async function get2FAStatus(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Not authenticated',
          code: 'NOT_AUTHENTICATED',
        },
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        twoFactorEnabled: true,
        twoFactorEmail: true,
        email: true,
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND',
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        enabled: user.twoFactorEnabled,
        email: user.twoFactorEmail || user.email,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Request to enable 2FA (sends verification code)
 * POST /api/v1/settings/2fa/enable
 */
export async function enable2FA(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.userId;
    const { email } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Not authenticated',
          code: 'NOT_AUTHENTICATED',
        },
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        twoFactorEnabled: true,
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND',
        },
      });
      return;
    }

    if (user.twoFactorEnabled) {
      res.status(400).json({
        success: false,
        error: {
          message: '2FA is already enabled',
          code: 'ALREADY_ENABLED',
        },
      });
      return;
    }

    // Store the email temporarily (will be saved after verification)
    // For now, we'll store it in the user record but not mark as enabled yet
    const emailToUse = email || user.email;

    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEmail: emailToUse,
      },
    });

    // Send verification code
    const codeSent = await generateAndSendCode(userId);

    if (!codeSent) {
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to send verification code',
          code: 'EMAIL_SEND_ERROR',
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        message: 'Verification code sent. Please verify to enable 2FA.',
        requiresVerification: true,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Confirm enable 2FA with verification code
 * POST /api/v1/settings/2fa/confirm-enable
 */
export async function confirmEnable2FA(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.userId;
    const { code } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Not authenticated',
          code: 'NOT_AUTHENTICATED',
        },
      });
      return;
    }

    if (!code) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Verification code is required',
          code: 'MISSING_CODE',
        },
      });
      return;
    }

    // Validate code
    const result = await validateCode(userId, code);

    if (!result.valid) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Invalid or expired code',
          code: 'INVALID_CODE',
        },
      });
      return;
    }

    // Enable 2FA
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: true,
      },
    });

    res.status(200).json({
      success: true,
      data: {
        message: '2FA enabled successfully',
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Disable 2FA (requires password confirmation)
 * POST /api/v1/settings/2fa/disable
 */
export async function disable2FA(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.userId;
    const { password } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Not authenticated',
          code: 'NOT_AUTHENTICATED',
        },
      });
      return;
    }

    if (!password) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Password is required',
          code: 'MISSING_PASSWORD',
        },
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        passwordHash: true,
        twoFactorEnabled: true,
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND',
        },
      });
      return;
    }

    if (!user.twoFactorEnabled) {
      res.status(400).json({
        success: false,
        error: {
          message: '2FA is not enabled',
          code: 'NOT_ENABLED',
        },
      });
      return;
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new AuthenticationError('Incorrect password');
    }

    // Disable 2FA and invalidate all codes
    await prisma.$transaction(async (tx) => {
      // Disable 2FA
      await tx.user.update({
        where: { id: userId },
        data: {
          twoFactorEnabled: false,
          twoFactorEmail: null,
        },
      });

      // Invalidate all existing codes
      await tx.twoFactorCode.updateMany({
        where: {
          userId,
          verified: false,
        },
        data: {
          verified: true,
        },
      });
    });

    res.status(200).json({
      success: true,
      data: {
        message: '2FA disabled successfully',
      },
    });
  } catch (error) {
    next(error);
  }
}
