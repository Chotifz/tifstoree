// src/services/auth/auth.service.js
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomBytes } from "crypto";
import { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail } from "@/lib/email";

// Register a new user
export async function registerUser(userData) {
  const { name, email, password, phone } = userData;

  // Check if user with this email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("Email already registered");
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create the user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      phone,
    },
  });

  // Create verification token
  const verificationToken = randomBytes(32).toString("hex");
  const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

  // Save token to database
  await prisma.verificationToken.create({
    data: {
      token: verificationToken,
      userId: user.id,
      expires: tokenExpires,
    },
  });

  // Send verification email
  try {
    await sendVerificationEmail(user.email, user.name, verificationToken);
  } catch (error) {
    console.error("Failed to send verification email:", error);
    // We don't throw here to prevent registration failure if email sending fails
    // But you might want to log this or handle it differently
  }

  // Remove password from the returned user object
  const { password: _, ...userWithoutPassword } = user;
  
  return userWithoutPassword;
}

// Login user
export async function loginUser(credentials) {
  const { email, password } = credentials;

  // Find the user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  
  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  // Create JWT token
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  // Remove password from the returned user object
  const { password: _, ...userWithoutPassword } = user;
  
  return {
    user: userWithoutPassword,
    token,
  };
}

// Verify email
export async function verifyEmail(token) {
  try {
    // Find verification token
    const verification = await prisma.verificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verification) {
      throw new Error("Invalid verification token");
    }

    // Check if token is expired (24 hours)
    if (verification.expires < new Date()) {
      throw new Error("Verification token has expired");
    }

    // Update user as verified
    await prisma.user.update({
      where: { id: verification.userId },
      data: { isVerified: true },
    });

    // Delete the used token
    await prisma.verificationToken.delete({
      where: { id: verification.id },
    });

    // Send welcome email
    try {
      await sendWelcomeEmail(verification.user.email, verification.user.name);
    } catch (error) {
      console.error("Failed to send welcome email:", error);
      // Non-critical error, we don't throw
    }

    return { success: true, email: verification.user.email };
  } catch (error) {
    throw new Error(`Email verification failed: ${error.message}`);
  }
}

// Request password reset
export async function requestPasswordReset(email) {
  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // For security reasons, we don't reveal if the email exists or not
      return { success: true };
    }

    // Generate reset token
    const resetToken = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Delete any existing password reset tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    // Save new token to database
    await prisma.passwordResetToken.create({
      data: {
        token: resetToken,
        userId: user.id,
        expires,
      },
    });

    // Send password reset email
    await sendPasswordResetEmail(user.email, user.name, resetToken);

    return { success: true };
  } catch (error) {
    console.error("Password reset request failed:", error);
    throw new Error("Failed to process password reset request");
  }
}

// Reset password with token
export async function resetPassword(token, newPassword) {
  try {
    // Find password reset token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      throw new Error("Invalid or expired password reset token");
    }

    // Check if token is expired
    if (resetToken.expires < new Date()) {
      throw new Error("Password reset token has expired");
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    });

    // Delete the used token
    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id },
    });

    return { success: true };
  } catch (error) {
    throw new Error(`Password reset failed: ${error.message}`);
  }
}

// Resend verification email
export async function resendVerificationEmail(email) {
  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (user.isVerified) {
      throw new Error("Email is already verified");
    }

    // Delete any existing verification tokens for this user
    await prisma.verificationToken.deleteMany({
      where: { userId: user.id },
    });

    // Create new verification token
    const verificationToken = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    // Save token to database
    await prisma.verificationToken.create({
      data: {
        token: verificationToken,
        userId: user.id,
        expires,
      },
    });

    // Send verification email
    await sendVerificationEmail(user.email, user.name, verificationToken);

    return { success: true };
  } catch (error) {
    throw new Error(`Failed to resend verification email: ${error.message}`);
  }
}