import { Skeleton } from "./ui/skeleton";

function SkeletonDetailGame() {
    return ( <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-6">
          <Skeleton className="h-8 w-8 rounded-full mr-2" />
          <Skeleton className="h-6 w-24" />
        </div>
        
        <Skeleton className="h-64 w-full rounded-lg mb-6" />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Skeleton className="h-10 w-full max-w-md mb-6" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <Skeleton key={n} className="h-32 w-full rounded-lg" />
              ))}
            </div>
          </div>
          <Skeleton className="h-[500px] w-full rounded-lg" />
        </div>
      </div> );
}

export default SkeletonDetailGame;