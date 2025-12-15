
import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import { Member } from '../types';
import { InputModal } from './InputModal';
import { generateBaseModel } from '../services/geminiService';
import { useToast } from './Toast';
import { LoadingState } from './LoadingState';

interface SquadTabProps {
  members: Member[];
  onAddMember: (member: Member) => Promise<void>;
  onRemoveMember: (id: string) => void;
}

export const SquadTab: React.FC<SquadTabProps> = ({ members, onAddMember, onRemoveMember }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { showToast } = useToast();

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

  const handleModalSubmit = async (name: string, instructions?: string, modelVersion?: string) => {
      if (!tempImage) return;

      setIsModalOpen(false);
      setIsProcessing(true);

      try {
          // Smart AI Generation with custom instructions and selected model
          const processedImage = await generateBaseModel(tempImage, instructions, modelVersion);
          
          const newMember: Member = {
            id: `m${Date.now()}`,
            name,
            photoData: processedImage,
            createdAt: Date.now()
          };
          
          await onAddMember(newMember);
          showToast('Model added to squad!', 'success');

      } catch (e: any) {
          console.error("Failed to generate model", e);
          const msg = e.message || "Failed to process photo";
          
          if (msg.includes("Permission denied")) {
              showToast("Gemini AI access denied. Using original photo.", "error");
          } else {
              showToast("AI Generation failed. Using original photo.", "error");
          }

          // Fallback to original
           const newMember: Member = {
            id: `m${Date.now()}`,
            name,
            photoData: tempImage,
            createdAt: Date.now()
          };
          await onAddMember(newMember);
      } finally {
        setIsProcessing(false);
        setTempImage(null);
      }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <header className="px-6 py-8 bg-background flex justify-between items-end border-b border-border">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-foreground">Squad</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your models</p>
        </div>
        <div className="text-xs font-mono text-muted-foreground">
          {members.length} MODEL{members.length !== 1 ? 'S' : ''}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-6 no-scrollbar">
        <div className="grid grid-cols-2 gap-x-4 gap-y-6">
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="aspect-[3/4] flex flex-col items-center justify-center rounded-lg border border-dashed border-input hover:border-foreground/50 hover:bg-secondary/30 transition-all group disabled:opacity-50"
          >
            {isProcessing ? (
                <LoadingState estimatedTime={15} message="Posing..." compact />
            ) : (
                <>
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Plus className="w-6 h-6 text-foreground" />
                    </div>
                    <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Add Model</span>
                </>
            )}
          </button>

          {members.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group relative aspect-[3/4] overflow-hidden rounded-lg bg-muted"
            >
              <img 
                src={member.photoData} 
                alt={member.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <h3 className="text-white font-medium text-sm">{member.name}</h3>
                <button 
                  onClick={(e) => { e.stopPropagation(); onRemoveMember(member.id); }}
                  className="absolute top-2 right-2 p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-red-500 hover:text-white transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {members.length === 0 && !isProcessing && (
          <div className="mt-12 text-center text-muted-foreground">
            <p className="text-sm">Upload a photo. Gemini will pose it.</p>
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
        title="Model Name"
        placeholder="Enter name..."
        secondaryPlaceholder="Describe the pose (e.g. 'Hands on hips, serious look'). Leave empty for auto-pose."
        secondaryLabel="Custom Pose"
        showModelSelection={true}
        onClose={() => { setIsModalOpen(false); setTempImage(null); }}
        onSubmit={handleModalSubmit}
      />
    </div>
  );
};
