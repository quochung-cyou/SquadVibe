
import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, MapPin, Clock, Info, Sparkles, Map as MapIcon, ChevronLeft, ChevronRight, Shirt, Image as ImageIcon } from 'lucide-react';
import { Place, Garment } from '../../types';
import { Button } from '../Button';
import { recommendAttire } from '../../services/geminiService';

interface PlaceDetailSheetProps {
  place: Place;
  garments: Garment[];
  onClose: () => void;
  onVisualize: (imageUrl: string) => void;
}

export const PlaceDetailSheet: React.FC<PlaceDetailSheetProps> = ({ place, garments, onClose, onVisualize }) => {
  const galleryRef = useRef<HTMLDivElement>(null);
  const [recommendedIds, setRecommendedIds] = useState<string[]>([]);
  const [loadingAttire, setLoadingAttire] = useState(false);

  useEffect(() => {
      const getRecs = async () => {
          if (garments.length === 0) return;
          setLoadingAttire(true);
          try {
              const ids = await recommendAttire(place.description, garments);
              setRecommendedIds(ids);
          } catch (e) {
              console.error("Failed to load attire recs", e);
          } finally {
              setLoadingAttire(false);
          }
      };
      getRecs();
  }, [place.id, garments]);

  const recommendedGarments = garments.filter(g => recommendedIds.includes(g.id));

  const handleOpenMaps = () => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`, '_blank');
  };

  const scrollGallery = (direction: 'left' | 'right') => {
    if (galleryRef.current) {
        const amount = direction === 'left' ? -200 : 200;
        galleryRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  return (
    <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="absolute inset-x-0 bottom-0 h-[75%] bg-background rounded-t-[2rem] z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden"
    >
        {/* Header */}
        <div className="flex justify-between items-start px-6 pt-6 pb-2 flex-none">
            <div>
                <h2 className="text-2xl font-light tracking-tight">{place.name}</h2>
                <div className="flex items-center text-muted-foreground mt-1 gap-2 text-xs uppercase tracking-wide">
                    <MapPin size={12} />
                    <span>{place.lat.toFixed(4)}, {place.lng.toFixed(4)}</span>
                </div>
            </div>
            <button onClick={onClose} className="p-2 bg-secondary rounded-full hover:bg-muted">
                <X size={20} />
            </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 no-scrollbar">
            
            {/* Action Prompt */}
            <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-secondary/50 to-background border border-border/50 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <ImageIcon size={20} />
                </div>
                <div>
                    <h3 className="text-sm font-semibold">Visualize your Squad here</h3>
                    <p className="text-xs text-muted-foreground">Select a photo from the gallery below to start composing.</p>
                </div>
            </div>

            {/* Gallery with Hint */}
            <div className="mb-6 relative group">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Gallery</h3>
                        <motion.span 
                            initial={{ opacity: 0, x: -5 }} 
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                            className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full"
                        >
                            Tap to visualize
                        </motion.span>
                    </div>
                </div>
                
                {place.imageUrls.length > 1 && (
                    <>
                         <button onClick={() => scrollGallery('left')} className="absolute left-0 top-1/2 z-10 w-8 h-8 bg-background/80 backdrop-blur-md rounded-full shadow-lg border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><ChevronLeft size={16} /></button>
                        <button onClick={() => scrollGallery('right')} className="absolute right-0 top-1/2 z-10 w-8 h-8 bg-background/80 backdrop-blur-md rounded-full shadow-lg border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><ChevronRight size={16} /></button>
                    </>
                )}

                <div ref={galleryRef} className="flex gap-3 overflow-x-auto no-scrollbar pb-4 -mx-6 px-6 snap-x snap-mandatory">
                    {place.imageUrls.map((url, idx) => (
                        <motion.div 
                            key={idx} 
                            whileHover={{ scale: 0.98 }}
                            onClick={() => onVisualize(url)}
                            className="relative group/item flex-shrink-0 w-60 aspect-[4/3] rounded-lg overflow-hidden border border-border bg-muted snap-start cursor-pointer"
                        >
                            <img src={url} alt={`${place.name} ${idx}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center">
                                <Button size="sm" variant="primary" className="scale-90 pointer-events-none">
                                    <Sparkles size={14} className="mr-2" /> VIBE CHECK
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                    {place.imageUrls.length === 0 && (
                        <div className="w-full h-32 bg-secondary/50 rounded-lg flex items-center justify-center text-muted-foreground text-xs mx-6">No images available</div>
                    )}
                </div>
            </div>

            {/* AI Recommendations */}
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                     <Sparkles size={14} className="text-amber-500" />
                     <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Recommended Attire</h3>
                </div>
                
                {loadingAttire ? (
                    <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                         {[1,2,3].map(i => <div key={i} className="w-20 h-24 rounded bg-secondary animate-pulse flex-shrink-0"></div>)}
                    </div>
                ) : (
                    <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                        {recommendedGarments.length > 0 ? (
                            recommendedGarments.map(garment => (
                                <div key={garment.id} className="relative flex-shrink-0 w-20 h-24 rounded border border-border overflow-hidden group/garment">
                                    <img src={garment.imageUrl} className="w-full h-full object-cover" alt={garment.name} />
                                    {garment.color && <div className="absolute top-1 right-1 w-2 h-2 rounded-full ring-1 ring-white" style={{backgroundColor: garment.color}} />}
                                </div>
                            ))
                        ) : (
                             <div className="text-xs text-muted-foreground bg-secondary/20 p-3 rounded-lg w-full">
                                {garments.length === 0 ? "Add items to closet to see recommendations." : "No specific closet matches found."}
                             </div>
                        )}
                    </div>
                )}
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 gap-6 mb-8">
                <div className="bg-secondary/20 p-4 rounded-lg border border-border/50">
                    <div className="flex items-center gap-2 mb-2 text-foreground font-medium"><Info size={16} /><span className="text-sm">Vibe Check</span></div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{place.description}</p>
                </div>
                <div className="flex gap-4">
                     <div className="flex-1 bg-secondary/20 p-4 rounded-lg border border-border/50">
                        <div className="flex items-center gap-2 mb-2 text-foreground font-medium"><Clock size={16} /><span className="text-sm">Best Time</span></div>
                        <p className="text-sm text-muted-foreground">{place.bestTime}</p>
                    </div>
                    <div className="flex-1 bg-secondary/20 p-4 rounded-lg border border-border/50">
                        <div className="flex items-center gap-2 mb-2 text-foreground font-medium"><Shirt size={16} /><span className="text-sm">General Style</span></div>
                        <p className="text-sm text-muted-foreground">{place.suggestedAttire}</p>
                    </div>
                </div>
                 <div className="bg-secondary/20 p-4 rounded-lg border border-border/50">
                    <div className="flex items-center gap-2 mb-2 text-foreground font-medium"><Info size={16} /><span className="text-sm">Local Tips</span></div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{place.tips}</p>
                </div>
            </div>
            
            <Button variant="outline" className="w-full mb-6" onClick={handleOpenMaps}><MapIcon size={16} className="mr-2" /> View on Google Maps</Button>
        </div>
    </motion.div>
  );
};
