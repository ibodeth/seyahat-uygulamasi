import React from 'react';
import { Compass, Sparkles, MapPin, Bookmark } from 'lucide-react';

interface HeaderProps {
  currentTab: 'explore' | 'studio' | 'map' | 'vault';
  onSelectTab: (tab: 'explore' | 'studio' | 'map' | 'vault') => void;
  onOpenNewTripModal: () => void;
  savedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenNewTripModal,
  savedCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-900/5 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single Text Element in Outfit) */}
        <button
          onClick={() => onSelectTab('explore')}
          className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/25 group-hover:scale-105 transition-transform duration-200">
            <Compass className="w-5 h-5 text-white stroke-[2.2]" />
          </div>
          <span className="font-display text-2xl font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0">
            Voyage<span className="text-blue-600">AI</span>
          </span>
        </button>

        {/* Zone 2: 4 Clean Single-Line Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <button
            onClick={() => onSelectTab('explore')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 relative ${
              currentTab === 'explore'
                ? 'text-blue-600 font-semibold'
                : 'hover:text-slate-900'
            }`}
          >
            Explore
            {currentTab === 'explore' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
            )}
          </button>

          <button
            onClick={() => onSelectTab('studio')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 relative flex items-center gap-1.5 ${
              currentTab === 'studio'
                ? 'text-blue-600 font-semibold'
                : 'hover:text-slate-900'
            }`}
          >
            <span>AI Trip Studio</span>
            {currentTab === 'studio' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
            )}
          </button>

          <button
            onClick={() => onSelectTab('map')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 relative flex items-center gap-1.5 ${
              currentTab === 'map'
                ? 'text-blue-600 font-semibold'
                : 'hover:text-slate-900'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Interactive Map</span>
            {currentTab === 'map' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
            )}
          </button>

          <button
            onClick={() => onSelectTab('vault')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 relative flex items-center gap-1.5 ${
              currentTab === 'vault'
                ? 'text-blue-600 font-semibold'
                : 'hover:text-slate-900'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Travel Vault</span>
            {savedCount > 0 && (
              <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded-full border border-blue-200/60 tabular-nums">
                {savedCount}
              </span>
            )}
            {currentTab === 'vault' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
            )}
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action (Solid Cobalt pill, text in Pure White) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenNewTripModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-full shadow-lg shadow-blue-600/20 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer whitespace-nowrap shrink-0"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span>Curate Voyage</span>
          </button>
        </div>
      </div>
    </header>
  );
};
