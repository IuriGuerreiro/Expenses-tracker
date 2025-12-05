import nodemailer from 'nodemailer';

// Create transporter for sending emails
const createTransporter = () => {
  // In development, use Gmail or SMTP
  // In production, use SendGrid, AWS SES, or similar
  const port = parseInt(process.env.EMAIL_PORT || '587');

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: port,
    secure: port === 465, // true for 465 (SSL), false for 587 (STARTTLS)
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD, // For Gmail, use App Password
    },
    // Enable STARTTLS for port 587
    requireTLS: port === 587,
    tls: {
      // Don't fail on invalid certs in development
      rejectUnauthorized: process.env.NODE_ENV === 'production',
    },
  });
};

/**
 * Send a two-factor authentication code via email
 * @param email - Recipient email address
 * @param code - 6-digit verification code
 */
export const sendTwoFactorCode = async (email: string, code: string): Promise<void> => {
  try {
    const transporter = createTransporter();

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
          .code { font-size: 32px; font-weight: bold; color: #4F46E5; text-align: center; letter-spacing: 8px; margin: 20px 0; }
          .warning { background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 12px; margin-top: 20px; }
          .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>ExpensesTracker Security</h1>
          </div>
          <div class="content">
            <h2>Your Verification Code</h2>
            <p>You requested to sign in to your ExpensesTracker account. Use the verification code below:</p>
            <div class="code">${code}</div>
            <p><strong>This code expires in 5 minutes.</strong></p>
            <div class="warning">
              <strong>⚠️ Security Notice:</strong> If you didn't request this code, please ignore this email. Someone may have entered your email address by mistake.
            </div>
          </div>
          <div class="footer">
            <p>ExpensesTracker - Secure Financial Management</p>
            <p>This is an automated message, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
ExpensesTracker Security

Your Verification Code: ${code}

This code expires in 5 minutes.

If you didn't request this code, please ignore this email.

---
ExpensesTracker - Secure Financial Management
    `.trim();

    await transporter.sendMail({
      from: `${process.env.EMAIL_FROM_NAME || 'ExpensesTracker Security'} <${process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your ExpensesTracker Verification Code',
      html: htmlContent,
      text: textContent,
    });

    console.log(`2FA code email sent successfully to ${email}`);
  } catch (error) {
    console.error('Failed to send 2FA code email:', error);
    // Don't expose email service details in the error
    throw new Error('Failed to send verification email. Please try again later.');
  }
};
