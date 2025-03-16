import { TrendingUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";

function HeaderGameDetail({ game }) {
    return ( <Card className="mb-8 overflow-hidden border-border/40">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <Avatar className="h-16 w-16 rounded-lg border border-border shadow-sm">
              <AvatarImage src={game.icon} alt={game.name} />
              <AvatarFallback className="rounded-lg bg-primary/10">
                {game.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold">{game.name}</h1>
                
                {game.isPopular && (
                  <Badge 
                    variant="secondary" 
                    className="bg-amber-100 text-amber-700 dark:bg-amber-700/20 dark:text-amber-400"
                  >
                    <TrendingUp className="h-3 w-3 mr-1" /> Populer
                  </Badge>
                )}
                
                {game.isNew && (
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-700/20 dark:text-emerald-400">
                    Baru
                  </Badge>
                )}
              </div>
              
              <p className="text-muted-foreground">{game.shortDescription}</p>
              
              <div className="flex flex-wrap gap-2 text-xs">
                <div className="bg-muted px-2 py-1 rounded-md">
                  Developer: {game.developerName}
                </div>
                <div className="bg-muted px-2 py-1 rounded-md">
                  Publisher: {game.publisherName}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card> );
}

export default HeaderGameDetail;