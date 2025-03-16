import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    
    // Parse filter parameters
    const featured = searchParams.get('featured') === 'true';
    const popular = searchParams.get('popular') === 'true';
    const isNew = searchParams.get('new') === 'true';
    const search = searchParams.get('search') || '';
    
    // Parse pagination parameters
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;
    
    // Build the where clause based on filters
    const where = {};
    
    if (featured) {
      where.isFeatured = true;
    }
    
    if (popular) {
      where.isPopular = true;
    }
    
    if (isNew) {
      where.isNew = true;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { shortDescription: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    // Get games from the database
    const games = await prisma.game.findMany({
      where,
      orderBy: { sorting: 'asc' },
      skip,
      take: limit,
    });
    
    // Get total count for pagination
    const total = await prisma.game.count({ where });
    
    // Create pagination metadata
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
      games,
      pagination,
    });
    
  } catch (error) {
    console.error('Error fetching games:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch games', 
        error: error.message,
      }, 
      { status: 500 }
    );
  }
}