import React, { useState } from 'react';
import { Star, Bookmark, ArrowUpRight, Compass, ShieldCheck, Flame, Sparkles } from 'lucide-react';
import { Destination } from '../types/travel';

interface DestinationCardProps {
  destination: Destination;
  onSelect: (dest: Destination) => void;
  onToggleSave: (dest: Destination) => void;
  isSaved?: boolean;
}

export const DestinationCard: React.FC<DestinationCardProps> = ({
  destination,
  onSelect,
  onToggleSave,
  isSaved = false,
}) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="group bg-white rounded-[20px] overflow-hidden border border-slate-900/5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
      {/* Top Media Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
        {!imageError ? (
          <img
            src={destination.imageUrl}
            alt={`${destination.name}, ${destination.country}`}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-center p-6 text-white text-center"
            style={{ background: destination.fallbackGradient }}
          >
            <Compass className="w-10 h-10 mb-2 opacity-80" />
            <span className="font-display font-bold text-lg">{destination.name}</span>
            <span className="text-xs text-white/80">{destination.country}</span>
          </div>
        )}

        {/* Floating Glassmorphic Pills in Upper Corners */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          {/* Rating Pill */}
          <div className="glass-pill px-2.5 py-1 rounded-full flex items-center gap-1 text-xs font-semibold text-slate-800 shadow-sm">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="tabular-nums">{destination.rating.toFixed(2)}</span>
            <span className="text-[10px] text-slate-500 font-normal">({destination.reviewCount})</span>
          </div>

          {/* Status Badge Pill */}
          {destination.badge && (
            <div
              className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-xs ${
                destination.badge.type === 'eco'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
                  : destination.badge.type === 'deal'
                  ? 'bg-orange-50 text-orange-800 border border-orange-200/60'
                  : 'bg-blue-50 text-blue-800 border border-blue-200/60'
              }`}
            >
              {destination.badge.type === 'eco' && <ShieldCheck className="w-3 h-3 text-emerald-600" />}
              {destination.badge.type === 'deal' && <Flame className="w-3 h-3 text-orange-600" />}
              {destination.badge.type === 'ai' && <Sparkles className="w-3 h-3 text-blue-600" />}
              <span>{destination.badge.text}</span>
            </div>
          )}
        </div>

        {/* Right Corner: Price & Save Button */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <div className="glass-pill px-2.5 py-1 rounded-full text-xs font-bold text-slate-900 shadow-sm tabular-nums">
            ${destination.dailyCostUsd} <span className="text-[10px] font-normal text-slate-600">/ day</span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(destination);
            }}
            className={`w-8 h-8 rounded-full glass-pill flex items-center justify-center transition-all cursor-pointer ${
              isSaved
                ? 'bg-blue-600 text-white border-blue-600'
                : 'text-slate-700 hover:text-blue-600 hover:bg-white'
            }`}
            title={isSaved ? 'Remove from Saved' : 'Save to Travel Vault'}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* Scrim overlay for contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

        {/* Location caption over bottom edge */}
        <div className="absolute bottom-3 left-3 text-white pointer-events-none drop-shadow-md">
          <span className="text-xs uppercase tracking-wider font-semibold opacity-90">
            {destination.country}
          </span>
        </div>
      </div>

      {/* Bottom Information Section */}
      <div className="p-5 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="font-display text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              {destination.name}
            </h3>
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap mt-1">
              {destination.bestSeason}
            </span>
          </div>

          <p className="text-xs font-medium text-blue-600 mb-2">
            {destination.tagline}
          </p>

          <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed mb-4">
            {destination.description}
          </p>
        </div>

        <div>
          {/* Micro-tags with clean unboxed styling */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 pt-3 border-t border-slate-100 mb-4">
            {destination.tags.slice(0, 3).map((tag, idx) => (
              <React.Fragment key={tag}>
                <span>{tag}</span>
                {idx < 2 && <span className="text-slate-300">·</span>}
              </React.Fragment>
            ))}
          </div>

          {/* Action Trigger */}
          <button
            type="button"
            onClick={() => onSelect(destination)}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-blue-600 text-slate-700 hover:text-white font-medium text-xs transition-all duration-200 group/btn cursor-pointer"
          >
            <span>Explore Itinerary & Map</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
