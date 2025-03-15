// src/app/api/auth/resend-verification/route.js
import { NextResponse } from 'next/server';
import { resendVerificationEmail } from '@/services/auth/auth.service';
import { z } from 'zod';

// Define validation schema for resend verification
const resendVerificationSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

export async function POST(request) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate request data
    const result = resendVerificationSchema.safeParse(body);
    
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
    
    // Resend verification email
    await resendVerificationEmail(result.data.email);
    
    // Return successful response
    return NextResponse.json({
      success: true,
      message: "Verification email has been resent",
    });
    
  } catch (error) {
    console.error("Resend verification error:", error);
    
    // Handle known errors
    if (error.message === "Email is already verified") {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }
    
    if (error.message === "User not found") {
      return NextResponse.json(
        { success: false, message: "No account found with this email" },
        { status: 404 }
      );
    }
    
    // Handle other errors
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to resend verification email", 
        error: error.message 
      }, 
      { status: 500 }
    );
  }
}