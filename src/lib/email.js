// src/lib/email.js
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Sends verification email to user
 * @param {string} email - User's email address
 * @param {string} name - User's name
 * @param {string} verificationToken - Verification token
 * @returns {Promise<{success: boolean}>}
 */
export async function sendVerificationEmail(email, name, verificationToken) {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const verificationUrl = `${baseUrl}/api/auth/verify?token=${verificationToken}`;

    const { data, error } = await resend.emails.send({
      from: `GameStore <${process.env.EMAIL_FROM || 'noreply@yourdomain.com'}>`,
      to: email,
      subject: 'Verify your email address',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f7f9fc;
            }
            .header {
              background-color: #4338ca;
              padding: 20px;
              text-align: center;
              color: white;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background-color: white;
              padding: 30px;
              border-radius: 0 0 8px 8px;
              box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background-color: #4338ca;
              color: white;
              text-decoration: none;
              border-radius: 4px;
              font-weight: bold;
              margin: 20px 0;
            }
            .footer {
              margin-top: 20px;
              text-align: center;
              font-size: 12px;
              color: #888;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Email Verification</h1>
            </div>
            <div class="content">
              <h2>Hello, ${name || 'there'}!</h2>
              <p>Thank you for registering with our game store. Please verify your email address to complete your registration and access all features.</p>
              <p>
                <a href="${verificationUrl}" class="button">Verify My Email</a>
              </p>
              <p>Or copy and paste this link in your browser:</p>
              <p style="word-break: break-all; font-size: 14px; color: #666;">
                ${verificationUrl}
              </p>
              <p>This link will expire in 24 hours.</p>
              <p>If you did not create an account, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} GameStore. All rights reserved.</p>
              <p>This is an automated email, please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Resend API error:', error);
      throw new Error(error.message);
    }

    console.log('Verification email sent successfully:', data);
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
}

/**
 * Sends welcome email to user after verification
 * @param {string} email - User's email address
 * @param {string} name - User's name
 * @returns {Promise<{success: boolean}>}
 */
export async function sendWelcomeEmail(email, name) {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    const { data, error } = await resend.emails.send({
      from: `GameStore <${process.env.EMAIL_FROM || 'noreply@yourdomain.com'}>`,
      to: email,
      subject: 'Welcome to GameStore!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to GameStore</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f7f9fc;
            }
            .header {
              background-color: #4338ca;
              padding: 20px;
              text-align: center;
              color: white;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background-color: white;
              padding: 30px;
              border-radius: 0 0 8px 8px;
              box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background-color: #4338ca;
              color: white;
              text-decoration: none;
              border-radius: 4px;
              font-weight: bold;
              margin: 20px 0;
            }
            .footer {
              margin-top: 20px;
              text-align: center;
              font-size: 12px;
              color: #888;
            }
            .games {
              display: flex;
              justify-content: space-between;
              margin: 20px 0;
              flex-wrap: wrap;
            }
            .game {
              width: 48%;
              margin-bottom: 15px;
              text-align: center;
            }
            .game img {
              max-width: 100%;
              border-radius: 4px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to GameStore!</h1>
            </div>
            <div class="content">
              <h2>Hello, ${name || 'there'}!</h2>
              <p>Thank you for joining GameStore! Your account has been successfully verified and is now ready to use.</p>
              <p>With your account, you can:</p>
              <ul>
                <li>Top up game credits for your favorite games</li>
                <li>Track your order history</li>
                <li>Get exclusive promotions and discounts</li>
                <li>Experience faster checkout process</li>
              </ul>
              <p>
                <a href="${baseUrl}/games" class="button">Explore Games</a>
              </p>
              <p>Here are some popular games you might be interested in:</p>
              <div class="games">
                <div class="game">
                  <p>Mobile Legends</p>
                </div>
                <div class="game">
                  <p>Free Fire</p>
                </div>
              </div>
              <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} GameStore. All rights reserved.</p>
              <p>This is an automated email, please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Resend API error:', error);
      throw new Error(error.message);
    }

    console.log('Welcome email sent successfully:', data);
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
}

/**
 * Sends password reset email to user
 * @param {string} email - User's email address
 * @param {string} name - User's name
 * @param {string} resetToken - Password reset token
 * @returns {Promise<{success: boolean}>}
 */
export async function sendPasswordResetEmail(email, name, resetToken) {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

    const { data, error } = await resend.emails.send({
      from: `GameStore <${process.env.EMAIL_FROM || 'noreply@yourdomain.com'}>`,
      to: email,
      subject: 'Reset Your Password',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f7f9fc;
            }
            .header {
              background-color: #4338ca;
              padding: 20px;
              text-align: center;
              color: white;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background-color: white;
              padding: 30px;
              border-radius: 0 0 8px 8px;
              box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background-color: #4338ca;
              color: white;
              text-decoration: none;
              border-radius: 4px;
              font-weight: bold;
              margin: 20px 0;
            }
            .footer {
              margin-top: 20px;
              text-align: center;
              font-size: 12px;
              color: #888;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset</h1>
            </div>
            <div class="content">
              <h2>Hello, ${name || 'there'}!</h2>
              <p>We received a request to reset your password. Click the button below to create a new password:</p>
              <p>
                <a href="${resetUrl}" class="button">Reset Password</a>
              </p>
              <p>Or copy and paste this link in your browser:</p>
              <p style="word-break: break-all; font-size: 14px; color: #666;">
                ${resetUrl}
              </p>
              <p>This link will expire in 1 hour.</p>
              <p>If you did not request a password reset, please ignore this email or contact our support team if you have concerns.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} GameStore. All rights reserved.</p>
              <p>This is an automated email, please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Resend API error:', error);
      throw new Error(error.message);
    }

    console.log('Password reset email sent successfully:', data);
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
}