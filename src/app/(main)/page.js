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
    <div className="min-h-screen bg-background max-w-7xl mx-auto px-4 sm:px-6">
      <main className="container py-6 space-y-12">
        {/* Hero Banner Section */}
        <section className="relative">
          <BannerCarousel banners={banners} />
        </section>
        <GamesList />
      </main>

      
    </div>
  );
}
