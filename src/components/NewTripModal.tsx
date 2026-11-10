import React, { useState } from 'react';
import { X, Sparkles, MapPin, Calendar, Users, ArrowRight, Loader2 } from 'lucide-react';

interface NewTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (params: {
    destination: string;
    days: number;
    travelers: string;
    vibe: string;
    prompt: string;
  }) => void;
  isGenerating?: boolean;
}

const DESTINATION_SUGGESTIONS = [
  'Kyoto, Japan',
  'Amalfi Coast, Italy',
  'Swiss Alps, Switzerland',
  'Iceland Ring Road',
  'Oaxaca de Juárez, Mexico',
  'Cape Town, South Africa',
];

const VIBE_OPTIONS = [
  'Slow Travel & Gastronomy',
  'Cliffside Coastal Drive',
  'Alpine Solitude & Remote Work',
  'Glaciers & Northern Lights',
  'Living Crafts & Culture',
];

export const NewTripModal: React.FC<NewTripModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isGenerating = false,
}) => {
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState(5);
  const [travelers, setTravelers] = useState('Couple');
  const [vibe, setVibe] = useState('Slow Travel & Gastronomy');
  const [prompt, setPrompt] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      destination: destination.trim() || 'Kyoto, Japan',
      days,
      travelers,
      vibe,
      prompt: prompt.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-900/10 relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            VoyageAI Orchestrator
          </span>
        </div>

        <h2 className="font-display text-2xl font-bold text-slate-900 mb-1">
          Choreograph a New Journey
        </h2>
        <p className="text-xs text-slate-500 mb-6">
          Tailor duration, rhythm, and sensory priorities to synthesize your bespoke itinerary.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Destination */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Destination
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-blue-600 absolute left-3.5 top-3" />
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Where would you like to wander?"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>
            {/* Quick choices */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {DESTINATION_SUGGESTIONS.slice(0, 4).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDestination(d)}
                  className="text-[11px] text-slate-600 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-full cursor-pointer transition-colors"
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Days & Travelers Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Duration (Days)
              </label>
              <div className="flex items-center gap-1">
                {[3, 5, 7, 10].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDays(d)}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                      days === d
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {d}d
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Travel Party
              </label>
              <select
                value={travelers}
                onChange={(e) => setTravelers(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer h-9"
              >
                <option value="Solo Nomad">Solo Nomad</option>
                <option value="Couple">Couple</option>
                <option value="Travel Friends">Travel Friends</option>
                <option value="Family">Family</option>
              </select>
            </div>
          </div>

          {/* Vibe Intent */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Sensory Intent / Vibe
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {VIBE_OPTIONS.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVibe(v)}
                  className={`py-2 px-3 text-xs font-medium rounded-xl text-left transition-colors cursor-pointer ${
                    vibe === v
                      ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Specific Prompt Wishes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Specific Wishes / Micro-Interests
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Vegetarian dining, architectural highlights, quiet sunrise viewpoints, scenic trains..."
              rows={2}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Submit CTA */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isGenerating}
              className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-orange-500 hover:opacity-95 text-white font-semibold text-sm flex items-center justify-center gap-2 ai-spark-halo transition-all cursor-pointer shadow-lg disabled:opacity-60"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Synthesizing Journey...</span>
                </>
              ) : (
                <>
                  <span>Generate Bespoke Itinerary</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
