import { prisma } from '@/lib/prisma';
import axios from 'axios';

/**
 * Fetch products from VIPayment API
 * @param {Object} options - Options for fetching products
 * @param {string} options.gameCode - Game code from provider
 * @param {string} options.filterType - Filter type (e.g., 'game')
 * @param {string} options.filterStatus - Filter status (e.g., 'available')
 * @returns {Promise<Array>} Array of products from VIPayment
 */
export async function fetchVipaymentProducts(options = {}) {
  try {
    const params = new FormData();
    params.append('key', process.env.VIPPAYMENT_KEY);
    params.append('sign', process.env.VIPPAYMENT_SIGN);
    params.append('type', 'services');
    
    if (options.gameCode || options.filterType || options.filterStatus) {  
      params.append('filter_value', options.gameCode || '');
      params.append('filter_type', options.filterType || 'game');
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

/**
 * Sync products from VIPayment with database
 * @param {Array} products - Products from VIPayment API
 * @param {Object} options - Sync options
 * @param {string} options.gameId - Game ID
 * @param {boolean} options.onlyAvailable - Only sync available products
 * @param {number} options.markupPercentage - Markup percentage for pricing
 * @returns {Promise<Object>} Sync results
 */
export async function syncWithDatabase(products, options) {
  try {
    const { gameId, onlyAvailable = false, markupPercentage = 10 } = options;
    
    if (!gameId) {
      throw new Error('Game ID is required');
    }
    
    // Get the game from database
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      select: { id: true, name: true, slug: true }
    });
    
    if (!game) {
      throw new Error('Game not found');
    }
    
    // Get existing products for this game by provider code
    const existingProducts = await prisma.product.findMany({
      where: {
        gameId,
        providerCode: {
          in: products.map(p => p.code).filter(Boolean)
        }
      },
      select: {
        id: true,
        providerCode: true,
        providerStatus: true,
        price: true,
        basePrice: true,
        markupPercentage: true
      }
    });
    
    // Map existing products by provider code for quick lookup
    const existingProductMap = {};
    existingProducts.forEach(product => {
      if (product.providerCode) {
        existingProductMap[product.providerCode] = product;
      }
    });
    
    // Track results
    const results = {
      created: 0,
      updated: 0,
      skipped: 0,
      noChange: 0,
      total: products.length,
    };
    
    // Process each product
    for (const providerProduct of products) {
      // Skip products without a code
      if (!providerProduct.code) {
        results.skipped++;
        continue;
      }
      
      // Skip products that are not available if onlyAvailable is true
      if (onlyAvailable && providerProduct.status !== 'available') {
        results.skipped++;
        continue;
      }
      
      // Calculate prices
      const basePrice = parseFloat(providerProduct.price.basic) || 0;
      const priceWithMarkup = Math.ceil(basePrice * (1 + markupPercentage / 100));
      
      // Create product data
      const productData = {
        name: providerProduct.name || `Unknown Product`,
        description: `${providerProduct.name} for ${game.name}`,
        basePrice: basePrice,
        price: priceWithMarkup,
        markupPercentage,
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
      const existingProduct = existingProductMap[providerProduct.code];
      
      if (existingProduct) {
        // Check if product needs update
        const needsUpdate = 
          existingProduct.basePrice !== basePrice ||
          existingProduct.providerStatus !== providerProduct.status ||
          existingProduct.markupPercentage !== markupPercentage;
        
        if (needsUpdate) {
          // Update existing product
          await prisma.product.update({
            where: {
              id: existingProduct.id,
            },
            data: productData,
          });
          results.updated++;
        } else {
          // No changes needed
          results.noChange++;
        }
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

/**
 * Calculate price with markup
 * @param {number} basePrice - Base price
 * @param {number} markupPercentage - Markup percentage
 * @returns {number} Price with markup
 */
export function calculatePrice(basePrice, markupPercentage = 10) {
  return Math.ceil(basePrice * (1 + markupPercentage / 100));
}

/**
 * Calculate discounted price
 * @param {number} price - Original price
 * @param {number} discountPercentage - Discount percentage
 * @returns {number|null} Discounted price or null if no discount
 */
export function calculateDiscountPrice(price, discountPercentage = 0) {
  if (discountPercentage <= 0) return null;
  return Math.ceil(price * (1 - discountPercentage / 100));
}

/**
 * Check nickname from game provider
 * @param {Object} params - Request parameters
 * @param {string} params.gameCode - Game code
 * @param {string} params.userId - User ID
 * @param {string} params.zoneId - Zone ID (optional)
 * @returns {Promise<Object>} Nickname information
 */
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