'use client';

import { useState, useEffect } from 'react';
import { BannerCarousel } from '@/components/BannerCarousel';
import { bannersRes } from '@/config/dummy-data';
import GamesList from '@/components/GameList';

export default function Home() {
  const [banners, setBanners] = useState([]);
 
 useEffect(() => {
  async function fetchData() {
    try {
      setBanners(bannersRes);

    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  fetchData();
}, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <main className="py-4 space-y-8 w-full">
          {/* Hero Banner Section */}
          <section className="relative">
            <BannerCarousel banners={banners} />
          </section>
          <GamesList />
        </main>
      </div>
    </div>
  );
}
