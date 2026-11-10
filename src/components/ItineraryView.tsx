import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Compass,
  Sparkles,
  RefreshCw,
  Bookmark,
  Share2,
  CheckCircle2,
  Leaf,
  Navigation,
  ChevronRight,
  SunMedium,
  Check,
  Plus,
} from 'lucide-react';
import { Itinerary, ActivityItem } from '../types/travel';

interface ItineraryViewProps {
  itinerary: Itinerary;
  onTweakWithPrompt?: (prompt: string) => void;
  onSaveTrip?: (itinerary: Itinerary) => void;
  isSaved?: boolean;
}

export const ItineraryView: React.FC<ItineraryViewProps> = ({
  itinerary,
  onTweakWithPrompt,
  onSaveTrip,
  isSaved = false,
}) => {
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [swappingId, setSwappingId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [localItinerary, setLocalItinerary] = useState<Itinerary>(itinerary);
  const [customTweakText, setCustomTweakText] = useState('');

  // Keep synced if parent changes
  React.useEffect(() => {
    setLocalItinerary(itinerary);
  }, [itinerary]);

  const currentDay = localItinerary.days[activeDayIndex] || localItinerary.days[0];

  const handleSwapActivity = async (dayNum: number, activity: ActivityItem) => {
    setSwappingId(activity.id);
    try {
      const res = await fetch('/api/gemini/swap-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: localItinerary.destination,
          timeSlot: activity.timeSlot,
          currentActivity: activity,
          preference: 'alternative authentic local experience with great atmosphere',
        }),
      });
      const data = await res.json();
      if (data.activity) {
        setLocalItinerary((prev) => {
          const updatedDays = prev.days.map((d) => {
            if (d.dayNumber === dayNum) {
              return {
                ...d,
                activities: d.activities.map((act) =>
                  act.id === activity.id ? { ...data.activity, id: `swap-${Date.now()}` } : act
                ),
              };
            }
            return d;
          });
          return { ...prev, days: updatedDays };
        });
      }
    } catch (e) {
      console.error('Swap failed:', e);
    } finally {
      setSwappingId(null);
    }
  };

  const handleCopySummary = () => {
    navigator.clipboard.writeText(
      `${localItinerary.destination} Itinerary: ${localItinerary.tagline}\nTotal Est: $${localItinerary.totalEstCostUsd}\nCurated by VoyageAI`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTweakSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customTweakText.trim() && onTweakWithPrompt) {
      onTweakWithPrompt(customTweakText.trim());
      setCustomTweakText('');
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header Banner Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-900/5 shadow-sm relative overflow-hidden">
        {/* Subtle sunset glow background accent */}
        <div className="absolute top-0 right-0 w-96 h-96 sunset-radial pointer-events-none opacity-60" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60 uppercase tracking-wider">
                Generative Itinerary
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {localItinerary.days.length} Days · {localItinerary.bestSeason}
              </span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
              {localItinerary.destination}
            </h1>
            <p className="text-base text-slate-600 max-w-2xl font-medium">
              {localItinerary.tagline}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 shrink-0">
            {onSaveTrip && (
              <button
                type="button"
                onClick={() => onSaveTrip(localItinerary)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  isSaved
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-white' : ''}`} />
                <span>{isSaved ? 'Saved in Vault' : 'Save Itinerary'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleCopySummary}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Narrative & Key Intelligence Strip */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-3">
            <p className="text-sm text-slate-700 leading-relaxed mb-4">
              {localItinerary.summary}
            </p>

            {/* Highlights bullets */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Choreographed Highlights
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                {localItinerary.highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-600">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Metrics Card */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-900/5 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Estimated Voyage Budget
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-2xl font-bold font-display text-slate-900 tabular-nums">
                  ${localItinerary.totalEstCostUsd}
                </span>
                <span className="text-xs text-slate-500">/ traveler</span>
              </div>
              <span className="text-[11px] text-slate-400">
                Local currency: {localItinerary.currency}
              </span>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-200/60">
              <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                <Leaf className="w-3 h-3 text-emerald-600" />
                <span>Optimized Low-Carbon Transit</span>
              </span>
            </div>
          </div>
        </div>

        {/* AI Quick Tweaker Bar */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <form onSubmit={handleTweakSubmit} className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-500 shrink-0" />
            <input
              type="text"
              value={customTweakText}
              onChange={(e) => setCustomTweakText(e.target.value)}
              placeholder="Refine with AI (e.g. 'Add more scenic cafes', 'Make Day 2 less strenuous')..."
              className="flex-1 text-xs sm:text-sm bg-slate-50 border border-slate-200/80 rounded-full px-4 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-full cursor-pointer transition-colors"
            >
              Apply Prompt
            </button>
          </form>
        </div>
      </div>

      {/* Day Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {localItinerary.days.map((day, idx) => (
          <button
            key={day.dayNumber}
            type="button"
            onClick={() => setActiveDayIndex(idx)}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
              activeDayIndex === idx
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 scale-[1.02]'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-900/5 hover:border-slate-300'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Day {day.dayNumber}</span>
          </button>
        ))}
      </div>

      {/* Day Overview Banner */}
      {currentDay && (
        <div className="bg-white/70 backdrop-blur-md rounded-2xl p-5 border border-slate-900/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-0.5">
              Day {currentDay.dayNumber} Theme
            </div>
            <h2 className="font-display text-xl font-bold text-slate-900">
              {currentDay.title}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              {currentDay.theme}
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-600 shrink-0">
            <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full">
              <SunMedium className="w-3.5 h-3.5 text-amber-500" />
              <span>{currentDay.weatherForecast}</span>
            </div>
            <div className="flex items-center gap-1 font-semibold text-slate-900 tabular-nums">
              <DollarSign className="w-3.5 h-3.5 text-slate-400" />
              <span>~${currentDay.dailyEstCostUsd} / day</span>
            </div>
          </div>
        </div>
      )}

      {/* Chronological Itinerary Trail (Left Cobalt Line Connector: 2px solid rgba(37,99,235,0.2)) */}
      <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 before:top-4 before:bottom-4 before:w-[2px] before:bg-blue-600/20">
        {currentDay?.activities.map((activity, actIdx) => (
          <div key={activity.id} className="relative group">
            {/* Trail Dot Node on Connector Line */}
            <div className="absolute -left-6 sm:-left-8 top-5 w-6 h-6 rounded-full bg-white border-2 border-blue-600 flex items-center justify-center text-[10px] font-bold text-blue-600 shadow-sm z-10">
              {actIdx + 1}
            </div>

            {/* AI Itinerary Tile: Modular Layout with White Surface */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-900/5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1">
                  {/* Category and Slot Tags */}
                  <div className="flex items-center gap-2 mb-2 text-xs">
                    <span className="font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                      {activity.timeSlot} · {activity.time}
                    </span>
                    <span className="text-slate-400">·</span>
                    <span className="font-medium text-slate-600">{activity.category}</span>
                    {activity.isEcoCertified && (
                      <>
                        <span className="text-slate-400">·</span>
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1">
                          <Leaf className="w-3 h-3 text-emerald-600" />
                          <span>Eco Choice</span>
                        </span>
                      </>
                    )}
                  </div>

                  <h3 className="font-display text-lg font-bold text-slate-900 mb-1">
                    {activity.title}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{activity.location}</span>
                    <span className="text-slate-300">·</span>
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{activity.duration}</span>
                    <span className="text-slate-300">·</span>
                    <span className="font-semibold text-slate-700 tabular-nums">
                      ${activity.estCostUsd} est.
                    </span>
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed mb-4">
                    {activity.description}
                  </p>

                  {/* Transit & Insider Secret Blocks */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
                    <div className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl">
                      <Navigation className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-slate-700 block">Transit Navigation</span>
                        <span className="text-slate-500">{activity.transitInfo}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 bg-orange-50/60 p-2.5 rounded-xl">
                      <Sparkles className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-orange-900 block">Insider AI Secret</span>
                        <span className="text-orange-950/80">{activity.insiderTip}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Action: Swap Activity with AI */}
                <div className="shrink-0 sm:self-start">
                  <button
                    type="button"
                    onClick={() => handleSwapActivity(currentDay.dayNumber, activity)}
                    disabled={swappingId === activity.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 border border-slate-200 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                    title="Swap with alternative local recommendation"
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 ${
                        swappingId === activity.id ? 'animate-spin text-blue-600' : ''
                      }`}
                    />
                    <span>{swappingId === activity.id ? 'Swapping...' : 'Swap Plan'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
