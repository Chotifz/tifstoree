// src/app/api/games/[slug]/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { 

  updateGame, 
  deleteGame,
  toggleGameFeatured,
  toggleGamePopular,
  toggleGameNew,
  getGameBySlug
} from '@/services/product/game.service';
import { z } from 'zod';

const checkedUser = async () => {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user || session.user.role !== "ADMIN") {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  return session;
};

export async function GET(request, { params }) {
  try {
    const { slug } = params;
    const { searchParams } = new URL(request.url);

    const includeCategories = searchParams.get('includeCategories') !== 'false';
    
    const game = await getGameBySlug(slug, includeCategories);
    
    return NextResponse.json({
      success: true,
      game,
    });
    
  } catch (error) {
    console.error('Error fetching game:', error);
    
    if (error.message === 'Game not found') {
      return NextResponse.json(
        { success: false, message: 'Game not found' },
        { status: 404 }
      );
    }
    
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


export async function PUT(request, { params }) {
  try {
    const session = await checkedUser();
    if (session instanceof NextResponse) return session;
    
    const { slug } = params;
    const body = await request.json();
    
    const gameSchema = z.object({
      name: z.string().min(1, { message: "Name is required" }).optional(),
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
    
    const game = await updateGame(slug, result.data);
    
    return NextResponse.json({
      success: true,
      message: "Game updated successfully",
      game,
    });
    
  } catch (error) {
    console.error('Error updating game:', error);
    
    if (error.message === 'Game not found') {
      return NextResponse.json(
        { success: false, message: 'Game not found' },
        { status: 404 }
      );
    }
    
    if (error.message.includes('already exists')) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to update game", 
        error: error.message 
      }, 
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await checkedUser();
    if (session instanceof NextResponse) return session;
    
    const { slug } = params;
    
    await deleteGame(slug);
    
    return NextResponse.json({
      success: true,
      message: "Game deleted successfully",
    });
    
  } catch (error) {
    console.error('Error deleting game:', error);
    
    if (error.message === 'Game not found') {
      return NextResponse.json(
        { success: false, message: 'Game not found' },
        { status: 404 }
      );
    }
    
    if (error.message.includes('Cannot delete game with related')) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to delete game", 
        error: error.message 
      }, 
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const session = await checkedUser();
    if (session instanceof NextResponse) return session;
    
    const { slug } = params;
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    let game;
    
    switch (action) {
      case 'toggleFeatured':
        game = await toggleGameFeatured(slug);
        break;
      case 'togglePopular':
        game = await toggleGamePopular(slug);
        break;
      case 'toggleNew':
        game = await toggleGameNew(slug);
        break;
      default:
        return NextResponse.json(
          { success: false, message: "Invalid action" },
          { status: 400 }
        );
    }
    
    return NextResponse.json({
      success: true,
      message: `Game ${action.replace('toggle', '')} status updated`,
      game,
    });
    
  } catch (error) {
    console.error('Error updating game status:', error);
    
    if (error.message === 'Game not found') {
      return NextResponse.json(
        { success: false, message: 'Game not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to update game status", 
        error: error.message 
      }, 
      { status: 500 }
    );
  }
}