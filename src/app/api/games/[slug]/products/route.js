// src/app/api/games/[slug]/products/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const { slug } = params;
    const { searchParams } = new URL(request.url);
    
    // Get query parameters
    const categoryId = searchParams.get('categoryId');
    const page = searchParams.get('page') ? parseInt(searchParams.get('page'), 10) : 1;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit'), 10) : 10;
    
    // First, find the game by slug
    const game = await prisma.game.findUnique({
      where: { slug },
      select: { id: true }
    });
    
    if (!game) {
      return NextResponse.json(
        { success: false, message: 'Game not found' },
        { status: 404 }
      );
    }
    
    // Build the query with minimal conditions
    const where = {
      gameId: game.id,
      isActive: true, // Always get active products by default
    };
    
    // Add category filter if specified
    if (categoryId) {
      where.categoryId = categoryId;
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    const take = limit;
    
    // Get products
    const products = await prisma.product.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      },
      orderBy: [
        { sorting: 'asc' },
        { name: 'asc' }
      ],
      skip,
      take,
    });
    
    // Get total count for pagination
    const total = await prisma.product.count({ where });
    
    // Create pagination data
    const totalPages = Math.ceil(total / limit);
    const pagination = {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
    
    // Return response
    return NextResponse.json({
      success: true,
      products,
      pagination,
    });
    
  } catch (error) {
    console.error('Error fetching game products:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch products', 
        error: error.message,
      }, 
      { status: 500 }
    );
  }
}

// For admin: Create a new product for a game
export async function POST(request, { params }) {
  try {
    // Check for admin authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Admin access required" },
        { status: 401 }
      );
    }
    
    const { slug } = params;
    const body = await request.json();
    
    // First, find the game by slug
    const game = await prisma.game.findUnique({
      where: { slug },
      select: { id: true }
    });
    
    if (!game) {
      return NextResponse.json(
        { success: false, message: 'Game not found' },
        { status: 404 }
      );
    }
    
    // Create product data with game ID
    const productData = {
      ...body,
      gameId: game.id
    };
    
    // Create the product
    const product = await prisma.product.create({
      data: productData,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });
    
    return NextResponse.json({
      success: true,
      message: "Product created successfully",
      product,
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating product:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to create product", 
        error: error.message 
      }, 
      { status: 500 }
    );
  }
}