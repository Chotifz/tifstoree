import GameDetailComp from "@/components/games-detail/GameDetailComp";
import HeaderGameDetail from "@/components/games-detail/HeaderGameDetail";
import axiosInstance from "@/lib/axios";

export default async function GameDetail({params}) {
  const { id } = await params;
  const gameResponse = await axiosInstance.get(`/games/${id}`, {
    cache: 'no-store',
  });
  const game = gameResponse.data.game;

  const gameLimitMap = {
    'arena-of-valor': 20,
    'mobile-legends': 45,
    'free-fire': 70,
    'call-of-duty-mobile': 9,
    'honor-of-kings': 12,
    'genshin-impact': 10,
  };
  const limit = gameLimitMap[id] 
  
  const productsResponse = await axiosInstance.get(`/games/${id}/products?limit=${limit}`, {
     cache: 'no-store',
   });
   const products = productsResponse.data.products

  return (
    <div className="bg-background min-h-screen">
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        
      <HeaderGameDetail game={game} />   
      <GameDetailComp game={game} products={products} />  
      
      </main>
    </div>
  );
}