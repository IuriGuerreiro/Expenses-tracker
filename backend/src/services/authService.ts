import prisma from '../config/database';
import { hashPassword, comparePassword } from '../utils/bcrypt';
import { generateToken } from '../utils/jwt';
import { ConflictError, AuthenticationError } from '../utils/errors';
import { generateAndSendCode, validateCode } from './twoFactorService';
import jwt from 'jsonwebtoken';

export interface RegisterInput {
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  userId: string;
  email: string;
  token: string;
}

export interface TwoFactorAuthResponse {
  requiresTwoFactor: true;
  tempToken: string;
  message: string;
}

export type LoginResponse = AuthResponse | TwoFactorAuthResponse;

/**
 * Register a new user
 */
export async function registerUser(input: RegisterInput): Promise<AuthResponse> {
  const { email, password } = input;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new ConflictError('Email already registered');
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
    },
  });

  // Generate JWT token
  const token = generateToken({ userId: user.id });

  return {
    userId: user.id,
    email: user.email,
    token,
  };
}

/**
 * Login a user (with 2FA support)
 */
export async function loginUser(input: LoginInput): Promise<LoginResponse> {
  const { email, password } = input;

  // Find user by email with 2FA settings
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      passwordHash: true,
      twoFactorEnabled: true,
      twoFactorEmail: true,
    },
  });

  if (!user) {
    throw new AuthenticationError('Invalid credentials');
  }

  // Compare password
  const isPasswordValid = await comparePassword(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new AuthenticationError('Invalid credentials');
  }

  // Check if 2FA is enabled
  if (user.twoFactorEnabled) {
    // Generate temporary token (10 minutes)
    const tempToken = jwt.sign(
      { userId: user.id, temp: true },
      process.env.JWT_SECRET || 'default-secret-change-me',
      { expiresIn: '10m' }
    );

    // Send 2FA code
    const codeSent = await generateAndSendCode(user.id);

    if (!codeSent) {
      throw new Error('Failed to send verification code. Please try again.');
    }

    return {
      requiresTwoFactor: true,
      tempToken,
      message: 'Verification code sent to your email',
    };
  }

  // Standard login flow (2FA disabled)
  const token = generateToken({ userId: user.id });

  return {
    userId: user.id,
    email: user.email,
    token,
  };
}

/**
 * Verify 2FA code and complete login
 */
export async function verify2FA(tempToken: string, code: string): Promise<AuthResponse> {
  try {
    // Verify temp token
    const decoded = jwt.verify(
      tempToken,
      process.env.JWT_SECRET || 'default-secret-change-me'
    ) as { userId: string; temp?: boolean };

    if (!decoded.temp) {
      throw new AuthenticationError('Invalid token');
    }

    // Validate 2FA code
    const result = await validateCode(decoded.userId, code);

    if (!result.valid) {
      throw new AuthenticationError('Invalid or expired verification code');
    }

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true },
    });

    if (!user) {
      throw new AuthenticationError('User not found');
    }

    // Generate full JWT token
    const token = generateToken({ userId: decoded.userId });

    return {
      userId: user.id,
      email: user.email,
      token,
    };
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AuthenticationError('Invalid or expired token');
    }
    throw error;
  }
}
