
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  estimatedTime: number; // in seconds
  message: string;
  className?: string;
  compact?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  estimatedTime, 
  message, 
  className = "",
  compact = false
}) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      setElapsed((Date.now() - startTime) / 1000);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const progress = Math.min((elapsed / estimatedTime) * 100, 95);

  if (compact) {
      return (
        <div className={`flex items-center gap-2 text-xs text-muted-foreground ${className}`}>
            <Loader2 className="animate-spin w-3 h-3" />
            <span>{message}</span>
            <span className="font-mono opacity-70">({elapsed.toFixed(1)}s / ~{estimatedTime}s)</span>
        </div>
      )
  }

  return (
    <div className={`flex flex-col items-center justify-center p-6 w-full ${className}`}>
        <div className="relative w-16 h-16 mb-4">
            <svg 
                className="w-full h-full -rotate-90" 
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="text-secondary opacity-30"
                />
                <motion.circle
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: progress / 100 }}
                    transition={{ duration: 0.5, ease: "linear" }}
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="text-foreground"
                    strokeLinecap="round"
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-mono font-bold tabular-nums">{elapsed.toFixed(0)}s</span>
            </div>
        </div>
        
        <h3 className="text-sm font-medium tracking-wide uppercase animate-pulse mb-1 text-center">{message}</h3>
        <p className="text-xs text-muted-foreground text-center">Usually takes ~{estimatedTime} seconds</p>
    </div>
  );
};
