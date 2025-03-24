import { useQuery, useInfiniteQuery } from '@tanstack/react-query';

export function useGames(options = {}, queryOptions = {}) {
  const { limit, page } = options;
  
  const result = useQuery({
    queryKey: ['games', { limit, page }],
    queryFn: async () => {
      const response = await fetch(`/api/games?${new URLSearchParams({
        limit: limit || 10,
        page: page || 1
      })}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch games');
      }
      
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...queryOptions
  });
  
  return result;
}

export function useInfiniteGames(options = {}, queryOptions = {}) {
  const { limit = 10 } = options;
  
  const result = useInfiniteQuery({
    queryKey: ['infiniteGames', { limit }],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await fetch(`/api/games?${new URLSearchParams({
        limit,
        page: pageParam
      })}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch games');
      }
      
      return response.json();
    },
    getNextPageParam: (lastPage) => {
      const { pagination } = lastPage;
      return pagination?.hasNext ? pagination.page + 1 : undefined;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...queryOptions
  });
  
  return result;
}


export function useGameById(slug, includeCategories = true, queryOptions = {}) {
  return useQuery({
    queryKey: ['game', slug, { includeCategories }],
    queryFn: async () => {
      const response = await fetch(`/api/games/${slug}?includeCategories=${includeCategories}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch game');
      }
      
      return response.json();
    },
    enabled: !!slug,
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...queryOptions
  });
}

export function useGameProducts(gameSlug, params = {}, queryOptions = {}) {
  const { categoryId, limit, page } = params;
  
  return useQuery({
    queryKey: ['gameProducts', gameSlug, { categoryId, limit, page }],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (categoryId) queryParams.append('categoryId', categoryId);
      if (limit) queryParams.append('limit', limit);
      if (page) queryParams.append('page', page);
      
      const response = await fetch(`/api/games/${gameSlug}/products?${queryParams}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      return response.json();
    },
    enabled: !!gameSlug,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...queryOptions
  });
}