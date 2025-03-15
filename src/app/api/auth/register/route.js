// src/app/api/auth/register/route.js
import { NextResponse } from 'next/server';
import { registerUser } from '@/services/auth/auth.service';
import { z } from 'zod';

// Define validation schema for registration
const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  phone: z.string().optional(),
});

export async function POST(request) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate request data
    const result = registerSchema.safeParse(body);
    
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
    
    // Register the user
    const user = await registerUser(result.data);
    
    // Return successful response
    return NextResponse.json({
      success: true,
      message: "Registration successful",
      user,
    });
    
  } catch (error) {
    console.error("Registration error:", error);
    
    // Handle known errors
    if (error.message === "Email already registered") {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 409 }
      );
    }
    
    // Handle other errors
    return NextResponse.json(
      { 
        success: false, 
        message: "Registration failed", 
        error: error.message 
      }, 
      { status: 500 }
    );
  }
}