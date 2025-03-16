function GameDetailBanner({game}) {
    return (  <div 
        className="w-full h-56 sm:h-64 md:h-80 relative bg-gradient-to-r from-primary/90 to-primary/30"
        style={{
          backgroundImage: `url(${game.banner})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'overlay'
        }}
      >
        <div className="max-w-7xl mx-auto h-full flex items-end px-4 sm:px-6 lg:px-8">
          <div className="pb-8 w-full">
            <h1 className="text-white text-2xl md:text-3xl lg:text-4xl font-bold">
              {game.bannerTitle || `Top Up ${game.name}`}
            </h1>
            <p className="text-white/90 mt-2">
              {game.bannerSubtitle || game.shortDescription}
            </p>
          </div>
        </div>
      </div> );
}

export default GameDetailBanner;