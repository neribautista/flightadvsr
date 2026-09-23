// services/aiService.ts
import passportIndex from '../data/passportIndex.json';
import { getAirportByCode } from '../data/airports';
import type { AirportSelection, JourneyResult, TravelerData, TripDetails, TripPreferences, VisaRequirement } from '../types/trip';

// ─── Types ────────────────────────────────────────────────────────────────────

export type VisaStatus =
  | 'visa_free'
  | 'visa_required'
  | 'e_visa'
  | 'on_arrival'
  | 'visa_on_arrival'
  | 'eta'
  | 'check_embassy';

export interface VisaInfo {
  status: VisaStatus;
  days?: number | null;
  note?: string;
}

export interface DestinationVisaInfo {
  country: string;
  visaStatus: VisaStatus;
  visaNote: string;
  stayLimit?: string;
  applyUrl?: string;
}

export interface FlightStop {
  airportCode: string;
  airport: string;
  layoverDuration: string;
  visaStatus: VisaStatus;
  visaNote: string;
}

export interface FlightResult {
  id: string;
  airline: string;
  airlineCode: string;
  cabinClass: string;
  price: number;
  departTime: string;
  arriveTime: string;
  fromCode: string;
  toCode: string;
  duration: string;
  stops: FlightStop[];
  deepLink: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface SendMessageResponse {
  message: string;
  flights?: FlightResult[];
  destinationVisa?: DestinationVisaInfo;
}

// ─── Fallback IATA → ISO Alpha-2 map ─────────────────────────────────────────

const IATA_FALLBACK: Record<string, string> = {
  // North America
  JFK: 'US', LAX: 'US', ORD: 'US', ATL: 'US', DFW: 'US', DEN: 'US',
  SFO: 'US', SEA: 'US', MIA: 'US', BOS: 'US', LAS: 'US', PHX: 'US',
  IAH: 'US', EWR: 'US', MSP: 'US', DTW: 'US', PHL: 'US', CLT: 'US',
  YYZ: 'CA', YVR: 'CA', YUL: 'CA', YYC: 'CA',
  MEX: 'MX', CUN: 'MX', GDL: 'MX',
  AUS: 'US', SAN: 'US', PDX: 'US', SLC: 'US', MSY: 'US', RSW: 'US',
  RDU: 'US', BNA: 'US', IND: 'US', CMH: 'US', PIT: 'US', MCI: 'US',
  OAK: 'US', SJC: 'US', SMF: 'US', ABQ: 'US', TUS: 'US',

  // Europe
  LHR: 'GB', LGW: 'GB', MAN: 'GB', EDI: 'GB', BHX: 'GB',
  CDG: 'FR', ORY: 'FR', NCE: 'FR', LYS: 'FR',
  FRA: 'DE', MUC: 'DE', TXL: 'DE', BER: 'DE', DUS: 'DE', HAM: 'DE',
  AMS: 'NL', EIN: 'NL',
  MAD: 'ES', BCN: 'ES', VLC: 'ES', AGP: 'ES',
  FCO: 'IT', MXP: 'IT', VCE: 'IT', NAP: 'IT',
  ZRH: 'CH', GVA: 'CH',
  VIE: 'AT', SZG: 'AT',
  BRU: 'BE',
  LIS: 'PT', OPO: 'PT',
  CPH: 'DK',
  ARN: 'SE', GOT: 'SE',
  OSL: 'NO',
  HEL: 'FI',
  WAW: 'PL', KRK: 'PL',
  PRG: 'CZ',
  BUD: 'HU',
  ATH: 'GR', SKG: 'GR',
  IST: 'TR', SAW: 'TR', AYT: 'TR',

  // Asia Pacific
  NRT: 'JP', HND: 'JP', KIX: 'JP', NGO: 'JP',
  ICN: 'KR', GMP: 'KR', PUS: 'KR',
  PEK: 'CN', PVG: 'CN', CAN: 'CN', SZX: 'CN', CTU: 'CN',
  HKG: 'HK',
  TPE: 'TW', KHH: 'TW',
  SIN: 'SG',
  KUL: 'MY', PEN: 'MY',
  BKK: 'TH', HKT: 'TH', CNX: 'TH',
  MNL: 'PH', CEB: 'PH',
  CGK: 'ID', DPS: 'ID', SUB: 'ID',
  SGN: 'VN', HAN: 'VN', DAD: 'VN',
  SYD: 'AU', MEL: 'AU', BNE: 'AU', PER: 'AU', ADL: 'AU',
  AKL: 'NZ', CHC: 'NZ',
  DEL: 'IN', BOM: 'IN', BLR: 'IN', MAA: 'IN', CCU: 'IN', HYD: 'IN',
  CMB: 'LK',
  DAC: 'BD',
  KTM: 'NP',
  RGN: 'MM',
  PNH: 'KH', REP: 'KH',
  VTE: 'LA',

  // Middle East
  DXB: 'AE', AUH: 'AE', SHJ: 'AE',
  DOH: 'QA',
  KWI: 'KW',
  BAH: 'BH',
  MCT: 'OM',
  RUH: 'SA', JED: 'SA', DMM: 'SA',
  TLV: 'IL',
  AMM: 'JO',
  BEY: 'LB',
  BGW: 'IQ', BSR: 'IQ',
  THR: 'IR', IKA: 'IR',

  // Africa
  CAI: 'EG', HRG: 'EG', SSH: 'EG',
  CMN: 'MA', RAK: 'MA', FEZ: 'MA',
  TUN: 'TN', MIR: 'TN',
  ALG: 'DZ',
  LOS: 'NG', ABV: 'NG', PHC: 'NG',
  ACC: 'GH',
  ABJ: 'CI',
  DKR: 'SN',
  NBO: 'KE', MBA: 'KE',
  DAR: 'TZ', JRO: 'TZ', ZNZ: 'TZ',
  EBB: 'UG',
  ADD: 'ET',
  JNB: 'ZA', CPT: 'ZA', DUR: 'ZA',
  MPM: 'MZ',
  LUN: 'ZM',
  HRE: 'ZW',

  // Latin America
  GRU: 'BR', GIG: 'BR', BSB: 'BR', SSA: 'BR', FOR: 'BR',
  EZE: 'AR', AEP: 'AR', COR: 'AR',
  SCL: 'CL', PMC: 'CL',
  BOG: 'CO', MDE: 'CO', CTG: 'CO',
  LIM: 'PE', CUZ: 'PE',
  UIO: 'EC', GYE: 'EC',
  CCS: 'VE', MAR: 'VE',
  MVD: 'UY',
  ASU: 'PY',
  VVI: 'BO', LPB: 'BO',
  SJO: 'CR',
  GUA: 'GT',
  SAL: 'SV',
  TGU: 'HN',
  MGA: 'NI',
  PTY: 'PA',
  SDQ: 'DO', PUJ: 'DO',
  HAV: 'CU',
  MBJ: 'JM', KIN: 'JM',

  // Caribbean / Pacific
  ANU: 'AG',
  BGI: 'BB',
  NAS: 'BS',
  POS: 'TT', TAB: 'TT',
  PPT: 'PF',
  APW: 'WS',
  SUV: 'FJ',
};

// ─── Country name / city → ISO Alpha-2 map ───────────────────────────────────

const COUNTRY_NAME_MAP: Record<string, string> = {
  // Country names & aliases
  'united states': 'US', 'usa': 'US', 'us': 'US', 'america': 'US', 'the us': 'US', 'the usa': 'US',
  'united kingdom': 'GB', 'uk': 'GB', 'britain': 'GB', 'england': 'GB', 'great britain': 'GB',
  'japan': 'JP', 'france': 'FR', 'germany': 'DE', 'italy': 'IT',
  'spain': 'ES', 'canada': 'CA', 'australia': 'AU', 'china': 'CN',
  'south korea': 'KR', 'korea': 'KR', 'singapore': 'SG', 'thailand': 'TH',
  'philippines': 'PH', 'indonesia': 'ID', 'malaysia': 'MY', 'vietnam': 'VN',
  'india': 'IN', 'uae': 'AE', 'united arab emirates': 'AE', 'mexico': 'MX',
  'brazil': 'BR', 'argentina': 'AR', 'colombia': 'CO', 'peru': 'PE',
  'netherlands': 'NL', 'holland': 'NL', 'portugal': 'PT', 'switzerland': 'CH',
  'austria': 'AT', 'belgium': 'BE', 'sweden': 'SE', 'norway': 'NO',
  'denmark': 'DK', 'finland': 'FI', 'greece': 'GR', 'turkey': 'TR',
  'egypt': 'EG', 'morocco': 'MA', 'south africa': 'ZA', 'kenya': 'KE',
  'nigeria': 'NG', 'ethiopia': 'ET', 'new zealand': 'NZ',
  'saudi arabia': 'SA', 'qatar': 'QA', 'israel': 'IL', 'jordan': 'JO',
  'taiwan': 'TW', 'hong kong': 'HK', 'cambodia': 'KH', 'myanmar': 'MM',
  'laos': 'LA', 'nepal': 'NP', 'sri lanka': 'LK', 'bangladesh': 'BD',
  'pakistan': 'PK', 'iran': 'IR', 'iraq': 'IQ', 'lebanon': 'LB',
  'oman': 'OM', 'kuwait': 'KW', 'bahrain': 'BH',
  'russia': 'RU', 'ukraine': 'UA', 'poland': 'PL', 'czech republic': 'CZ',
  'czechia': 'CZ', 'hungary': 'HU', 'romania': 'RO', 'bulgaria': 'BG',
  'croatia': 'HR', 'serbia': 'RS', 'slovakia': 'SK', 'slovenia': 'SI',
  'chile': 'CL', 'ecuador': 'EC', 'venezuela': 'VE', 'uruguay': 'UY',
  'paraguay': 'PY', 'bolivia': 'BO', 'panama': 'PA', 'costa rica': 'CR',
  'cuba': 'CU', 'jamaica': 'JM', 'dominican republic': 'DO',
  'ghana': 'GH', 'senegal': 'SN', 'tanzania': 'TZ', 'uganda': 'UG',
  'mozambique': 'MZ', 'zambia': 'ZM', 'zimbabwe': 'ZW', 'tunisia': 'TN',
  'algeria': 'DZ', 'ivory coast': 'CI', "cote d'ivoire": 'CI',

  // Cities → country
  'tokyo': 'JP', 'osaka': 'JP', 'kyoto': 'JP', 'hiroshima': 'JP',
  'london': 'GB', 'manchester': 'GB', 'edinburgh': 'GB',
  'paris': 'FR', 'nice': 'FR', 'lyon': 'FR',
  'berlin': 'DE', 'munich': 'DE', 'frankfurt': 'DE', 'hamburg': 'DE',
  'rome': 'IT', 'milan': 'IT', 'venice': 'IT', 'florence': 'IT',
  'madrid': 'ES', 'barcelona': 'ES', 'seville': 'ES',
  'amsterdam': 'NL', 'lisbon': 'PT', 'porto': 'PT',
  'zurich': 'CH', 'geneva': 'CH', 'bern': 'CH',
  'vienna': 'AT', 'brussels': 'BE',
  'stockholm': 'SE', 'oslo': 'NO', 'copenhagen': 'DK', 'helsinki': 'FI',
  'athens': 'GR', 'istanbul': 'TR', 'ankara': 'TR',
  'new york': 'US', 'los angeles': 'US', 'chicago': 'US',
  'san francisco': 'US', 'miami': 'US', 'las vegas': 'US',
  'seattle': 'US', 'boston': 'US', 'houston': 'US', 'dallas': 'US',
  'toronto': 'CA', 'vancouver': 'CA', 'montreal': 'CA', 'calgary': 'CA',
  'sydney': 'AU', 'melbourne': 'AU', 'brisbane': 'AU', 'perth': 'AU',
  'auckland': 'NZ', 'christchurch': 'NZ',
  'bangkok': 'TH', 'phuket': 'TH', 'chiang mai': 'TH',
  'manila': 'PH', 'cebu': 'PH',
  'bali': 'ID', 'jakarta': 'ID', 'surabaya': 'ID',
  'kuala lumpur': 'MY', 'kl': 'MY', 'penang': 'MY',
  'ho chi minh': 'VN', 'hanoi': 'VN', 'saigon': 'VN', 'da nang': 'VN',
  'mumbai': 'IN', 'delhi': 'IN', 'bangalore': 'IN', 'chennai': 'IN',
  'dubai': 'AE', 'abu dhabi': 'AE',
  'cairo': 'EG', 'casablanca': 'MA', 'marrakech': 'MA',
  'nairobi': 'KE', 'johannesburg': 'ZA', 'cape town': 'ZA',
  'mexico city': 'MX', 'cancun': 'MX', 'guadalajara': 'MX',
  'sao paulo': 'BR', 'rio': 'BR', 'rio de janeiro': 'BR',
  'buenos aires': 'AR', 'bogota': 'CO', 'lima': 'PE', 'santiago': 'CL',
  'doha': 'QA', 'riyadh': 'SA', 'jeddah': 'SA',
  'tel aviv': 'IL', 'jerusalem': 'IL', 'amman': 'JO',
  'moscow': 'RU', 'st petersburg': 'RU', 'saint petersburg': 'RU',
  'beijing': 'CN', 'shanghai': 'CN', 'guangzhou': 'CN', 'shenzhen': 'CN',
  'seoul': 'KR', 'busan': 'KR',
  'taipei': 'TW',
  'phnom penh': 'KH', 'siem reap': 'KH',
  'yangon': 'MM', 'kathmandu': 'NP', 'colombo': 'LK', 'dhaka': 'BD',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCountryFromIATA(iata: string): string | null {
  const code = iata.toUpperCase();
  const country = getAirportByCode(code)?.countryCode ?? IATA_FALLBACK[code];
  if (!country) console.warn(`Could not resolve country for IATA code: ${code}`);
  return country ?? null;
}

function getCountryFromText(text: string): string | null {
  const lower = text.toLowerCase().trim();
  return COUNTRY_NAME_MAP[lower] ?? null;
}

function mapStatus(raw: string): VisaStatus {
  switch (raw) {
    case 'visa free':       return 'visa_free';
    case 'visa on arrival': return 'visa_on_arrival';
    case 'e-visa':          return 'e_visa';
    case 'visa required':   return 'visa_required';
    case 'eta':             return 'eta';
    default:                return 'check_embassy';
  }
}

// ─── Parse route from user message ───────────────────────────────────────────

interface ParsedRoute {
  fromIATA: string;
  toIATA: string;
  fromCountry: string;
  toCountry: string;
}

function parseRoute(text: string): ParsedRoute | null {
  // 1. IATA pair: "JFK → LHR", "LAX -> NRT", "PHL to AUS", "fly from PHL to AUS"
  //    Handles optional "from" before the origin code
  const iataMatch = text.match(/(?:from\s+)?([A-Za-z]{3})\s*(?:→|->|to)\s*([A-Za-z]{3})/i);
  if (iataMatch) {
    const [, from, to] = iataMatch;
    const fromCountry = getCountryFromIATA(from);
    const toCountry = getCountryFromIATA(to);
    if (fromCountry && toCountry) {
      console.log(`parseRoute (IATA): ${from} → ${to} | ${fromCountry} → ${toCountry}`);
      return {
        fromIATA: from.toUpperCase(),
        toIATA: to.toUpperCase(),
        fromCountry,
        toCountry,
      };
    }
  }

  // 2. "fly from Philadelphia to Australia" — extract destination after last "to"
  const fromToMatch = text.match(/\bfrom\s+[a-zA-Z\s]+?\s+to\s+([a-zA-Z][a-zA-Z\s]{2,28})(?:\s+on\b|\s+in\b|\s+for\b|\s*[,.]|$)/i);
  if (fromToMatch) {
    const destText = fromToMatch[1].trim();
    const toCountry = getCountryFromText(destText);
    if (toCountry) {
      console.log(`parseRoute (from-to): destination="${destText}" → ${toCountry}`);
      return { fromIATA: '???', toIATA: toCountry, fromCountry: '??', toCountry };
    }
  }

  // 3. Natural language: "I want to fly to Tokyo", "trip to Thailand"
  const nlMatch = text.match(
    /(?:go(?:ing)?\s+to|fly(?:ing)?\s+to|travel(?:l?ing)?\s+to|trip\s+to|visit(?:ing)?|heading\s+to|want\s+to\s+(?:go|fly|travel)\s+to)\s+([a-zA-Z\s]+?)(?:\s+on\b|\s+in\b|\s+from\b|\s+for\b|\s*[,.]|$)/i
  );
  if (nlMatch) {
    const destText = nlMatch[1].trim();
    const toCountry = getCountryFromText(destText);
    if (toCountry) {
      console.log(`parseRoute (NL): destination="${destText}" → ${toCountry}`);
      return { fromIATA: '???', toIATA: toCountry, fromCountry: '??', toCountry };
    }
  }

  // 4. Simple "to [place]" fallback
  const simpleMatch = text.match(/\bto\s+([a-zA-Z][a-zA-Z\s]{2,28})(?:\s+on\b|\s+in\b|\s+from\b|\s+for\b|\s*[,.]|$)/i);
  if (simpleMatch) {
    const destText = simpleMatch[1].trim();
    const toCountry = getCountryFromText(destText);
    if (toCountry) {
      console.log(`parseRoute (simple): destination="${destText}" → ${toCountry}`);
      return { fromIATA: '???', toIATA: toCountry, fromCountry: '??', toCountry };
    }
  }

  return null;
}

// ─── Core visa lookup ─────────────────────────────────────────────────────────

export async function getVisaInfo(
  passport: string,
  destination: string
): Promise<VisaInfo | null> {
  const index = passportIndex as Record<string, Record<string, { status: string; days?: number }>>;

  const passportData = index[passport.toUpperCase()];
  if (!passportData) return null;

  const visaInfo = passportData[destination.toUpperCase()];
  if (!visaInfo) return null;

  const status = mapStatus(visaInfo.status);

  return {
    status,
    days: visaInfo.days ?? null,
    note: `Visa status: ${visaInfo.status}${visaInfo.days ? `. Max stay: ${visaInfo.days} days` : ''}.`,
  };
}

// ─── sendMessage (called by index.tsx) ───────────────────────────────────────

export async function sendMessage(
  history: ChatMessage[],
  passport: string
): Promise<SendMessageResponse> {
  const lastMessage = history[history.length - 1]?.content ?? '';

  const route = parseRoute(lastMessage);

  if (!route) {
    return {
      message:
        "I can help you check visa requirements and find flights! Try:\n\n• Airport codes: JFK → LHR\n• City names: \"I want to fly to Tokyo\"\n• Countries: \"trip to Japan\"\n\nWhat's your destination?",
    };
  }

  // Detect domestic route (same country on both ends)
  const isDomestic =
    route.fromCountry !== '??' &&
    route.toCountry !== '??' &&
    route.fromCountry === route.toCountry;

  if (isDomestic) {
    return {
      message: `${route.fromIATA} to ${route.toIATA} is a domestic route within ${route.fromCountry} — no visa or passport required! You'll just need a valid government-issued ID to fly.`,
      flights: [],
    };
  }

  const visaInfo = await getVisaInfo(passport, route.toCountry);

  const destinationVisa: DestinationVisaInfo | undefined = visaInfo
    ? {
        country: route.toIATA,
        visaStatus: visaInfo.status,
        visaNote: visaInfo.note ?? '',
        stayLimit: visaInfo.days ? `${visaInfo.days} days` : undefined,
      }
    : undefined;

  const statusLabel: Record<VisaStatus, string> = {
    visa_free:       'visa-free ✓',
    visa_on_arrival: 'visa on arrival',
    on_arrival:      'visa on arrival',
    e_visa:          'e-visa required',
    visa_required:   'visa required',
    eta:             'ETA required',
    check_embassy:   'check with embassy',
  };

  const label = visaInfo ? statusLabel[visaInfo.status] : 'unknown';
  const stayText = visaInfo?.days ? ` for up to ${visaInfo.days} days` : '';

  const routeLabel = route.fromIATA === '???'
    ? `traveling to ${route.toCountry}`
    : `flying ${route.fromIATA} → ${route.toIATA}`;

  const message = visaInfo
    ? `For a ${passport} passport holder ${routeLabel}, entry is ${label}${stayText}.`
    : `I found your destination but couldn't retrieve visa data for that passport/destination combination. Please verify with the embassy.`;

  return {
    message,
    destinationVisa,
    flights: [],
  };
}

// ─── New onboarding integration ──────────────────────────────────────────────

export interface VisaChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface VisaAssistantContext {
  travelerData: TravelerData;
  tripDetails: TripDetails;
  preferences: TripPreferences;
  result: JourneyResult | null;
}

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const GEMINI_MODEL =
  process.env.EXPO_PUBLIC_GEMINI_MODEL?.trim() || 'gemini-2.5-flash';

const ONBOARDING_COUNTRY_TO_ISO: Record<string, string> = {
  ...COUNTRY_NAME_MAP,
};

function toJourneyVisaStatus(
  status: VisaStatus,
): VisaRequirement['status'] {
  switch (status) {
    case 'visa_free':
      return 'visa_free';

    case 'visa_on_arrival':
    case 'on_arrival':
      return 'visa_on_arrival';

    case 'e_visa':
    case 'eta':
      return 'evisa';

    case 'visa_required':
    case 'check_embassy':
    default:
      return 'visa_required';
  }
}

export function resolveCountryCode(
  airport: AirportSelection | null,
): string | null {
  if (!airport) {
    return null;
  }

  if (airport.countryCode) {
    return airport.countryCode;
  }

  const countryName = airport.country?.trim().toLowerCase();

  if (countryName && ONBOARDING_COUNTRY_TO_ISO[countryName]) {
    return ONBOARDING_COUNTRY_TO_ISO[countryName];
  }

  if (airport.code) {
    return getCountryFromIATA(airport.code);
  }

  return null;
}

export function buildVisaRequirements(
  travelerData: TravelerData,
  tripDetails: TripDetails,
): VisaRequirement[] {
  const airports = [
    ...tripDetails.additionalStops,
    ...(tripDetails.destination ? [tripDetails.destination] : []),
  ];

  const requirements: VisaRequirement[] = [];
  const seen = new Set<string>();

  airports.forEach((airport, index) => {
    const countryCode = resolveCountryCode(airport);

    if (!countryCode || seen.has(countryCode)) {
      return;
    }

    seen.add(countryCode);

    const isTransit = index < tripDetails.additionalStops.length;

    const indexData = passportIndex as Record<
      string,
      Record<string, { status: string; days?: number }>
    >;

    const passportCode = travelerData.passportCode?.toUpperCase();
    const raw = passportCode
      ? indexData[passportCode]?.[countryCode]
      : undefined;

    if (!raw) {
      requirements.push({
        countryCode,
        countryName: airport.country,
        status: isTransit ? 'transit_visa' : 'visa_required',
        note: `No passport-dataset match was found. Verify current ${
          isTransit ? 'transit' : 'entry'
        } rules with the official immigration authority and airline.`,
      });

      return;
    }

    const mappedStatus = mapStatus(raw.status);

    requirements.push({
      countryCode,
      countryName: airport.country,
      status:
        isTransit && mappedStatus === 'visa_required'
          ? 'transit_visa'
          : toJourneyVisaStatus(mappedStatus),
      allowedStay: raw.days ? `${raw.days} days` : undefined,
      note: `Passport dataset result: ${raw.status}${
        raw.days ? `. Maximum stay: ${raw.days} days.` : '.'
      }${
        isTransit
          ? ' Confirm airport-transit rules for this specific connection.'
          : ''
      }`,
    });
  });

  return requirements;
}

function buildOnboardingTripContext(
  context: VisaAssistantContext,
): string {
  const { travelerData, tripDetails, preferences, result } = context;

  return JSON.stringify(
    {
      traveler: {
        passportCountry:
          travelerData.passportCountry || 'Not provided',
        passportCode: travelerData.passportCode || 'Not provided',
        existingVisas: travelerData.existingVisas,
        tripType: travelerData.tripType || 'Not provided',
      },
      route: {
        origin: travelerData.origin,
        destination: tripDetails.destination,
        plannedStops: tripDetails.additionalStops,
      },
      dates: {
        departure: tripDetails.departureDate,
        return: tripDetails.returnDate,
        mode: tripDetails.tripMode,
      },
      preferences: {
        cabinClass: preferences.cabinClass,
        maximumStops: preferences.maximumStops,
        maximumLayoverHours: preferences.maximumLayoverHours,
        checkedBaggage: preferences.checkedBaggage,
        accessibilityNeeds: preferences.accessibilityNeeds,
      },
      verifiedLocalDataset: buildVisaRequirements(
        travelerData,
        tripDetails,
      ),
      displayedJourneyResult: result,
    },
    null,
    2,
  );
}

function onboardingSystemInstruction(
  context: VisaAssistantContext,
): string {
  return `
You are FlightADVSR Trip Assistant.

You are not a general-purpose chatbot. You are reviewing the traveler's
displayed itinerary, passport information, existing visas, visa results,
layovers, documents, and recommended flight.

Use the verified local passport dataset and displayed journey result as the
primary facts. Do not contradict those facts.

Response rules:
- Answer the question directly.
- Use plain text only.
- Do not use Markdown, asterisks, headings, tables, or code blocks.
- Keep the answer under 100 words.
- Prefer 3 to 6 short lines.
- Do not repeat the entire itinerary.
- Only include information relevant to the question.
- Never guarantee entry or boarding.
- Do not invent visa exemptions, transit rules, fees, processing times,
  passport-validity rules, or official URLs.
- When current confirmation is needed, tell the traveler to verify with the
  official immigration authority, embassy, and airline.
- If the exact visa type cannot be established from the supplied data, say
  "Confirm the visa category with the official authority" instead of guessing.

Suggested formats:

Visa question:
Visa status: [status]
Likely visa type: [type only when established]
Recommended action: [short action]
Official source: [government department or embassy]

Transit question:
Transit airport: [airport]
Layover: [duration]
Transit status: [status]
Recommended action: [short action]

Documents question:
Documents to prepare:
✓ [document]
✓ [document]
⚠ [warning only when needed]

Flight question:
Recommendation: [short answer]
Reason: [price, duration, stops, visa simplicity, or connection quality]
Next step: [short action]

Trip context:
${buildOnboardingTripContext(context)}
  `.trim();
}

function cleanAssistantResponse(value: string): string {
  return value
    .replace(/```[\s\S]*?```/g, '')
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^\s*[-•]\s+/gm, '✓ ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function readGeminiResponse(payload: unknown): string {
  const candidatePayload = payload as {
    candidates?: Array<{
      content?: {
        parts?: Array<{ text?: string }>;
      };
    }>;
  };

  const parts = candidatePayload.candidates?.[0]?.content?.parts;

  if (!Array.isArray(parts)) {
    return '';
  }

  const text = parts
    .map((part) => part.text ?? '')
    .join('')
    .trim();

  return cleanAssistantResponse(text);
}

function getGeminiErrorMessage(
  status: number,
  payload: unknown,
): string {
  const errorPayload = payload as {
    error?: {
      message?: string;
      status?: string;
    };
  };

  const apiMessage =
    errorPayload.error?.message?.toLowerCase() ?? '';

  if (
    status === 429 ||
    status === 503 ||
    apiMessage.includes('high demand') ||
    apiMessage.includes('overloaded') ||
    apiMessage.includes('resource exhausted') ||
    apiMessage.includes('quota')
  ) {
    return 'The Trip Assistant is temporarily busy. Please wait a moment and try again.';
  }

  if (status === 400) {
    return 'The Trip Assistant request was not accepted. Check the selected Gemini model and restart Expo.';
  }

  if (status === 401 || status === 403) {
    return 'The Trip Assistant could not connect. Check the Gemini API key in .env.local and restart Expo.';
  }

  if (status === 404) {
    return `The Gemini model "${GEMINI_MODEL}" is unavailable. Set EXPO_PUBLIC_GEMINI_MODEL=gemini-2.5-flash and restart Expo.`;
  }

  if (status >= 500) {
    return 'The Trip Assistant is temporarily unavailable. Please try again shortly.';
  }

  return 'The Trip Assistant could not answer that question. Please try again.';
}

export async function askVisaAssistant(
  messages: VisaChatMessage[],
  context: VisaAssistantContext,
): Promise<string> {
  if (!GEMINI_API_KEY || GEMINI_API_KEY.includes('your_')) {
    throw new Error(
      'The Gemini API key is missing. Add EXPO_PUBLIC_GEMINI_API_KEY to .env.local and restart Expo.',
    );
  }

  const recentMessages = (messages ?? [])
    .filter((message) => message.content.trim().length > 0)
    .slice(-6);

  if (recentMessages.length === 0) {
    throw new Error('Please enter a question for the Trip Assistant.');
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      GEMINI_MODEL,
    )}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text: onboardingSystemInstruction(context),
            },
          ],
        },
        contents: recentMessages.map((message) => ({
          role: message.role === 'assistant' ? 'model' : 'user',
          parts: [
            {
              text: message.content,
            },
          ],
        })),
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 180,
          topP: 0.8,
          topK: 20,
        },
      }),
    },
  );

  const payload: unknown = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      getGeminiErrorMessage(response.status, payload),
    );
  }

  const answer = readGeminiResponse(payload);

  if (!answer) {
    throw new Error(
      'The Trip Assistant returned an empty response. Please try again.',
    );
  }

  return answer;
}