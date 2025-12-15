
import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Clock, X } from 'lucide-react';
import { LoadingState } from '../LoadingState';
import { SEARCH_SUGGESTIONS } from '../../constants';
import { SearchRecord, getAllItems, deleteItem } from '../../services/db';

interface SearchBarProps {
  query: string;
  isSearching: boolean;
  onQueryChange: (val: string) => void;
  onSearch: (term: string) => void;
  onHistorySelect?: (record: SearchRecord) => void;
  onClear: () => void;
  hasResults: boolean;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
  query, 
  isSearching, 
  onQueryChange, 
  onSearch,
  onHistorySelect,
  onClear,
  hasResults,
  placeholder
}) => {
  const [history, setHistory] = useState<SearchRecord[]>([]);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (isFocused) {
        loadHistory();
    }
  }, [isFocused]);

  const loadHistory = async () => {
      try {
          const recs = await getAllItems<SearchRecord>('searchHistory');
          // Sort by timestamp desc
          setHistory(recs.sort((a, b) => b.timestamp - a.timestamp).slice(0, 5));
      } catch (e) {
          console.error("Failed to load history", e);
      }
  };

  const handleDeleteHistory = async (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      await deleteItem('searchHistory', id);
      loadHistory();
  };

  const showHistory = isFocused && !isSearching && !hasResults && history.length > 0 && !query;

  return (
    <div className="w-full px-6 pt-12 pointer-events-auto z-50">
        <div className="relative shadow-xl group">
            <input
                type="text"
                value={query}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setTimeout(() => setIsFocused(false), 200)} // Delay to allow click
                onChange={(e) => onQueryChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSearch(query)}
                placeholder={placeholder || "Where's the vibe? (e.g. Cafe in Hanoi)"}
                className="w-full h-14 pl-12 pr-10 bg-background/95 backdrop-blur-md rounded-lg border-0 text-lg font-light focus:ring-2 focus:ring-foreground/10 outline-none transition-shadow"
            />
            <Search className="absolute left-4 top-4 text-muted-foreground group-focus-within:text-foreground transition-colors" size={20} />
            
            {isSearching ? (
                <div className="absolute right-4 top-4">
                    <LoadingState estimatedTime={15} message="" compact className="mr-2" />
                </div>
            ) : query ? (
                <button 
                    onClick={onClear}
                    className="absolute right-4 top-4 p-1 text-muted-foreground hover:text-foreground"
                >
                    <X size={16} />
                </button>
            ) : (
                <Sparkles className="absolute right-4 top-4 text-amber-400 opacity-0 group-focus-within:opacity-100 animate-sparkle transition-opacity" size={20} />
            )}
        </div>

        {/* Search History Dropdown */}
        {showHistory && (
             <div className="absolute left-6 right-6 mt-2 bg-background/95 backdrop-blur-md rounded-lg shadow-xl border border-border overflow-hidden">
                <div className="px-4 py-2 text-xs font-bold uppercase text-muted-foreground bg-secondary/30">Recent</div>
                {history.map(item => (
                    <div 
                        key={item.id} 
                        className="flex items-center justify-between px-4 py-3 hover:bg-secondary/50 cursor-pointer border-b border-border/50 last:border-0"
                        onClick={() => onHistorySelect && onHistorySelect(item)}
                    >
                        <div className="flex items-center gap-3 overflow-hidden">
                            <Clock size={14} className="text-muted-foreground flex-shrink-0" />
                            <span className="text-sm truncate">{item.query}</span>
                        </div>
                        <button 
                            onClick={(e) => handleDeleteHistory(e, item.id)}
                            className="p-1 hover:bg-destructive/10 hover:text-destructive rounded-full"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}
             </div>
        )}

        {/* Suggestions */}
        {!isSearching && !hasResults && !showHistory && (
            <div className="mt-4 flex flex-wrap gap-2">
                {SEARCH_SUGGESTIONS.map(s => (
                    <button
                        key={s}
                        onClick={() => onSearch(s)}
                        className="px-3 py-1.5 bg-background/80 backdrop-blur border border-border rounded-full text-xs font-medium text-muted-foreground hover:bg-foreground hover:text-background transition-colors"
                    >
                        {s}
                    </button>
                ))}
            </div>
        )}
    </div>
  );
};
