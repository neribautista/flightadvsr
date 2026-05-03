// services/aiService.ts
import passportIndex from '../data/passportIndex.json';

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
  const country = IATA_FALLBACK[code];
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