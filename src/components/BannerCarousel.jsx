"use client"

import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import Image from "next/image";

export const BannerCarousel = ({ banners }) => {
    const [current, setCurrent] = useState(0);
  
    useEffect(() => {
      const interval = setInterval(() => {
        setCurrent((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
      }, 5000);
      return () => clearInterval(interval);
    }, [banners.length]);
  
    return (
      <div className="relative w-full overflow-hidden rounded-xl">
        <div className="relative h-[200px] sm:h-[300px] md:h-[400px] w-full overflow-hidden rounded-xl">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-500 ${
                index === current ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="relative h-full w-full">
                <Image
                  src={banner.imageUrl || '/images/banners/placeholder.jpg'}
                  alt={banner.title}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent">
                  <div className="flex h-full flex-col justify-end p-6 text-white">
                    <h2 className="text-xl font-bold sm:text-2xl md:text-3xl">{banner.title}</h2>
                    <p className="mt-2 max-w-md text-sm sm:text-base">{banner.subtitle}</p>
                    <Button
                      className="mt-4 w-fit"
                      size="sm"
                      asChild
                    >
                      <Link href={banner.targetUrl || '#'}>
                        {banner.buttonText || 'Learn More'}
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`h-2 w-2 rounded-full transition-all ${
                index === current ? 'bg-white w-6' : 'bg-white/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    );
  };