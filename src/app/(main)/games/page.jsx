import GamesList from "@/components/GameList";

export const metadata = {
  title: 'Games | TIF Store',
  description: 'Browse all available games for top up',
};

export default function GamesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">  
        <GamesList />
    </div>
  );
}