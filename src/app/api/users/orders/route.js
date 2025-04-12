// src/app/api/user/orders/route.js
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
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const status = searchParams.get('status');
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Build query filter
    const where = { userId: session.user.id };
    
    // Add status filter if provided
    if (status) {
      where.status = status;
    }
    
    // Get orders from database with pagination
    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              include: {
                game: {
                  select: {
                    name: true,
                    slug: true,
                    icon: true
                  }
                }
              }
            }
          }
        },
        payment: {
          select: {
            status: true,
            method: true,
            paymentCode: true,
            paidAt: true
          }
        },
        transaction: {
          select: {
            status: true,
            transactionCode: true,
            providerRef: true,
            responseData: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    });
    
    // Get total count for pagination
    const total = await prisma.order.count({ where });
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    
    return NextResponse.json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });
    
  } catch (error) {
    console.error('Error fetching user orders:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || "Failed to fetch orders" 
      }, 
      { status: 500 }
    );
  }
}