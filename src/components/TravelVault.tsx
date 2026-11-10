import React, { useState } from 'react';
import {
  Bookmark,
  Check,
  Plus,
  Trash2,
  ArrowRight,
  Luggage,
  Coins,
  ShieldCheck,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { Destination, Itinerary, PackingItem } from '../types/travel';
import { INITIAL_PACKING_ITEMS } from '../data/curatedDestinations';

interface TravelVaultProps {
  savedDestinations: Destination[];
  savedItineraries: Itinerary[];
  onOpenItinerary: (itinerary: Itinerary) => void;
  onRemoveSavedDest: (destId: string) => void;
  onRemoveSavedItinerary: (destName: string) => void;
}

export const TravelVault: React.FC<TravelVaultProps> = ({
  savedDestinations,
  savedItineraries,
  onOpenItinerary,
  onRemoveSavedDest,
  onRemoveSavedItinerary,
}) => {
  const [packingList, setPackingList] = useState<PackingItem[]>(INITIAL_PACKING_ITEMS);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<PackingItem['category']>('Essentials');
  const [budgetBaseUsd, setBudgetBaseUsd] = useState(1800);
  const [targetCurrency, setTargetCurrency] = useState<'EUR' | 'JPY' | 'GBP' | 'CHF'>('EUR');

  const RATES: Record<string, { rate: number; symbol: string }> = {
    EUR: { rate: 0.92, symbol: '€' },
    JPY: { rate: 154.2, symbol: '¥' },
    GBP: { rate: 0.79, symbol: '£' },
    CHF: { rate: 0.9, symbol: 'CHF' },
  };

  const togglePacked = (id: string) => {
    setPackingList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, packed: !item.packed } : item))
    );
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    const newItem: PackingItem = {
      id: `pack-${Date.now()}`,
      category: newItemCategory,
      name: newItemName.trim(),
      packed: false,
      isAiSuggested: false,
    };
    setPackingList((prev) => [...prev, newItem]);
    setNewItemName('');
  };

  const packedCount = packingList.filter((i) => i.packed).length;
  const progressPercent = Math.round((packedCount / (packingList.length || 1)) * 100);

  const convertedAmount = Math.round(budgetBaseUsd * RATES[targetCurrency].rate);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Title Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-900/5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Traveler’s Dossier
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500 font-medium">Vault, Luggage & Currency</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-slate-900">
            Travel Vault & Logistics
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="glass-pill px-4 py-2 rounded-2xl flex items-center gap-2 text-xs font-semibold text-slate-800">
            <Bookmark className="w-4 h-4 text-blue-600" />
            <span>
              {savedDestinations.length} Portals · {savedItineraries.length} Itineraries
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Saved Itineraries & Destinations (Top Half) */}
      <div className="space-y-4">
        <h2 className="font-display text-xl font-bold text-slate-900">
          Saved Voyages & Itineraries
        </h2>

        {savedItineraries.length === 0 && savedDestinations.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-900/5 text-center text-slate-500">
            <Bookmark className="w-10 h-10 mx-auto mb-3 text-slate-300" />
            <p className="font-medium text-slate-700">No saved journeys yet.</p>
            <p className="text-xs text-slate-400 mt-1">
              Explore destinations or generate an itinerary to pin them to your vault.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedItineraries.map((itinerary) => (
              <div
                key={itinerary.destination}
                className="bg-white rounded-2xl p-5 border border-slate-900/5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                      Custom Itinerary
                    </span>
                    <button
                      type="button"
                      onClick={() => onRemoveSavedItinerary(itinerary.destination)}
                      className="text-slate-400 hover:text-red-600 p-1 rounded-lg transition-colors cursor-pointer"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h3 className="font-display text-lg font-bold text-slate-900 mb-1">
                    {itinerary.destination}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-4">
                    {itinerary.tagline}
                  </p>
                  <div className="text-xs font-semibold text-slate-700 tabular-nums">
                    Est. Budget: ${itinerary.totalEstCostUsd}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenItinerary(itinerary)}
                  className="mt-4 w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-50 hover:bg-blue-600 text-slate-700 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  <span>Launch in Trip Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {savedDestinations.map((dest) => (
              <div
                key={dest.id}
                className="bg-white rounded-2xl p-5 border border-slate-900/5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                      Saved Portal
                    </span>
                    <button
                      type="button"
                      onClick={() => onRemoveSavedDest(dest.id)}
                      className="text-slate-400 hover:text-red-600 p-1 rounded-lg transition-colors cursor-pointer"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h3 className="font-display text-lg font-bold text-slate-900 mb-1">
                    {dest.name}, {dest.country}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-4">
                    {dest.tagline}
                  </p>
                  <div className="text-xs font-semibold text-slate-700 tabular-nums">
                    Daily Est: ${dest.dailyCostUsd} / day
                  </div>
                </div>

                {dest.sampleItinerary && (
                  <button
                    type="button"
                    onClick={() => onOpenItinerary(dest.sampleItinerary!)}
                    className="mt-4 w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-50 hover:bg-blue-600 text-slate-700 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <span>Open Curated Itinerary</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Logistics Split: Smart Packing Intelligence & Currency Converter */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Smart Packing Checklist (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-900/5 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <Luggage className="w-5 h-5 text-blue-600" />
                <h2 className="font-display text-xl font-bold text-slate-900">
                  AI Luggage Intelligence
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Dynamic packing matrix calibrated for destination weather and transit logistics
              </p>
            </div>

            {/* Progress pill */}
            <div className="flex items-center gap-3">
              <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-xs font-bold text-slate-700 tabular-nums">
                {packedCount}/{packingList.length} Packed
              </span>
            </div>
          </div>

          {/* Checklist by categories */}
          <div className="space-y-5">
            {(['Essentials', 'Apparel & Footwear', 'Tech & Gear', 'Health & Documents'] as const).map(
              (category) => {
                const categoryItems = packingList.filter((i) => i.category === category);
                if (categoryItems.length === 0) return null;

                return (
                  <div key={category} className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      {category}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {categoryItems.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => togglePacked(item.id)}
                          className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                            item.packed
                              ? 'bg-blue-50/50 border-blue-200/60 text-slate-500 line-through'
                              : 'bg-white hover:bg-slate-50/80 border-slate-200/80 text-slate-800'
                          }`}
                        >
                          {/* Curved Checkbox per spec: radius 6px, active fills with Electric Cobalt + white checkmark */}
                          <div
                            className={`w-5 h-5 rounded-[6px] flex items-center justify-center transition-colors shrink-0 ${
                              item.packed
                                ? 'bg-blue-600 text-white'
                                : 'border border-slate-900/20 bg-white'
                            }`}
                          >
                            {item.packed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          <span className="text-xs font-medium leading-tight">
                            {item.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
            )}
          </div>

          {/* Add custom packing item form */}
          <form
            onSubmit={handleAddItem}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-4 border-t border-slate-100"
          >
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Add personal gear item (e.g. 'Polarized sunglasses')..."
              className="flex-1 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500"
            />
            <select
              value={newItemCategory}
              onChange={(e) => setNewItemCategory(e.target.value as any)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="Essentials">Essentials</option>
              <option value="Apparel & Footwear">Apparel & Footwear</option>
              <option value="Tech & Gear">Tech & Gear</option>
              <option value="Health & Documents">Health & Documents</option>
            </select>
            <button
              type="submit"
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Item</span>
            </button>
          </form>
        </div>

        {/* Currency & Financial Logistics HUD (1 Col) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-900/5 shadow-xs flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Coins className="w-5 h-5 text-amber-500" />
              <h2 className="font-display text-xl font-bold text-slate-900">
                Currency & Budget
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Live multi-currency estimate with dynamic spot calculations
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Voyage Budget (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    value={budgetBaseUsd}
                    onChange={(e) => setBudgetBaseUsd(Number(e.target.value))}
                    step={100}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-2 text-sm font-bold text-slate-900 tabular-nums focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Target Destination Currency
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['EUR', 'JPY', 'GBP', 'CHF'] as const).map((curr) => (
                    <button
                      key={curr}
                      type="button"
                      onClick={() => setTargetCurrency(curr)}
                      className={`py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                        targetCurrency === curr
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {curr}
                    </button>
                  ))}
                </div>
              </div>

              {/* Conversion Result Card */}
              <div className="bg-blue-50/70 border border-blue-200/60 rounded-2xl p-4 text-center">
                <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider">
                  Target Converted Value
                </span>
                <div className="text-3xl font-bold font-display text-blue-900 mt-1 tabular-nums">
                  {RATES[targetCurrency].symbol} {convertedAmount.toLocaleString()}
                </div>
                <span className="text-[10px] text-blue-600 mt-0.5 block">
                  1 USD = {RATES[targetCurrency].rate} {targetCurrency}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl text-xs text-slate-500 space-y-1">
            <span className="font-semibold text-slate-700 block">VoyageAI Tip:</span>
            <span>
              Always opt to be charged in the local foreign currency at point-of-sale to avoid predatory DCC conversion markups.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
