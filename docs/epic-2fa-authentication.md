# Epic: Two-Factor Authentication (2FA) with Email Codes

**Author:** a
**Date:** 2025-12-04
**Status:** Ready for Implementation
**Priority:** High (Security Enhancement)

---

## Epic Overview

### Epic Goal

Implement a robust Two-Factor Authentication (2FA) system using email-based verification codes to enhance account security for ExpensesTracker users. This feature will be optional and user-controlled through a dedicated Security Settings interface.

### User Value Statement

As a security-conscious user, I want to enable two-factor authentication on my account, so that even if my password is compromised, my financial data remains protected through email verification.

### Business Rationale

Two-factor authentication significantly reduces the risk of unauthorized account access, which is critical for a financial management application handling sensitive user data. By making 2FA optional, we respect user choice while providing enhanced security for those who want it.

### PRD Coverage

This epic addresses enhanced security requirements beyond the MVP scope. It builds upon:
- **FR1-FR6:** User Management & Authentication (extends existing auth system)
- **NFR7-NFR13:** Security requirements (adds additional security layer)

### Architecture Integration

This epic leverages the existing architecture decisions:
- **Backend:** Express.js with JWT authentication (extends existing auth middleware)
- **Database:** Prisma ORM with SQLite (adds new tables for 2FA codes and user settings)
- **Email Service:** Requires integration of email service (e.g., nodemailer, SendGrid, or similar)
- **Frontend:** React with React Hook Form (adds new settings UI components)

### Dependencies

**Technical Prerequisites:**
- Existing authentication system must be functional (FR1-FR6)
- User settings/profile management infrastructure
- Email service provider configuration

**Epic Dependencies:**
- Must be implemented after core authentication is stable
- Should follow user profile/settings epic if one exists

---

## Stories Breakdown

### Story 2FA.1: Database Schema for 2FA Storage

**As a** system architect
**I want** to create database tables to store 2FA settings and verification codes
**So that** the system can securely manage 2FA state and email codes

**Acceptance Criteria:**

**Given** the existing Prisma schema
**When** I extend the schema for 2FA support
**Then** the following models are created:

**User Model Extension:**
- Add `twoFactorEnabled` boolean field (default: false)
- Add `twoFactorEmail` string field (nullable, stores verified email for 2FA)
- Ensure backward compatibility with existing users

**TwoFactorCode Model:**
- `id` - Unique identifier (UUID)
- `userId` - Foreign key to users table
- `code` - 6-digit verification code (string)
- `expiresAt` - Timestamp for code expiration (DateTime)
- `verified` - Boolean flag indicating if code was used
- `createdAt` - Timestamp
- Index on `userId` and `expiresAt` for query performance

**And** migrations are created and tested
**And** existing user data is not affected by the migration

**Technical Implementation:**

Architecture Reference: `/server/prisma/schema.prisma` (Architecture section: Data Architecture)

```prisma
model users {
  id                String            @id @default(uuid())
  email             String            @unique
  password          String
  twoFactorEnabled  Boolean           @default(false)
  twoFactorEmail    String?
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  twoFactorCodes    two_factor_codes[]
}

model two_factor_codes {
  id         String   @id @default(uuid())
  userId     String
  code       String
  expiresAt  DateTime
  verified   Boolean  @default(false)
  createdAt  DateTime @default(now())
  user       users    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, expiresAt])
}
```

**Prerequisites:** None (foundation story)

---

### Story 2FA.2: Email Service Integration

**As a** backend developer
**I want** to integrate an email sending service
**So that** the system can send verification codes to users

**Acceptance Criteria:**

**Given** the backend Express application
**When** I integrate an email service
**Then** the following is implemented:

**Email Service Configuration:**
- Install and configure email service package (nodemailer or SendGrid)
- Add environment variables for email service credentials:
  - `EMAIL_SERVICE_API_KEY` or SMTP credentials
  - `EMAIL_FROM_ADDRESS` (e.g., noreply@expensestracker.app)
  - `EMAIL_FROM_NAME` (e.g., ExpensesTracker Security)

**Email Utility Service:**
- Create `/server/src/services/emailService.ts`
- Implement `sendTwoFactorCode(email: string, code: string)` function
- Email template includes:
  - Clear subject line: "Your ExpensesTracker Verification Code"
  - 6-digit code prominently displayed
  - Code expiration time (5 minutes)
  - Security warning: "If you didn't request this, ignore this email"
  - Professional HTML template with plain text fallback

**And** email sending is tested in development environment
**And** errors are logged but don't expose email service credentials (NFR13)
**And** rate limiting prevents email spam (max 3 codes per 15 minutes per user)

**Technical Implementation:**

Architecture Reference: `/server/src/services/emailService.ts` (new file)
Security Reference: Architecture section - Security Middleware

**Code Pattern:**
```typescript
// services/emailService.ts
import nodemailer from 'nodemailer';

export const sendTwoFactorCode = async (email: string, code: string): Promise<void> => {
  const transporter = nodemailer.createTransport({
    // Email service config from env
  });

  const htmlContent = `
    <h2>Your Verification Code</h2>
    <p>Your verification code is: <strong style="font-size: 24px;">${code}</strong></p>
    <p>This code expires in 5 minutes.</p>
    <p>If you didn't request this code, please ignore this email.</p>
  `;

  await transporter.sendMail({
    from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM_ADDRESS}>`,
    to: email,
    subject: 'Your ExpensesTracker Verification Code',
    html: htmlContent,
    text: `Your verification code is: ${code}. This code expires in 5 minutes.`
  });
};
```

**Prerequisites:** Story 2FA.1 (database schema must exist)

---

### Story 2FA.3: 2FA Code Generation and Validation Service

**As a** backend developer
**I want** to create services for generating and validating 2FA codes
**So that** the auth flow can securely manage email verification

**Acceptance Criteria:**

**Given** the database schema and email service
**When** I implement 2FA code services
**Then** the following functions are created:

**Code Generation Service (`/server/src/services/twoFactorService.ts`):**

`generateAndSendCode(userId: string)`:
- Generate random 6-digit numeric code
- Calculate expiration time (5 minutes from now)
- Store code in `two_factor_codes` table using Prisma transaction:
  - Invalidate any existing unused codes for this user
  - Create new code record
- Send code via `emailService.sendTwoFactorCode()`
- Return success/failure status (not the code itself)

`validateCode(userId: string, code: string)`:
- Query for code matching userId and code value
- Check if code is not expired (`expiresAt > now()`)
- Check if code is not already verified
- If valid:
  - Mark code as verified (set `verified: true`)
  - Return success with validated userId
- If invalid:
  - Return failure with reason (expired, not found, already used)

**And** all database operations use Prisma transactions for atomicity (NFR15)
**And** codes are cryptographically random (using `crypto.randomInt()`)
**And** validation prevents timing attacks by using constant-time comparison
**And** expired codes are NOT automatically deleted (audit trail per FR39)

**Technical Implementation:**

Architecture Reference: `/server/src/services/twoFactorService.ts` (new file)

```typescript
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { sendTwoFactorCode } from './emailService';

const prisma = new PrismaClient();

export const generateAndSendCode = async (userId: string): Promise<boolean> => {
  try {
    // Generate 6-digit code
    const code = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Atomic transaction
    await prisma.$transaction(async (tx) => {
      // Invalidate old codes
      await tx.two_factor_codes.updateMany({
        where: { userId, verified: false },
        data: { verified: true } // Mark as used to prevent reuse
      });

      // Create new code
      await tx.two_factor_codes.create({
        data: { userId, code, expiresAt }
      });
    });

    // Get user email
    const user = await prisma.users.findUnique({ where: { id: userId } });
    if (!user) return false;

    // Send email
    await sendTwoFactorCode(user.twoFactorEmail || user.email, code);
    return true;
  } catch (error) {
    console.error('2FA code generation error:', error);
    return false;
  }
};

export const validateCode = async (userId: string, code: string): Promise<{ valid: boolean; reason?: string }> => {
  const record = await prisma.two_factor_codes.findFirst({
    where: {
      userId,
      code,
      verified: false,
      expiresAt: { gte: new Date() }
    }
  });

  if (!record) {
    return { valid: false, reason: 'INVALID_OR_EXPIRED' };
  }

  // Mark as verified
  await prisma.two_factor_codes.update({
    where: { id: record.id },
    data: { verified: true }
  });

  return { valid: true };
};
```

**Prerequisites:** Story 2FA.1, Story 2FA.2

---

### Story 2FA.4: Enhanced Login Flow with 2FA Check

**As a** user with 2FA enabled
**I want** the login process to request my verification code
**So that** my account is protected by two-factor authentication

**Acceptance Criteria:**

**Given** the existing login endpoint (`POST /api/v1/auth/login`)
**When** a user submits valid credentials
**Then** the system checks if 2FA is enabled:

**Standard Login (2FA Disabled):**
- Validate email/password (existing flow)
- Generate JWT token
- Return success with token (existing behavior)

**2FA Login (2FA Enabled):**
- Validate email/password
- **Do NOT generate full JWT token yet**
- Generate and send 2FA code via `twoFactorService.generateAndSendCode()`
- Create temporary session token (short-lived, 10 minutes)
- Return response:
  ```json
  {
    "success": true,
    "requiresTwoFactor": true,
    "tempToken": "short-lived-jwt",
    "message": "Verification code sent to your email"
  }
  ```

**New Endpoint: Verify 2FA Code (`POST /api/v1/auth/verify-2fa`):**

Request body:
```json
{
  "tempToken": "short-lived-jwt",
  "code": "123456"
}
```

**When** user submits verification code
**Then** the system:
- Validates the temporary token
- Calls `twoFactorService.validateCode(userId, code)`
- If valid:
  - Generate full JWT token (standard auth token)
  - Return success with full token
- If invalid:
  - Return error with reason
  - Track failed attempts (max 3 attempts before requiring new login)

**And** rate limiting prevents brute force (max 5 attempts per 15 minutes per IP)
**And** all auth flows follow existing JWT middleware patterns (Architecture: Auth section)

**Technical Implementation:**

Architecture Reference: `/server/src/routes/auth.routes.ts`, `/server/src/controllers/authController.ts`

Modified Login Controller:
```typescript
// controllers/authController.ts
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await userService.findByEmail(email);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({
      success: false,
      error: { message: 'Invalid credentials', code: 'AUTH_ERROR' }
    });
  }

  // Check if 2FA is enabled
  if (user.twoFactorEnabled) {
    // Generate temp token
    const tempToken = jwt.sign(
      { userId: user.id, temp: true },
      process.env.JWT_SECRET!,
      { expiresIn: '10m' }
    );

    // Send 2FA code
    await twoFactorService.generateAndSendCode(user.id);

    return res.json({
      success: true,
      requiresTwoFactor: true,
      tempToken,
      message: 'Verification code sent to your email'
    });
  }

  // Standard login flow
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });

  res.json({ success: true, data: { token } });
};

export const verify2FA = async (req: Request, res: Response) => {
  const { tempToken, code } = req.body;

  // Verify temp token
  const decoded = jwt.verify(tempToken, process.env.JWT_SECRET!) as { userId: string; temp: boolean };
  if (!decoded.temp) {
    return res.status(401).json({
      success: false,
      error: { message: 'Invalid token', code: 'AUTH_ERROR' }
    });
  }

  // Validate 2FA code
  const result = await twoFactorService.validateCode(decoded.userId, code);
  if (!result.valid) {
    return res.status(401).json({
      success: false,
      error: { message: 'Invalid or expired code', code: 'INVALID_2FA_CODE' }
    });
  }

  // Generate full JWT
  const token = jwt.sign({ userId: decoded.userId }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });

  res.json({ success: true, data: { token } });
};
```

**Prerequisites:** Story 2FA.1, Story 2FA.2, Story 2FA.3

---

### Story 2FA.5: 2FA Settings Toggle API

**As a** logged-in user
**I want** API endpoints to enable or disable 2FA on my account
**So that** I can control my security settings

**Acceptance Criteria:**

**New Endpoint: Get 2FA Status (`GET /api/v1/settings/2fa`)**

**Given** an authenticated user
**When** they request their 2FA status
**Then** return:
```json
{
  "success": true,
  "data": {
    "enabled": false,
    "email": "user@example.com"
  }
}
```

**New Endpoint: Enable 2FA (`POST /api/v1/settings/2fa/enable`)**

Request body:
```json
{
  "email": "user@example.com"  // Optional: different email for 2FA
}
```

**Given** an authenticated user with 2FA disabled
**When** they request to enable 2FA
**Then** the system:
- Sends a verification code to the specified email (or user's primary email)
- Stores the email temporarily (not yet enabled)
- Returns:
  ```json
  {
    "success": true,
    "message": "Verification code sent. Please verify to enable 2FA.",
    "requiresVerification": true
  }
  ```

**New Endpoint: Confirm Enable 2FA (`POST /api/v1/settings/2fa/confirm-enable`)**

Request body:
```json
{
  "code": "123456"
}
```

**When** user submits the verification code
**Then** the system:
- Validates the code using `twoFactorService.validateCode()`
- If valid:
  - Update user record: `twoFactorEnabled: true`, `twoFactorEmail: [email]`
  - Return success
- If invalid:
  - Return error

**New Endpoint: Disable 2FA (`POST /api/v1/settings/2fa/disable`)**

Request body:
```json
{
  "password": "user-password"  // Require password confirmation
}
```

**Given** an authenticated user with 2FA enabled
**When** they request to disable 2FA
**Then** the system:
- Validates the user's password
- If valid:
  - Update user record: `twoFactorEnabled: false`
  - Invalidate all existing 2FA codes
  - Return success
- If invalid:
  - Return error

**And** all endpoints require authentication middleware
**And** all endpoints follow standard API response format (Architecture: API patterns)
**And** rate limiting prevents abuse

**Technical Implementation:**

Architecture Reference: `/server/src/routes/settings.routes.ts` (new file), `/server/src/controllers/settingsController.ts` (new file)

**Prerequisites:** Story 2FA.1, Story 2FA.2, Story 2FA.3

---

### Story 2FA.6: Frontend Security Settings UI

**As a** logged-in user
**I want** a Security Settings page in the frontend
**So that** I can enable or disable 2FA through the UI

**Acceptance Criteria:**

**Given** the authenticated frontend application
**When** I navigate to Settings → Security
**Then** I see the Security Settings page with:

**Page Layout (`/client/src/pages/SecuritySettings.tsx`):**
- Page title: "Security Settings"
- Section: "Two-Factor Authentication (2FA)"
- Description: "Add an extra layer of security to your account by requiring a verification code sent to your email."

**2FA Status Display:**
- If 2FA is disabled:
  - Show toggle switch in "OFF" state
  - Show "Enable 2FA" button (Primary action)
- If 2FA is enabled:
  - Show toggle switch in "ON" state
  - Display: "2FA Email: user@example.com"
  - Show "Disable 2FA" button (Secondary/Destructive action)

**Enable 2FA Flow:**

**When** user clicks "Enable 2FA"
**Then** a modal/dialog opens with:
- Email input field (pre-filled with user's primary email)
- "Send Verification Code" button
- After clicking send:
  - Show success message: "Code sent to [email]"
  - Display 6-digit code input field
  - "Verify & Enable" button
  - "Resend Code" link (disabled for 60 seconds after send)

**When** user enters code and clicks "Verify & Enable"
**Then**:
- Call `POST /api/v1/settings/2fa/confirm-enable` with code
- If successful:
  - Show success toast: "2FA enabled successfully!"
  - Close modal
  - Update UI to show 2FA as enabled
- If failed:
  - Show inline error: "Invalid or expired code. Please try again."

**Disable 2FA Flow:**

**When** user clicks "Disable 2FA"
**Then** a confirmation dialog opens:
- Warning message: "Are you sure you want to disable 2FA? This will make your account less secure."
- Password input field (required for confirmation)
- "Confirm Disable" button (Destructive style)
- "Cancel" button

**When** user enters password and confirms
**Then**:
- Call `POST /api/v1/settings/2fa/disable` with password
- If successful:
  - Show success toast: "2FA disabled"
  - Close dialog
  - Update UI to show 2FA as disabled
- If failed:
  - Show inline error: "Incorrect password"

**And** all forms use React Hook Form for validation (Architecture: Form patterns)
**And** all UI follows UX Design Specification (modal sheets, button hierarchy, spacing)
**And** loading states are displayed during API calls
**And** errors are displayed using the standard error pattern (inline, rose-500 color)

**Technical Implementation:**

Architecture Reference:
- `/client/src/pages/SecuritySettings.tsx` (new page)
- `/client/src/components/settings/TwoFactorSettings.tsx` (new component)
- `/client/src/services/settingsService.ts` (new service for API calls)

UX Reference:
- Modal/Dialog patterns (UX section: Modal Sheets for Data Entry)
- Button hierarchy (UX section: Button Hierarchy)
- Form patterns (UX section: Form Patterns)

**Prerequisites:** Story 2FA.5 (API endpoints must exist)

---

### Story 2FA.7: Frontend Enhanced Login Flow

**As a** user with 2FA enabled
**I want** the login page to handle the verification code step
**So that** I can complete the 2FA login process

**Acceptance Criteria:**

**Given** the existing Login page (`/client/src/pages/Login.tsx`)
**When** I submit valid credentials
**Then** the system checks the API response:

**Standard Login Response (2FA Disabled):**
- Existing behavior: Store token, redirect to Dashboard

**2FA Required Response:**
```json
{
  "success": true,
  "requiresTwoFactor": true,
  "tempToken": "...",
  "message": "Verification code sent to your email"
}
```

**When** 2FA is required
**Then** the login form transitions to show:
- Hide email/password fields
- Show informational message: "A verification code has been sent to your email"
- Display 6-digit code input field (auto-focus, numeric only)
- "Verify" button (Primary action)
- "Resend Code" link
- "Back to Login" link (clears state, returns to email/password form)

**Code Input Component:**
- 6 individual input boxes (one digit each) for better UX
- Auto-advance to next box on digit entry
- Auto-submit when all 6 digits are entered
- Clear visual feedback for invalid code

**When** user enters the 6-digit code
**Then**:
- Auto-submit or click "Verify"
- Call `POST /api/v1/auth/verify-2fa` with tempToken and code
- If successful:
  - Store the full JWT token
  - Redirect to Dashboard
  - Show success toast: "Login successful!"
- If failed:
  - Show error below code input: "Invalid or expired code. Please try again."
  - Allow retry (max 3 attempts before returning to login)

**Resend Code:**
**When** user clicks "Resend Code"
**Then**:
- Call login API again with same credentials to trigger new code
- Show success message: "New code sent!"
- Disable "Resend" link for 60 seconds (countdown timer)

**And** all state is managed locally in the Login component
**And** loading states are shown during verification
**And** errors follow the standard error pattern (Architecture: Error Handling)
**And** the UI is responsive and follows UX design patterns

**Technical Implementation:**

Architecture Reference:
- `/client/src/pages/Login.tsx` (modify existing)
- `/client/src/components/auth/TwoFactorCodeInput.tsx` (new component)
- `/client/src/services/authService.ts` (add verify2FA function)

UX Reference:
- Form patterns and validation (UX section: Form Patterns)
- Feedback patterns for success/error (UX section: Feedback Patterns)

**Prerequisites:** Story 2FA.4 (backend login flow must support 2FA)

---

### Story 2FA.8: Rate Limiting and Security Hardening

**As a** system administrator
**I want** rate limiting and security measures on 2FA endpoints
**So that** the system is protected against brute force and abuse

**Acceptance Criteria:**

**Given** all 2FA endpoints are implemented
**When** I add security middleware
**Then** the following protections are in place:

**Rate Limiting (using express-rate-limit):**

1. **2FA Code Generation:** Max 3 requests per 15 minutes per user
   - Applies to: Login (when 2FA required), Enable 2FA flow
   - Prevents email spam and abuse

2. **2FA Code Verification:** Max 5 attempts per 15 minutes per IP
   - Applies to: `POST /api/v1/auth/verify-2fa`
   - Prevents brute force code guessing

3. **Settings Changes:** Max 10 requests per hour per user
   - Applies to: Enable/Disable 2FA endpoints
   - Prevents settings abuse

**Failed Attempt Tracking:**
- Track failed verification attempts in database
- After 3 consecutive failed verifications:
  - Invalidate current code
  - Require user to request a new code
  - Log security event for audit

**Security Headers:**
- Ensure helmet middleware covers all new endpoints (Architecture: Security Middleware)
- CSRF protection on state-changing endpoints

**Input Validation:**
- All endpoints use express-validator (Architecture: Security)
- Sanitize email inputs
- Validate code format (6 digits, numeric only)
- Validate token formats

**Logging:**
- Log all 2FA events (enable, disable, successful/failed verifications)
- Include userId, timestamp, IP address, action type
- Do NOT log the actual codes (NFR13: no sensitive data in logs)

**And** rate limit errors return HTTP 429 with clear message
**And** security events are logged to a dedicated audit log
**And** all validations follow Architecture patterns (express-validator)

**Technical Implementation:**

Architecture Reference:
- `/server/src/middleware/rateLimiters.ts` (extend existing or create)
- `/server/src/middleware/validation.ts` (add 2FA validators)
- Security middleware patterns (Architecture: Security Middleware Stack)

**Prerequisites:** All previous 2FA stories (final hardening step)

---

## Technical Notes

### Email Service Recommendations

**Option 1: SendGrid (Recommended for Production)**
- Free tier: 100 emails/day
- Excellent deliverability
- Simple API integration
- Good documentation

**Option 2: Nodemailer with Gmail (Development/Testing)**
- Free for low volume
- Easy setup for development
- App-specific passwords required
- Not recommended for production scale

**Option 3: AWS SES**
- Pay-as-you-go pricing
- Highly scalable
- Requires AWS account setup

### Security Considerations

1. **Code Expiration:** 5-minute window balances security and usability
2. **Code Format:** 6-digit numeric codes are user-friendly and sufficiently secure for email-based 2FA
3. **Temp Token:** 10-minute expiration for the temporary login token prevents session hijacking
4. **No Code Reuse:** Once a code is verified or expires, it cannot be reused
5. **Audit Trail:** All codes remain in database for security auditing (FR39)

### Testing Checklist

- [ ] Email delivery in development and production environments
- [ ] Code expiration timing (5 minutes)
- [ ] Rate limiting behavior (3 code requests per 15 minutes)
- [ ] Failed attempt tracking (3 failures invalidates code)
- [ ] Enable/disable 2FA flow end-to-end
- [ ] Login flow with 2FA enabled
- [ ] Resend code functionality
- [ ] Password confirmation for disabling 2FA
- [ ] Mobile responsiveness of UI components
- [ ] Accessibility of form inputs and modals

---

## Epic Completion Criteria

This epic is considered complete when:

✅ All 8 stories are implemented and tested
✅ Users can successfully enable 2FA through Security Settings
✅ Login flow properly handles 2FA verification
✅ Email codes are delivered reliably
✅ Rate limiting prevents abuse
✅ All security measures are in place
✅ UI is responsive and accessible
✅ Documentation is updated with 2FA setup instructions

---

## Future Enhancements (Post-Epic)

- **Backup Codes:** Generate one-time backup codes for account recovery
- **Remember Device:** Option to skip 2FA on trusted devices for 30 days
- **SMS 2FA:** Alternative to email-based codes
- **TOTP/Authenticator App:** Support for Google Authenticator, Authy, etc.
- **Multiple 2FA Methods:** Allow users to configure backup methods
- **2FA Recovery Flow:** Account recovery process if user loses access to email

---

**Total Stories:** 8
**Estimated Complexity:** Medium-High
**Security Impact:** High
**User Impact:** Medium (optional feature)
