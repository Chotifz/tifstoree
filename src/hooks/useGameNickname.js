// src/hooks/useGameNickname.js
import { useState } from 'react';
import { toast } from 'sonner';
import axios from 'axios';

export function useGameNickname() {
  const [nickname, setNickname] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNickname = async ({ gameCode, userId, zoneId }) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.get('/api/vipayment/nickname', {
        params: {
          gameCode,
          userId,
          zoneId,
        },
      });
      
      const data = response.data;
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch nickname');
      }
      
      setNickname(data.nickname);
      return data.nickname;
      
    } catch (err) {
      console.error('Error fetching nickname:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch nickname';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  
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