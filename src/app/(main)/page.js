import { BannerCarousel } from '@/components/BannerCarousel';
import { bannersRes } from '@/config/dummy-data';
import GamesList from '@/components/games-detail/GameList';
import { getGames } from '@/services/product/game.service';


export default async function Home() {
  const banners = bannersRes;

  const { games } = await getGames({ limit: 30 });
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <main className="py-4 space-y-8 w-full">
          <section className="relative">
            <BannerCarousel banners={banners} />
          </section>
          <GamesList gamesData={games} />
        </main>
      </div>
    </div>
  );
}
