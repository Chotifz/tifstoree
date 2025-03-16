'use client';

import { useState, useEffect } from 'react';
import gamesApi from '@/lib/api-client';
import { Button } from '@/components/ui/button';

export default function TestGamesApi() {
  const [games, setGames] = useState(null);
  const [gameDetail, setGameDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fungsi untuk mengambil semua games
  const fetchAllGames = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await gamesApi.getAllGames();
      console.log('Games result:', result);
      setGames(result);
    } catch (err) {
      console.error('Error fetching games:', err);
      setError(err.message || 'Error fetching games');
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi untuk mengambil detail game berdasarkan slug
  const fetchGameDetail = async (slug) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await gamesApi.getGameBySlug(slug);
      console.log('Game detail result:', result);
      setGameDetail(result);
    } catch (err) {
      console.error('Error fetching game detail:', err);
      setError(err.message || 'Error fetching game detail');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Test Games API</h1>
      
      <div className="space-y-6">
        {/* Test getAllGames */}
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Test getAllGames</h2>
          <Button 
            onClick={fetchAllGames}
            disabled={isLoading}
            className="mb-4"
          >
            {isLoading ? 'Loading...' : 'Fetch All Games'}
          </Button>
          
          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-md mb-4">
              {error}
            </div>
          )}
          
          {games && (
            <div>
              <h3 className="font-medium mb-2">Result:</h3>
              <pre className="bg-muted p-4 rounded-md overflow-auto max-h-60 text-sm">
                {JSON.stringify(games, null, 2)}
              </pre>
              
              {/* Tombol untuk mengambil detail game pertama */}
              {games.games && games.games.length > 0 && (
                <Button
                  onClick={() => fetchGameDetail(games.games[0].slug)}
                  className="mt-4"
                  variant="outline"
                >
                  Fetch Detail for "{games.games[0].name}"
                </Button>
              )}
            </div>
          )}
        </div>
        
        {/* Detail game */}
        {gameDetail && (
          <div className="border rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4">Game Detail</h2>
            <pre className="bg-muted p-4 rounded-md overflow-auto max-h-60 text-sm">
              {JSON.stringify(gameDetail, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}