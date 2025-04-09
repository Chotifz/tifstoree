// src/services/product/product.service.js
import { prisma } from '@/lib/prisma';
import { calculatePrice, calculateDiscountPrice } from '../provider/vippayment.service';
import { randomUUID } from 'crypto';

/**
 * Get products for a specific game with filtering and pagination
 * @param {string} gameId - Game ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Object containing products and pagination info
 */
export async function getProductsByGame(gameId, options = {}) {
  const { 
    categoryId,
    page = 1, 
    limit = 10,
    search = '',
    sortBy = 'price',
    sortOrder = 'asc',
    status = 'all'
  } = options;
  
  // Build the where clause
  const where = { gameId };
  
  // Filter by category if provided
  if (categoryId) {
    where.categoryId = categoryId;
  }
  
  // Filter by search term if provided
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { providerCode: { contains: search, mode: 'insensitive' } }
    ];
  }
  
  // Filter by status if provided
  if (status && status !== 'all') {
    where.providerStatus = status;
  }
  
  // Calculate pagination
  const skip = (page - 1) * limit;
  
  // Build the orderBy clause
  let orderBy = [];
  
  switch (sortBy) {
    case 'price':
      orderBy.push({ price: sortOrder });
      break;
    case 'name':
      orderBy.push({ name: sortOrder });
      break;
    case 'basePrice':
      orderBy.push({ basePrice: sortOrder });
      break;
    case 'status':
      orderBy.push({ providerStatus: sortOrder });
      break;
    case 'sorting':
    default:
      orderBy.push({ sorting: sortOrder || 'asc' });
      orderBy.push({ price: 'asc' });
      break;
  }
  
  // Fetch products with pagination
  const products = await prisma.product.findMany({
    where,
    orderBy,
    skip,
    take: limit,
  });
  
  // Get total count for pagination
  const total = await prisma.product.count({ where });
  
  // Calculate pagination metadata
  const totalPages = Math.ceil(total / limit);
  
  return {
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

/**
 * Get a product by ID
 * @param {string} id - Product ID
 * @param {string} gameId - Game ID (optional, for validation)
 * @returns {Promise<Object>} Product object
 */
export async function getProductById(id, gameId = null) {
  const where = { id };
  
  // If gameId is provided, add it to the where clause
  if (gameId) {
    where.gameId = gameId;
  }
  
  const product = await prisma.product.findFirst({
    where,
    include: {
      game: {
        select: {
          id: true,
          name: true,
          slug: true,
          requiredFields: true,
          instructionText: true,
        }
      }
    },
  });
  
  if (!product) {
    throw new Error('Product not found');
  }
  
  return product;
}

/**
 * Create a new product
 * @param {Object} data - Product data
 * @returns {Promise<Object>} Created product object
 */
export async function createProduct(data) {
  // Generate unique product ID if not provided
  if (!data.id) {
    data.id = `PROD_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  }
  
  // Calculate price from basePrice if provided but no price
  if (data.basePrice && !data.price) {
    data.price = calculatePrice(data.basePrice, data.markupPercentage || 10);
  }
  
  // Calculate discount price if discountPercentage is provided
  if (data.price && data.discountPercentage) {
    data.discountPrice = calculateDiscountPrice(data.price, data.discountPercentage);
  }
  
  // Ensure required fields are in the right format
  if (data.requiredFields && typeof data.requiredFields === 'string') {
    try {
      data.requiredFields = JSON.parse(data.requiredFields);
    } catch (e) {
      data.requiredFields = data.requiredFields.split(',').map(f => f.trim());
    }
  }
  
  // If provider prices are provided as string, convert to object
  if (data.providerPrices && typeof data.providerPrices === 'string') {
    try {
      data.providerPrices = JSON.parse(data.providerPrices);
    } catch (e) {
      console.error('Error parsing provider prices:', e);
      data.providerPrices = null;
    }
  }
  
  // Create the product
  const product = await prisma.product.create({
    data,
    include: {
      game: {
        select: {
          id: true,
          name: true,
          slug: true,
        }
      }
    },
  });
  
  return product;
}

/**
 * Update an existing product
 * @param {string} id - Product ID
 * @param {Object} data - Updated product data
 * @returns {Promise<Object>} Updated product object
 */
export async function updateProduct(id, data) {
  // Check if product exists
  const existingProduct = await prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      basePrice: true,
      price: true,
      markupPercentage: true,
      discountPercentage: true,
    }
  });
  
  if (!existingProduct) {
    throw new Error('Product not found');
  }
  
  // Calculate prices if basePrice or markupPercentage is updated
  if (data.basePrice !== undefined || data.markupPercentage !== undefined) {
    const basePrice = data.basePrice !== undefined ? data.basePrice : existingProduct.basePrice;
    const markupPercentage = data.markupPercentage !== undefined ? data.markupPercentage : existingProduct.markupPercentage;
    
    data.price = calculatePrice(basePrice, markupPercentage);
  }
  
  // Calculate discount price if discountPercentage is provided or price changed
  if (data.discountPercentage !== undefined || (data.price !== undefined && data.discountPercentage === undefined && existingProduct.discountPercentage > 0)) {
    const price = data.price !== undefined ? data.price : existingProduct.price;
    const discountPercentage = data.discountPercentage !== undefined ? data.discountPercentage : existingProduct.discountPercentage;
    
    data.discountPrice = discountPercentage > 0 ? calculateDiscountPrice(price, discountPercentage) : null;
  }
  
  // Format required fields
  if (data.requiredFields && typeof data.requiredFields === 'string') {
    try {
      data.requiredFields = JSON.parse(data.requiredFields);
    } catch (e) {
      data.requiredFields = data.requiredFields.split(',').map(f => f.trim());
    }
  }
  
  // Format provider prices
  if (data.providerPrices && typeof data.providerPrices === 'string') {
    try {
      data.providerPrices = JSON.parse(data.providerPrices);
    } catch (e) {
      console.error('Error parsing provider prices:', e);
    }
  }
  
  // Update the product
  const product = await prisma.product.update({
    where: { id },
    data,
    include: {
      game: {
        select: {
          id: true,
          name: true,
          slug: true,
        }
      }
    },
  });
  
  return product;
}

/**
 * Delete a product
 * @param {string} id - Product ID
 * @returns {Promise<Object>} Deleted product object
 */
export async function deleteProduct(id) {
  // Check if product exists
  const product = await prisma.product.findUnique({
    where: { id },
  });
  
  if (!product) {
    throw new Error('Product not found');
  }
  
  // Check if product is used in orders
  const orderCount = await prisma.orderItem.count({
    where: { productId: id },
  });
  
  if (orderCount > 0) {
    throw new Error('Cannot delete product that has been ordered');
  }
  
  // Delete the product
  const deletedProduct = await prisma.product.delete({
    where: { id },
  });
  
  return deletedProduct;
}

/**
 * Get available product statuses for filtering
 * @param {string} gameId - Game ID (optional)
 * @returns {Promise<Array>} Available statuses
 */
export async function getProductStatuses(gameId = null) {
  const where = gameId ? { gameId } : {};
  
  const statuses = await prisma.product.groupBy({
    by: ['providerStatus'],
    where,
  });
  
  return statuses.map(status => status.providerStatus).filter(Boolean);
}

/**
 * Bulk update product prices based on markup
 * @param {string} gameId - Game ID
 * @param {number} markupPercentage - New markup percentage
 * @returns {Promise<Object>} Update result
 */
export async function bulkUpdateProductsMarkup(gameId, markupPercentage) {
  if (!gameId) {
    throw new Error('Game ID is required');
  }
  
  if (markupPercentage < 0) {
    throw new Error('Markup percentage must be a positive number');
  }
  
  // Get all products for this game
  const products = await prisma.product.findMany({
    where: { gameId },
    select: {
      id: true,
      basePrice: true,
    }
  });
  
  // Update each product
  const updateResults = await Promise.all(
    products.map(async (product) => {
      if (product.basePrice) {
        const newPrice = calculatePrice(product.basePrice, markupPercentage);
        return prisma.product.update({
          where: { id: product.id },
          data: {
            price: newPrice,
            markupPercentage,
          }
        });
      }
      
      return null;
    })
  );
  
  // Count successful updates
  const updatedCount = updateResults.filter(Boolean).length;
  
  return {
    success: true,
    updated: updatedCount,
    total: products.length,
  };
}