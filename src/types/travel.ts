export interface ActivityItem {
  id: string;
  timeSlot: 'Morning' | 'Midday' | 'Afternoon' | 'Evening';
  time: string;
  title: string;
  category: 'Culture' | 'Dining' | 'Nature' | 'Architecture' | 'Leisure' | 'Transit';
  location: string;
  description: string;
  duration: string;
  estCostUsd: number;
  transitInfo: string;
  insiderTip: string;
  isEcoCertified?: boolean;
}

export interface DayPlan {
  dayNumber: number;
  title: string;
  theme: string;
  weatherForecast: string;
  dailyEstCostUsd: number;
  activities: ActivityItem[];
}

export interface Itinerary {
  destination: string;
  country?: string;
  tagline: string;
  summary: string;
  totalEstCostUsd: number;
  currency: string;
  bestSeason: string;
  highlights: string[];
  packingEssentials: string[];
  days: DayPlan[];
  imageUrl?: string;
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  tagline: string;
  description: string;
  imageUrl: string;
  fallbackGradient: string;
  rating: number;
  reviewCount: number;
  dailyCostUsd: number;
  bestSeason: string;
  vibe: string;
  badge?: {
    text: string;
    type: 'eco' | 'deal' | 'ai';
  };
  tags: string[];
  coordinates: {
    lat: number;
    lng: number;
    x: number; // percentage for SVG map projection (0-100)
    y: number; // percentage for SVG map projection (0-100)
  };
  sampleItinerary?: Itinerary;
}

export interface PackingItem {
  id: string;
  category: 'Essentials' | 'Apparel & Footwear' | 'Tech & Gear' | 'Health & Documents';
  name: string;
  packed: boolean;
  isAiSuggested?: boolean;
}
