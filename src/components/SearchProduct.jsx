import { Search, X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";

function SearchProducts({ searchTerm, setSearchTerm}) {
    const [showSearchBar, setShowSearchBar] = useState(false);

    const handleClearSearch = () => {
        setSearchTerm('');
      };

    const handleSearch = (e) => {
        e.preventDefault();
        // The search will be triggered automatically by the useGames hook
      };
    return (  
        <div className="relative">
          {showSearchBar ? (
            <form onSubmit={handleSearch} className="flex">
              <Input
                type="text"
                placeholder="Search games..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-60"
              />
              {searchTerm && (
                <Button 
                  type="button" 
                  size="icon" 
                  variant="ghost"
                  onClick={handleClearSearch}
                  className="absolute right-10 top-1/2 transform -translate-y-1/2"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              <Button 
                type="submit" 
                size="icon" 
                variant="ghost"
                className="absolute right-1 top-1/2 transform -translate-y-1/2"
              >
                <Search className="h-4 w-4" />
              </Button>
            </form>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSearchBar(true)}
              className="flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              <span>Search</span>
            </Button>
          )}
        </div> );
}

export default SearchProducts;