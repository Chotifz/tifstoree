// src/services/provider/vippayment.service.js
import { prisma } from '@/lib/prisma';


export async function fetchProducts(options = {}) {
  try {
    // Build query parameters
    const params = new URLSearchParams();
    
    if (options.gameCode) {
      params.append('filter_type', 'game');
      params.append('filter_value', options.gameCode);
    }
    
    if (options.server) {
      params.append('filter_server', options.server);
    }
    
    // Only get available products
    params.append('filter_status', 'available');
    
    // Make request to internal API endpoint that forwards to VIPayment
    const response = await fetch(`/api/vipayment/services?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.result) {
      throw new Error(result.message || 'Failed to fetch products');
    }
    
    return result.data || [];
  } catch (error) {
    console.error('Error fetching VIPayment products:', error);
    throw error;
  }
}


export async function syncWithDatabase(products, options) {
  try {
    const { gameId, categoryId, markupPercentage = 10 } = options;
    
    if (!gameId || !categoryId) {
      throw new Error('Game ID and Category ID are required');
    }
    
    // Get game and category
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      select: { id: true, name: true }
    });
    
    if (!game) {
      throw new Error('Game not found');
    }
    
    const category = await prisma.category.findFirst({
      where: { 
        id: categoryId,
        gameId
      }
    });
    
    if (!category) {
      throw new Error('Category not found for this game');
    }
    
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
      total: products.length,
    };
    
    // Process each product
    for (const providerProduct of products) {
      // Skip products without a code
      if (!providerProduct.code) {
        results.skipped++;
        continue;
      }
      
      // Skip products that are not available
      if (providerProduct.status !== 'available') {
        results.skipped++;
        continue;
      }
      
      // Calculate prices
      const basePrice = providerProduct.price.basic || 0;
      const priceWithMarkup = Math.ceil(basePrice * (1 + markupPercentage / 100));
      
      // Create product data
      const productData = {
        name: providerProduct.name || `Unknown Product`,
        description: '', // No description from provider
        basePrice: basePrice,
        price: priceWithMarkup,
        isActive: true,
        gameId,
        categoryId,
        providerCode: providerProduct.code,
        providerGame: providerProduct.game,
        providerServer: providerProduct.server,
        providerStatus: providerProduct.status,
        providerPrices: providerProduct.price,
        markupPercentage,
        requiredFields: JSON.stringify(["userId"]), // Default
        instructionText: 'Please enter your User ID', // Default
      };
      
      // If the name contains certain keywords, add server ID to required fields
      if (
        providerProduct.game?.toLowerCase().includes('mobile legends') ||
        providerProduct.name?.toLowerCase().includes('mobile legends')
      ) {
        productData.requiredFields = JSON.stringify(["userId", "serverId"]);
        productData.instructionText = 'Please enter your User ID and Server ID';
      }
      
      // Check if product already exists
      if (existingProductMap[providerProduct.code]) {
        // Update existing product
        await prisma.product.update({
          where: {
            id: existingProductMap[providerProduct.code],
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
    console.error('Error syncing VIPayment products:', error);
    throw error;
  }
}


export function calculatePrice(basePrice, markupPercentage = 10) {
  return Math.ceil(basePrice * (1 + markupPercentage / 100));
}

export function calculateDiscountPrice(price, discountPercentage = 0) {
  if (discountPercentage <= 0) return null;
  return Math.ceil(price * (1 - discountPercentage / 100));
}