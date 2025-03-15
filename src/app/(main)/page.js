'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronRight, Star, TrendingUp, Zap } from 'lucide-react';
import { BannerCarousel } from '@/components/BannerCarousel';
import { bannersResponse, gamesResponse } from '@/config/dummy-api-res';
import Header from '@/components/Header';
import GameCard from '@/components/GameCard';


// Featured game card component


export default function Home() {
  // Using the dummy data from the provided files
  // In a real application, you would fetch this data from the API
  const [games, setGames] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [activeTab, setActiveTab] = useState('all');

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  useEffect(() => {
    // This is where you would typically fetch the data from your API
    // For now, we'll use the dummy data imported directly
    async function fetchData() {
      try {
        // In a real app, you would do API calls here
        // For demo purposes, we'll simulate the API response with the dummy data
        
        // These would be the API responses
       
        
        setGames(gamesResponse);
        setBanners(bannersResponse);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, []);

  // Filter games based on the active tab
  const filteredGames = games.filter(game => {
    if (activeTab === 'all') return true;
    if (activeTab === 'featured') return game.isFeatured;
    if (activeTab === 'popular') return game.isPopular;
    if (activeTab === 'new') return game.isNew;
    return true;
  });

  return (
    <div className="min-h-screen bg-background max-w-7xl mx-auto px-4 sm:px-6">
 

      <main className="container py-6 space-y-12">
        {/* Hero Banner Section */}
        <section className="relative">
          <BannerCarousel banners={banners} />
        </section>

        {/* Featured Games Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight">Games</h2>
              <p className="text-sm text-muted-foreground">
                Top up your favorite games with the best prices
              </p>
            </div>
            <Link 
              href="/games" 
              className="inline-flex items-center text-sm font-medium text-primary"
            >
              View all
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
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

            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredGames.map(game => (
                <motion.div key={game.id} variants={item}>
                  <GameCard game={game} />
                </motion.div>
                
              ))}
            </div>
          </Tabs>
        </section>

        
       
      </main>

      
    </div>
  );
}
