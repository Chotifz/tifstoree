// src/app/api/users/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    // Get session from NextAuth
    const session = await getServerSession(authOptions);
    
    // // Check authentication
    // if (!session || !session.user) {
    //   return NextResponse.json(
    //     { success: false, message: "Unauthorized" },
    //     { status: 401 }
    //   );
    // }
    
    // // Check admin role
    // if (session.user.role !== 'ADMIN') {
    //   return NextResponse.json(
    //     { success: false, message: "Forbidden" },
    //     { status: 403 }
    //   );
    // }
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role');
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Create where clause for filtering
    const where = {};
    
    // Add search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    // Add role filter
    if (role) {
      where.role = role;
    }
    
    // Get users from database with pagination
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isVerified: true,
        address: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    // Get total count for pagination
    const total = await prisma.user.count({ where });
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;
    
    // Return users with pagination info
    return NextResponse.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
      },
    });
    
  } catch (error) {
    console.error("Error fetching users:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to fetch users", 
        error: error.message 
      }, 
      { status: 500 }
    );
  }
}