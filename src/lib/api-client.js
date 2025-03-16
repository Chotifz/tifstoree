// src/lib/api-client.js
import axios from '@/lib/axios';

/**
 * API client for games-related endpoints
 */
const gamesApi = {
  /**
   * Get all games with optional filters
   * @param {Object} params - Query parameters
   * @param {boolean} [params.featured] - Filter by featured status
   * @param {boolean} [params.popular] - Filter by popular status
   * @param {boolean} [params.new] - Filter by new status
   * @param {string} [params.search] - Search term for game name
   * @param {number} [params.limit] - Limit number of results
   * @param {number} [params.page] - Page number for pagination
   * @returns {Promise<Object>} Games data with pagination
   */
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

  /**
   * Get a single game by slug
   * @param {string} slug - Game slug
   * @param {boolean} [includeCategories=true] - Whether to include categories
   * @returns {Promise<Object>} Game data
   */
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

  /**
   * Search games by name
   * @param {string} query - Search query
   * @returns {Promise<Object>} Search results
   */
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

/**
 * Get products for a specific game by slug
 * @param {string} gameSlug - Game slug
 * @param {Object} params - Query parameters
 * @param {string} [params.categoryId] - Optional category ID filter
 * @param {boolean} [params.active] - Filter by active status
 * @param {string} [params.search] - Search term
 * @param {number} [params.limit] - Limit number of results
 * @param {number} [params.page] - Page number for pagination
 * @returns {Promise<Object>} Products data
 */
getGameProducts: async (gameSlug, params = {}) => {
  try {
    const response = await axios.get(`/api/games/${gameSlug}/products`, {
      params: {
        categoryId: params.categoryId,
        active: params.active ? 'true' : undefined,
        search: params.search || undefined,
        limit: params.limit,
        page: params.page
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching game products:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch products');
  }}}
  
export default gamesApi;