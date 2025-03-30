// src/services/product/product.service.js
import { prisma } from '@/lib/prisma';

/**
 * Get products for a game with optional filters
 * @param {string} gameId - The game ID
 * @param {Object} options - Filter options
 * @param {string} [options.categoryId] - Category ID filter
 * @param {number} [options.page=1] - Page number
 * @param {number} [options.limit=10] - Items per page
 * @returns {Promise<Object>} Products with pagination info
 */
export async function getProductsByGame(gameId, options = {}) {
  const { 
    categoryId,
    page = 1, 
    limit = 10,
  } = options;
  
  // Build query conditions
  const where = { gameId };
  
  if (categoryId) {
    where.categoryId = categoryId;
  }
  
  // Calculate pagination
  const skip = (page - 1) * limit;
  
  // Get products
  const products = await prisma.product.findMany({
    where,
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    orderBy: [
      { sorting: 'asc' },
      { name: 'asc' },
    ],
    skip,
    take: limit,
  });
  
  // Get total count
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
 * Get a single product by ID
 * @param {string} id - Product ID
 * @param {string} gameId - Game ID (for validation)
 * @returns {Promise<Object>} Product data
 */
export async function getProductById(id, gameId) {
  const product = await prisma.product.findFirst({
    where: {
      id,
      gameId,
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
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
 * @returns {Promise<Object>} Created product
 */
export async function createProduct(data) {
  // Validate required fields
  if (!data.name || !data.price || !data.categoryId || !data.gameId) {
    throw new Error('Missing required product fields');
  }
  
  const product = await prisma.product.create({
    data,
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });
  
  return product;
}

/**
 * Update a product
 * @param {string} id - Product ID
 * @param {Object} data - Updated product data
 * @returns {Promise<Object>} Updated product
 */
export async function updateProduct(id, data) {
  const product = await prisma.product.update({
    where: { id },
    data,
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });
  
  return product;
}

/**
 * Delete a product
 * @param {string} id - Product ID
 * @returns {Promise<Object>} Deleted product
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