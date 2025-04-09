// src/services/product/product.service.js
import { prisma } from '@/lib/prisma';
import { calculatePrice, calculateDiscountPrice } from '../provider/vippayment.service';


export async function getProductsByGame(gameId, options = {}) {
  const { 
    categoryId,
    page = 1, 
    limit = 10,
    search = '',
    sortBy = 'price',
    sortOrder = 'asc'
  } = options;
  
  // Build the where clause
  const where = { gameId };
  
  if (categoryId) {
    where.categoryId = categoryId;
  }
  
  if (search) {
    where.name = {
      contains: search,
      mode: 'insensitive'
    };
  }
  
  // Calculate pagination
  const skip = (page - 1) * limit;
  
  // Build the orderBy clause
  let orderBy = [];
  
  if (sortBy === 'price') {
    orderBy.push({ price: sortOrder });
  } else if (sortBy === 'name') {
    orderBy.push({ name: sortOrder });
  } else {
    // Default sorting
    orderBy.push({ sorting: 'asc' });
    orderBy.push({ price: 'asc' });
  }
  
  // Fetch products
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
    orderBy,
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


export async function createProduct(data) {
 
  if (data.basePrice && !data.price) {
    data.price = calculatePrice(data.basePrice, data.markupPercentage || 10);
  }
  
  // Make sure required fields are in the right format
  if (data.requiredFields && typeof data.requiredFields === 'string') {
    try {
      data.requiredFields = JSON.parse(data.requiredFields);
    } catch (e) {
      data.requiredFields = data.requiredFields.split(',').map(f => f.trim());
    }
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

export async function updateProduct(id, data) {
  // Calculate prices if basePrice is updated
  if (data.basePrice && (data.markupPercentage || data.markupPercentage === 0)) {
    data.price = calculatePrice(data.basePrice, data.markupPercentage);
  }
  
  // Calculate discount price if discountPercentage is provided
  if (data.price && data.discountPercentage) {
    data.discountPrice = calculateDiscountPrice(data.price, data.discountPercentage);
  }
  
  // Make sure required fields are in the right format
  if (data.requiredFields && typeof data.requiredFields === 'string') {
    try {
      data.requiredFields = JSON.parse(data.requiredFields);
    } catch (e) {
      data.requiredFields = data.requiredFields.split(',').map(f => f.trim());
    }
  }
  
  // Update the product
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