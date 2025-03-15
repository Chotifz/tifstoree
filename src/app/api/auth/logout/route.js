// src/app/api/auth/logout/route.js
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Create response object
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });

    // Clear the auth token cookie
    response.cookies.set({
      name: 'auth-token',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0, // Immediately expire the cookie
    });
    
    return response;
    
  } catch (error) {
    console.error("Logout error:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: "Logout failed", 
        error: error.message 
      }, 
      { status: 500 }
    );
  }
}