import { useState, useMemo } from 'react';
import { useGames } from '@/hooks/queries/useGames';
import GameCard from '@/components/GameCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Zap } from 'lucide-react';

export default function GamesList() {
  const [activeTab, setActiveTab] = useState('all');
  
  const { data, isLoading, isError, error } = useGames({
    limit: 100,
  });

  const filteredGames = useMemo(() => {
    if (!data?.games || !data.games.length) return [];
    
    const allGames = data.games;
    
    switch (activeTab) {
      case 'popular':
        return allGames.filter(game => game.isPopular);
      case 'new':
        return allGames.filter(game => game.isNew);
      default:
        return allGames;
    }
  }, [data?.games, activeTab]);

  const handleTabChange = (value) => {
    setActiveTab(value);
  };

  if (isLoading && !data) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-8 w-1/6 mb-6" />
        
        <div className="w-full">
          <Skeleton className="h-8 w-1/2 mb-6" />
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, index) => (
              <div key={index} className="space-y-3">
                <Skeleton className="aspect-square w-full rounded-xl" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-4/5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 my-4 text-destructive bg-destructive/10 rounded-md">
        <h3 className="font-semibold mb-2">Error loading games</h3>
        <p>{error.message || 'Something went wrong. Please try again.'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Games</h2>
          <p className="text-sm text-muted-foreground">
            Top up your favorite games with the best prices
          </p>
        </div>     
      </div>
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Games</TabsTrigger>
          <TabsTrigger value="popular" className="inline-flex items-center">
            <TrendingUp className="mr-1 h-3.5 w-3.5" />
            Popular
          </TabsTrigger>
          <TabsTrigger value="new" className="inline-flex items-center">
            <Zap className="mr-1 h-3.5 w-3.5" />
            New
          </TabsTrigger>
        </TabsList>
        
        {filteredGames.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">No games found</p>
          </div>
        )}
      </Tabs>
    </div>
  );
}