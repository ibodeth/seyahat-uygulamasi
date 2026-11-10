import React, { useState } from 'react';
import {
  MapPin,
  Plane,
  Compass,
  Star,
  ArrowRight,
  ShieldCheck,
  Flame,
  Sparkles,
  Info,
  Layers,
  ZoomIn,
  Navigation2,
} from 'lucide-react';
import { Destination } from '../types/travel';

interface InteractiveMapProps {
  destinations: Destination[];
  onSelectDestination: (dest: Destination) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  destinations,
  onSelectDestination,
}) => {
  const [selectedDest, setSelectedDest] = useState<Destination>(destinations[0]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'cultural' | 'coastal' | 'nature'>('all');
  const [originCity, setOriginCity] = useState('London (LHR)');

  const ORIGINS: Record<string, { lat: number; lng: number; x: number; y: number }> = {
    'London (LHR)': { lat: 51.5074, lng: -0.1278, x: 47, y: 25 },
    'New York (JFK)': { lat: 40.7128, lng: -74.006, x: 26, y: 32 },
    'Tokyo (HND)': { lat: 35.6762, lng: 139.6503, x: 84, y: 37 },
    'Paris (CDG)': { lat: 48.8566, lng: 2.3522, x: 48, y: 27 },
    'Istanbul (IST)': { lat: 41.0082, lng: 28.9784, x: 55, y: 34 },
  };

  const currentOrigin = ORIGINS[originCity] || ORIGINS['London (LHR)'];

  // Calculate approximate distance
  const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  };

  const distanceKm = calculateDistanceKm(
    currentOrigin.lat,
    currentOrigin.lng,
    selectedDest.coordinates.lat,
    selectedDest.coordinates.lng
  );

  const flightHours = (distanceKm / 850 + 0.5).toFixed(1);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Title & Filter Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-slate-900/5 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Global Route Visualizer
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500 font-medium">Waypoints & Transit Corridors</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
            Interactive Global Chart
          </h1>
        </div>

        {/* Departure Airport Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80 text-xs text-slate-600">
            <Plane className="w-3.5 h-3.5 text-blue-600" />
            <span className="font-medium">Origin:</span>
            <select
              value={originCity}
              onChange={(e) => setOriginCity(e.target.value)}
              className="bg-transparent font-semibold text-slate-900 focus:outline-none cursor-pointer"
            >
              {Object.keys(ORIGINS).map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Map & Detail Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Canvas (2 Cols) */}
        <div className="lg:col-span-2 bg-[#F1EFEA] rounded-3xl p-4 sm:p-6 border border-slate-900/5 shadow-inner relative overflow-hidden min-h-[460px] flex flex-col justify-between">
          {/* Subtle continent silhouettes via SVG background */}
          <div className="absolute inset-0 opacity-15 pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="grid" width="4" height="4" patternUnits="userSpaceOnUse">
                  <path d="M 4 0 L 0 0 0 4" fill="none" stroke="currentColor" strokeWidth="0.1" />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#grid)" />
            </svg>
          </div>

          {/* Interactive SVG Projection */}
          <div className="relative w-full h-[380px] sm:h-[460px]">
            <svg
              className="w-full h-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {/* Flight Arc from origin to selected destination */}
              {selectedDest && (
                <g>
                  {/* Arc curve */}
                  <path
                    d={`M ${currentOrigin.x} ${currentOrigin.y} Q ${
                      (currentOrigin.x + selectedDest.coordinates.x) / 2
                    } ${
                      Math.min(currentOrigin.y, selectedDest.coordinates.y) - 15
                    } ${selectedDest.coordinates.x} ${selectedDest.coordinates.y}`}
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="0.8"
                    strokeDasharray="1.5,1.5"
                    className="animate-pulse"
                  />
                  {/* Origin Point Marker */}
                  <circle
                    cx={currentOrigin.x}
                    cy={currentOrigin.y}
                    r="1.2"
                    fill="#0F172A"
                  />
                </g>
              )}

              {/* Waypoint Nodes for all destinations */}
              {destinations.map((dest) => {
                const isSelected = selectedDest.id === dest.id;
                return (
                  <g
                    key={dest.id}
                    onClick={() => setSelectedDest(dest)}
                    className="cursor-pointer transition-transform duration-200"
                  >
                    {/* Pulsing ring if selected */}
                    {isSelected && (
                      <circle
                        cx={dest.coordinates.x}
                        cy={dest.coordinates.y}
                        r="3.5"
                        fill="#2563EB"
                        fillOpacity="0.2"
                      />
                    )}
                    {/* Outer Circle */}
                    <circle
                      cx={dest.coordinates.x}
                      cy={dest.coordinates.y}
                      r={isSelected ? '2' : '1.5'}
                      fill={isSelected ? '#2563EB' : '#FFFFFF'}
                      stroke={isSelected ? '#FFFFFF' : '#0F172A'}
                      strokeWidth="0.4"
                    />
                    {/* Inner core */}
                    <circle
                      cx={dest.coordinates.x}
                      cy={dest.coordinates.y}
                      r="0.7"
                      fill={isSelected ? '#FFFFFF' : '#2563EB'}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Absolute overlay pin cards over waypoints for quick clickability */}
            {destinations.map((dest) => {
              const isSelected = selectedDest.id === dest.id;
              return (
                <button
                  key={dest.id}
                  type="button"
                  onClick={() => setSelectedDest(dest)}
                  style={{
                    left: `${dest.coordinates.x}%`,
                    top: `${dest.coordinates.y}%`,
                    transform: 'translate(-50%, -120%)',
                  }}
                  className={`absolute z-20 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-md transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                    isSelected
                      ? 'bg-blue-600 text-white scale-110 shadow-blue-600/30 ring-2 ring-white'
                      : 'bg-white/90 text-slate-800 hover:bg-white border border-slate-900/10'
                  }`}
                >
                  <MapPin className={`w-3 h-3 ${isSelected ? 'text-white' : 'text-blue-600'}`} />
                  <span>{dest.name}</span>
                </button>
              );
            })}
          </div>

          {/* Map legend HUD */}
          <div className="relative z-10 flex items-center justify-between gap-2 text-xs text-slate-600 bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/60">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-slate-900" /> Origin: {originCity.split(' ')[0]}
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-blue-600" /> Active Voyage: {selectedDest.name}
              </span>
            </div>
            <span className="hidden sm:inline text-slate-400">Click any portal pin to inspect</span>
          </div>
        </div>

        {/* Selected Destination Intelligence Panel (1 Col) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-900/5 shadow-sm flex flex-col justify-between">
          <div>
            {/* Image Preview */}
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-5 bg-slate-100">
              <img
                src={selectedDest.imageUrl}
                alt={selectedDest.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 glass-pill px-2.5 py-0.5 rounded-full text-xs font-semibold text-slate-900">
                {selectedDest.country}
              </div>
              <div className="absolute top-3 right-3 glass-pill px-2.5 py-0.5 rounded-full text-xs font-bold text-slate-900 tabular-nums">
                ${selectedDest.dailyCostUsd} / day
              </div>
            </div>

            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                Active Portal
              </span>
              <div className="flex items-center text-amber-500 text-xs font-semibold">
                <Star className="w-3 h-3 fill-amber-500 mr-1" />
                <span className="tabular-nums">{selectedDest.rating.toFixed(2)}</span>
              </div>
            </div>

            <h2 className="font-display text-2xl font-bold text-slate-900 mb-1">
              {selectedDest.name}
            </h2>
            <p className="text-xs font-medium text-slate-500 mb-3">
              {selectedDest.tagline}
            </p>

            <p className="text-sm text-slate-600 leading-relaxed mb-5">
              {selectedDest.description}
            </p>

            {/* Flight & Logistics HUD */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-900/5 space-y-2.5 mb-5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Plane className="w-3.5 h-3.5 text-blue-600" /> Direct Flight Path
                </span>
                <span className="font-bold text-slate-900 tabular-nums">
                  ~{distanceKm.toLocaleString()} km
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Navigation2 className="w-3.5 h-3.5 text-blue-600" /> Approx Flight Time
                </span>
                <span className="font-bold text-slate-900 tabular-nums">
                  ~{flightHours} hrs
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Best Travel Window</span>
                <span className="font-medium text-slate-800">
                  {selectedDest.bestSeason}
                </span>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-5">
              {selectedDest.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Launch into AI Trip Studio */}
          <button
            type="button"
            onClick={() => onSelectDestination(selectedDest)}
            className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-md shadow-blue-600/20 cursor-pointer"
          >
            <span>Open in AI Trip Studio</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
