
import React from 'react';
import { motion } from 'framer-motion';
import { Wand2, X, Download, Share2 } from 'lucide-react';
import { Button } from '../Button';
import { Compare } from '../ui/compare';

interface RenderResultOverlayProps {
  img: string;
  originalImage?: string;
  context: string;
  onClose: () => void;
}

export const RenderResultOverlay: React.FC<RenderResultOverlayProps> = ({ img, originalImage, context, onClose }) => {
  return (
    <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="absolute inset-0 z-50 bg-background flex flex-col"
    >
        {/* Result Header */}
        <div className="px-6 py-4 flex justify-between items-center bg-background border-b border-border flex-none">
            <div className="flex items-center gap-2 text-foreground">
                    <Wand2 size={16} />
                    <span className="text-xs font-bold uppercase tracking-widest">Generated Vibe</span>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full">
                <X size={20} />
            </button>
        </div>

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col bg-secondary/10">
            {/* Image Container - Grows to fit */}
            <div className="flex-1 p-4 flex items-center justify-center">
                <div className="relative w-full max-w-lg shadow-2xl rounded-md overflow-hidden bg-white">
                    {originalImage ? (
                        <Compare 
                            firstImage={originalImage}
                            secondImage={img}
                            className="w-full h-auto aspect-square md:aspect-[3/4]"
                            slideMode="drag"
                            showHandlebar={true}
                        />
                    ) : (
                        <img src={img} className="w-full h-auto object-contain" alt="Rendered Result" />
                    )}
                </div>
            </div>

            {/* Context/Vibe Section - Explicitly BELOW the image area */}
            <div className="flex-none px-6 py-6 bg-background border-t border-border">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Context</h3>
                <p className="text-sm font-light leading-relaxed text-foreground">{context}</p>
            </div>
        </div>

        {/* Fixed Footer Actions */}
        <div className="p-6 bg-background border-t border-border flex gap-4 flex-none safe-pb">
            <Button variant="outline" className="flex-1 rounded-md border-foreground text-foreground h-12">
                <Download size={16} className="mr-2" /> SAVE
            </Button>
            <Button variant="primary" className="flex-1 rounded-md h-12">
                <Share2 size={16} className="mr-2" /> SHARE
            </Button>
        </div>
    </motion.div>
  );
};
