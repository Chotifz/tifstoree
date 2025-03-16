// src/hooks/use-games-query.js
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import gamesApi from '@/lib/api-client';

/**
 * Custom hook to fetch all games with filtering options
 * @param {Object} options - Query options
 * @param {boolean} [options.featured] - Filter by featured status
 * @param {boolean} [options.popular] - Filter by popular status
 * @param {boolean} [options.new] - Filter by new status
 * @param {string} [options.search] - Search term
 * @param {number} [options.limit] - Limit per page
 * @param {number} [options.page] - Page number
 * @param {Object} [queryOptions] - Additional React Query options
 * @returns {Object} React Query result
 */
export function useGames(options = {}, queryOptions = {}) {
  const { featured, popular, isNew, search, limit, page } = options;
  
  return useQuery({
    queryKey: ['games', { featured, popular, isNew, search, limit, page }],
    queryFn: () => gamesApi.getAllGames({ 
      featured, 
      popular, 
      new: isNew, // Renamed to avoid JS reserved keyword
      search,
      limit,
      page
    }),
    ...queryOptions
  });
}

/**
 * Custom hook to fetch games with infinite scrolling
 * @param {Object} options - Query options
 * @param {boolean} [options.featured] - Filter by featured status
 * @param {boolean} [options.popular] - Filter by popular status
 * @param {boolean} [options.new] - Filter by new status
 * @param {string} [options.search] - Search term
 * @param {number} [options.limit] - Limit per page
 * @param {Object} [queryOptions] - Additional React Query options
 * @returns {Object} React Query infinite result
 */
export function useInfiniteGames(options = {}, queryOptions = {}) {
  const { featured, popular, isNew, search, limit = 10 } = options;
  
  return useInfiniteQuery({
    queryKey: ['infiniteGames', { featured, popular, isNew, search, limit }],
    queryFn: ({ pageParam = 1 }) => gamesApi.getAllGames({ 
      featured, 
      popular, 
      new: isNew, // Renamed to avoid JS reserved keyword
      search,
      limit,
      page: pageParam
    }),
    getNextPageParam: (lastPage) => {
      const { pagination } = lastPage;
      return pagination.hasNext ? pagination.page + 1 : undefined;
    },
    ...queryOptions
  });
}

/**
 * Custom hook to fetch a game by slug
 * @param {string} slug - Game slug
 * @param {boolean} [includeCategories=true] - Whether to include categories
 * @param {Object} [queryOptions] - Additional React Query options
 * @returns {Object} React Query result
 */
export function useGameBySlug(slug, includeCategories = true, queryOptions = {}) {
  return useQuery({
    queryKey: ['game', slug, { includeCategories }],
    queryFn: () => gamesApi.getGameBySlug(slug, includeCategories),
    enabled: !!slug,
    ...queryOptions
  });
}

/**
 * Custom hook to fetch products for a game category
 * @param {string} gameId - Game ID
 * @param {string} categoryId - Category ID
 * @param {Object} [queryOptions] - Additional React Query options
 * @returns {Object} React Query result
 */
export function useCategoryProducts(gameId, categoryId, queryOptions = {}) {
  return useQuery({
    queryKey: ['categoryProducts', gameId, categoryId],
    queryFn: () => gamesApi.getCategoryProducts(gameId, categoryId),
    enabled: !!gameId && !!categoryId,
    ...queryOptions
  });
}

/**
 * Custom hook to fetch featured games
 * @param {number} [limit] - Limit number of results
 * @param {Object} [queryOptions] - Additional React Query options
 * @returns {Object} React Query result
 */
export function useFeaturedGames(limit, queryOptions = {}) {
  return useQuery({
    queryKey: ['featuredGames', limit],
    queryFn: () => gamesApi.getFeaturedGames(limit),
    ...queryOptions
  });
}

/**
 * Custom hook to fetch popular games
 * @param {number} [limit] - Limit number of results
 * @param {Object} [queryOptions] - Additional React Query options
 * @returns {Object} React Query result
 */
export function usePopularGames(limit, queryOptions = {}) {
  return useQuery({
    queryKey: ['popularGames', limit],
    queryFn: () => gamesApi.getPopularGames(limit),
    ...queryOptions
  });
}

/**
 * Custom hook to fetch new games
 * @param {number} [limit] - Limit number of results
 * @param {Object} [queryOptions] - Additional React Query options
 * @returns {Object} React Query result
 */
export function useNewGames(limit, queryOptions = {}) {
  return useQuery({
    queryKey: ['newGames', limit],
    queryFn: () => gamesApi.getNewGames(limit),
    ...queryOptions
  });
}

/**
 * Custom hook to search games
 * @param {string} query - Search query
 * @param {Object} [queryOptions] - Additional React Query options
 * @returns {Object} React Query result
 */
export function useSearchGames(query, queryOptions = {}) {
  return useQuery({
    queryKey: ['searchGames', query],
    queryFn: () => gamesApi.searchGames(query),
    enabled: !!query && query.length > 2,
    ...queryOptions
  });
}