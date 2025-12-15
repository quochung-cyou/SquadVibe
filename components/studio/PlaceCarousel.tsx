import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { Place } from '../../types';

interface PlaceCarouselProps {
  places: Place[];
  onSelectPlace: (place: Place) => void;
  isLoading: boolean;
}

export const PlaceCarousel: React.FC<PlaceCarouselProps> = ({ 
  places, 
  onSelectPlace, 
  isLoading
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (places.length === 0 && !isLoading) return null;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
        const amount = direction === 'left' ? -250 : 250;
        scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-end pb-safe pl-6 pointer-events-auto overflow-hidden relative group">
        
        {/* Navigation Buttons */}
        {!isLoading && places.length > 0 && (
            <>
                <button 
                    onClick={() => scroll('left')}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-background/80 backdrop-blur-md rounded-full shadow-lg border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <ChevronLeft size={16} />
                </button>
                <button 
                    onClick={() => scroll('right')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-background/80 backdrop-blur-md rounded-full shadow-lg border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <ChevronRight size={16} />
                </button>
            </>
        )}

        <div ref={scrollRef} className="flex gap-4 overflow-x-auto no-scrollbar pb-6 pr-6 items-end snap-x snap-mandatory">
            
            {isLoading ? (
                // Skeleton Loader with Glazing Shimmer
                Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="relative flex-shrink-0 w-64 aspect-[16/10] rounded-xl bg-muted overflow-hidden border border-border shadow-lg">
                        {/* Glazing Effect */}
                        <div className="absolute inset-0 -translate-x-full animate-shimmer-gold bg-gradient-to-r from-transparent via-amber-100/40 to-transparent z-10"></div>
                        
                        <div className="absolute bottom-3 left-3 w-1/2 h-4 bg-gray-300 rounded-sm" />
                        <div className="absolute bottom-9 left-3 w-2/3 h-5 bg-gray-300 rounded-sm" />
                    </div>
                ))
            ) : (
                // Real Items
                places.map((place, index) => {
                    const coverImage = place.imageUrls?.[0] || '';
                    
                    return (
                        <motion.div
                            key={place.id}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => onSelectPlace(place)}
                            className="relative flex-shrink-0 w-64 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 shadow-xl border border-transparent bg-background hover:scale-105 snap-start"
                        >
                            <div className="aspect-[16/10] bg-muted relative">
                                {coverImage ? (
                                    <img src={coverImage} alt={place.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-secondary flex items-center justify-center text-muted-foreground">No Image</div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                                <div className="absolute bottom-3 left-3 right-3 text-white">
                                    <h3 className="font-semibold text-base truncate">{place.name}</h3>
                                    <div className="flex items-center gap-1 mt-0.5">
                                        <MapPin size={10} className="text-gray-300" />
                                        <p className="text-[10px] text-gray-300 line-clamp-1">{place.description}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })
            )}
        </div>
    </div>
  );
};