// src/app/api/auth/verify/route.js
import { NextResponse } from 'next/server';
import { verifyEmail } from '@/services/auth/auth.service';

export async function GET(request) {
  try {
    // Get verification token from URL
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Verification token is required" },
        { status: 400 }
      );
    }
    
    // Verify the email
    await verifyEmail(token);
    
    // Redirect to success page
    return NextResponse.redirect(new URL('/sign-in?verified=true', request.url));
    
  } catch (error) {
    console.error("Email verification error:", error);
    
    // Redirect to error page
    return NextResponse.redirect(
      new URL(`/error?message=${encodeURIComponent(error.message)}`, request.url)
    );
  }
}