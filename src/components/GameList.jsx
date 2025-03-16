'use client';

import { useState } from 'react';
import { useGames } from '@/hooks/queries/useGames';
import GameCard from '@/components/GameCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, TrendingUp, Zap, ChevronRight, Search, X } from 'lucide-react';

export default function GamesList() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchBar, setShowSearchBar] = useState(false);
  
  // Define query parameters based on active tab
  const queryParams = {
    featured: activeTab === 'featured',
    popular: activeTab === 'popular',
    isNew: activeTab === 'new',
    search: searchTerm,
    limit: 12,
  };
  
  // Fetch games using React Query
  const { data, isLoading, isError, error } = useGames(queryParams, {
    // Keep previous data while loading new data
    keepPreviousData: true,
  });
  
  const handleSearch = (e) => {
    e.preventDefault();
    // The search will be triggered automatically by the useGames hook
  };
  
  const handleTabChange = (value) => {
    setActiveTab(value);
  };
  
  const handleClearSearch = () => {
    setSearchTerm('');
  };
  
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
  
  // Destructure data for easier access
  const { games, pagination } = data || { games: [], pagination: {} };

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
        
        {games.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">No games found</p>
            {searchTerm && (
              <p className="text-sm mt-2">
                Try adjusting your search or filters
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {games.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        )}
        
        {/* Pagination info */}
        {pagination.total > 0 && (
          <div className="flex justify-between items-center mt-8 text-sm text-muted-foreground">
            <p>
              Showing {(pagination.page - 1) * pagination.limit + 1}-
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} games
            </p>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasPrev}
                onClick={() => setPage(pagination.page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasNext}
                onClick={() => setPage(pagination.page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Tabs>
    </div>
  );
}