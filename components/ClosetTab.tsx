
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Tag, SlidersHorizontal } from 'lucide-react';
import { Garment, GarmentCategory } from '../types';
import { CATEGORIES, COLORS } from '../constants';
import { Button } from './Button';
import { InputModal } from './InputModal';
import { analyzeGarment } from '../services/geminiService';
import { useToast } from './Toast';
import { LoadingState } from './LoadingState';

interface ClosetTabProps {
  garments: Garment[];
  onAddGarment: (garment: Garment) => Promise<void>;
  onRemoveGarment: (id: string) => void;
}

export const ClosetTab: React.FC<ClosetTabProps> = ({ garments, onAddGarment, onRemoveGarment }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeCategory, setActiveCategory] = useState<GarmentCategory>(GarmentCategory.ALL);
  const [activeColor, setActiveColor] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const { showToast } = useToast();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Extract all unique tags
  const allTags = Array.from(new Set(garments.flatMap(g => g.tags || [])));

  const filteredGarments = garments.filter(g => {
    const matchCat = activeCategory === GarmentCategory.ALL || g.category === activeCategory;
    const matchColor = !activeColor || (g.color && g.color.toLowerCase() === activeColor.toLowerCase());
    const matchTag = !activeTag || (g.tags && g.tags.includes(activeTag));
    return matchCat && matchColor && matchTag;
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempImage(reader.result as string);
        setIsModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleModalSubmit = async (name: string, hint?: string, modelVersion?: string) => {
    if (!tempImage) return;
    
    setIsModalOpen(false);
    setIsProcessing(true);

    try {
        // AI Analysis with hint and selected model
        const analysis = await analyzeGarment(tempImage, hint, modelVersion);
        
        const newGarment: Garment = {
            id: `c${Date.now()}`,
            name,
            imageUrl: tempImage,
            category: analysis.category || GarmentCategory.TOPS,
            color: analysis.color || 'Multi',
            tags: analysis.tags || [],
            createdAt: Date.now()
        };

        await onAddGarment(newGarment);
        showToast('Garment analyzed & added!', 'success');
    } catch (e: any) {
        console.error("Failed to analyze garment", e);
        const msg = e.message || "Failed";
        
        if (msg.includes("Permission denied")) {
            showToast("Gemini AI access denied. Added without analysis.", "error");
        } else {
            showToast("Analysis failed. Added with default tags.", "error");
        }

        // Fallback
        const newGarment: Garment = {
            id: `c${Date.now()}`,
            name,
            imageUrl: tempImage,
            category: GarmentCategory.TOPS,
            tags: ['Uploaded'],
            createdAt: Date.now()
        };
        await onAddGarment(newGarment);
    } finally {
        setIsProcessing(false);
        setTempImage(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background relative">
        {isProcessing && (
            <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                <LoadingState estimatedTime={5} message="Analyzing..." />
            </div>
        )}

       <header className="px-6 py-6 bg-background border-b border-border sticky top-0 z-20 shadow-sm">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-3xl font-light tracking-tight text-foreground">Closet</h1>
          </div>
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
            <Plus size={16} className="mr-2" /> Add Piece
          </Button>
        </div>
        
        <div className="flex overflow-x-auto gap-4 pb-2 no-scrollbar -mx-6 px-6 mask-fade-right">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`
                text-sm font-medium whitespace-nowrap transition-colors pb-1 border-b-2
                ${activeCategory === cat 
                  ? 'text-foreground border-foreground' 
                  : 'text-muted-foreground border-transparent hover:text-foreground/80'}
              `}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex gap-4 pt-4 items-center overflow-x-auto no-scrollbar pb-1">
            <SlidersHorizontal size={14} className="text-muted-foreground shrink-0" />
            
            {COLORS.map(c => (
                <button
                    key={c.name}
                    onClick={() => setActiveColor(activeColor === c.name ? null : c.name)}
                    className={`w-5 h-5 rounded-full border shrink-0 transition-all ${c.class} ${activeColor === c.name ? 'ring-2 ring-foreground ring-offset-2' : ''}`}
                    aria-label={c.name}
                />
            ))}

            <div className="w-[1px] h-4 bg-border shrink-0 mx-2" />

            {allTags.map(tag => (
                <button
                    key={tag}
                    onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                    className={`
                        px-2 py-0.5 rounded-full text-[10px] font-medium border whitespace-nowrap transition-colors
                        ${activeTag === tag ? 'bg-foreground text-background border-foreground' : 'bg-secondary text-muted-foreground border-transparent hover:border-border'}
                    `}
                >
                    #{tag}
                </button>
            ))}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-6 no-scrollbar bg-secondary/20">
        <div className="columns-2 gap-4 space-y-4">
          <AnimatePresence>
            {filteredGarments.map((garment) => (
              <motion.div
                key={garment.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="break-inside-avoid bg-background p-2 rounded-lg border border-border hover:shadow-md transition-shadow group relative"
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded bg-muted/50">
                  <img 
                    src={garment.imageUrl} 
                    alt={garment.name}
                    className="w-full h-full object-cover"
                  />
                  {garment.color && (
                      <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full border border-white/50 shadow-sm" style={{ backgroundColor: garment.color }} title={garment.color} />
                  )}
                  <button 
                    onClick={() => onRemoveGarment(garment.id)}
                    className="absolute top-2 right-2 p-1.5 bg-background/90 rounded-full text-destructive opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
                <div className="pt-2 px-1">
                  <h4 className="text-xs font-semibold text-foreground truncate">{garment.name}</h4>
                  <div className="flex gap-1 mt-1 flex-wrap">
                      {garment.tags?.slice(0,2).map(t => (
                          <span key={t} className="text-[9px] text-muted-foreground bg-secondary px-1 rounded-sm">#{t}</span>
                      ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        {filteredGarments.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50 pt-20">
                <Tag size={32} className="mb-2" />
                <p className="text-xs">No garments found.</p>
            </div>
        )}
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />

      <InputModal 
        isOpen={isModalOpen}
        title="Item Name"
        placeholder="Name this piece..."
        secondaryPlaceholder="Any hints? e.g. 'Vintage 90s denim jacket'"
        secondaryLabel="Analysis Hint"
        showModelSelection={true}
        onClose={() => { setIsModalOpen(false); setTempImage(null); }}
        onSubmit={handleModalSubmit}
      />
    </div>
  );
};
