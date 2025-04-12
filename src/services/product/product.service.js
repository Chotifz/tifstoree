import { prisma } from '@/lib/prisma';
import { calculatePrice, calculateDiscountPrice } from '../provider/vippayment.service';

export async function getProductsByGame(slug, options = {}) {
  const {
    categoryId,
    page = 1,
    limit = 60,
    search = '',
    sortBy = 'price',
    sortOrder = 'asc',
    status = 'all',
  } = options;

  // Ambil gameId berdasarkan slug
  const game = await prisma.game.findUnique({
    where: { slug },
    select: { id: true, name: true },
  });

  if (!game) {
    throw new Error('Game not found');
  }

  const where = { gameId: game.id };

  if (categoryId) where.categoryId = categoryId;

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { providerCode: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (status && status !== 'all') {
    where.providerStatus = status;
  }

  const skip = (page - 1) * limit;

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

  const products = await prisma.product.findMany({
    where,
    orderBy,
    skip,
    take: limit,
  });

  const total = await prisma.product.count({ where });

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
    game: {
      id: game.id,
      name: game.name,
    }
  };
}

export async function getProductById(id, gameId = null) {
  const where = { id };
  
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
export async function createProduct(data) {

  if (!data.id) {
    data.id = `PROD_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  }

  if (data.basePrice && !data.price) {
    data.price = calculatePrice(data.basePrice, data.markupPercentage || 10);
  }

  if (data.price && data.discountPercentage) {
    data.discountPrice = calculateDiscountPrice(data.price, data.discountPercentage);
  }
  
  if (data.requiredFields && typeof data.requiredFields === 'string') {
    try {
      data.requiredFields = JSON.parse(data.requiredFields);
    } catch (e) {
      data.requiredFields = data.requiredFields.split(',').map(f => f.trim());
    }
  }
  
  if (data.providerPrices && typeof data.providerPrices === 'string') {
    try {
      data.providerPrices = JSON.parse(data.providerPrices);
    } catch (e) {
      console.error('Error parsing provider prices:', e);
      data.providerPrices = null;
    }
  }

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

export async function getProductStatuses(gameId = null) {
  const where = gameId ? { gameId } : {};
  
  const statuses = await prisma.product.groupBy({
    by: ['providerStatus'],
    where,
  });
  
  return statuses.map(status => status.providerStatus).filter(Boolean);
}

export async function bulkUpdateProductsMarkup(gameId, markupPercentage) {
  if (!gameId) {
    throw new Error('Game ID is required');
  }
  
  if (markupPercentage < 0) {
    throw new Error('Markup percentage must be a positive number');
  }
  
  const products = await prisma.product.findMany({
    where: { gameId },
    select: {
      id: true,
      basePrice: true,
    }
  });
  
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
  
  const updatedCount = updateResults.filter(Boolean).length;
  
  return {
    success: true,
    updated: updatedCount,
    total: products.length,
  };
}