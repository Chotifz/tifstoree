// src/app/api/games/[slug]/sync-vipayment/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { fetchVipaymentGameFeature, syncWithDatabase } from '@/services/provider/vippayment.service';
import { z } from 'zod';

export async function POST(request, { params }) {
  try {
     const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Admin access required" },
        { status: 401 }
      );
    }
    
    const { slug } = await params;
    const body = await request.json();

    // Validate request body
    const syncSchema = z.object({
      gameCode: z.string().min(1, { message: "Game code is required" }),
      onlyAvailable: z.boolean().optional().default(false),
      markupPercentage: z.number().min(0).max(100).optional().default(10),
    });
    
    const result = syncSchema.safeParse(body);
    
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
    
    // Fetch products from VIPayment
    const products = await fetchVipaymentGameFeature({
      gameCode: result.data.gameCode,
      filterType: 'game'
    });
    
    if (!products || !Array.isArray(products)) {
      return NextResponse.json(
        { success: false, message: 'Failed to fetch products from provider' },
        { status: 500 }
      );
    }
    
    // Sync with database
    const syncResults = await syncWithDatabase(products, {
      gameId: game.id,
      onlyAvailable: result.data.onlyAvailable,
      markupPercentage: result.data.markupPercentage
    });
    
    // Create a sync log
    await prisma.syncLog.create({
      data: {
        provider: 'vipayment',
        gameId: game.id,
        providerCategory: result.data.gameCode,
        results: syncResults,
        status: syncResults.created > 0 || syncResults.updated > 0 ? 'success' : 'no_changes',
        // userId: session.user.id
      }
    });
    
    return NextResponse.json({
      success: true,
      message: "Products synchronized successfully",
      results: syncResults,
      game: {
        id: game.id,
        name: game.name
      }
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