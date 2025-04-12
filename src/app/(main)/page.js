import { BannerCarousel } from '@/components/BannerCarousel';
import { bannersRes } from '@/config/dummy-data';
import GamesList from '@/components/games-detail/GameList';
import axiosInstance from '@/lib/axios';

export default async function Home() {
  const banners = bannersRes;
  const gamesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/games?limit=30`, {
      cache: 'no-store',
    });
    /* const prepaidResponse = await axiosInstance.get('/api/games?limit=30&category=prepaid', {
      cache: 'no-store',
    }); */
    const gamesData = await gamesResponse.json();
    
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <main className="py-4 space-y-8 w-full">
          <section className="relative">
            <BannerCarousel banners={banners} />
          </section>
          <GamesList gamesData={gamesData}/>
        </main>
      </div>
    </div>
  );
}
