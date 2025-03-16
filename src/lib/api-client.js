// src/lib/api-client.js
import axios from '@/lib/axios';

/**
 * API client for games-related endpoints
 */
const gamesApi = {
  /**
   * Get all games with optional filters
   * @param {Object} params - Query parameters
   * @param {string} [params.featured] - Filter by featured status (true/false)
   * @param {string} [params.popular] - Filter by popular status (true/false)
   * @param {string} [params.new] - Filter by new status (true/false)
   * @param {string} [params.search] - Search term for game name
   * @param {number} [params.limit] - Limit number of results
   * @param {number} [params.page] - Page number for pagination
   * @returns {Promise<Object>} Games data with pagination
   */
  getAllGames: async (params = {}) => {
    const response = await axios.get('/api/games', { params });
  
    return response.data;
  },

  /**
   * Get a single game by slug
   * @param {string} slug - Game slug
   * @param {boolean} [includeCategories=true] - Whether to include categories
   * @returns {Promise<Object>} Game data
   */
  getGameBySlug: async (slug, includeCategories = true) => {
    const response = await axios.get(`/api/games/${slug}`, { 
      params: { includeCategories }
    });
    return response.data;
  },

  /**
   * Get products for a specific game category
   * @param {string} gameId - Game ID
   * @param {string} categoryId - Category ID
   * @param {Object} params - Query parameters
   * @param {boolean} [params.active] - Filter by active status
   * @param {string} [params.search] - Search term
   * @param {number} [params.limit] - Limit number of results
   * @param {number} [params.page] - Page number for pagination
   * @returns {Promise<Object>} Products data
   */
  getCategoryProducts: async (gameId, categoryId, params = {}) => {
    const response = await axios.get(`/api/games/${gameId}/categories/${categoryId}/products`, {
      params
    });
    return response.data;
  },

  /**
   * Get featured games
   * @param {number} [limit] - Limit number of results
   * @returns {Promise<Object>} Featured games data
   */
  getFeaturedGames: async (limit) => {
    const response = await axios.get('/api/games', { 
      params: { 
        featured: true,
        limit: limit
      }
    });
    return response.data;
  },

  /**
   * Get popular games
   * @param {number} [limit] - Limit number of results
   * @returns {Promise<Object>} Popular games data
   */
  getPopularGames: async (limit) => {
    const response = await axios.get('/api/games', { 
      params: { 
        popular: true,
        limit: limit
      }
    });
    return response.data;
  },

  /**
   * Get new games
   * @param {number} [limit] - Limit number of results
   * @returns {Promise<Object>} New games data
   */
  getNewGames: async (limit) => {
    const response = await axios.get('/api/games', { 
      params: { 
        new: true,
        limit: limit
      }
    });
    return response.data;
  },

  /**
   * Search games by name
   * @param {string} query - Search query
   * @returns {Promise<Object>} Search results
   */
  searchGames: async (query) => {
    const response = await axios.get('/api/games', { 
      params: { search: query }
    });
    return response.data;
  },
};

export default gamesApi;