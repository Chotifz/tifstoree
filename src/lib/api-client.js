// src/lib/api-client.js
import axios from '@/lib/axios';

/**
 * API client for games-related endpoints
 */
const gamesApi = {
 
  getAllGames: async (params = {}) => {
    try {
      const response = await axios.get('/api/games', { 
        params: {
          // Convert boolean params to strings for URL compatibility
          featured: params.featured ? 'true' : undefined,
          popular: params.popular ? 'true' : undefined,
          new: params.new ? 'true' : undefined,
          search: params.search || undefined,
          limit: params.limit,
          page: params.page
        }
      });
    
      return response.data;
    } catch (error) {
      console.error('Error fetching games:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch games');
    }
  },

  getGameById: async (slug, includeCategories = true) => {
    try {
      const response = await axios.get(`/api/games/${slug}`, { 
        params: { includeCategories: includeCategories ? 'true' : 'false' }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching game "${slug}":`, error);
      throw new Error(error.response?.data?.message || 'Failed to fetch game');
    }
  },

  searchGames: async (query) => {
    try {
      const response = await axios.get('/api/games', { 
        params: { search: query }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching games:', error);
      throw new Error(error.response?.data?.message || 'Failed to search games');
    }
  },

  getGameProducts: async (gameSlug, params = {}) => {
    try {
      const response = await axios.get(`/api/games/${gameSlug}/products`, {
        params: {
          categoryId: params.categoryId,
          active: params.active !== undefined ? String(params.active) : undefined,
          search: params.search || undefined,
          limit: params.limit,
          page: params.page
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching products for game "${gameSlug}":`, error);
      throw new Error(error.response?.data?.message || 'Failed to fetch products');
    }
  },
}
  
export default gamesApi;