// import nodemailer from 'nodemailer';
import config from '../config';
import { logger } from './logger';

// const transporter = nodemailer.createTransport({
//   host: config.email.host,
//   port: config.email.port,
//   secure: config.email.secure,
//   auth: {
//     user: config.email.user,
//     pass: config.email.password,
//   },
// });

// export const sendVerificationEmail = async (email: string, token: string) => {
//   const verificationUrl = `${config.app.url}/verify-email?token=${token}`;

//   await transporter.sendMail({
//     from: config.email.user,
//     to: email,
//     subject: 'Verify your email address',
//     html: `
//       <h1>Email Verification</h1>
//       <p>Please click the link below to verify your email address:</p>
//       <a href="${verificationUrl}">${verificationUrl}</a>
//       <p>This link will expire in 24 hours.</p>
//     `,
//   });
// };

// export const sendPasswordResetEmail = async (email: string, token: string) => {
//   const resetUrl = `${config.app.url}/reset-password?token=${token}`;

//   await transporter.sendMail({
//     from: config.email.user,
//     to: email,
//     subject: 'Reset your password',
//     html: `
//       <h1>Password Reset</h1>
//       <p>Please click the link below to reset your password:</p>
//       <a href="${resetUrl}">${resetUrl}</a>
//       <p>This link will expire in 24 hours.</p>
//     `,
//   });
// };

// test without email setup
export const sendVerificationEmail = async (email: string, token: string) => {
  const verificationUrl = `${
    process.env.APP_URL || 'http://localhost:5000'
  }/verify-email?token=${token}`;

  logger.info('Verification URL:', {
    email,
    url: verificationUrl,
  });
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetUrl = `${
    process.env.APP_URL || 'http://localhost:5000'
  }/reset-password?token=${token}`;

  logger.info('Password Reset URL:', {
    email,
    url: resetUrl,
  });
};
