
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, AlertCircle, ChevronLeft, ChevronRight, Check, Zap, Brain, RefreshCw, Layers, ScanEye, X } from 'lucide-react';
import { Member, Garment } from '../../types';
import { Button } from '../Button';
import { RenderConfig } from '../../services/geminiService';
import { LoadingState } from '../LoadingState';

interface ComposePanelProps {
  members: Member[];
  garments: Garment[];
  selectedMemberId: string;
  assignments: Record<string, string | null>;
  isRendering: boolean;
  intermediateResults: Record<string, string>; // Maps memberID -> base64 image (Phase 1 result)
  error: string | null;
  onBack: () => void;
  onSelectMember: (id: string) => void;
  onAssign: (memberId: string, garmentId: string | null) => void;
  onDress: (memberIds: string[], config: RenderConfig) => void;
  onComposite: (memberIds: string[], config: RenderConfig) => void;
  backgroundImage?: string;
}

export const ComposePanel: React.FC<ComposePanelProps> = ({
  members,
  garments,
  selectedMemberId,
  assignments,
  isRendering,
  intermediateResults,
  error,
  onBack,
  onSelectMember,
  onAssign,
  onDress,
  onComposite,
  backgroundImage
}) => {
  const [modelVersion, setModelVersion] = useState<'3.0' | '2.5'>('3.0');
  const [skipTryOn, setSkipTryOn] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Initialize with strict validation
  const [includedMembers, setIncludedMembers] = useState<Set<string>>(() => {
    const valid = new Set<string>();
    if (selectedMemberId && members.some(m => m.id === selectedMemberId)) {
        valid.add(selectedMemberId);
    } else if (members.length > 0) {
        valid.add(members[0].id);
    }
    return valid;
  });

  // Strict Sync Effect
  useEffect(() => {
    setIncludedMembers(prev => {
        const next = new Set<string>();
        prev.forEach(id => {
            if (members.some(m => m.id === id)) next.add(id);
        });
        if (selectedMemberId && members.some(m => m.id === selectedMemberId)) {
            next.add(selectedMemberId);
        }
        if (next.size === 0 && members.length > 0) next.add(members[0].id);
        return next;
    });
  }, [members, selectedMemberId]);

  const toggleInclusion = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      const newSet = new Set(includedMembers);
      if (newSet.has(id)) {
          if (newSet.size > 1) newSet.delete(id);
      } else {
          newSet.add(id);
      }
      setIncludedMembers(newSet);
  };

  const handleMemberClick = (id: string) => {
      onSelectMember(id);
  };

  const activeMember = members.find(m => m.id === selectedMemberId);
  const hasAssignment = activeMember && assignments[activeMember.id];
  
  const allIncludedHaveAssignments = Array.from(includedMembers).every((id: string) => 
      members.some(m => m.id === id) && assignments[id]
  );

  const scrollContainer = (id: string, dir: 'left' | 'right') => {
    const el = document.getElementById(id);
    if (el) {
        const scrollAmount = dir === 'left' ? -200 : 200;
        el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handlePrimaryAction = () => {
      const config: RenderConfig = { modelVersion };
      const includedIds = Array.from(includedMembers);
      
      if (skipTryOn) {
          // Skip Phase 1, go straight to Composite with original images (handled by StudioView logic)
          onComposite(includedIds, config);
          return;
      }

      // Filter those who need dressing (no intermediate result)
      const needsDressing = includedIds.filter((id: string) => !intermediateResults[id]);

      if (needsDressing.length > 0) {
          onDress(needsDressing, config);
      } else {
          onComposite(includedIds, config);
      }
  };

  const handleRegenerateOne = (e: React.MouseEvent, memberId: string) => {
      e.stopPropagation();
      const config: RenderConfig = { modelVersion };
      onDress([memberId], config);
  };

  const handlePreview = (e: React.MouseEvent, img: string) => {
      e.stopPropagation();
      setPreviewImage(img);
  };

  // Determine button state
  const includedIds = Array.from(includedMembers);
  const undressedCount = includedIds.filter((id: string) => !intermediateResults[id]).length;
  const isPhase1 = !skipTryOn && undressedCount > 0;
  
  // Disable check: 
  // If skipTryOn -> enabled as long as models exist
  // If normal -> enabled if assignments exist OR (if already dressed)
  const isButtonDisabled = isRendering || includedMembers.size === 0 || (!skipTryOn && !allIncludedHaveAssignments && undressedCount > 0);

  return (
    <>
        <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute inset-x-0 bottom-0 h-[85%] md:h-[60%] flex flex-col bg-background rounded-t-[2rem] z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]"
        >
            {/* Header */}
            <div className="flex-none w-full flex justify-between items-center px-6 pt-4 pb-2 border-b border-transparent">
                <button onClick={onBack} className="p-2 -ml-2 text-muted-foreground hover:text-foreground">
                    <ChevronUp className="rotate-180" size={20} /> <span className="text-xs font-bold uppercase ml-1">Change Place</span>
                </button>
                <div className="w-12 h-1 rounded-full bg-border/50" />
                
                <div className="flex items-center gap-1 bg-secondary rounded-lg p-0.5">
                    <button 
                        onClick={() => setModelVersion('2.5')}
                        className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold transition-all ${modelVersion === '2.5' ? 'bg-background shadow text-foreground' : 'text-muted-foreground'}`}
                    >
                        <Zap size={10} /> FLASH
                    </button>
                    <button 
                        onClick={() => setModelVersion('3.0')}
                        className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold transition-all ${modelVersion === '3.0' ? 'bg-background shadow text-foreground' : 'text-muted-foreground'}`}
                    >
                        <Brain size={10} /> 3.0 PRO
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-2 min-h-0 no-scrollbar">
                
                {backgroundImage && (
                    <div className="mb-6 flex items-center gap-3 bg-secondary/30 p-2 rounded-lg border border-border/50">
                        <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0 bg-muted">
                            <img src={backgroundImage} className="w-full h-full object-cover" alt="Background Context" onError={(e) => (e.currentTarget.style.display = 'none')} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Scene</p>
                            <p className="text-xs font-medium truncate">Using selected photo background</p>
                        </div>
                    </div>
                )}

                {/* Cast Selector */}
                <div className="mb-6">
                    <div className="flex justify-between items-end mb-3">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Cast ({includedMembers.size})</h3>
                        <span className="text-[10px] text-muted-foreground">Tap to edit • Check to include</span>
                    </div>
                    
                    {members.length > 0 ? (
                        <div className="relative group/slider">
                            <div id="model-list" className="flex gap-4 overflow-x-auto no-scrollbar py-2 px-1">
                                {members.map(member => {
                                    const isIncluded = includedMembers.has(member.id);
                                    const isSelected = selectedMemberId === member.id;
                                    const intermediateImg = intermediateResults[member.id];

                                    return (
                                        <div key={member.id} className="relative flex flex-col items-center gap-1">
                                            <button 
                                                onClick={() => handleMemberClick(member.id)}
                                                className={`
                                                    relative w-16 h-16 rounded-full overflow-hidden border-2 transition-all duration-300
                                                    ${intermediateImg ? 'border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]' : isSelected ? 'border-foreground scale-105 shadow-md' : 'border-transparent opacity-80'}
                                                    ${!isIncluded && !isSelected ? 'grayscale opacity-40' : ''}
                                                `}
                                            >
                                                <AnimatePresence mode='popLayout'>
                                                    {intermediateImg ? (
                                                        <motion.img 
                                                            key="dressed"
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            src={intermediateImg} 
                                                            className="absolute inset-0 w-full h-full object-cover" 
                                                            alt="Dressed" 
                                                        />
                                                    ) : (
                                                        <motion.img 
                                                            key="original"
                                                            src={member.photoData} 
                                                            className="w-full h-full object-cover" 
                                                            alt={member.name} 
                                                        />
                                                    )}
                                                </AnimatePresence>

                                                {/* Action Overlays */}
                                                {intermediateImg && isIncluded && !isRendering && !skipTryOn && (
                                                    <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                                        <div 
                                                            onClick={(e) => handlePreview(e, intermediateImg)}
                                                            className="p-1 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm transition-colors"
                                                            title="View Result"
                                                        >
                                                            <ScanEye size={12} className="text-white" />
                                                        </div>
                                                        <div 
                                                            onClick={(e) => handleRegenerateOne(e, member.id)}
                                                            className="p-1 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm transition-colors"
                                                            title="Regenerate"
                                                        >
                                                            <RefreshCw size={12} className="text-white" />
                                                        </div>
                                                    </div>
                                                )}
                                            </button>
                                            
                                            <button
                                                onClick={(e) => toggleInclusion(e, member.id)}
                                                className={`
                                                    w-5 h-5 rounded-full flex items-center justify-center border transition-all z-10 -mt-3
                                                    ${isIncluded ? 'bg-primary border-primary text-primary-foreground' : 'bg-background border-border text-transparent hover:border-foreground'}
                                                `}
                                            >
                                                <Check size={10} strokeWidth={4} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="text-sm text-muted-foreground border border-dashed border-border rounded-lg p-4 text-center">Add models in Squad tab</div>
                    )}
                </div>

                {/* Options Toggle */}
                <div className="mb-6 flex items-center justify-between bg-secondary/20 p-3 rounded-lg border border-border/50">
                    <div className="flex items-center gap-2">
                        <Layers size={16} className="text-muted-foreground" />
                        <div className="flex flex-col">
                            <span className="text-xs font-medium text-foreground">Virtual Try-On</span>
                            <span className="text-[9px] text-muted-foreground">Apply new outfit to models</span>
                        </div>
                    </div>
                    <button 
                        onClick={() => setSkipTryOn(!skipTryOn)}
                        className={`w-10 h-5 rounded-full transition-colors relative ${!skipTryOn ? 'bg-foreground' : 'bg-border'}`}
                    >
                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-background transition-transform ${!skipTryOn ? 'left-6' : 'left-1'}`} />
                    </button>
                </div>

                {/* Wardrobe Selector (Hidden if skipping try-on) */}
                <AnimatePresence>
                    {!skipTryOn && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }} 
                            animate={{ opacity: 1, height: 'auto' }} 
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-4 overflow-hidden"
                        >
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                    Look for {activeMember?.name || 'Model'}
                                </h3>
                                {hasAssignment && (
                                    <button 
                                        onClick={() => onAssign(selectedMemberId, null)}
                                        className="text-[10px] text-destructive hover:underline"
                                    >
                                        CLEAR
                                    </button>
                                )}
                            </div>
                            
                            {garments.length > 0 ? (
                                <div className="relative group/slider">
                                    <button 
                                        onClick={() => scrollContainer('garment-list', 'left')}
                                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-background/80 backdrop-blur-sm rounded-full shadow-md border border-border flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-opacity disabled:opacity-0"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    
                                    <div id="garment-list" className="flex gap-3 overflow-x-auto no-scrollbar pb-4 px-1 h-32 items-center">
                                        {garments.map(garment => (
                                            <button
                                                key={garment.id}
                                                onClick={() => onAssign(selectedMemberId, garment.id)}
                                                className={`
                                                    flex-shrink-0 w-20 h-24 rounded border overflow-hidden relative transition-all duration-300
                                                    ${assignments[selectedMemberId] === garment.id 
                                                        ? 'border-foreground shadow-lg -translate-y-1' 
                                                        : 'border-border opacity-80 hover:opacity-100'}
                                                `}
                                            >
                                                <img src={garment.imageUrl} className="w-full h-full object-cover" alt={garment.name} />
                                                {garment.color && (
                                                    <div className="absolute bottom-0 right-0 w-3 h-3 rounded-tl bg-background border-t border-l border-border flex items-center justify-center">
                                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: garment.color }}></div>
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>

                                    <button 
                                        onClick={() => scrollContainer('garment-list', 'right')}
                                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-background/80 backdrop-blur-sm rounded-full shadow-md border border-border flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-opacity"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground border border-dashed border-border rounded-lg p-6 text-center">
                                    Closet is empty
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer Action Button */}
            <div className="flex-none p-6 bg-background border-t border-border mt-auto safe-pb">
                {error && <div className="text-xs text-destructive mb-2 flex items-center"><AlertCircle size={12} className="mr-1"/> {error}</div>}
                
                <div className="flex flex-col gap-2">
                    {!skipTryOn && !allIncludedHaveAssignments && includedMembers.size > 0 && undressedCount > 0 && (
                        <div className="text-[10px] text-amber-500 text-center animate-pulse">
                            Note: Some active models have no outfit assigned.
                        </div>
                    )}
                    
                    {isRendering ? (
                        <LoadingState 
                            estimatedTime={isPhase1 ? 15 : 30} 
                            message={isPhase1 ? "Dressing Models..." : "Weaving Reality..."} 
                        />
                    ) : (
                        <Button 
                            onClick={handlePrimaryAction} 
                            disabled={isButtonDisabled}
                            className="w-full h-14 text-lg font-light tracking-widest bg-foreground text-background hover:bg-foreground/90 rounded-md shadow-xl"
                        >
                            {skipTryOn ? "VISUALIZE SCENE" : (undressedCount > 0 ? "TRY ON LOOKS" : "VISUALIZE SCENE")}
                        </Button>
                    )}
                </div>
            </div>
        </motion.div>

        {/* Full Screen Preview Modal */}
        <AnimatePresence>
            {previewImage && (
                <SimpleImageViewer src={previewImage} onClose={() => setPreviewImage(null)} />
            )}
        </AnimatePresence>
    </>
  );
};

// Inline SimpleImageViewer to avoid file creation complexity
const SimpleImageViewer: React.FC<{ src: string; onClose: () => void }> = ({ src, onClose }) => {
    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div className="relative max-w-full max-h-full">
                <img src={src} alt="Preview" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" />
                <button 
                    onClick={onClose}
                    className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white bg-white/10 rounded-full"
                >
                    <X size={24} />
                </button>
            </div>
        </motion.div>
    );
};
