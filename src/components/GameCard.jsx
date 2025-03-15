import Link from "next/link";
import { Card, CardContent } from "./ui/card";
import Image from "next/image";
import { Badge } from "./ui/badge";

const GameCard = ({ game }) => {
  return (
    <Link href={`/games/${game.slug}`}>
      <Card className="overflow-hidden h-full border-border/40 hover:border-primary/30 transition-all duration-300 hover:shadow-md bg-card hover:-translate-y-1">
        <div className="aspect-square relative overflow-hidden bg-background">
          <div className="h-full w-full relative">
            <Image 
              src={game.icon || '/images/games/placeholder.png'}
              alt={game.name}
              fill
              className="object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
          {game.isNew && (
            <div className="absolute top-2 left-2">
              <Badge 
                variant="secondary" 
                className="text-[10px] font-medium px-2 py-0 bg-primary text-primary-foreground"
              >
                NEW
              </Badge>
            </div>
          )}
        </div>
        <CardContent className="p-3 space-y-1">
          <p className="text-[0.65rem] sm:text-xs text-muted-foreground line-clamp-1">
            {game.developerName || 'Unknown Developer'}
          </p>
          <h3 className="font-semibold text-xs sm:text-sm line-clamp-2 leading-tight">
            {game.name}
          </h3>
        </CardContent>
      </Card>
    </Link>
  );
};

export default GameCard