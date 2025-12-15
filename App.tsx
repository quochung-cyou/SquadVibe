import React, { useState, useEffect } from 'react';
import { Users, Shirt, Aperture, ShieldCheck } from 'lucide-react';
import { Tab, Member, Garment } from './types';
import { SquadTab } from './components/SquadTab';
import { ClosetTab } from './components/ClosetTab';
import { StudioView } from './components/StudioView';
import { DEFAULT_WARDROBE } from './constants';
import { getAllItems, saveItem, deleteItem } from './services/db';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast';

// Removed conflicting global declaration for Window interface to fix TS errors.
// Usage of window.aistudio will be handled via type assertion.

function AppContent() {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.STUDIO);
  
  // Real State
  const [squad, setSquad] = useState<Member[]>([]);
  const [closet, setCloset] = useState<Garment[]>([]);
  const [assignments, setAssignments] = useState<Record<string, string | null>>({});

  // Load from IndexedDB on mount
  useEffect(() => {
    const loadData = async () => {
        try {
            const savedSquad = await getAllItems<Member>('squad');
            const savedCloset = await getAllItems<Garment>('closet');
            
            setSquad(savedSquad);
            
            if (savedCloset.length > 0) {
                setCloset(savedCloset);
            } else {
                loadDefaults();
            }
        } catch (e) {
            console.error("Failed to load data from DB", e);
        }
    };
    loadData();
  }, []);

  const loadDefaults = async () => {
    const loadedItems: Garment[] = [];
    
    for (const item of DEFAULT_WARDROBE) {
        try {
            const response = await fetch(item.url);
            const blob = await response.blob();
            const base64 = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(blob);
            });

            const newItem = {
                id: item.id,
                name: item.name,
                category: item.category,
                imageUrl: base64,
                color: item.color,
                tags: ['Default', 'Essential'],
                createdAt: Date.now()
            };
            
            loadedItems.push(newItem);
            await saveItem('closet', newItem); // Save default to DB immediately
        } catch (e) {
            console.error(`Failed to load default wardrobe item: ${item.name}`, e);
        }
    }
    
    if (loadedItems.length > 0) {
      setCloset(loadedItems);
    }
  };

  const handleAddMember = async (member: Member) => {
    try {
        await saveItem('squad', member);
        setSquad(prev => [...prev, member]);
    } catch (e) {
        console.error("Failed to save member", e);
        throw e; // Let the component handle the error toast
    }
  };

  const handleRemoveMember = async (id: string) => {
    await deleteItem('squad', id);
    setSquad(prev => prev.filter(m => m.id !== id));
  };

  const handleAddGarment = async (garment: Garment) => {
    try {
        await saveItem('closet', garment);
        setCloset(prev => [garment, ...prev]);
    } catch (e) {
        console.error("Failed to save garment", e);
        throw e;
    }
  };

  const handleRemoveGarment = async (id: string) => {
    await deleteItem('closet', id);
    setCloset(prev => prev.filter(g => g.id !== id));
  };

  const handleAssignOutfit = (memberId: string, garmentId: string | null) => {
    setAssignments(prev => ({
        ...prev,
        [memberId]: garmentId
    }));
  };

  return (
    <div className="h-full w-full flex flex-col bg-background text-foreground font-sans">
      <main className="flex-1 overflow-hidden relative">
        {/* Persistence: Always keep StudioView mounted but hide/show */}
        <div className={`w-full h-full ${activeTab === Tab.STUDIO ? 'block' : 'hidden'}`}>
            <StudioView 
                members={squad} 
                garments={closet} 
                assignments={assignments}
                onAssign={handleAssignOutfit}
                onChangeTab={setActiveTab}
            />
        </div>

        {activeTab === Tab.SQUAD && (
            <SquadTab 
                members={squad} 
                onAddMember={handleAddMember} 
                onRemoveMember={handleRemoveMember} 
            />
        )}
        
        {activeTab === Tab.CLOSET && (
            <ClosetTab 
                garments={closet} 
                onAddGarment={handleAddGarment} 
                onRemoveGarment={handleRemoveGarment} 
            />
        )}
      </main>

      {/* Minimalist Bottom Navigation */}
      <nav className="bg-background border-t border-border px-8 pb-safe pt-2 z-50">
        <div className="flex items-center justify-between h-16 max-w-md mx-auto">
            <NavButton 
                active={activeTab === Tab.SQUAD} 
                onClick={() => setActiveTab(Tab.SQUAD)} 
                icon={<Users strokeWidth={1.5} size={22} />} 
                label="SQUAD" 
            />
            
            <button 
                onClick={() => setActiveTab(Tab.STUDIO)} 
                className={`
                    relative -top-4 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg
                    ${activeTab === Tab.STUDIO ? 'bg-foreground text-background scale-110' : 'bg-background text-foreground border border-border hover:scale-105'}
                `}
            >
                <Aperture strokeWidth={1.5} size={24} />
            </button>

            <NavButton 
                active={activeTab === Tab.CLOSET} 
                onClick={() => setActiveTab(Tab.CLOSET)} 
                icon={<Shirt strokeWidth={1.5} size={22} />} 
                label="CLOSET" 
            />
        </div>
      </nav>
    </div>
  );
}

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => {
    return (
        <button 
            onClick={onClick}
            className={`
                group flex flex-col items-center justify-center w-16 transition-colors duration-300
                ${active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground/70'}
            `}
        >
            <div className="mb-1">{icon}</div>
            <span className="text-[9px] font-medium tracking-widest">{label}</span>
        </button>
    )
}

export default function App() {
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
        const win = window as any;
        if (win.aistudio) {
            const selected = await win.aistudio.hasSelectedApiKey();
            setHasKey(selected);
        }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
      const win = window as any;
      if (win.aistudio) {
          await win.aistudio.openSelectKey();
          setHasKey(true);
      }
  };

  if (!hasKey) {
      return (
          <div className="h-screen w-full flex flex-col items-center justify-center bg-background p-6 text-center">
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                  <ShieldCheck className="w-12 h-12 text-primary" />
              </div>
              <h1 className="text-xl font-bold mb-2">API Key Required</h1>
              <p className="text-muted-foreground text-sm max-w-md mb-6">
                  To use the high-quality Gemini models, please select a paid API key from a Google Cloud Project.
              </p>
              <button 
                  onClick={handleSelectKey}
                  className="px-6 py-3 bg-foreground text-background rounded-md font-medium hover:opacity-90 transition-opacity"
              >
                  Select API Key
              </button>
              <p className="mt-4 text-xs text-muted-foreground">
                  <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="underline hover:text-foreground">
                      Billing Documentation
                  </a>
              </p>
          </div>
      );
  }

  return (
    <ErrorBoundary>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </ErrorBoundary>
  );
}