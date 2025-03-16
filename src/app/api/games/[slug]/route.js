// src/app/api/games/[slug]/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const { slug } = params;
    const { searchParams } = new URL(request.url);
    

    const includeCategories = searchParams.get('includeCategories') !== 'false';
    
    // Find game by slug with optional categories
    const game = await prisma.game.findUnique({
      where: { slug },
      include: {
        categories: includeCategories ? {
          orderBy: { sorting: 'asc' },
        } : false,
      },
    });
    
    if (!game) {
      return NextResponse.json(
        { success: false, message: 'Game not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      game,
    });
    
  } catch (error) {
    console.error('Error fetching game:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch game', 
        error: error.message,
      }, 
      { status: 500 }
    );
  }
}