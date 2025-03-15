// src/app/api/auth/reset-password/route.js
import { NextResponse } from 'next/server';
import { resetPassword } from '@/services/auth/auth.service';
import { z } from 'zod';

// Define validation schema for password reset
const resetPasswordSchema = z.object({
  token: z.string().min(1, { message: "Token is required" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  confirmPassword: z.string().min(1, { message: "Confirm password is required" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export async function POST(request) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate request data
    const result = resetPasswordSchema.safeParse(body);
    
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
    
    // Reset the password
    await resetPassword(result.data.token, result.data.password);
    
    // Return successful response
    return NextResponse.json({
      success: true,
      message: "Password has been reset successfully",
    });
    
  } catch (error) {
    console.error("Password reset error:", error);
    
    // Handle known errors
    if (error.message.includes("Invalid or expired") || error.message.includes("expired")) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }
    
    // Handle other errors
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to reset password", 
        error: error.message 
      }, 
      { status: 500 }
    );
  }
}