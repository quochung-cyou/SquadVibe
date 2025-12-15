
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './Button';
import { Cpu } from 'lucide-react';

interface InputModalProps {
  isOpen: boolean;
  title: string;
  defaultValue?: string;
  placeholder?: string;
  secondaryPlaceholder?: string; // For instructions
  secondaryLabel?: string;
  showModelSelection?: boolean;
  onClose: () => void;
  onSubmit: (value: string, secondaryValue?: string, modelVersion?: string) => void;
}

export const InputModal: React.FC<InputModalProps> = ({ 
  isOpen, 
  title, 
  defaultValue = '', 
  placeholder,
  secondaryPlaceholder,
  secondaryLabel,
  showModelSelection = false,
  onClose, 
  onSubmit 
}) => {
  const [value, setValue] = useState(defaultValue);
  const [secondaryValue, setSecondaryValue] = useState('');
  const [modelVersion, setModelVersion] = useState('3.0');

  useEffect(() => {
    if (isOpen) {
        setValue(defaultValue);
        setSecondaryValue('');
        setModelVersion('3.0');
    }
  }, [isOpen, defaultValue]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            exit={{ scale: 0.95, opacity: 0 }} 
            className="relative bg-background w-full max-w-xs rounded-xl shadow-2xl p-6 border border-border"
          >
            <h3 className="text-lg font-medium mb-4">{title}</h3>
            
            <label className="text-xs text-muted-foreground font-bold uppercase tracking-wide mb-1 block">Name</label>
            <input 
              autoFocus
              type="text" 
              value={value} 
              placeholder={placeholder}
              onChange={(e) => setValue(e.target.value)}
              className="w-full px-3 py-2 bg-secondary/50 border border-input rounded-md mb-4 focus:outline-none focus:ring-1 focus:ring-ring"
            />

            {secondaryPlaceholder && (
                <>
                    <label className="text-xs text-muted-foreground font-bold uppercase tracking-wide mb-1 block">{secondaryLabel || 'Instructions'}</label>
                    <textarea 
                        value={secondaryValue}
                        placeholder={secondaryPlaceholder}
                        onChange={(e) => setSecondaryValue(e.target.value)}
                        className="w-full h-20 px-3 py-2 bg-secondary/50 border border-input rounded-md mb-4 focus:outline-none focus:ring-1 focus:ring-ring text-sm resize-none"
                    />
                </>
            )}

            {showModelSelection && (
                <div className="mb-6">
                    <label className="text-xs text-muted-foreground font-bold uppercase tracking-wide mb-2 block flex items-center gap-1">
                        <Cpu size={12} /> AI Model
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => setModelVersion('3.0')}
                            className={`px-3 py-2 text-xs border rounded-md transition-all ${modelVersion === '3.0' ? 'bg-foreground text-background border-foreground font-medium' : 'bg-background text-muted-foreground border-input hover:border-foreground/50'}`}
                        >
                            3.0 Pro (Best)
                        </button>
                        <button
                            onClick={() => setModelVersion('2.5')}
                            className={`px-3 py-2 text-xs border rounded-md transition-all ${modelVersion === '2.5' ? 'bg-foreground text-background border-foreground font-medium' : 'bg-background text-muted-foreground border-input hover:border-foreground/50'}`}
                        >
                            2.5 Flash (Fast)
                        </button>
                    </div>
                </div>
            )}

            <div className="flex gap-3 justify-end">
              <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
              <Button size="sm" onClick={() => { if (value.trim()) onSubmit(value, secondaryValue, modelVersion); }}>Confirm</Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
