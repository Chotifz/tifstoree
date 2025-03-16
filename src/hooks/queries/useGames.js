// src/hooks/queries/useGames.js
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import gamesApi from '@/lib/api-client';

/**
 * Custom hook to fetch all games with filtering options
 * @param {Object} options - Query options
 * @param {boolean} [options.featured] - Filter by featured status
 * @param {boolean} [options.popular] - Filter by popular status
 * @param {boolean} [options.isNew] - Filter by new status
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
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...queryOptions
  });
}

/**
 * Custom hook to fetch games with infinite scrolling
 * @param {Object} options - Query options
 * @param {boolean} [options.featured] - Filter by featured status
 * @param {boolean} [options.popular] - Filter by popular status
 * @param {boolean} [options.isNew] - Filter by new status
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
      return pagination?.hasNext ? pagination.page + 1 : undefined;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
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
export function useGameById(id, includeCategories = true, queryOptions = {}) {
  return useQuery({
    queryKey: ['game', id, { includeCategories }],
    queryFn: () => gamesApi.getGameById(id, includeCategories),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
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
    staleTime: 2 * 60 * 1000, // 2 minutes
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
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...queryOptions
  });
}

/**
 * Custom hook to fetch products for a game by slug
 * @param {string} gameSlug - Game slug
 * @param {Object} params - Query parameters
 * @param {string} [params.categoryId] - Optional category ID filter
 * @param {boolean} [params.active] - Filter by active status (true/false)
 * @param {string} [params.search] - Search term for product name or description
 * @param {number} [params.limit] - Limit number of results per page
 * @param {number} [params.page] - Page number for pagination
 * @param {Object} [queryOptions] - Additional React Query options
 * @returns {Object} React Query result with products data
 */
export function useGameProducts(gameSlug, params = {}, queryOptions = {}) {
  return useQuery({
    queryKey: ['gameProducts', gameSlug, params],
    queryFn: () => gamesApi.getGameProducts(gameSlug, params),
    enabled: !!gameSlug,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...queryOptions
  });
}


