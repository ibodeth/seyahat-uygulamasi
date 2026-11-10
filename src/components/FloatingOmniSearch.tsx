import React, { useState } from 'react';
import { Search, Calendar, Users, Sparkles, MapPin, ArrowRight, Loader2 } from 'lucide-react';

interface FloatingOmniSearchProps {
  onSearch: (params: {
    destination: string;
    days: number;
    travelers: string;
    vibe: string;
    prompt: string;
  }) => void;
  isGenerating?: boolean;
}

const PRESET_DESTINATIONS = [
  'Kyoto, Japan',
  'Amalfi Coast, Italy',
  'Swiss Alps, Switzerland',
  'Iceland Ring Road',
  'Oaxaca de Juárez, Mexico',
  'Cape Town, South Africa',
];

const QUICK_VIBES = [
  'Zen Serenity & Gastronomy',
  'Mediterranean Coastal Slow Travel',
  'High-Altitude Alpine Solitude',
  'Glaciers & Northern Lights',
  'Ancestral Culinary Arts',
];

export const FloatingOmniSearch: React.FC<FloatingOmniSearchProps> = ({
  onSearch,
  isGenerating = false,
}) => {
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState(5);
  const [travelers, setTravelers] = useState('Couple');
  const [prompt, setPrompt] = useState('');
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  const [showConfigDropdown, setShowConfigDropdown] = useState(false);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSearch({
      destination: destination.trim() || 'Kyoto, Japan',
      days,
      travelers,
      vibe: prompt.trim() || 'Curated Sensory Discovery',
      prompt: prompt.trim(),
    });
  };

  const handleSelectPreset = (dest: string) => {
    setDestination(dest);
    setShowDestDropdown(false);
  };

  const handleSelectVibe = (vibeText: string) => {
    setPrompt(vibeText);
  };

  return (
    <div className="w-full max-w-5xl mx-auto relative z-30">
      {/* Omni-Search Shell: Ultra-elevated glass pill console */}
      <div className="glass-panel rounded-3xl md:rounded-full p-2.5 sm:p-3 shadow-2xl border border-white/70 relative">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-0"
        >
          {/* Zone 1: Where to? */}
          <div className="relative flex-1 px-4 py-2 hover:bg-black/[0.02] rounded-2xl md:rounded-full transition-colors">
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
              Where to?
            </label>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                onFocus={() => setShowDestDropdown(true)}
                placeholder="Kyoto, Amalfi, Alps, Iceland..."
                className="w-full bg-transparent text-slate-900 font-medium text-sm sm:text-base placeholder:text-slate-400 focus:outline-none"
              />
            </div>

            {/* Destination Autocomplete Dropdown */}
            {showDestDropdown && (
              <div
                className="absolute top-full left-0 mt-3 w-72 glass-panel rounded-2xl shadow-xl border border-white/80 p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                onMouseLeave={() => setShowDestDropdown(false)}
              >
                <div className="text-[11px] font-semibold text-slate-400 px-3 py-1.5 uppercase tracking-wider">
                  Curated Portals
                </div>
                {PRESET_DESTINATIONS.map((dest) => (
                  <button
                    key={dest}
                    type="button"
                    onClick={() => handleSelectPreset(dest)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm text-slate-700 hover:text-blue-600 hover:bg-blue-50/70 rounded-xl transition-colors cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span className="font-medium">{dest}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sub-divider hairline */}
          <div className="hidden md:block w-[1px] h-10 bg-slate-900/10 self-center" />

          {/* Zone 2: Duration & Travelers */}
          <div className="relative md:w-56 px-4 py-2 hover:bg-black/[0.02] rounded-2xl md:rounded-full transition-colors">
            <button
              type="button"
              onClick={() => setShowConfigDropdown(!showConfigDropdown)}
              className="w-full text-left focus:outline-none cursor-pointer"
            >
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5 cursor-pointer">
                Duration & Travelers
              </label>
              <div className="flex items-center gap-2 text-slate-900 font-medium text-sm sm:text-base">
                <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="truncate">
                  {days} Days · {travelers}
                </span>
              </div>
            </button>

            {/* Duration & Traveler Selector Dropdown */}
            {showConfigDropdown && (
              <div
                className="absolute top-full left-0 mt-3 w-80 glass-panel rounded-2xl shadow-xl border border-white/80 p-4 z-50 animate-in fade-in duration-150"
                onMouseLeave={() => setShowConfigDropdown(false)}
              >
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
                    <span>Trip Duration</span>
                    <span className="text-blue-600 font-bold">{days} Days</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {[3, 5, 7, 10, 14].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDays(d)}
                        className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                          days === d
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {d}d
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-700 mb-2">
                    Travel Party
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {['Solo Nomad', 'Couple', 'Travel Friends', 'Family'].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTravelers(t)}
                        className={`py-1.5 px-2 text-xs font-medium rounded-lg text-left transition-colors cursor-pointer ${
                          travelers === t
                            ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sub-divider hairline */}
          <div className="hidden md:block w-[1px] h-10 bg-slate-900/10 self-center" />

          {/* Zone 3: Vibe & AI Prompt */}
          <div className="flex-1 px-4 py-2 hover:bg-black/[0.02] rounded-2xl md:rounded-full transition-colors">
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
              Sensory Intent / AI Prompt
            </label>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-500 shrink-0" />
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Cliffside walks, quiet temples, third-wave coffee..."
                className="w-full bg-transparent text-slate-900 font-medium text-sm sm:text-base placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Action Button: Discovery Aura + AI Spark Glow */}
          <div className="p-1 shrink-0 flex items-center justify-end">
            <button
              type="submit"
              disabled={isGenerating}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-orange-500 hover:opacity-95 text-white font-semibold text-sm rounded-full ai-spark-halo cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.99] disabled:opacity-60 shadow-lg whitespace-nowrap"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Choreographing...</span>
                </>
              ) : (
                <>
                  <span>Orchestrate Journey</span>
                  <ArrowRight className="w-4 h-4 text-white/90" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Suggested Quick Vibe Chips below search */}
      <div className="mt-3 flex items-center justify-center flex-wrap gap-2 px-2">
        <span className="text-xs text-slate-500 font-medium mr-1">Inspirations:</span>
        {QUICK_VIBES.map((vibe) => (
          <button
            key={vibe}
            type="button"
            onClick={() => handleSelectVibe(vibe)}
            className="text-xs text-slate-600 hover:text-blue-600 bg-white/70 hover:bg-white px-3 py-1 rounded-full border border-slate-900/5 shadow-xs transition-colors cursor-pointer whitespace-nowrap"
          >
            {vibe}
          </button>
        ))}
      </div>
    </div>
  );
};
