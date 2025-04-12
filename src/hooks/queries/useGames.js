import axiosInstance from '@/lib/axios';
import { useQuery} from '@tanstack/react-query';

export function useGameBySlug(slug) {
  return useQuery({
    queryKey: ['game', slug],
    queryFn: async () => {
      const res = await axiosInstance.get(`/games/${slug}`);
      return res.data;
    },
    enabled: !!slug,
    staleTime: 1 * 60 * 1000, 
  });
}

export function useGameProducts(gameSlug, params = {}, queryOptions = {}) {
  return useQuery({
    queryKey: ['gameProducts', gameSlug, params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();

      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      if (params.status) queryParams.append('status', params.status);

      const url = `/games/${gameSlug}/products${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

      const response = await axiosInstance.get(url);

      return response.data;
    },
    enabled: !!gameSlug,
    staleTime: 5 * 60 * 1000, 
    ...queryOptions,
  });
}