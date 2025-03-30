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
    const body = await request.json();
   
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
 
    const user = await registerUser(result.data);
    
    return NextResponse.json({
      success: true,
      message: "Registration successful",
      user,
    });
    
  } catch (error) {
    console.error("Registration error:", error);
    
    if (error.message === "Email already registered") {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 409 }
      );
    }
    
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