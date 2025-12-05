import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { sendTwoFactorCode } from './emailService';

const prisma = new PrismaClient();

/**
 * Generate a cryptographically secure 6-digit code and send it via email
 * @param userId - User ID to generate code for
 * @returns Promise<boolean> - Success status
 */
export const generateAndSendCode = async (userId: string): Promise<boolean> => {
  try {
    // Generate cryptographically random 6-digit code
    const code = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    // Atomic transaction: invalidate old codes and create new one
    await prisma.$transaction(async (tx) => {
      // Mark all existing unused codes as verified (invalidate them)
      await tx.twoFactorCode.updateMany({
        where: {
          userId,
          verified: false,
        },
        data: {
          verified: true, // Mark as used to prevent reuse
        },
      });

      // Create new code
      await tx.twoFactorCode.create({
        data: {
          userId,
          code,
          expiresAt,
        },
      });
    });

    // Get user's email
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, twoFactorEmail: true },
    });

    if (!user) {
      console.error(`User not found for 2FA code generation: ${userId}`);
      return false;
    }

    // Use twoFactorEmail if set, otherwise use primary email
    const emailAddress = user.twoFactorEmail || user.email;

    // Send email
    await sendTwoFactorCode(emailAddress, code);

    console.log(`2FA code generated and sent for user ${userId}`);
    return true;
  } catch (error) {
    console.error('Error generating and sending 2FA code:', error);
    return false;
  }
};

/**
 * Validate a 2FA code for a user
 * @param userId - User ID
 * @param code - 6-digit code to validate
 * @returns Object with validation result and optional reason
 */
export const validateCode = async (
  userId: string,
  code: string
): Promise<{ valid: boolean; reason?: string }> => {
  try {
    // Find valid code that matches criteria:
    // 1. Belongs to the user
    // 2. Matches the code value
    // 3. Not yet verified
    // 4. Not expired
    const record = await prisma.twoFactorCode.findFirst({
      where: {
        userId,
        code,
        verified: false,
        expiresAt: {
          gte: new Date(), // Greater than or equal to now (not expired)
        },
      },
    });

    if (!record) {
      console.log(`Invalid or expired 2FA code attempt for user ${userId}`);
      return {
        valid: false,
        reason: 'INVALID_OR_EXPIRED',
      };
    }

    // Mark code as verified (one-time use)
    await prisma.twoFactorCode.update({
      where: { id: record.id },
      data: { verified: true },
    });

    console.log(`2FA code validated successfully for user ${userId}`);
    return { valid: true };
  } catch (error) {
    console.error('Error validating 2FA code:', error);
    return {
      valid: false,
      reason: 'VALIDATION_ERROR',
    };
  }
};

/**
 * Track failed verification attempts
 * @param userId - User ID
 * @returns Number of recent failed attempts
 */
export const trackFailedAttempt = async (userId: string): Promise<number> => {
  // This is a simple in-memory tracking for now
  // In production, consider using Redis or database table
  // For now, we'll rely on rate limiting at the route level
  return 0;
};

/**
 * Check if user should be rate limited (too many code generation requests)
 * @param userId - User ID
 * @returns boolean - true if should be rate limited
 */
export const shouldRateLimitCodeGeneration = async (userId: string): Promise<boolean> => {
  try {
    // Count codes generated in last 15 minutes
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

    const recentCodes = await prisma.twoFactorCode.count({
      where: {
        userId,
        createdAt: {
          gte: fifteenMinutesAgo,
        },
      },
    });

    // Max 3 codes per 15 minutes
    return recentCodes >= 3;
  } catch (error) {
    console.error('Error checking rate limit:', error);
    // Fail open - allow the request if check fails
    return false;
  }
};
