import GameDetailComp from "@/components/games-detail/GameDetailComp";
import HeaderGameDetail from "@/components/games-detail/HeaderGameDetail";
import { getGameBySlug } from "@/services/product/game.service";
import { getProductsByGame } from "@/services/product/product.service";

export default async function GameDetail({params}) {
  const { id } = await params;
  
  const game = await getGameBySlug(id)
 
  const gameLimitMap = {
    'arena-of-valor': 20,
    'mobile-legends': 45,
    'free-fire': 70,
    'call-of-duty-mobile': 9,
    'honor-of-kings': 12,
    'genshin-impact': 10,
  };
  const limit = gameLimitMap[id] 
  
  const options = { 
    page : 1,
    limit,
    search :'',
    sortBy : 'price',
    sortOrder : 'asc',
    status: 'all',}

  const productData = await getProductsByGame(id, options )
  
  return (
    <div className="bg-background min-h-screen">
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        
      <HeaderGameDetail game={game} />   
      <GameDetailComp game={game} products={productData.products} />  
      
      </main>
    </div>
  );
}