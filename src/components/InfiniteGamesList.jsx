// src/components/InfiniteGamesList.jsx - with client-side filtering
import { useState, useEffect, useMemo } from 'react';
import { useInView } from 'react-intersection-observer';
import { useInfiniteGames } from '@/hooks/queries/useGames';
import GameCard from '@/components/GameCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, TrendingUp, Zap, ChevronRight, Search, X } from 'lucide-react';

export default function InfiniteGamesList() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchBar, setShowSearchBar] = useState(false);
  
  // Setup intersection observer for infinite scrolling
  const { ref, inView } = useInView();
  
  // Fetch games with infinite scrolling - no filters in API call
  const { 
    data, 
    isLoading, 
    isError, 
    error, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = useInfiniteGames({ limit: 24 });
  
  // Fetch next page when scrolled to bottom
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage, isFetchingNextPage]);
  
  // Client-side search handler
  const handleSearch = (e) => {
    e.preventDefault();
    // We'll just update the search term state, filtering happens in useMemo
  };
  
  // Handle tab changes
  const handleTabChange = (value) => {
    setActiveTab(value);
  };
  
  // Clear search
  const handleClearSearch = () => {
    setSearchTerm('');
  };
  
  // Flatten all pages of games data
  const allGames = data?.pages.flatMap(page => page.games) || [];
  
  // Client-side filtering based on tab and search
  const filteredGames = useMemo(() => {
    if (!allGames.length) return [];
    
    // First filter by search term
    let filtered = allGames;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(game => 
        game.name.toLowerCase().includes(search) || 
        (game.shortDescription && game.shortDescription.toLowerCase().includes(search)) ||
        (game.developerName && game.developerName.toLowerCase().includes(search))
      );
    }
    
    // Then filter by tab
    switch (activeTab) {
      case 'featured':
        return filtered.filter(game => game.isFeatured);
      case 'popular':
        return filtered.filter(game => game.isPopular);
      case 'new':
        return filtered.filter(game => game.isNew);
      default:
        return filtered;
    }
  }, [allGames, activeTab, searchTerm]);
  
  // Render loading state
  if (isLoading && !data) {
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
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Games</TabsTrigger>
            <TabsTrigger value="featured">Featured</TabsTrigger>
            <TabsTrigger value="popular">Popular</TabsTrigger>
            <TabsTrigger value="new">New</TabsTrigger>
          </TabsList>
          
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
        </Tabs>
      </div>
    );
  }
  
  // Render error state
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
        
        {/* Search button/form */}
        <div className="relative">
          {showSearchBar ? (
            <form onSubmit={handleSearch} className="flex">
              <Input
                type="text"
                placeholder="Search games..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-60"
              />
              {searchTerm && (
                <Button 
                  type="button" 
                  size="icon" 
                  variant="ghost"
                  onClick={handleClearSearch}
                  className="absolute right-10 top-1/2 transform -translate-y-1/2"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              <Button 
                type="submit" 
                size="icon" 
                variant="ghost"
                className="absolute right-1 top-1/2 transform -translate-y-1/2"
              >
                <Search className="h-4 w-4" />
              </Button>
            </form>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSearchBar(true)}
              className="flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              <span>Search</span>
            </Button>
          )}
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Games</TabsTrigger>
          <TabsTrigger value="featured" className="inline-flex items-center">
            <Star className="mr-1 h-3.5 w-3.5" />
            Featured
          </TabsTrigger>
          <TabsTrigger value="popular" className="inline-flex items-center">
            <TrendingUp className="mr-1 h-3.5 w-3.5" />
            Popular
          </TabsTrigger>
          <TabsTrigger value="new" className="inline-flex items-center">
            <Zap className="mr-1 h-3.5 w-3.5" />
            New
          </TabsTrigger>
        </TabsList>
        
        {searchTerm && (
          <div className="mb-4">
            <Badge variant="secondary" className="flex gap-1 items-center">
              Search: {searchTerm}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-4 w-4 p-0 ml-1" 
                onClick={handleClearSearch}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          </div>
        )}
        
        {filteredGames.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">No games found</p>
            {searchTerm && (
              <p className="text-sm mt-2">
                Try adjusting your search or filters
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
            
            {/* Loading indicator for infinite scroll - only show if in the "all" tab with no search */}
            {(activeTab === 'all' && !searchTerm && (hasNextPage || isFetchingNextPage)) && (
              <div ref={ref} className="flex justify-center items-center py-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 w-full">
                  {Array.from({ length: 6 }).map((_, index) => (
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
            )}
            
            {/* Show when there are no more games to load */}
            {!hasNextPage && activeTab === 'all' && !searchTerm && (
              <div className="text-center py-6 text-muted-foreground">
                <p>No more games to load</p>
              </div>
            )}
          </>
        )}
      </Tabs>
    </div>
  );
}