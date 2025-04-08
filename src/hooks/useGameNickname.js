// src/hooks/useGameNickname.js
import { useState } from 'react';
import { toast } from 'sonner';

/**
 * Hook for fetching game nicknames
 * @returns {Object} Nickname fetching utilities
 */
export function useGameNickname() {
  const [nickname, setNickname] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch a game nickname
   * @param {Object} options - Request options
   * @param {string} options.gameCode - Game code (e.g. 'ml', 'ff', etc.)
   * @param {string} options.userId - User ID in the game
   * @param {string} options.zoneId - Zone/Server ID (if applicable)
   * @returns {Promise<string|null>} The nickname or null if there was an error
   */
  const fetchNickname = async ({ gameCode, userId, zoneId }) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Make request to our API endpoint
      const response = await fetch('/api/vipayment/nickname', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameCode,
          userId,
          zoneId,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch nickname');
      }
      
      setNickname(data.nickname);
      return data.nickname;
      
    } catch (err) {
      console.error('Error fetching nickname:', err);
      setError(err.message || 'Failed to fetch nickname');
      toast.error(err.message || 'Failed to fetch nickname');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Reset the nickname and error state
   */
  const resetNickname = () => {
    setNickname(null);
    setError(null);
  };

  return {
    nickname,
    isLoading,
    error,
    fetchNickname,
    resetNickname,
  };
}