import rawAirports from './airports.json';
import { AirportSelection } from '../types/trip';

/**
 * Worldwide airport list (IATA codes) generated from OpenFlights data by
 * scripts/build-airports.js. Each row is [code, name, city, country, countryCode].
 */
type AirportRow = [string, string, string, string, string];

function expandName(name: string): string {
  return name
    .replace(/\bIntl\b/g, 'International')
    .replace(/\bFld\b/g, 'Field')
    .replace(/\bRgnl\b/g, 'Regional')
    .replace(/\bMuni\b/g, 'Municipal');
}

export const AIRPORTS: AirportSelection[] = (rawAirports as AirportRow[]).map(
  ([code, name, city, country, countryCode]) => ({
    code,
    city,
    country,
    countryCode,
    label: `${expandName(name)} (${code})`,
  }),
);

const AIRPORTS_BY_CODE = new Map(AIRPORTS.map((airport) => [airport.code, airport]));

export function getAirportByCode(code: string): AirportSelection | undefined {
  return AIRPORTS_BY_CODE.get(code.toUpperCase());
}

// Major hubs and capital-city airports get ranked first in search results.
const MAJOR_AIRPORTS = new Set([
  // North America
  'ATL', 'LAX', 'ORD', 'DFW', 'DEN', 'JFK', 'SFO', 'SEA', 'LAS', 'MCO', 'EWR', 'MIA',
  'PHX', 'IAH', 'BOS', 'MSP', 'DTW', 'PHL', 'LGA', 'IAD', 'HNL', 'YYZ', 'YVR', 'YUL',
  'MEX', 'CUN', 'GDL',
  // Central & South America, Caribbean
  'GRU', 'GIG', 'BOG', 'LIM', 'SCL', 'EZE', 'PTY', 'SJO', 'UIO', 'MVD', 'ASU', 'CCS',
  'HAV', 'SDQ', 'KIN', 'SJU', 'GUA', 'SAL', 'MGA', 'TGU', 'LPB', 'VVI', 'NAS',
  // Europe
  'LHR', 'LGW', 'CDG', 'ORY', 'AMS', 'FRA', 'MUC', 'MAD', 'BCN', 'FCO', 'MXP', 'IST',
  'SAW', 'ZRH', 'VIE', 'CPH', 'OSL', 'ARN', 'HEL', 'DUB', 'LIS', 'BRU', 'ATH', 'WAW',
  'PRG', 'BUD', 'OTP', 'SOF', 'BER', 'KBP', 'SVO', 'DME', 'LED', 'BEG', 'ZAG', 'KEF',
  'RIX', 'VNO', 'TLL', 'LJU', 'SKP', 'TIA', 'KIV', 'MSQ', 'LUX', 'MLA', 'LCA', 'EDI',
  'MAN',
  // Middle East
  'DXB', 'AUH', 'DOH', 'RUH', 'JED', 'KWI', 'BAH', 'MCT', 'AMM', 'BEY', 'TLV', 'IKA',
  'BGW', 'SAH',
  // Africa
  'JNB', 'CPT', 'CAI', 'NBO', 'ADD', 'LOS', 'ABV', 'ACC', 'CMN', 'RAK', 'ALG', 'TUN',
  'DAR', 'EBB', 'KGL', 'DSS', 'ABJ', 'LAD', 'LUN', 'HRE', 'MPM', 'WDH', 'GBE', 'TNR',
  'MRU', 'SEZ', 'DKR', 'BKO', 'OUA', 'NIM', 'NDJ', 'DLA', 'NSI', 'LBV', 'FIH', 'BZV',
  'KRT', 'JIB', 'MGQ', 'ASM', 'TIP', 'FNA', 'ROB', 'CKY', 'BJL', 'LFW', 'COO',
  // Asia
  'HND', 'NRT', 'KIX', 'ICN', 'GMP', 'PEK', 'PKX', 'PVG', 'CAN', 'SZX', 'HKG', 'TPE',
  'MFM', 'SIN', 'KUL', 'BKK', 'DMK', 'CGK', 'DPS', 'MNL', 'CEB', 'SGN', 'HAN', 'PNH',
  'REP', 'VTE', 'RGN', 'BWN', 'DEL', 'BOM', 'BLR', 'MAA', 'CCU', 'HYD', 'CMB', 'DAC',
  'KTM', 'MLE', 'ISB', 'KHI', 'LHE', 'KBL', 'TAS', 'ALA', 'NQZ', 'FRU', 'DYU', 'ASB',
  'GYD', 'TBS', 'EVN', 'ULN', 'PBH', 'DIL',
  // Oceania
  'SYD', 'MEL', 'BNE', 'PER', 'AKL', 'CHC', 'NAN', 'POM', 'APW', 'TBU', 'PPT', 'NOU',
  'HIR', 'VLI',
]);

// Common short names people type for a country.
const COUNTRY_ALIASES: Record<string, string> = {
  uk: 'GB',
  england: 'GB',
  scotland: 'GB',
  wales: 'GB',
  britain: 'GB',
  'great britain': 'GB',
  us: 'US',
  usa: 'US',
  america: 'US',
  uae: 'AE',
  emirates: 'AE',
  holland: 'NL',
  korea: 'KR',
  czech: 'CZ',
  'ivory coast': 'CI',
  burma: 'MM',
  drc: 'CD',
};

function scoreAirport(airport: AirportSelection, query: string): number {
  const code = airport.code.toLowerCase();
  const city = airport.city.toLowerCase();
  const country = airport.country.toLowerCase();
  const label = airport.label.toLowerCase();

  let score = 0;
  if (code === query) score = 100;
  else if (
    country === query ||
    COUNTRY_ALIASES[query] === airport.countryCode
  )
    score = 80;
  else if (city === query) score = 70;
  else if (city.startsWith(query)) score = 60;
  else if (country.startsWith(query)) score = 45;
  else if (label.includes(query)) score = 30;
  else if (city.includes(query) || country.includes(query)) score = 20;
  else return 0;

  // Prefer international airports over small airfields with the same match.
  if (MAJOR_AIRPORTS.has(airport.code)) score += 30;
  else if (label.includes('international')) score += 15;
  return score;
}

/** Searches airports by IATA code, city, country or airport name. */
export function searchAirports(
  query: string,
  options: { limit?: number; exclude?: string[] } = {},
): AirportSelection[] {
  const { limit = 20, exclude = [] } = options;
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  return AIRPORTS.filter((airport) => !exclude.includes(airport.code))
    .map((airport) => ({ airport, score: scoreAirport(airport, normalized) }))
    .filter(({ score }) => score > 0)
    .sort(
      (a, b) =>
        b.score - a.score || a.airport.city.localeCompare(b.airport.city),
    )
    .slice(0, limit)
    .map(({ airport }) => airport);
}

/** A few well-known hubs shown before the user starts typing. */
export const POPULAR_AIRPORTS: AirportSelection[] = [
  'LHR', 'DXB', 'JFK', 'SIN', 'CDG', 'HND', 'IST', 'LAX', 'NBO', 'GRU', 'SYD', 'MNL',
]
  .map((code) => AIRPORTS_BY_CODE.get(code))
  .filter((airport): airport is AirportSelection => Boolean(airport));
