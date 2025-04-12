import GameCard from '@/components/GameCard';

export default function GamesList({ gamesData }) {
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
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
            {gamesData?.games.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>      
    </div>
  );
}