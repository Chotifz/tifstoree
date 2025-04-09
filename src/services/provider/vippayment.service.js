import { prisma } from '@/lib/prisma';
import axios from 'axios';


export async function fetchVipaymentProducts(options = {}) {
  try {
    const params = new FormData();
    params.append('key', process.env.VIPPAYMENT_KEY);
    params.append('sign', process.env.VIPPAYMENT_SIGN);
    params.append('type', 'services');
    
    if (options.gameCode|| options.filterType || options.filterStatus) {  
      params.append('filter_value', options.gameCode || '');
      params.append('filter_type', options.filterType   || 'game');
      params.append('filter_status', options.filterStatus || 'available');
    }
    
    const response = await axios.post(process.env.API_URL_SERVER + '/game-feature', params, {
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.data.result) {
      throw new Error(response.data.message || 'Failed to fetch products from VIPayment');
    }
    
    return response.data.data || [];
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
    
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      select: { id: true, name: true, slug: true }
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
      
      // Skip products that are not available if desired
      if (options.onlyAvailable && providerProduct.status !== 'available') {
        results.skipped++;
        continue;
      }
      
      // Calculate prices
      const basePrice = parseFloat(providerProduct.price.basic) || 0;
      const priceWithMarkup = Math.ceil(basePrice * (1 + markupPercentage / 100));
      
      // Create product data
      const productData = {
        name: providerProduct.name || `Unknown Product`,
        description: providerProduct.description || '',
        basePrice: basePrice,
        price: priceWithMarkup,
        markupPercentage,
        categoryId,
        gameId,
        providerCode: providerProduct.code,
        providerGame: providerProduct.game,
        providerServer: providerProduct.server,
        providerStatus: providerProduct.status,
        providerPrices: providerProduct.price,
      };
      
      // Set required fields and instructions based on game type
      if (
        game.slug.toLowerCase().includes('mobile-legends') ||
        providerProduct.game?.toLowerCase().includes('mobile legends') ||
        providerProduct.name?.toLowerCase().includes('mobile legends')
      ) {
        productData.requiredFields = ["userId", "serverId"];
        productData.instructionText = 'Masukkan User ID dan Server ID Mobile Legends Anda. Contoh: 12345678 (1234)';
      } else {
        productData.requiredFields = ["userId"];
        productData.instructionText = `Masukkan User ID ${game.name} Anda`;
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
          data: {
            ...productData,
            id: `PROD_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`, // Generate unique ID
          },
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

export async function checkNickname(params) {
  try {
    const { gameCode, userId, zoneId } = params;
    
    if (!gameCode || !userId) {
      throw new Error('Game code and user ID are required');
    }
    
    const formData = new FormData();
    formData.append('key', process.env.VIPPAYMENT_KEY);
    formData.append('sign', process.env.VIPPAYMENT_SIGN);
    formData.append('type', 'get-nickname');
    formData.append('code', gameCode);
    formData.append('target', userId);
    
    if (zoneId) {
      formData.append('additional_target', zoneId);
    }
    
    const response = await axios.post(process.env.API_URL_SERVER + '/game-feature', formData, {
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.data.result) {
      throw new Error(response.data.message || 'Failed to check nickname');
    }
    
    return {
      success: true,
      nickname: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    console.error('Error checking nickname:', error);
    throw error;
  }
}