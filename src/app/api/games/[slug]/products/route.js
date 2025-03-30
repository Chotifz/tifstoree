// src/app/api/games/[slug]/products/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { 
  getProductsByGame, 
  createProduct 
} from '@/services/product/product.service';

export async function GET(request, { params }) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    
    // Get query parameters
    const categoryId = searchParams.get('categoryId');
    const page = searchParams.get('page') ? parseInt(searchParams.get('page'), 10) : 1;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit'), 10) : 10;
    
    // Find the game by slug
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
    
    // Use the service to get products
    const { products, pagination } = await getProductsByGame(game.id, {
      categoryId,
      page,
      limit
    });
    
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

export async function POST(request, { params }) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Admin access required" },
        { status: 401 }
      );
    }
    
    const { slug } = params;
    const body = await request.json();
    
    // Find the game by slug
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
    
    // Use the service to create a product
    const product = await createProduct({
      ...body,
      gameId: game.id
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