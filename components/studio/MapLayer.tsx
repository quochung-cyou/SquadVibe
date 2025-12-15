import React, { useEffect, useRef, useState } from 'react';
import { MapLocation } from '../../types';
import { Layers, Box, RefreshCcw, Sparkles, Crosshair } from 'lucide-react';
import { Button } from '../Button';

declare var google: any;

interface MapLayerProps {
  location: MapLocation;
  mode: 'SEARCH' | 'DETAIL' | 'COMPOSE';
  onMapLoadError: (msg: string) => void;
  onPoiClick?: (poiName: string, location: {lat: number, lng: number}, placeId?: string) => void;
  onLocationFound?: (location: MapLocation) => void;
}

export const MapLayer: React.FC<MapLayerProps> = ({ location, mode, onMapLoadError, onPoiClick, onLocationFound }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  
  const [is3D, setIs3D] = useState(false);
  const [isSatellite, setIsSatellite] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  
  // State for the selected point logic
  const [selectedLocation, setSelectedLocation] = useState<{lat: number, lng: number, placeId?: string} | null>(null);

  // Initialize Map
  useEffect(() => {
    let map: any;

    const initMap = async () => {
        if (!mapRef.current) return;
        
        try {
            const { Map } = await google.maps.importLibrary("maps");
            const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
            
            map = new Map(mapRef.current, {
                center: { lat: location.lat, lng: location.lng },
                zoom: location.zoom,
                mapId: '4504f8b37365c3d0', 
                disableDefaultUI: true, // We still keep this true to hide standard controls, but POI clicks work
                gestureHandling: 'greedy',
                heading: 0,
                tilt: 0,
                clickableIcons: true, 
            });
            
            mapInstanceRef.current = map;

            markerRef.current = new AdvancedMarkerElement({
                map,
                position: { lat: location.lat, lng: location.lng },
            });

            // POI/Map Click Listener
             map.addListener("click", (e: any) => {
                // If user clicks a POI, e.placeId is present.
                // We DO NOT call e.stop() so the default Google Maps "pill"/window appears.
                
                const placeId = e.placeId;
                const lat = e.latLng.lat();
                const lng = e.latLng.lng();

                // Set our state to show the "Explore" button
                setSelectedLocation({
                    lat,
                    lng,
                    placeId
                });

                // Pan to center
                map.panTo(e.latLng);
            });

            map.addListener("dragstart", () => {
                // Optional: Clear selection on drag? 
            });

        } catch (e) {
            console.error("Map load failed", e);
            onMapLoadError("Map failed to load. Check API Key.");
        }
    };

    initMap();
  }, []); 

  // Update Map Position
  useEffect(() => {
      if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.panTo({ lat: location.lat, lng: location.lng });
          mapInstanceRef.current.setZoom(location.zoom);
          markerRef.current.position = { lat: location.lat, lng: location.lng };
      }
  }, [location]);

  // Toggle Map Type
  const toggleMapType = () => {
      if (!mapInstanceRef.current) return;
      const newType = !isSatellite;
      setIsSatellite(newType);
      mapInstanceRef.current.setMapTypeId(newType ? 'satellite' : 'roadmap');
  };

  // Toggle 3D Tilt
  const toggle3D = () => {
      if (!mapInstanceRef.current) return;
      const new3D = !is3D;
      setIs3D(new3D);
      let tilt = new3D ? 45 : 0;
      let heading = new3D ? 45 : 0;
      
      const animate = () => {
        mapInstanceRef.current.moveCamera({
            tilt: tilt,
            heading: heading
        });
      };
      animate();
  };

  const rotateCamera = () => {
      if (!mapInstanceRef.current) return;
      const currentHeading = mapInstanceRef.current.getHeading() || 0;
      mapInstanceRef.current.moveCamera({
          heading: currentHeading + 90
      });
  };

  const handleLocateMe = () => {
      if (navigator.geolocation) {
          setIsLocating(true);
          navigator.geolocation.getCurrentPosition(
              (position) => {
                  const newLoc = {
                      lat: position.coords.latitude,
                      lng: position.coords.longitude,
                      zoom: 15
                  };
                  // Notify parent to update state (which triggers the useEffect above)
                  if (onLocationFound) onLocationFound(newLoc);
                  setIsLocating(false);
              },
              (error) => {
                  console.error("Geolocation failed", error);
                  setIsLocating(false);
                  onMapLoadError("Could not get your location.");
              }
          );
      } else {
          onMapLoadError("Geolocation not supported.");
      }
  };

  const handleExploreClick = () => {
      if (selectedLocation && onPoiClick) {
          // Pass the data up to trigger the search
          onPoiClick(
            `COORDS:${selectedLocation.lat},${selectedLocation.lng}`, 
            { lat: selectedLocation.lat, lng: selectedLocation.lng },
            selectedLocation.placeId
          );
          setSelectedLocation(null);
      }
  };

  const heightClass = mode === 'SEARCH' ? 'h-full' : 'h-[50vh]';

  return (
    <div className={`w-full relative bg-muted overflow-hidden transition-all duration-500 ease-in-out ${heightClass}`}>
        <div ref={mapRef} className="w-full h-full grayscale-[10%] contrast-[1.05]" />
        
        {/* Top Gradient Overlay */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background/90 to-transparent pointer-events-none z-10" />

        {/* Explore Button - Floating Action Button for Selected Location */}
        {selectedLocation && (
            <div className="absolute bottom-40 left-1/2 -translate-x-1/2 z-30 animate-in slide-in-from-bottom-4 fade-in duration-300">
                <Button 
                    size="lg" 
                    variant="primary" 
                    onClick={handleExploreClick}
                    className="shadow-2xl rounded-full px-8 py-3 bg-foreground text-background font-medium tracking-wide border-2 border-background/20"
                >
                    <Sparkles size={18} className="mr-2" /> Explore Here
                </Button>
            </div>
        )}

        {/* Map Controls - Bottom Right */}
        <div className="absolute right-4 bottom-36 flex flex-col gap-2 z-20 transition-all duration-300">
            <button 
                onClick={handleLocateMe}
                className={`p-3 rounded-full shadow-lg transition-colors ${isLocating ? 'bg-secondary text-foreground animate-pulse' : 'bg-background text-foreground hover:bg-secondary'}`}
                title="Locate Me"
            >
                <Crosshair size={20} />
            </button>
            <button 
                onClick={toggleMapType}
                className={`p-3 rounded-full shadow-lg transition-colors ${isSatellite ? 'bg-foreground text-background' : 'bg-background text-foreground'}`}
            >
                <Layers size={20} />
            </button>
            <button 
                onClick={toggle3D}
                className={`p-3 rounded-full shadow-lg transition-colors ${is3D ? 'bg-foreground text-background' : 'bg-background text-foreground'}`}
            >
                <Box size={20} />
            </button>
            <button 
                onClick={rotateCamera}
                className="p-3 rounded-full shadow-lg bg-background text-foreground hover:bg-secondary"
            >
                <RefreshCcw size={20} />
            </button>
        </div>
    </div>
  );
};