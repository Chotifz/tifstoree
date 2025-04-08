// src/app/api/games/[slug]/sync-vipayment/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { fetchProducts, syncWithDatabase } from '@/services/provider/vippayment.service';

// Admin-only API endpoint to sync products for a game from VIPayment
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

    if (!body.categoryId || !body.gameCode) {
      return NextResponse.json(
        { success: false, message: "Missing required fields: categoryId, gameCode" },
        { status: 400 }
      );
    }
    
 
    const game = await prisma.game.findUnique({
      where: { slug },
      select: { id: true, name: true }
    });
    
    if (!game) {
      return NextResponse.json(
        { success: false, message: 'Game not found' },
        { status: 404 }
      );
    }
    
    // Check if category exists and belongs to this game
    const category = await prisma.category.findFirst({
      where: {
        id: body.categoryId,
        gameId: game.id
      }
    });
    
    if (!category) {
      return NextResponse.json(
        { success: false, message: 'Category not found for this game' },
        { status: 404 }
      );
    }
    
    // Fetch products from VIPayment
    const products = await fetchProducts({
      gameCode: body.gameCode,
      server: body.server
    });
    
    // Sync with database
    const syncResults = await syncWithDatabase(products, {
      gameId: game.id,
      categoryId: body.categoryId,
      markupPercentage: body.markupPercentage || 10
    });
    
    // Create a sync log
    await prisma.syncLog.create({
      data: {
        provider: 'vipayment',
        gameId: game.id,
        categoryId: body.categoryId,
        providerCategory: body.gameCode,
        results: syncResults,
        status: syncResults.created > 0 || syncResults.updated > 0 ? 'success' : 'failed',
        userId: session.user.id
      }
    });
    
    return NextResponse.json({
      success: true,
      message: "Products synchronized successfully",
      results: syncResults
    });
    
  } catch (error) {
    console.error('Error syncing products:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to sync products", 
        error: error.message 
      }, 
      { status: 500 }
    );
  }
}