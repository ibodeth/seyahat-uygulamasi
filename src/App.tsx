import React, { useState } from 'react';
import {
  Compass,
  Sparkles,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe,
  Wind,
  CheckCircle2,
  Calendar,
  MessageSquare,
  Bookmark,
} from 'lucide-react';
import { Header } from './components/Header';
import { FloatingOmniSearch } from './components/FloatingOmniSearch';
import { DestinationCard } from './components/DestinationCard';
import { ItineraryView } from './components/ItineraryView';
import { InteractiveMap } from './components/InteractiveMap';
import { TravelVault } from './components/TravelVault';
import { CopilotModal } from './components/CopilotModal';
import { NewTripModal } from './components/NewTripModal';
import { CURATED_DESTINATIONS, VIBE_CATEGORIES } from './data/curatedDestinations';
import { Destination, Itinerary } from './types/travel';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'explore' | 'studio' | 'map' | 'vault'>('explore');
  const [activeItinerary, setActiveItinerary] = useState<Itinerary>(
    CURATED_DESTINATIONS[0].sampleItinerary!
  );
  const [savedDestinations, setSavedDestinations] = useState<Destination[]>([
    CURATED_DESTINATIONS[0],
    CURATED_DESTINATIONS[1],
  ]);
  const [savedItineraries, setSavedItineraries] = useState<Itinerary[]>([
    CURATED_DESTINATIONS[0].sampleItinerary!,
  ]);
  const [selectedVibeFilter, setSelectedVibeFilter] = useState('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isNewTripModalOpen, setIsNewTripModalOpen] = useState(false);

  // Filtered destinations
  const filteredDestinations = CURATED_DESTINATIONS.filter((dest) => {
    if (selectedVibeFilter === 'all') return true;
    if (selectedVibeFilter === 'zen') return dest.vibe.toLowerCase().includes('zen');
    if (selectedVibeFilter === 'coastal') return dest.vibe.toLowerCase().includes('coast');
    if (selectedVibeFilter === 'alpine') return dest.vibe.toLowerCase().includes('alpine');
    if (selectedVibeFilter === 'wild') return dest.vibe.toLowerCase().includes('wild');
    if (selectedVibeFilter === 'cultural') return dest.vibe.toLowerCase().includes('craft') || dest.vibe.toLowerCase().includes('heritage');
    return true;
  });

  // Handle generating a new trip
  const handleGenerateTrip = async (params: {
    destination: string;
    days: number;
    travelers: string;
    vibe: string;
    prompt: string;
  }) => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/gemini/generate-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (data.itinerary) {
        setActiveItinerary(data.itinerary);
        setCurrentTab('studio');
        setIsNewTripModalOpen(false);
      }
    } catch (e) {
      console.error('Failed to generate itinerary:', e);
      // Fallback: match destination or default
      const matched = CURATED_DESTINATIONS.find((d) =>
        d.name.toLowerCase().includes(params.destination.toLowerCase())
      );
      if (matched?.sampleItinerary) {
        setActiveItinerary(matched.sampleItinerary);
      }
      setCurrentTab('studio');
      setIsNewTripModalOpen(false);
    } finally {
      setIsGenerating(false);
    }
  };

  // Toggle saving destination
  const handleToggleSaveDest = (dest: Destination) => {
    setSavedDestinations((prev) => {
      const exists = prev.some((d) => d.id === dest.id);
      if (exists) {
        return prev.filter((d) => d.id !== dest.id);
      }
      return [...prev, dest];
    });
  };

  // Save current itinerary
  const handleSaveItinerary = (itinerary: Itinerary) => {
    setSavedItineraries((prev) => {
      const exists = prev.some((i) => i.destination === itinerary.destination);
      if (exists) {
        return prev.filter((i) => i.destination !== itinerary.destination);
      }
      return [...prev, itinerary];
    });
  };

  // Open destination into Trip Studio
  const handleSelectDestination = (dest: Destination) => {
    if (dest.sampleItinerary) {
      setActiveItinerary(dest.sampleItinerary);
      setCurrentTab('studio');
    } else {
      // Generate dynamically
      handleGenerateTrip({
        destination: dest.name,
        days: 5,
        travelers: 'Couple',
        vibe: dest.vibe,
        prompt: `Focus on ${dest.tags.join(', ')}`,
      });
    }
  };

  // AI Prompt tweak from inside Trip Studio
  const handleTweakItinerary = async (tweakPrompt: string) => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/gemini/generate-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: activeItinerary.destination,
          days: activeItinerary.days.length,
          travelers: 'Traveler',
          vibe: 'Customized Refinement',
          prompt: `Existing Plan: ${activeItinerary.tagline}. Traveler Tweak Request: "${tweakPrompt}". Refine and update the activities accordingly.`,
        }),
      });
      const data = await res.json();
      if (data.itinerary) {
        setActiveItinerary(data.itinerary);
      }
    } catch (e) {
      console.error('Tweak failed:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const totalSavedCount = savedDestinations.length + savedItineraries.length;

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#0F172A] flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Navigation conforming to Top Bar Contract */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenNewTripModal={() => setIsNewTripModalOpen(true)}
        savedCount={totalSavedCount}
      />

      {/* Main Content Areas */}
      <main className="flex-1 pb-24">
        {currentTab === 'explore' && (
          <div className="space-y-16">
            {/* Hero Section with Sunset Horizon Radial Glow */}
            <section className="relative pt-12 pb-8 sm:pt-20 sm:pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] sunset-radial pointer-events-none opacity-80" />

              <div className="max-w-5xl mx-auto text-center relative z-10">
                {/* AI Recommendation Pill */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-slate-900/10 shadow-xs mb-6 animate-in fade-in duration-300">
                  <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                  <span className="text-xs font-semibold text-slate-700 tracking-wide">
                    VoyageAI Intelligence Engine
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="text-xs text-blue-600 font-semibold">
                    Global Discovery
                  </span>
                </div>

                {/* Display Hero Title in Outfit */}
                <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.08] mb-6 max-w-4xl mx-auto">
                  Where algorithm meets{' '}
                  <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-orange-500 bg-clip-text text-transparent">
                    wanderlust.
                  </span>
                </h1>

                {/* Subtitle in Plus Jakarta Sans */}
                <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed mb-10">
                  Precision itineraries, generative discovery, and sensory travel intelligence crafted in seconds.
                </p>

                {/* Floating Omni-Search Bar (Level 3 Glassmorphic Console) */}
                <FloatingOmniSearch
                  onSearch={handleGenerateTrip}
                  isGenerating={isGenerating}
                />
              </div>
            </section>

            {/* Curated Portals Grid Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                      Handcrafted Portals
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs text-slate-500 font-medium">Algorithmic Precision</span>
                  </div>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
                    Trending Curated Voyages
                  </h2>
                </div>

                {/* Interactive Filter Tabs / Segmented Controls */}
                <div className="flex items-center gap-1.5 p-1 bg-white rounded-full border border-slate-900/5 shadow-xs overflow-x-auto scrollbar-none">
                  {VIBE_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedVibeFilter(cat.id)}
                      className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-colors whitespace-nowrap cursor-pointer ${
                        selectedVibeFilter === cat.id
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Destination Cards 3-Column Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredDestinations.map((dest) => (
                  <DestinationCard
                    key={dest.id}
                    destination={dest}
                    onSelect={handleSelectDestination}
                    onToggleSave={handleToggleSaveDest}
                    isSaved={savedDestinations.some((d) => d.id === dest.id)}
                  />
                ))}
              </div>
            </section>

            {/* Bento Architecture / Travel Intelligence Showcase */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-900/5 shadow-xs">
                <div className="max-w-2xl mb-10">
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-1">
                    The VoyageAI Standard
                  </span>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                    Engineered for effortless velocity and tactile wonder.
                  </h2>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Generic itineraries result in crowds, backtracking, and fatigue. VoyageAI synthesizes temporal flow, sunlight geometry, and regional traditions.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Card 1 */}
                  <div className="bg-[#FAF8F5] rounded-2xl p-6 border border-slate-900/5 flex flex-col justify-between">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-blue-100/70 text-blue-600 flex items-center justify-center mb-4">
                        <Zap className="w-5 h-5" />
                      </div>
                      <h3 className="font-display text-lg font-bold text-slate-900 mb-2">
                        Choreographed Chronology
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Every transit leg, meal pause, and viewpoint is sequentially ordered by geographical proximity and optimal solar angle.
                      </p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-200/60 text-[11px] font-semibold text-blue-600">
                      Zero wasted transfers
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="bg-[#FAF8F5] rounded-2xl p-6 border border-slate-900/5 flex flex-col justify-between">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-orange-100/70 text-orange-600 flex items-center justify-center mb-4">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <h3 className="font-display text-lg font-bold text-slate-900 mb-2">
                        Sensory Localization
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Insider intelligence advises exact times to beat tour buses, secret terrace tables, and seasonal agricultural harvests.
                      </p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-200/60 text-[11px] font-semibold text-orange-600">
                      Hyper-local secrets
                    </div>
                  </div>

                  {/* Card 3 */}
                  <div className="bg-[#FAF8F5] rounded-2xl p-6 border border-slate-900/5 flex flex-col justify-between">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-emerald-100/70 text-emerald-700 flex items-center justify-center mb-4">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <h3 className="font-display text-lg font-bold text-slate-900 mb-2">
                        Eco-Verified Mobility
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Prioritizes high-speed rail, scenic electric ferries, and pedestrian cobblestone promenades over crowded tour shuttles.
                      </p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-200/60 text-[11px] font-semibold text-emerald-700">
                      Low-impact footprint
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {currentTab === 'studio' && (
          <div className="px-4 sm:px-6 lg:px-8 pt-8">
            <ItineraryView
              itinerary={activeItinerary}
              onTweakWithPrompt={handleTweakItinerary}
              onSaveTrip={handleSaveItinerary}
              isSaved={savedItineraries.some(
                (i) => i.destination === activeItinerary.destination
              )}
            />
          </div>
        )}

        {currentTab === 'map' && (
          <div className="px-4 sm:px-6 lg:px-8 pt-8">
            <InteractiveMap
              destinations={CURATED_DESTINATIONS}
              onSelectDestination={(dest) => {
                handleSelectDestination(dest);
                setCurrentTab('studio');
              }}
            />
          </div>
        )}

        {currentTab === 'vault' && (
          <div className="px-4 sm:px-6 lg:px-8 pt-8">
            <TravelVault
              savedDestinations={savedDestinations}
              savedItineraries={savedItineraries}
              onOpenItinerary={(itinerary) => {
                setActiveItinerary(itinerary);
                setCurrentTab('studio');
              }}
              onRemoveSavedDest={(id) => {
                setSavedDestinations((prev) => prev.filter((d) => d.id !== id));
              }}
              onRemoveSavedItinerary={(name) => {
                setSavedItineraries((prev) =>
                  prev.filter((i) => i.destination !== name)
                );
              }}
            />
          </div>
        )}
      </main>

      {/* Floating Copilot Trigger Button (Bottom Right) with AI Spark Halo */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={() => setIsCopilotOpen(true)}
          className="flex items-center gap-2.5 px-5 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xl ai-spark-halo cursor-pointer transition-transform hover:scale-105 active:scale-95"
        >
          <Sparkles className="w-4 h-4 text-orange-400" />
          <span>Ask VoyageAI Copilot</span>
        </button>
      </div>

      {/* Copilot Drawer / Modal */}
      <CopilotModal
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        currentTrip={activeItinerary}
      />

      {/* New Trip / Voyage Orchestrator Modal */}
      <NewTripModal
        isOpen={isNewTripModalOpen}
        onClose={() => setIsNewTripModalOpen(false)}
        onSubmit={handleGenerateTrip}
        isGenerating={isGenerating}
      />

      {/* Quiet Footer */}
      <footer className="w-full bg-white border-t border-slate-900/5 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-slate-900">VoyageAI</span>
            <span>·</span>
            <span>AI-First Global Travel Intelligence</span>
          </div>
          <div>
            <span>© {new Date().getFullYear()} VoyageAI Inc. Designed with frosted tactility & algorithmic wonder.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
