// src/app/api/auth/me/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        role: true,
        isVerified: true,
        image: true,
        createdAt: true,
      },
    });
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      user,
    });
    
  } catch (error) {
    console.error("Error fetching user profile:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to fetch user profile", 
        error: error.message 
      }, 
      { status: 500 }
    );
  }
}