import { prisma } from '@/lib/prisma';
import slugify from 'slugify';

export async function getGames({
    page = 1,
    limit = 10
  } = {}) {
    const skip = (page - 1) * limit;
    
    const games = await prisma.game.findMany({
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
    
    
    return {
      games,
     
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
  
  const existingGame = await prisma.game.findUnique({
    where: { slug: data.slug },
  });
  
  if (existingGame) {
    throw new Error(`Game with slug "${data.slug}" already exists`);
  }
  
  const game = await prisma.game.create({
    data,
  });
  
  return game;
}
export async function updateGame(slug, data) {
    // First, find the game by slug
    const game = await prisma.game.findUnique({
      where: { slug },
    });
    
    if (!game) {
      throw new Error(`Game not found`);
    }
    
    // If slug is being updated, check if the new slug already exists
    if (data.slug && data.slug !== slug) {
      const existingGame = await prisma.game.findFirst({
        where: {
          slug: data.slug,
          NOT: { id: game.id },
        },
      });
      
      if (existingGame) {
        throw new Error(`Game with slug "${data.slug}" already exists`);
      }
    }
    
    // Update the game
    const updatedGame = await prisma.game.update({
      where: { id: game.id },
      data,
      include: {
        categories: {
          orderBy: { sorting: 'asc' },
        },
      },
    });
    
    return updatedGame;
  }
export async function deleteGame(slug) {
    // Find the game by slug
    const game = await prisma.game.findUnique({
      where: { slug },
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
      where: { id: game.id },
    });
    
    return deletedGame;
  }

