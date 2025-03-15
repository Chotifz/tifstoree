// src/app/api/auth/login/route.js
import { NextResponse } from 'next/server';
import { loginUser } from '@/services/auth/auth.service';
import { z } from 'zod';

// Define validation schema for login
const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export async function POST(request) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate request data
    const result = loginSchema.safeParse(body);
    
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
    
    // Login the user
    const { user, token } = await loginUser(result.data);
    
    // Set cookies for authentication
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user,
    });

    // Set the auth token as HTTP-only cookie
    response.cookies.set({
      name: 'auth-token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });
    
    return response;
    
  } catch (error) {
    console.error("Login error:", error);
    
    // Handle invalid credentials
    if (error.message === "Invalid email or password") {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 401 }
      );
    }
    
    // Handle other errors
    return NextResponse.json(
      { 
        success: false, 
        message: "Login failed", 
        error: error.message 
      }, 
      { status: 500 }
    );
  }
}