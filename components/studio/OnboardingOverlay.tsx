import React from 'react';
import { motion } from 'framer-motion';
import { Search, Users, MapPin } from 'lucide-react';

interface OnboardingOverlayProps {
  onDismiss: () => void;
  onExplore: () => void;
  onCreateSquad: () => void;
}

export const OnboardingOverlay: React.FC<OnboardingOverlayProps> = ({ onDismiss, onExplore, onCreateSquad }) => {
  return (
    <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-[2px]"
        onClick={onDismiss}
    >
        <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", bounce: 0.4 }}
            className="w-full max-w-sm flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="text-center mb-4">
                <motion.h2 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-3xl font-light text-white tracking-tight drop-shadow-md"
                >
                    Start your Vibe
                </motion.h2>
            </div>

            <motion.button
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                onClick={onExplore}
                className="group relative h-32 rounded-2xl overflow-hidden bg-background/90 hover:bg-background transition-colors shadow-2xl border border-white/20 text-left p-6 flex flex-col justify-between"
            >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <MapPin size={80} />
                </div>
                <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center text-primary mb-2">
                    <Search size={20} />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-foreground">Find a Place</h3>
                    <p className="text-xs text-muted-foreground">Search spots or explore the map</p>
                </div>
            </motion.button>

            <motion.button
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                onClick={onCreateSquad}
                className="group relative h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-primary to-primary/90 text-primary-foreground shadow-2xl text-left p-6 flex flex-col justify-between"
            >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Users size={80} />
                </div>
                <div className="bg-white/20 w-10 h-10 rounded-full flex items-center justify-center text-white mb-2">
                    <Users size={20} />
                </div>
                <div>
                    <h3 className="text-lg font-semibold">Create Squad</h3>
                    <p className="text-xs text-primary-foreground/80">Upload models to visualize</p>
                </div>
            </motion.button>
            
            <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-center text-white/60 text-xs mt-4"
            >
                Tap anywhere to explore map freely
            </motion.p>
        </motion.div>
    </motion.div>
  );
};