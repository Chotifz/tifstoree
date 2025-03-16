// src/app/api/games/[id]/products/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    
    // Get query parameters
    const categoryId = searchParams.get('categoryId');
    const active = searchParams.get('active') === 'true' ? true : undefined;
    const search = searchParams.get('search');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit'), 10) : undefined;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page'), 10) : 1;
    
    // First, find the game by id
    const game = await prisma.game.findUnique({
      where: { id },
      select: { id: true }
    });
    
    if (!game) {
      return NextResponse.json(
        { success: false, message: 'Game not found' },
        { status: 404 }
      );
    }
    
    const where = {
      gameId: game.id
    };
    
    // Add category filter if specified
    if (categoryId) {
      where.categoryId = categoryId;
    }
    
    // Add active filter if specified
    if (active !== undefined) {
      where.isActive = active;
    }
    
    // Add search if provided
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    // Calculate pagination
    const skip = limit ? (page - 1) * limit : undefined;
    const take = limit;
    
    // Get products
    const products = await prisma.product.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            id: true
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
    
    // Create pagination data if limit is specified
    let pagination = null;
    if (limit) {
      const totalPages = Math.ceil(total / limit);
      pagination = {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      };
    }
    
    // Return response
    return NextResponse.json({
      success: true,
      products,
      ...(pagination && { pagination }),
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