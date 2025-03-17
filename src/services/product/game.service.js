// src/services/product/game.service.js
import { prisma } from '@/lib/prisma';
import slugify from 'slugify';

/**
 * Get all games with optional filters and pagination
 * @param {Object} options - Query options
 * @param {boolean} [options.featured] - Filter by featured status
 * @param {boolean} [options.popular] - Filter by popular status
 * @param {boolean} [options.isNew] - Filter by new status
 * @param {string} [options.search] - Search term
 * @param {number} [options.page=1] - Page number
 * @param {number} [options.limit=10] - Items per page
 * @returns {Promise<Object>} Object containing games array and pagination info
 */
export async function getGames({
  featured = undefined,
  popular = undefined,
  isNew = undefined,
  search = '',
  page = 1,
  limit = 10
} = {}) {
  // Build the where clause based on filters
  const where = {};
  
  if (featured !== undefined) {
    where.isFeatured = featured;
  }
  
  if (popular !== undefined) {
    where.isPopular = popular;
  }
  
  if (isNew !== undefined) {
    where.isNew = isNew;
  }
  
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { shortDescription: { contains: search, mode: 'insensitive' } },
    ];
  }
  
  // Calculate pagination
  const skip = (page - 1) * limit;
  
  // Get games from the database with pagination
  const games = await prisma.game.findMany({
    where,
    orderBy: [
      { sorting: 'asc' },
      { name: 'asc' }
    ],
    include: {
      _count: {
        select: {
          products: true,
          categories: true
        }
      }
    },
    skip,
    take: limit,
  });
  
  // Get total count for pagination
  const total = await prisma.game.count({ where });
  
  // Create pagination metadata
  const totalPages = Math.ceil(total / limit);
  const pagination = {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
  
  return {
    games,
    pagination,
  };
}

export async function getGameBySlug(slug, includeCategories = true) {
  const game = await prisma.game.findUnique({
    where: { slug },
    include: {
      categories: includeCategories ? {
        orderBy: { sorting: 'asc' },
      } : false,
    },
  });
  
  if (!game) {
    throw new Error('Game not found');
  }
  
  return game;
}

export async function createGame(data) {
  if (!data.slug) {
    data.slug = slugify(data.name, { lower: true, strict: true });
  }
  
  // Check if slug already exists
  const existingGame = await prisma.game.findUnique({
    where: { slug: data.slug },
  });
  
  if (existingGame) {
    throw new Error(`Game with slug "${data.slug}" already exists`);
  }
  
  // Create the game
  const game = await prisma.game.create({
    data,
  });
  
  return game;
}

/**
 * Update an existing game
 * @param {string} id - Game ID
 * @param {Object} data - Game data to update
 * @returns {Promise<Object>} Updated game
 */
export async function updateGame(id, data) {
  // If slug is being updated, check if the new slug already exists
  if (data.slug) {
    const existingGame = await prisma.game.findFirst({
      where: {
        slug: data.slug,
        NOT: { id },
      },
    });
    
    if (existingGame) {
      throw new Error(`Game with slug "${data.slug}" already exists`);
    }
  }
  
  // Update the game
  const game = await prisma.game.update({
    where: { id },
    data,
  });
  
  return game;
}

/**
 * Delete a game
 * @param {string} id - Game ID
 * @returns {Promise<Object>} Deleted game
 */
export async function deleteGame(id) {
  // Check if the game exists
  const game = await prisma.game.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          products: true,
          categories: true
        }
      }
    }
  });
  
  if (!game) {
    throw new Error('Game not found');
  }
  
  // Check if the game has related products or categories
  if (game._count.products > 0 || game._count.categories > 0) {
    throw new Error('Cannot delete game with related products or categories. Delete them first.');
  }
  
  // Delete the game
  const deletedGame = await prisma.game.delete({
    where: { id },
  });
  
  return deletedGame;
}

/**
 * Toggle game featured status
 * @param {string} id - Game ID
 * @returns {Promise<Object>} Updated game
 */
export async function toggleGameFeatured(id) {
  const game = await prisma.game.findUnique({
    where: { id },
    select: { isFeatured: true },
  });
  
  if (!game) {
    throw new Error('Game not found');
  }
  
  // Toggle the status
  const updatedGame = await prisma.game.update({
    where: { id },
    data: { isFeatured: !game.isFeatured },
  });
  
  return updatedGame;
}

/**
 * Toggle game popular status
 * @param {string} id - Game ID
 * @returns {Promise<Object>} Updated game
 */
export async function toggleGamePopular(id) {
  const game = await prisma.game.findUnique({
    where: { id },
    select: { isPopular: true },
  });
  
  if (!game) {
    throw new Error('Game not found');
  }
  
  // Toggle the status
  const updatedGame = await prisma.game.update({
    where: { id },
    data: { isPopular: !game.isPopular },
  });
  
  return updatedGame;
}

/**
 * Toggle game new status
 * @param {string} id - Game ID
 * @returns {Promise<Object>} Updated game
 */
export async function toggleGameNew(id) {
  const game = await prisma.game.findUnique({
    where: { id },
    select: { isNew: true },
  });
  
  if (!game) {
    throw new Error('Game not found');
  }
  
  // Toggle the status
  const updatedGame = await prisma.game.update({
    where: { id },
    data: { isNew: !game.isNew },
  });
  
  return updatedGame;
}

/**
 * Update game sorting position
 * @param {string} id - Game ID
 * @param {number} sorting - New sorting position
 * @returns {Promise<Object>} Updated game
 */
export async function updateGameSorting(id, sorting) {
  const updatedGame = await prisma.game.update({
    where: { id },
    data: { sorting },
  });
  
  return updatedGame;
}