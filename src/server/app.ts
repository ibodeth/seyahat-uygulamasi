import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();

app.use(express.json());

// Initialize GoogleGenAI client safely
const getAIClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Express router for all Gemini / Travel API endpoints
const apiRouter = express.Router();

// Health check endpoint
apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'production',
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

apiRouter.get('/', (_req: Request, res: Response) => {
  res.json({
    name: 'VoyageAI API',
    status: 'online',
    endpoints: [
      'POST /api/gemini/generate-itinerary',
      'POST /api/gemini/chat',
      'POST /api/gemini/swap-activity',
      'GET /api/health',
    ],
  });
});

// API: Generate Itinerary
apiRouter.post('/gemini/generate-itinerary', async (req: Request, res: Response) => {
  const { destination, days = 5, travelers = 'Couple', vibe = 'Balanced Discovery', prompt = '' } = req.body;

  const ai = getAIClient();

  if (!ai) {
    // Return structured default itinerary if API key is not present
    return res.json({
      fallback: true,
      message: 'Generated via VoyageAI curated travel intelligence engine.',
      itinerary: createFallbackItinerary(destination, days, travelers, vibe, prompt),
    });
  }

  try {
    const systemPrompt = `You are VoyageAI, a world-class travel curator and logistics intelligence engine.
Create a hyper-detailed, sensory, and logically sequential ${days}-day travel itinerary for "${destination}".
Travelers: ${travelers}
Vibe / Intent: ${vibe}
Specific Wishes: ${prompt || 'Curate the most unforgettable, culturally rich, and seamlessly paced experience.'}

Return a valid JSON object matching the requested schema with distinct days, sequential time slots (Morning, Midday, Afternoon, Evening), realistic estimated local costs in USD, transit details, and insider secrets.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Generate an inspiring ${days}-day itinerary for ${destination}.`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            destination: { type: Type.STRING },
            tagline: { type: Type.STRING },
            summary: { type: Type.STRING },
            totalEstCostUsd: { type: Type.NUMBER },
            currency: { type: Type.STRING },
            bestSeason: { type: Type.STRING },
            highlights: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            packingEssentials: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            days: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  dayNumber: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  theme: { type: Type.STRING },
                  weatherForecast: { type: Type.STRING },
                  dailyEstCostUsd: { type: Type.NUMBER },
                  activities: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        timeSlot: { type: Type.STRING, description: 'Morning | Midday | Afternoon | Evening' },
                        time: { type: Type.STRING },
                        title: { type: Type.STRING },
                        category: { type: Type.STRING, description: 'Culture | Dining | Nature | Architecture | Leisure | Transit' },
                        location: { type: Type.STRING },
                        description: { type: Type.STRING },
                        duration: { type: Type.STRING },
                        estCostUsd: { type: Type.NUMBER },
                        transitInfo: { type: Type.STRING },
                        insiderTip: { type: Type.STRING },
                        isEcoCertified: { type: Type.BOOLEAN },
                      },
                      required: ['id', 'timeSlot', 'time', 'title', 'category', 'location', 'description', 'duration', 'estCostUsd', 'transitInfo', 'insiderTip'],
                    },
                  },
                },
                required: ['dayNumber', 'title', 'theme', 'weatherForecast', 'dailyEstCostUsd', 'activities'],
              },
            },
          },
          required: ['destination', 'tagline', 'summary', 'totalEstCostUsd', 'currency', 'bestSeason', 'highlights', 'packingEssentials', 'days'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      fallback: false,
      itinerary: parsed,
    });
  } catch (error: any) {
    console.error('Gemini itinerary error:', error);
    // Provide seamless fallback so app never breaks
    return res.json({
      fallback: true,
      errorNotice: error?.message || 'Using offline travel intelligence database.',
      itinerary: createFallbackItinerary(destination, days, travelers, vibe, prompt),
    });
  }
});

// API: Chat / Copilot
apiRouter.post('/gemini/chat', async (req: Request, res: Response) => {
  const { message, history = [], currentTrip } = req.body;
  const ai = getAIClient();

  if (!ai) {
    return res.json({
      reply: getSmartTravelReply(message, currentTrip),
    });
  }

  try {
    const systemInstruction = `You are VoyageAI Copilot, an elite travel specialist and local concierge.
Context: The traveler is currently planning or viewing a voyage${currentTrip ? ` to ${currentTrip.destination}` : ''}.
Keep your tone warm, sophisticated, concise, and full of tactile, sensory local insight (sounds, flavors, transit nuances, etiquette).
Give direct actionable recommendations with specific venue names, timing, and navigation tips.`;

    const chat = ai.chats.create({
      model: 'gemini-3.8-flash',
      config: { systemInstruction },
    });

    // Provide past history context if available
    for (const h of history.slice(-4)) {
      if (h.role === 'user') {
        await chat.sendMessage({ message: h.content });
      }
    }

    const response = await chat.sendMessage({ message });
    return res.json({ reply: response.text });
  } catch (error: any) {
    console.error('Gemini chat error:', error);
    return res.json({
      reply: getSmartTravelReply(message, currentTrip),
    });
  }
});

// API: Swap Activity
apiRouter.post('/gemini/swap-activity', async (req: Request, res: Response) => {
  const { destination, timeSlot, currentActivity, preference } = req.body;
  const ai = getAIClient();

  if (!ai) {
    return res.json({
      activity: {
        id: `swap-${Date.now()}`,
        timeSlot: timeSlot || 'Afternoon',
        time: currentActivity?.time || '2:30 PM',
        title: `Alternative Experience in ${destination || 'the City'}`,
        category: preference?.toLowerCase().includes('food') ? 'Dining' : 'Culture',
        location: `${destination} Arts & Heritage Quarter`,
        description: `A curated alternative tailored to your preference: ${preference || 'peaceful immersion'}. Enjoy handcrafted regional specialties and quiet observation terraces.`,
        duration: '2.5 hrs',
        estCostUsd: 28,
        transitInfo: '8 min stroll or 1 metro stop',
        insiderTip: 'Book the mezzanine terrace table or arrive 15 minutes before golden hour for stunning light.',
        isEcoCertified: true,
      },
    });
  }

  try {
    const prompt = `Suggest ONE distinct alternative travel activity in ${destination} for the ${timeSlot} slot to replace "${currentActivity?.title || 'current plan'}".
Traveler preference: "${preference || 'more relaxed and culturally authentic'}".
Return a single JSON object.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            timeSlot: { type: Type.STRING },
            time: { type: Type.STRING },
            title: { type: Type.STRING },
            category: { type: Type.STRING },
            location: { type: Type.STRING },
            description: { type: Type.STRING },
            duration: { type: Type.STRING },
            estCostUsd: { type: Type.NUMBER },
            transitInfo: { type: Type.STRING },
            insiderTip: { type: Type.STRING },
            isEcoCertified: { type: Type.BOOLEAN },
          },
          required: ['id', 'timeSlot', 'time', 'title', 'category', 'location', 'description', 'duration', 'estCostUsd', 'transitInfo', 'insiderTip'],
        },
      },
    });

    return res.json({ activity: JSON.parse(response.text || '{}') });
  } catch (error) {
    return res.json({
      activity: {
        id: `swap-${Date.now()}`,
        timeSlot: timeSlot || 'Afternoon',
        time: currentActivity?.time || '3:00 PM',
        title: `Curated Heritage Walk & Tea Master Experience`,
        category: 'Culture',
        location: `${destination} Historic Alleyways`,
        description: 'Immerse in intimate local workshops and taste single-origin infusions with master artisans.',
        duration: '2 hours',
        estCostUsd: 32,
        transitInfo: '10 min walking route through pedestrian lanes',
        insiderTip: 'Ask the host about seasonal harvest releases that are never exported abroad.',
        isEcoCertified: true,
      },
    });
  }
});

// Mount the API router at both '/api' and '/' to ensure total compatibility
// whether requests come directly in local dev (/api/gemini/...) or via Vercel rewrites (/gemini/...)
app.use('/api', apiRouter);
app.use('/', apiRouter);

// Fallback dynamic generator
function createFallbackItinerary(destination: string, days: number, travelers: string, vibe: string, _prompt: string) {
  const destName = destination || 'Kyoto, Japan';
  const numDays = Math.max(1, Math.min(days || 5, 14));

  const templates: Record<string, any> = {
    kyoto: {
      tagline: 'The Art of Quiet Precision & Timeless Flavors',
      currency: 'JPY',
      cost: 1650,
      season: 'Autumn Foliage & Spring Cherry Blossom',
      highlights: [
        'Dawn meditation at hidden Nanzen-ji sub-temple',
        'Kaiseki masterclass in Gion private machiya',
        'Sagano bamboo forest before the morning rush',
        'Historic Uji riverside matcha tea ceremony',
      ],
      essentials: ['Slip-on walking shoes', 'Tempered rain umbrella', 'Suica / Pasmo transit card', 'Cash for temple gardens'],
    },
    amalfi: {
      tagline: 'Sun-Drenched Terraces & Tyrrhenian Sea Horizons',
      currency: 'EUR',
      cost: 2150,
      season: 'May – June & September – October',
      highlights: [
        'Private wooden gozzo boat around Capri faraglioni',
        'Path of the Gods clifftop morning hike',
        'Ravello clifftop garden concerts at Villa Cimbrone',
        'Lemongrove dinner in Positano overlooking sunset waters',
      ],
      essentials: ['Linen shirts', 'Trail sneakers with grip', 'UV polarized sunglasses', 'Light evening layer'],
    },
    iceland: {
      tagline: 'Glacial Calderas, Basalt Cascades & Celestial Aurora',
      currency: 'ISK',
      cost: 2400,
      season: 'September – April (Aurora) or June – August (Midnight Sun)',
      highlights: [
        'Silfra fissure snorkeling between tectonic plates',
        'Secret geothermal canyon bath in Hrunalaug',
        'Vik black sand beach basalt cathedral columns',
        'Glacier lagoon zodiac exploration with icebergs',
      ],
      essentials: ['Windproof GORE-TEX shell', 'Thermal merino baselayer', 'Waterproof hiking boots', 'Swimwear for hot springs'],
    },
  };

  const key = Object.keys(templates).find((k) => destName.toLowerCase().includes(k)) || 'kyoto';
  const tmpl = templates[key] || templates.kyoto;

  const generatedDays = Array.from({ length: numDays }, (_, i) => {
    const dayNum = i + 1;
    return {
      dayNumber: dayNum,
      title: `Day ${dayNum}: ${getDayTitle(key, dayNum)}`,
      theme: getDayTheme(key, dayNum),
      weatherForecast: '21°C · Crisp morning sun with soft afternoon breezes',
      dailyEstCostUsd: Math.round(tmpl.cost / numDays),
      activities: [
        {
          id: `act-${dayNum}-1`,
          timeSlot: 'Morning',
          time: '08:30 AM',
          title: getMorningActivity(key, dayNum, destName),
          category: 'Culture',
          location: `${destName} Historic District`,
          description: 'Begin early to experience serenity before midday crowds. Absorb sensory acoustics and contemplative architecture.',
          duration: '2.5 hrs',
          estCostUsd: 25,
          transitInfo: '15m walking path or direct express tram',
          insiderTip: 'Step inside the rear stone terrace for unobstructed panoramic perspectives.',
          isEcoCertified: true,
        },
        {
          id: `act-${dayNum}-2`,
          timeSlot: 'Midday',
          time: '12:30 PM',
          title: getLunchActivity(key, dayNum, destName),
          category: 'Dining',
          location: `${destName} Market Enclave`,
          description: 'Savor regional culinary traditions crafted with seasonal, locally foraged farm-to-table ingredients.',
          duration: '1.5 hrs',
          estCostUsd: 38,
          transitInfo: '8 min stroll through heritage covered arcade',
          insiderTip: 'Request the chef counter to witness the meticulous preparation technique up close.',
          isEcoCertified: false,
        },
        {
          id: `act-${dayNum}-3`,
          timeSlot: 'Afternoon',
          time: '03:15 PM',
          title: getAfternoonActivity(key, dayNum, destName),
          category: 'Nature',
          location: `${destName} Scenic Foothills`,
          description: 'Explore scenic pathways, botanical gardens, and observation lookouts with sweeping views over the valley.',
          duration: '2 hrs',
          estCostUsd: 15,
          transitInfo: '12 min scenic cableway or electric shuttle',
          insiderTip: 'Golden hour begins here roughly 45 minutes prior to official sunset.',
          isEcoCertified: true,
        },
        {
          id: `act-${dayNum}-4`,
          timeSlot: 'Evening',
          time: '07:30 PM',
          title: getEveningActivity(key, dayNum, destName),
          category: 'Dining',
          location: `${destName} Waterfront Promenade`,
          description: 'An atmospheric dining experience pairing regional wines, artisan aperitifs, and ambient candlelit hospitality.',
          duration: '2.5 hrs',
          estCostUsd: 65,
          transitInfo: 'Short 5m walk along lantern-lit alleys',
          insiderTip: 'Ask the sommelier for rare local small-batch reserve vintage.',
          isEcoCertified: true,
        },
      ],
    };
  });

  return {
    destination: destName,
    tagline: tmpl.tagline,
    summary: `A bespoke ${numDays}-day journey calibrated for ${travelers.toLowerCase()} seeking ${vibe.toLowerCase()}. Every transit leg and culinary pause is choreographed for rhythm, sensory beauty, and effortless velocity.`,
    totalEstCostUsd: tmpl.cost,
    currency: tmpl.currency,
    bestSeason: tmpl.season,
    highlights: tmpl.highlights,
    packingEssentials: tmpl.essentials,
    days: generatedDays,
  };
}

function getDayTitle(key: string, day: number) {
  const titles: Record<string, string[]> = {
    kyoto: ['Awakening in Higashiyama', 'The Zen of Bamboo & Moss', 'Philosopher’s Contemplation', 'Imperial Gardens & Crafts', 'Hidden Uji Tea Enclaves', 'Fushimi Lantern Nightfall', 'Modern Kyoto Art & Coffee'],
    amalfi: ['Arrival in Cliffside Positano', 'Capri Waters & Faraglioni Odyssey', 'Ravello Terrace of Infinity', 'Path of the Gods Mountain Hike', 'Amalfi Maritime & Paper Mills', 'Sunset at Marina di Praia', 'Fiordo di Furore Discovery'],
    iceland: ['Geothermal Golden Circle', 'South Coast Waterfalls & Basalt', 'Glacier Lagoon & Iceberg Drift', 'Eastfjords Quiet Coastal Passes', 'Volcanic Krafla & Myvatn Baths', 'Snaefellsnes Peninsula Odyssey', 'Reykjavik Design & Nordic Spa'],
  };
  const list = titles[key] || titles.kyoto;
  return list[(day - 1) % list.length];
}

function getDayTheme(key: string, day: number) {
  const themes = ['Ancient Heritage & Sensory Stillness', 'Mountain Ridges & Botanical Serenity', 'Artisan Gastronomy & Living Craft', 'Panoramic Horizons & Coastal Light', 'Secret Enclaves & Slow Travel Rhythm'];
  return themes[(day - 1) % themes.length];
}

function getMorningActivity(key: string, day: number, _dest: string) {
  if (key === 'kyoto') {
    return ['Dawn Walk Through Fushimi Inari Torii Paths', 'Nanzen-ji Aqueduct & Zen Rock Meditation', 'Arashiyama Bamboo Grove at First Light', 'Kinkaku-ji Mirror Pond & Tea Pavilions'][day % 4];
  }
  if (key === 'amalfi') {
    return ['Clifftop Breakfast at Le Sirenuse Terrace', 'Morning Cruise along Faraglioni Arches', 'Path of the Gods Ridge Traverse', 'Ravello Villa Cimbrone Gardens'][day % 4];
  }
  return [`Morning Geyser Eruptions at Strokkur`, `Seljalandsfoss Behind-the-Water Wall Trek`, `Crystal Ice Cave Expedition`, `Reykjavik Harpa Concert Hall Architectural Tour`][day % 4];
}

function getLunchActivity(key: string, day: number, _dest: string) {
  if (key === 'kyoto') {
    return ['Handmade Soba & Seasonal Tempura at Honke Owariya', 'Nishiki Market Tasting & Yuba Delicacies', 'Obanzai Lunch in 120-Year-Old Machiya', 'Riverside Kawadoko Dining in Kibune'][day % 4];
  }
  if (key === 'amalfi') {
    return ['Spaghetti alle Vongole at Da Adolfo beach club', 'Lemon Grove Lunch at Ristorante Al Convento', 'Cliffside Trattoria da Gemma in Amalfi Center', 'Woodfired Neapolitan Pizza in Agerola'][day % 4];
  }
  return ['Fresh Arctic Char & Rye Bread baked in geothermal sand', 'Seafood Chowder at Old Harbor Reykjavik', 'Farm-to-Table Organic Greenhouse Lunch at Fridheimar', 'Smoked Lamb Flatbread in Vik village'][day % 4];
}

function getAfternoonActivity(key: string, day: number, _dest: string) {
  if (key === 'kyoto') {
    return ['Philosopher’s Path Canal Walk & Ceramic Boutiques', 'Matcha Whisking Workshop with 15th-Gen Master', 'Kiyomizu-dera Wooden Stage & Valley Overlook', 'Kennin-ji Twin Dragons Ceiling Meditation'][day % 4];
  }
  if (key === 'amalfi') {
    return ['Swimming in Emerald Grotto Turquoise Cavern', 'Artisan Ceramic Painting Studio in Vietri sul Mare', 'Limoncello Distillation Masterclass in Sorrento', 'Private Sunbed Lounge at Marina Grande'][day % 4];
  }
  return ['Thermal Bath Soak in Blue Lagoon Silica Waters', 'Skogafoss Rainbow Waterfall Exploration', 'Black Sand Beach & Basalt Columns in Reynisfjara', 'Zodiac Boat Safari among Jokulsarlon Icebergs'][day % 4];
}

function getEveningActivity(key: string, day: number, _dest: string) {
  if (key === 'kyoto') {
    return ['Multi-Course Kaiseki in Lantern-Lit Pontocho Alley', 'Exclusive Whisky Flight at Bar K6', 'Twilight Stroll through Gion Heritage Preservation Area', 'Moonlit Tea Tasting by the Kamo River'][day % 4];
  }
  if (key === 'amalfi') {
    return ['Candlelit Seafood Dinner on Positano Clifftop Balcony', 'Ravello Music Festival Chamber Concert under Stars', 'Aperitivo Sunset Spritz at Franco’s Bar', 'Fresh Catch Tasting at Marina di Praia cove'][day % 4];
  }
  return ['Northern Lights Hunt in Thingvellir National Park', 'Nordic Gastronomy Dinner at Dill Restaurant', 'Night Soak in Secret Lagoon with Steaming Geysers', 'Craft Beer & Live Folk Music in Downtown Reykjavik'][day % 4];
}

function getSmartTravelReply(msg: string, currentTrip: any) {
  const m = msg.toLowerCase();
  const dest = currentTrip?.destination || 'your destination';

  if (m.includes('tip') || m.includes('etiquette') || m.includes('custom')) {
    if (dest.toLowerCase().includes('japan') || dest.toLowerCase().includes('kyoto')) {
      return `In Japan, tipping is not customary and can even cause confusion or polite refusal. Exceptional hospitality (Omotenashi) is proudly included in the service. Simply bow slightly and say "Gochisousama deshita" (Thank you for the delicious meal) when leaving.`;
    }
    if (dest.toLowerCase().includes('amalfi') || dest.toLowerCase().includes('ital')) {
      return `In Italy, a service charge (*coperto*) of €2–€4 per person is often automatically added to the bill for bread and table setting. If service was exceptional, leaving an extra 5–10% cash tip or rounding up to the nearest €5/€10 is warmly appreciated.`;
    }
    return `For ${dest}, service charges are often built into dining checks. Rounding up bills for cafe services and leaving 10% for fine dining is customary when service exceeds expectations.`;
  }

  if (m.includes('coffee') || m.includes('cafe') || m.includes('wifi')) {
    return `In ${dest}, seek out neighborhood artisan roasters situated away from major train terminals. Look for third-wave spots offering single-origin pour-overs where morning hours before 10:00 AM provide quiet seating, reliable high-speed fiber Wi-Fi, and sunny window bars.`;
  }

  if (m.includes('pack') || m.includes('luggage') || m.includes('wear')) {
    return `For ${dest}, focus on versatile breathable layers: a merino wool base, light packable rain/wind shell, slip-on comfortable walking shoes for cobblestones and temple floors, and a slim cross-body daypack. Keep electronic power adapters and a compact high-output power bank within easy reach.`;
  }

  if (m.includes('relax') || m.includes('chill') || m.includes('slow')) {
    return `To inject calm into your ${dest} itinerary, I recommend designating the midday hours (1:30 PM – 4:00 PM) for quiet shaded gardens, a long leisurely multi-course lunch, or a wellness thermal soak, reserving active sightseeing exclusively for crisp morning light and twilight golden hour.`;
  }

  return `VoyageAI intelligence notes that in ${dest}, the golden rule of seamless transit is timing: plan temple, museum, or coastal trail visits between 7:30 AM – 9:00 AM or after 4:30 PM. Would you like me to adjust your day timetable, swap an afternoon activity, or find authentic hidden dining nearby?`;
}

export { app };
export default app;
