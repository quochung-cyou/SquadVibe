
import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Member, Garment, MapLocation, Place, Tab } from '../types';
import { generateDressedMember, generateSceneComposition, searchPlaces, RenderSubject, RenderConfig } from '../services/geminiService';
import { saveItem, SearchRecord, getAllItems } from '../services/db';
import { useToast } from './Toast';

// Sub-components
import { MapLayer } from './studio/MapLayer';
import { SearchBar } from './studio/SearchBar';
import { PlaceCarousel } from './studio/PlaceCarousel';
import { PlaceDetailSheet } from './studio/PlaceDetailSheet';
import { ComposePanel } from './studio/ComposePanel';
import { RenderResultOverlay } from './studio/RenderResultOverlay';
import { OnboardingOverlay } from './studio/OnboardingOverlay';

interface StudioViewProps {
  members: Member[];
  garments: Garment[];
  assignments: Record<string, string | null>; 
  onAssign: (memberId: string, garmentId: string | null) => void;
  onChangeTab: (tab: Tab) => void;
}

export const StudioView: React.FC<StudioViewProps> = ({ 
  members, 
  garments, 
  assignments, 
  onAssign,
  onChangeTab
}) => {
  // Mode: SEARCH (Default) -> DETAIL (Sheet Open) -> COMPOSE (After selecting visualize)
  const [mode, setMode] = useState<'SEARCH' | 'DETAIL' | 'COMPOSE'>('SEARCH');
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [searchPlaceholder, setSearchPlaceholder] = useState("Where's the vibe? (e.g. Cafe in Hanoi)");

  // Compose State
  const [selectedMemberId, setSelectedMemberId] = useState<string>(members[0]?.id || '');
  const [isRendering, setIsRendering] = useState(false);
  const [renderResult, setRenderResult] = useState<{img: string} | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Intermediate State (Phase 1 results: id -> base64)
  const [intermediateResults, setIntermediateResults] = useState<Record<string, string>>({});

  // Map State
  const [mapLocation, setMapLocation] = useState<MapLocation>({ lat: 21.0285, lng: 105.8542, zoom: 14 });
  const [sceneContext, setSceneContext] = useState<string>(""); // Text description
  const [backgroundImage, setBackgroundImage] = useState<string | undefined>(undefined); // Real image URL

  const { showToast } = useToast();

  useEffect(() => {
      // Check history to show onboarding
      const checkHistory = async () => {
          const h = await getAllItems('searchHistory');
          if (h.length === 0) setShowOnboarding(true);
      };
      checkHistory();
  }, []);

  // Sync selectedMemberId
  useEffect(() => {
    if (members.length === 0) {
       if (selectedMemberId !== '') setSelectedMemberId('');
    } else {
       const exists = members.find(m => m.id === selectedMemberId);
       if (!exists) {
           setSelectedMemberId(members[0].id);
       }
    }
  }, [members]);

  // Wrapper for assignment to invalidate phase 1 results
  const handleAssignment = (memberId: string, garmentId: string | null) => {
      onAssign(memberId, garmentId);
      // If outfit changes, remove the dressed image
      if (intermediateResults[memberId]) {
          const next = { ...intermediateResults };
          delete next[memberId];
          setIntermediateResults(next);
      }
  };

  const performSearch = async (term: string, placeId?: string) => {
      setSearchQuery(term);
      setIsSearching(true);
      setError(null);
      setSearchResults([]);
      setSelectedPlace(null);
      setMode('SEARCH');
      setShowOnboarding(false);
      
      try {
          const results = await searchPlaces(term, placeId);
          setSearchResults(results);
          
          const record: SearchRecord = {
              id: `h${Date.now()}`,
              query: term,
              timestamp: Date.now(),
              results: results
          };
          await saveItem('searchHistory', record);

      } catch (e: any) {
          console.error("Search error:", e);
          const msg = e.message || "Could not find places. Try again.";
          if (msg.includes("overloaded") || msg.includes("503")) {
              showToast(msg, 'error');
          } else {
              setError(msg);
          }
      } finally {
          setIsSearching(false);
      }
  };

  const handleSearch = async (term: string) => {
      if (!term.trim()) return;
      await performSearch(term);
  };

  const handleHistorySelect = (record: SearchRecord) => {
      setSearchQuery(record.query);
      setSearchResults(record.results);
      if (record.results.length > 0) {
          const first = record.results[0];
          setMapLocation({ lat: first.lat, lng: first.lng, zoom: 14 });
      }
  };

  const handlePoiClick = (query: string, location: {lat: number, lng: number}, placeId?: string) => {
      setMapLocation({ ...location, zoom: 16 });
      // Pass the query (which contains COORDS:...) directly to performSearch
      performSearch(query, placeId);
  };

  const handleLocationFound = (loc: MapLocation) => {
      setMapLocation(loc);
      setSearchPlaceholder("Search near you... (e.g. Hidden Cafe)");
      // Implicitly suggest nearby vibes
      setShowOnboarding(false);
  };

  const handleSelectPlace = (place: Place) => {
      setSelectedPlace(place);
      setMapLocation({ lat: place.lat, lng: place.lng, zoom: 18 });
      setMode('DETAIL');
  };

  const handleVisualize = (imageUrl: string) => {
      setBackgroundImage(imageUrl);
      setSceneContext(selectedPlace?.description || "");
      setMode('COMPOSE');
  };
  
  const handleBackToDetail = () => {
      setMode('DETAIL');
      setBackgroundImage(undefined);
  };

  // Phase 1: Dress specific members
  const handleDress = async (memberIdsToDress: string[], config: RenderConfig) => {
      setIsRendering(true);
      setError(null);
      
      try {
          const promises = memberIdsToDress.map(async (mid) => {
              const member = members.find(m => m.id === mid);
              const garmentId = assignments[mid];
              const garment = garments.find(g => g.id === garmentId);
              
              if (!member || !garment) return null;

              const subject: RenderSubject = {
                  memberId: member.id,
                  memberImageBase64: member.photoData,
                  garmentImageBase64: garment.imageUrl,
                  garmentCategory: garment.category
              };
              
              return generateDressedMember(subject, config);
          });

          const results = await Promise.all(promises);
          
          setIntermediateResults(prev => {
              const next = { ...prev };
              results.forEach(r => {
                  if (r) next[r.id] = r.img;
              });
              return next;
          });

      } catch (e: any) {
          setError(e.message || "Try-on failed.");
      } finally {
          setIsRendering(false);
      }
  };

  // Phase 2: Composite scene
  const handleComposite = async (includedMemberIds: string[], config: RenderConfig) => {
      setIsRendering(true);
      setError(null);
      setRenderResult(null);

      try {
          // Robust subject collection: Prefer intermediate (dressed), fallback to original
          const subjects = includedMemberIds
            .map(id => {
                // Priority: 1. Dressed Image, 2. Original Photo
                const img = intermediateResults[id] || members.find(m => m.id === id)?.photoData;
                return { id, img };
            })
            .filter(item => !!item.img) as { id: string, img: string }[];

          if (subjects.length === 0) throw new Error("No ready models found.");

          const resultImage = await generateSceneComposition(
              subjects,
              sceneContext,
              backgroundImage,
              config
          );

          setRenderResult({ img: resultImage });

      } catch (e: any) {
          setError(e.message || "Composition failed.");
      } finally {
          setIsRendering(false);
      }
  };

  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden transition-all duration-500">
      
      <MapLayer 
        location={mapLocation} 
        mode={mode} 
        onMapLoadError={setError}
        onPoiClick={handlePoiClick}
        onLocationFound={handleLocationFound}
      />

      {/* Onboarding Overlay */}
      <AnimatePresence>
          {showOnboarding && (
              <OnboardingOverlay 
                  onDismiss={() => setShowOnboarding(false)}
                  onExplore={() => setShowOnboarding(false)}
                  onCreateSquad={() => {
                      setShowOnboarding(false);
                      onChangeTab(Tab.SQUAD);
                  }}
              />
          )}
      </AnimatePresence>

      {/* SEARCH INTERFACE */}
      <AnimatePresence>
        {mode === 'SEARCH' && (
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0, y: -20 }}
                className="absolute inset-0 z-20 flex flex-col pointer-events-none"
            >
                <SearchBar 
                    query={searchQuery}
                    isSearching={isSearching}
                    onQueryChange={setSearchQuery}
                    onSearch={handleSearch}
                    onHistorySelect={handleHistorySelect}
                    onClear={() => {
                        setSearchQuery('');
                        setSearchResults([]);
                    }}
                    hasResults={searchResults.length > 0}
                    placeholder={searchPlaceholder}
                />

                <PlaceCarousel 
                    places={searchResults}
                    isLoading={isSearching}
                    onSelectPlace={handleSelectPlace}
                />
            </motion.div>
        )}
      </AnimatePresence>
    
      {/* PLACE DETAIL SHEET */}
      <AnimatePresence>
          {mode === 'DETAIL' && selectedPlace && (
              <PlaceDetailSheet 
                place={selectedPlace}
                garments={garments}
                onClose={() => setMode('SEARCH')}
                onVisualize={handleVisualize}
              />
          )}
      </AnimatePresence>

      {/* COMPOSE INTERFACE */}
      <AnimatePresence>
        {mode === 'COMPOSE' && (
            <ComposePanel 
                members={members}
                garments={garments}
                selectedMemberId={selectedMemberId}
                assignments={assignments}
                isRendering={isRendering}
                intermediateResults={intermediateResults}
                error={error}
                onBack={handleBackToDetail}
                onSelectMember={setSelectedMemberId}
                onAssign={handleAssignment}
                onDress={handleDress}
                onComposite={handleComposite}
                backgroundImage={backgroundImage}
            />
        )}
      </AnimatePresence>

      {/* RENDER RESULT */}
      <AnimatePresence>
        {renderResult && (
            <RenderResultOverlay 
                img={renderResult.img}
                originalImage={backgroundImage}
                context={sceneContext}
                onClose={() => setRenderResult(null)}
            />
        )}
      </AnimatePresence>
    </div>
  );
};
