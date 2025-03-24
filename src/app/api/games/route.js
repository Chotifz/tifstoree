// src/app/api/games/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getGames, createGame } from '@/services/product/game.service';
import { z } from 'zod';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const result = await getGames({
      page,
      limit,
    });
    
    return NextResponse.json({
      success: true,
      games: result.games,
      pagination: result.pagination,
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

export async function POST(request) {
  try {

    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    
    const gameSchema = z.object({
      name: z.string().min(1, { message: "Name is required" }),
      slug: z.string().optional(),
      description: z.string().optional(),
      shortDescription: z.string().optional(),
      developerName: z.string().optional(),
      publisherName: z.string().optional(),
      icon: z.string().optional(),
      banner: z.string().optional(),
      bannerTitle: z.string().optional(),
      bannerSubtitle: z.string().optional(),
      isFeatured: z.boolean().optional(),
      isPopular: z.boolean().optional(),
      isNew: z.boolean().optional(),
      sorting: z.number().optional(),
    });
    
    const result = gameSchema.safeParse(body);
    
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
    
    const game = await createGame(result.data);
    
    return NextResponse.json({
      success: true,
      message: "Game created successfully",
      game,
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating game:', error);
    
    if (error.message.includes('already exists')) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to create game", 
        error: error.message 
      }, 
      { status: 500 }
    );
  }
}