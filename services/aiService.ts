// services/aiService.ts
// Supports: Google Gemini (free), Groq (free), OpenRouter (free models)
// Switch providers by setting the right env variable in .env.local

export type VisaStatus = 'visa_free' | 'visa_required' | 'e_visa' | 'on_arrival' | 'check_embassy';

export interface FlightResult {
  id: string;
  airline: string;
  airlineCode: string;
  from: string;
  fromCode: string;
  to: string;
  toCode: string;
  departTime: string;
  arriveTime: string;
  duration: string;
  stops: StopInfo[];
  price: number;
  currency: string;
  cabinClass: string;
  deepLink: string;
}

export interface StopInfo {
  airport: string;
  airportCode: string;
  country: string;
  layoverDuration: string;
  visaStatus: VisaStatus;
  visaNote: string;
  stayLimit?: string;
}

export interface DestinationVisaInfo {
  country: string;
  visaStatus: VisaStatus;
  visaNote: string;
  stayLimit?: string;
  applyUrl?: string;
}

export interface AIResponse {
  message: string;
  flights?: FlightResult[];
  destinationVisa?: DestinationVisaInfo;
  searchContext?: {
    from?: string;
    to?: string;
    date?: string;
    tripType?: string;
    passport?: string;
  };
}

// ── Visa rules database (simplified – replace with Sherpa API in production) ──
const VISA_RULES: Record<string, Record<string, { status: VisaStatus; note: string; stay?: string; url?: string }>> = {
  US: {
    PH:  { status: 'visa_free',    note: 'No visa needed for US citizens.', stay: '30 days', url: 'https://immigration.gov.ph' },
    JP:  { status: 'visa_free',    note: 'No visa needed for US citizens.', stay: '90 days' },
    KR:  { status: 'e_visa',       note: 'K-ETA required (online, free).', stay: '90 days', url: 'https://www.k-eta.go.kr' },
    HK:  { status: 'visa_free',    note: 'No visa needed.', stay: '90 days' },
    TH:  { status: 'visa_free',    note: 'No visa needed.', stay: '30 days' },
    SG:  { status: 'visa_free',    note: 'No visa needed.', stay: '90 days' },
    CN:  { status: 'visa_required', note: 'Visa required. Apply at Chinese consulate 4–6 weeks ahead.', url: 'https://visaforchina.cn' },
    IN:  { status: 'e_visa',       note: 'e-Visa required. Apply online at least 4 days before travel.', url: 'https://indianvisaonline.gov.in' },
    AE:  { status: 'visa_free',    note: 'No visa needed on arrival.', stay: '30 days' },
    GB:  { status: 'visa_free',    note: 'No visa needed.', stay: '180 days' },
    FR:  { status: 'visa_free',    note: 'No visa needed (Schengen).', stay: '90 days' },
    DE:  { status: 'visa_free',    note: 'No visa needed (Schengen).', stay: '90 days' },
    IT:  { status: 'visa_free',    note: 'No visa needed (Schengen).', stay: '90 days' },
    MY:  { status: 'visa_free',    note: 'No visa needed.', stay: '90 days' },
    VN:  { status: 'e_visa',       note: 'e-Visa recommended. Apply online.', url: 'https://evisa.xuatnhapcanh.gov.vn' },
    ID:  { status: 'visa_on_arrival', note: 'Visa on arrival available ($35 USD).', stay: '30 days' },
  },
  PH: {
    JP:  { status: 'visa_required', note: 'Visa required for Philippine passport. Apply at Japanese embassy.', url: 'https://www.ph.emb-japan.go.jp' },
    KR:  { status: 'visa_free',    note: 'Visa-free under KVIP agreement.', stay: '30 days' },
    HK:  { status: 'visa_free',    note: 'Visa-free for Philippine citizens.', stay: '14 days' },
    SG:  { status: 'visa_free',    note: 'No visa needed.', stay: '30 days' },
    TH:  { status: 'visa_free',    note: 'No visa needed.', stay: '30 days' },
    AE:  { status: 'visa_on_arrival', note: 'Visa on arrival for 14 days.', stay: '14 days' },
    US:  { status: 'visa_required', note: 'US tourist visa (B-2) required.', url: 'https://travel.state.gov' },
    GB:  { status: 'visa_required', note: 'UK Standard Visitor Visa required.', url: 'https://www.gov.uk/standard-visitor-visa' },
    DE:  { status: 'visa_required', note: 'Schengen visa required.', url: 'https://www.schengenvisainfo.com' },
    CN:  { status: 'visa_required', note: 'Visa required.', url: 'https://visaforchina.cn' },
    MY:  { status: 'visa_free',    note: 'No visa needed.', stay: '30 days' },
    ID:  { status: 'visa_free',    note: 'No visa needed.', stay: '30 days' },
  },
  IN: {
    PH:  { status: 'visa_required', note: 'Visa required for Indian passport.', url: 'https://immigration.gov.ph' },
    JP:  { status: 'visa_required', note: 'Visa required. Apply at Japanese embassy with bank statements.' },
    SG:  { status: 'visa_required', note: 'Visa required for Indian passport.' },
    TH:  { status: 'visa_on_arrival', note: 'Visa on arrival available (THB 2,000).', stay: '15 days' },
    HK:  { status: 'e_visa',       note: 'Pre-arrival registration required.', url: 'https://www.immd.gov.hk' },
    AE:  { status: 'visa_on_arrival', note: 'Visa on arrival for Indian passport holders.', stay: '14 days' },
    US:  { status: 'visa_required', note: 'US tourist visa (B-2) required.', url: 'https://travel.state.gov' },
    GB:  { status: 'visa_required', note: 'UK Standard Visitor Visa required.' },
    ID:  { status: 'visa_on_arrival', note: 'Visa on arrival available.', stay: '30 days' },
    MY:  { status: 'visa_free',    note: 'No visa needed.', stay: '30 days' },
    VN:  { status: 'e_visa',       note: 'e-Visa available online.', url: 'https://evisa.xuatnhapcanh.gov.vn' },
  },
};

export function getVisaInfo(passport: string, destination: string): DestinationVisaInfo {
  const rules = VISA_RULES[passport.toUpperCase()];
  const dest = destination.toUpperCase();
  if (rules && rules[dest]) {
    const r = rules[dest];
    return {
      country: destination,
      visaStatus: r.status,
      visaNote: r.note,
      stayLimit: r.stay,
      applyUrl: r.url,
    };
  }
  return {
    country: destination,
    visaStatus: 'check_embassy',
    visaNote: 'Please verify entry requirements with the destination embassy before travel.',
  };
}

// ── Mock flight generator (replace with Duffel/Amadeus API in production) ──
const AIRLINES: Record<string, { name: string; code: string }> = {
  PR: { name: 'Philippine Airlines', code: 'PR' },
  CX: { name: 'Cathay Pacific', code: 'CX' },
  KE: { name: 'Korean Air', code: 'KE' },
  SQ: { name: 'Singapore Airlines', code: 'SQ' },
  EK: { name: 'Emirates', code: 'EK' },
  JL: { name: 'Japan Airlines', code: 'JL' },
  QR: { name: 'Qatar Airways', code: 'QR' },
  NH: { name: 'ANA', code: 'NH' },
  UA: { name: 'United Airlines', code: 'UA' },
  AA: { name: 'American Airlines', code: 'AA' },
};

const ROUTE_STOPS: Record<string, StopInfo[][]> = {
  'EWR-MNL': [
    [{airport:'Tokyo Narita', airportCode:'NRT', country:'Japan', layoverDuration:'1h 50m', visaStatus:'visa_free', visaNote:'Transit, no visa needed.'}],
    [{airport:'Seoul Incheon', airportCode:'ICN', country:'South Korea', layoverDuration:'2h 30m', visaStatus:'visa_free', visaNote:'Transit, no visa needed.'}],
    [{airport:'Hong Kong', airportCode:'HKG', country:'Hong Kong', layoverDuration:'1h 15m', visaStatus:'visa_free', visaNote:'Transit, no visa needed.'}],
  ],
  'DEFAULT': [
    [],
    [{airport:'Dubai', airportCode:'DXB', country:'UAE', layoverDuration:'2h 00m', visaStatus:'visa_free', visaNote:'Transit permitted.'}],
    [{airport:'Singapore', airportCode:'SIN', country:'Singapore', layoverDuration:'1h 45m', visaStatus:'visa_free', visaNote:'Transit, no visa needed.'}],
  ],
};

function generateFlights(from: string, to: string, passport: string): FlightResult[] {
  const key = `${from}-${to}`;
  const stopOptions = ROUTE_STOPS[key] || ROUTE_STOPS['DEFAULT'];
  const airlineList = Object.values(AIRLINES).slice(0, 3);
  const basePrice = 600 + Math.floor(Math.random() * 600);

  return airlineList.map((airline, i) => {
    const stops = stopOptions[i] || [];
    // Adjust visa info based on passport
    const enrichedStops = stops.map(stop => {
      const info = getVisaInfo(passport, stop.airportCode.slice(0, 2) === 'HK' ? 'HK' : stop.country.slice(0, 2).toUpperCase());
      return {
        ...stop,
        visaStatus: info.visaStatus,
        visaNote: info.visaNote,
        stayLimit: info.stayLimit,
      };
    });

    const hour = 8 + i * 3;
    const deptTime = `${hour.toString().padStart(2, '0')}:${i % 2 === 0 ? '00' : '30'}`;

    return {
      id: `${airline.code}-${Date.now()}-${i}`,
      airline: airline.name,
      airlineCode: airline.code,
      from,
      fromCode: from,
      to,
      toCode: to,
      departTime: deptTime,
      arriveTime: `${(hour + 18 + i * 2) % 24}:${i % 2 === 0 ? '45' : '15'} +${i + 1}`,
      duration: `${20 + i}h ${15 + i * 5}m`,
      stops: enrichedStops,
      price: basePrice - i * 40 + Math.floor(Math.random() * 80),
      currency: 'USD',
      cabinClass: 'Economy',
      deepLink: `https://www.google.com/flights?hl=en#search;f=${from};t=${to}`,
    };
  });
}

// ── System prompt for the AI ──
function buildSystemPrompt(passport: string): string {
  return `You are FlightAdvsr AI — a professional, globally focused AI flight advisor. You help travelers worldwide find flights, understand visa requirements for every passport, and navigate international travel restrictions. Be concise, accurate, and friendly.

Your job is to help users plan trips by:
1. Understanding where they want to go, when, and what type of trip (one-way, roundtrip, multi-city)
2. Checking if their passport (${passport || 'not set yet'}) requires a visa for their destination and any layover countries
3. Showing relevant flight options with visa status clearly marked
4. Answering any travel questions conversationally

RESPONSE FORMAT — CRITICAL:
Always respond in this exact JSON format:
{
  "message": "Your friendly conversational reply here",
  "searchContext": {
    "from": "airport code like EWR or null",
    "to": "airport code like MNL or null",
    "date": "YYYY-MM-DD or null",
    "tripType": "one-way|roundtrip|multi or null",
    "passport": "2-letter code like US or null"
  },
  "hasFlights": true or false,
  "hasDestinationCountry": "2-letter country code like PH, or null"
}

Set hasFlights: true when the user has clearly specified both origin and destination airports/cities and wants to see flights.
Set hasDestinationCountry to the destination country code when you know the destination.
Set hasFlights: false for general questions, greetings, or when info is incomplete.

Keep your message friendly, concise, and helpful. If the user hasn't told you their passport yet and it matters for visa info, ask them.
If they haven't specified travel dates, still show flights and note they can adjust dates.

Examples of when to set hasFlights: true:
- "I want to fly from Newark to Manila"
- "Show me flights to Tokyo from New York"  
- "Newark to MNL next month"

Examples of when to set hasFlights: false:
- "Hi" or "Hello"
- "Do I need a visa for Japan?" (no departure specified)
- "What's the weather like in Manila?"

Always respond in valid JSON only. No markdown, no extra text outside the JSON.`;
}

// ── Provider implementations ──

async function callGemini(messages: { role: string; content: string }[], passport: string): Promise<AIResponse> {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') throw new Error('NO_KEY');

  const history = messages.slice(0, -1).map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));
  const lastMsg = messages[messages.length - 1].content;

  const body = {
    system_instruction: { parts: [{ text: buildSystemPrompt(passport) }] },
    contents: [
      ...history,
      { role: 'user', parts: [{ text: lastMsg }] },
    ],
    generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
  };

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
  );
  if (!res.ok) throw new Error(`Gemini error ${res.status}`);
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  return parseAIResponse(text, passport);
}

async function callGroq(messages: { role: string; content: string }[], passport: string): Promise<AIResponse> {
  const apiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;
  if (!apiKey || apiKey === 'your_groq_api_key_here') throw new Error('NO_KEY');

  const body = {
    model: 'llama3-8b-8192',
    messages: [
      { role: 'system', content: buildSystemPrompt(passport) },
      ...messages,
    ],
    temperature: 0.7,
    max_tokens: 1024,
  };

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Groq error ${res.status}`);
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || '{}';
  return parseAIResponse(text, passport);
}

async function callOpenRouter(messages: { role: string; content: string }[], passport: string): Promise<AIResponse> {
  const apiKey = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY;
  if (!apiKey || apiKey === 'your_openrouter_key_here') throw new Error('NO_KEY');

  const body = {
    model: 'mistralai/mistral-7b-instruct:free',
    messages: [
      { role: 'system', content: buildSystemPrompt(passport) },
      ...messages,
    ],
  };

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://flightadvsr.app',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`OpenRouter error ${res.status}`);
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || '{}';
  return parseAIResponse(text, passport);
}

function parseAIResponse(raw: string, passport: string): AIResponse {
  try {
    const clean = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    let flights: FlightResult[] | undefined;
    let destinationVisa: DestinationVisaInfo | undefined;

    if (parsed.hasFlights && parsed.searchContext?.from && parsed.searchContext?.to) {
      const p = parsed.searchContext.passport || passport || 'US';
      flights = generateFlights(parsed.searchContext.from, parsed.searchContext.to, p);

      if (parsed.hasDestinationCountry) {
        destinationVisa = getVisaInfo(p, parsed.hasDestinationCountry);
      }
    }

    return {
      message: parsed.message || "I'm here to help you plan your trip! Where would you like to go?",
      flights,
      destinationVisa,
      searchContext: parsed.searchContext,
    };
  } catch {
    return {
      message: raw.length > 0 ? raw : "I'm here to help you plan your trip! Where would you like to go?",
    };
  }
}

// ── Main export: tries providers in order ──
export async function sendMessage(
  messages: { role: string; content: string }[],
  passport: string = 'US'
): Promise<AIResponse> {
  const providers = [
    () => callGemini(messages, passport),
    () => callGroq(messages, passport),
    () => callOpenRouter(messages, passport),
  ];

  for (const provider of providers) {
    try {
      return await provider();
    } catch (e: any) {
      if (e.message === 'NO_KEY') continue;
      console.warn('Provider failed:', e.message);
      continue;
    }
  }

  // Fallback: smart offline parser (no API key needed for demo)
  return offlineFallback(messages[messages.length - 1].content, passport);
}

// ── Offline fallback for demo / no API key ──
function offlineFallback(input: string, passport: string): AIResponse {
  const lower = input.toLowerCase();

  const airportMap: Record<string, string> = {
    newark: 'EWR', ewr: 'EWR', 'new york': 'JFK', jfk: 'JFK',
    manila: 'MNL', mnl: 'MNL', philippines: 'MNL',
    tokyo: 'NRT', nrt: 'NRT', japan: 'NRT',
    seoul: 'ICN', icn: 'ICN', korea: 'ICN',
    singapore: 'SIN', sin: 'SIN',
    dubai: 'DXB', dxb: 'DXB',
    london: 'LHR', lhr: 'LHR',
    paris: 'CDG', cdg: 'CDG',
    'hong kong': 'HKG', hkg: 'HKG',
    bali: 'DPS', dps: 'DPS',
    bangkok: 'BKK', bkk: 'BKK',
    'los angeles': 'LAX', lax: 'LAX',
    chicago: 'ORD', ord: 'ORD',
  };

  const countryMap: Record<string, string> = {
    MNL: 'PH', NRT: 'JP', ICN: 'KR', SIN: 'SG',
    DXB: 'AE', LHR: 'GB', CDG: 'FR', HKG: 'HK',
    DPS: 'ID', BKK: 'TH', LAX: 'US', ORD: 'US',
    JFK: 'US', EWR: 'US',
  };

  let from: string | null = null;
  let to: string | null = null;

  for (const [kw, code] of Object.entries(airportMap)) {
    if (lower.includes(kw)) {
      if (!from) from = code;
      else if (code !== from) { to = code; break; }
    }
  }

  if (from && to) {
    const destCountry = countryMap[to] || null;
    const visa = destCountry ? getVisaInfo(passport, destCountry) : null;
    const flights = generateFlights(from, to, passport);

    return {
      message: `Great choice! Here are flights from ${from} to ${to} with visa information for your ${passport} passport. ${visa ? `For ${visa.country}: ${visa.visaNote}` : ''}`,
      flights,
      destinationVisa: visa || undefined,
      searchContext: { from, to, passport },
    };
  }

  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('mabuhay')) {
    return { message: "Hey! I'm FlightAdvsr ✈️ Tell me where you'd like to fly — for example: \"I want to fly from Newark to Manila\" — and I'll find flights and check your visa requirements!" };
  }

  if (lower.includes('visa')) {
    return { message: "To check your visa requirements, tell me your destination! For example: \"I want to fly from New York to Tokyo\" and I'll check everything based on your passport." };
  }

  return {
    message: "Tell me where you'd like to go! Try something like: \"I want to fly from Newark to Manila next month\" and I'll pull up flights with visa info for you.",
  };
}
