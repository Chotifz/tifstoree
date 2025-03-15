// src/app/api/auth/forgot-password/route.js
import { NextResponse } from 'next/server';
import { requestPasswordReset } from '@/services/auth/auth.service';
import { z } from 'zod';

// Define validation schema for forgot password
const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

export async function POST(request) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate request data
    const result = forgotPasswordSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Validation failed", 
          errors: result.error.errors 
        }, 
        { status: 400 }
      );
    }
    
    // Request password reset
    await requestPasswordReset(result.data.email);
    
    // Always return success, even if email doesn't exist (for security)
    return NextResponse.json({
      success: true,
      message: "If an account with that email exists, we've sent password reset instructions.",
    });
    
  } catch (error) {
    console.error("Forgot password error:", error);
    
    // Don't reveal specific errors (for security)
    return NextResponse.json(
      { 
        success: false, 
        message: "Something went wrong. Please try again later."
      }, 
      { status: 500 }
    );
  }
}