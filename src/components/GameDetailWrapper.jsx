'use client';

import { useGameBySlug } from '@/hooks/queries/useGames';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

// This component is designed as a wrapper that fetches game data and passes it to children
export default function GameDetailsWrapper({ slug, includeCategories = true, children }) {
  const { data, isLoading, isError, error } = useGameBySlug(slug, includeCategories);
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex gap-4">
          <Skeleton className="h-24 w-24 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
        
        <Skeleton className="h-64 w-full rounded-lg" />
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-12 rounded-md" />
          ))}
        </div>
      </div>
    );
  }
  
  // Show error state
  if (isError) {
    return (
      <Alert variant="destructive" className="my-8">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error?.message || 'Failed to load game details. Please try again.'}
        </AlertDescription>
      </Alert>
    );
  }
  
  // No data found
  if (!data?.game) {
    return (
      <Alert variant="destructive" className="my-8">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Game not found
        </AlertDescription>
      </Alert>
    );
  }
  
  // Render children with the game data
  return children(data.game);
}