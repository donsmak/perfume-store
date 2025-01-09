import nodemailer from 'nodemailer';
import { logger } from './logger';

// Configure email transporter (replace with your actual settings)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendVerificationEmail = async (email: string, token: string): Promise<void> => {
  const verificationUrl = `${
    process.env.BACKEND_URL || 'http://localhost:5000'
  }/api/v1/auth/verify-email?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Verify Your Email',
    html: `
      <p>Please click the link below to verify your email address:</p>
      <a href="${verificationUrl}">${verificationUrl}</a>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`Verification email sent to ${email}`);
  } catch (error) {
    logger.error(`Error sending verification email: ${error}`);
    throw error;
  }
};

export const sendPasswordResetEmail = async (email: string, token: string): Promise<void> => {
  const resetUrl = `${
    process.env.FRONTEND_URL || 'http://localhost:3000'
  }/reset-password?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset Request',
    html: `
      <p>You requested a password reset. Please click the link below to reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>If you did not request a password reset, please ignore this email.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`Password reset email sent to ${email}`);
  } catch (error) {
    logger.error(`Error sending password reset email: ${error}`);
    throw error;
  }
};
