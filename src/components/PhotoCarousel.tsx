import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface Season1Photo {
  id: string;
  name: string;
  url: string;
  caption: string;
  category: string;
}

interface PhotoCarouselProps {
  photos: Season1Photo[];
  className?: string;
  autoPlay?: boolean;
  interval?: number;
  showCaption?: boolean;
  aspectRatio?: 'square' | 'video' | 'wide';
}

export function PhotoCarousel({ 
  photos, 
  className,
  autoPlay = true,
  interval = 5000,
  showCaption = true,
  aspectRatio = 'square'
}: PhotoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || photos.length <= 1) return;

    const timer = setInterval(() => {
      setIsTransitioning(true);
      
      // Small delay to allow transition to start
      setTimeout(() => {
        setCurrentIndex((prevIndex) => 
          prevIndex === photos.length - 1 ? 0 : prevIndex + 1
        );
        setIsTransitioning(false);
      }, 50);
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, photos.length]);

  // Manual navigation
  const goToSlide = (index: number) => {
    if (index === currentIndex) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsTransitioning(false);
    }, 50);
  };

  const goToPrevious = () => {
    goToSlide(currentIndex === 0 ? photos.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    goToSlide(currentIndex === photos.length - 1 ? 0 : currentIndex + 1);
  };

  if (photos.length === 0) {
    return (
      <div className={cn(
        "flex items-center justify-center bg-muted rounded-lg",
        aspectRatio === 'square' && "aspect-square",
        aspectRatio === 'video' && "aspect-video", 
        aspectRatio === 'wide' && "aspect-[16/9]",
        className
      )}>
        <div className="text-center text-muted-foreground">
          <div className="text-4xl mb-2">📸</div>
          <p>No photos available</p>
        </div>
      </div>
    );
  }

  const aspectRatioClasses = {
    square: "aspect-square",
    video: "aspect-video",
    wide: "aspect-[16/9]"
  };

  return (
    <div className={cn("relative group", className)}>
      {/* Main Image Container */}
      <div className={cn(
        "relative overflow-hidden rounded-lg bg-muted",
        aspectRatioClasses[aspectRatio]
      )}>
        <div className="relative w-full h-full">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              className={cn(
                "absolute inset-0 transition-all duration-1000 ease-in-out",
                index === currentIndex 
                  ? "opacity-100 scale-100" 
                  : "opacity-0 scale-105"
              )}
            >
              <img
                src={photo.url}
                alt={photo.caption}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback handling
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              
              {/* Overlay for caption */}
              {showCaption && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-semibold text-lg mb-1">
                      {photo.caption}
                    </h3>
                    <span className="inline-block px-2 py-1 bg-primary/80 text-white text-xs rounded-full">
                      {photo.category}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        {photos.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              aria-label="Previous photo"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              aria-label="Next photo"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Progress Indicator */}
        {autoPlay && photos.length > 1 && (
          <div className="absolute bottom-2 left-2 right-2">
            <div className="flex space-x-1">
              {photos.map((_, index) => (
                <div
                  key={index}
                  className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden"
                >
                  <div
                    className={cn(
                      "h-full bg-white rounded-full transition-all duration-100 ease-linear",
                      index === currentIndex ? "animate-progress" : ""
                    )}
                    style={{
                      animationDuration: `${interval}ms`,
                      animationPlayState: index === currentIndex ? 'running' : 'paused'
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Thumbnail Navigation */}
      {photos.length > 1 && (
        <div className="flex space-x-2 mt-3 overflow-x-auto pb-2">
          {photos.map((photo, index) => (
            <button
              key={photo.id}
              onClick={() => goToSlide(index)}
              className={cn(
                "flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-300",
                index === currentIndex 
                  ? "border-primary shadow-lg" 
                  : "border-transparent hover:border-primary/50"
              )}
            >
              <img
                src={photo.url}
                alt={photo.caption}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
