// src/app/api/games/[slug]/sync/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import axios from 'axios';

// Sync products from DigiFlazz based on provider category
async function syncDigiflazzProducts(gameId, categoryId, providerCategory) {
  try {
    // In a real implementation, this would call the DigiFlazz API
    // For now, we'll use the Digiflazz configuration from environment variables
    const username = process.env.DIGIFLAZZ_USERNAME;
    const apiKey = process.env.DIGIFLAZZ_API_KEY;
    
    if (!username || !apiKey) {
      throw new Error('DigiFlazz credentials not configured');
    }
    
    // Make a request to DigiFlazz API to get the product list
    const response = await axios.post('https://api.digiflazz.com/v1/price-list', {
      cmd: 'prepaid',
      username: username,
      sign: apiKey,
      code: providerCategory // The category/brand code in DigiFlazz
    });
    
    // Check if response is valid
    if (!response.data || !response.data.data) {
      throw new Error('Invalid response from DigiFlazz API');
    }
    
    const providerProducts = response.data.data;
    
    // Get existing products for this game and category
    const existingProducts = await prisma.product.findMany({
      where: {
        gameId,
        categoryId,
      },
      select: {
        id: true,
        providerCode: true,
      }
    });
    
    // Map existing products by provider code for quick lookup
    const existingProductMap = {};
    existingProducts.forEach(product => {
      if (product.providerCode) {
        existingProductMap[product.providerCode] = product.id;
      }
    });
    
    // Track results
    const results = {
      created: 0,
      updated: 0,
      skipped: 0,
      total: providerProducts.length,
    };
    
    // Process each provider product
    for (const providerProduct of providerProducts) {
      // Skip products without a code
      if (!providerProduct.product_code) {
        results.skipped++;
        continue;
      }
      
      // Create product data
      const productData = {
        name: providerProduct.product_name || `Unknown Product`,
        description: providerProduct.desc || '',
        price: parseFloat(providerProduct.price) || 0,
        isActive: true,
        gameId,
        categoryId,
        providerCode: providerProduct.product_code,
        providerType: providerProduct.category || providerCategory,
        requiredFields: JSON.stringify(["userId"]), // Default
        instructionText: 'Please enter your User ID', // Default
      };
      
      // Check if product already exists
      if (existingProductMap[providerProduct.product_code]) {
        // Update existing product
        await prisma.product.update({
          where: {
            id: existingProductMap[providerProduct.product_code],
          },
          data: productData,
        });
        results.updated++;
      } else {
        // Create new product
        await prisma.product.create({
          data: productData,
        });
        results.created++;
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error syncing DigiFlazz products:', error);
    throw error;
  }
}

// Admin-only API endpoint to sync products for a game
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
    
    // Validate request body
    if (!body.categoryId || !body.providerCategory || !body.provider) {
      return NextResponse.json(
        { success: false, message: "Missing required fields: categoryId, providerCategory, provider" },
        { status: 400 }
      );
    }
    
    // Find the game by slug
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
    
    let syncResults;
    
    // Sync based on provider
    if (body.provider === 'digiflazz') {
      syncResults = await syncDigiflazzProducts(
        game.id, 
        body.categoryId, 
        body.providerCategory
      );
    } else {
      return NextResponse.json(
        { success: false, message: `Unsupported provider: ${body.provider}` },
        { status: 400 }
      );
    }
    
    // Create a sync log
    await prisma.syncLog.create({
      data: {
        provider: body.provider,
        gameId: game.id,
        categoryId: body.categoryId,
        providerCategory: body.providerCategory,
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