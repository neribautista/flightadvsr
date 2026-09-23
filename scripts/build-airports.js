// Builds data/airports.json from the OpenFlights dataset in `airport-codes`.
// Run with: node scripts/build-airports.js
const fs = require('fs');
const path = require('path');
const countries = require('i18n-iso-countries');
countries.registerLocale(require('i18n-iso-countries/langs/en.json'));

const raw = require('airport-codes/airports.json');

// OpenFlights country names that i18n-iso-countries doesn't recognise.
const OVERRIDES = {
  'Burma': 'MM',
  'Congo (Kinshasa)': 'CD',
  'Congo (Brazzaville)': 'CG',
  "Cote d'Ivoire": 'CI',
  'Macau': 'MO',
  'Micronesia': 'FM',
  'Virgin Islands': 'VI',
  'British Virgin Islands': 'VG',
  'Wallis and Futuna': 'WF',
  'Saint Helena': 'SH',
  'Svalbard': 'SJ',
  'Midway Islands': 'UM',
  'Wake Island': 'UM',
  'Johnston Atoll': 'UM',
  'Netherlands Antilles': 'BQ',
  'East Timor': 'TL',
  'Cape Verde': 'CV',
  'Swaziland': 'SZ',
  'Macedonia': 'MK',
  'Palestine': 'PS',
  'West Bank': 'PS',
  'Kosovo': 'XK',
  'Falkland Islands': 'FK',
  'Moldova': 'MD',
  'Syria': 'SY',
  'Laos': 'LA',
  'Brunei': 'BN',
  'Korea': 'KR',
  'North Korea': 'KP',
};

// Friendlier display names than i18n-iso-countries' defaults.
const DISPLAY_NAMES = {
  BN: 'Brunei',
  LA: 'Laos',
  SY: 'Syria',
  NL: 'Netherlands',
  GM: 'Gambia',
  MO: 'Macau',
  CD: 'DR Congo',
  CG: 'Republic of the Congo',
  CI: "Côte d'Ivoire",
  FK: 'Falkland Islands',
  FM: 'Micronesia',
  MD: 'Moldova',
  KR: 'South Korea',
  KP: 'North Korea',
  VG: 'British Virgin Islands',
  VI: 'U.S. Virgin Islands',
  GB: 'United Kingdom',
  AE: 'United Arab Emirates',
  VA: 'Vatican City',
  XK: 'Kosovo',
  MF: 'Saint Martin',
  SX: 'Sint Maarten',
};

// Closed airports or non-airport entries that OpenFlights still lists.
const REMOVED_CODES = new Set(['IDL', 'QQW', 'TXL', 'THF', 'HKG_OLD', 'KAI']);

const unresolved = new Set();
const seen = new Set();
const airports = [];

for (const a of raw) {
  const code = (a.iata || '').trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(code) || seen.has(code)) continue;
  // Military bases don't sell commercial tickets.
  if (/\b(AFB|ARB|NAS|Air Force Base|Air Base|Naval|Army|Military)\b/i.test(a.name)) continue;
  // Nor do heliports, rail/bus stations or closed airports.
  if (/\b(Heliport|Helipad|Railway|Rail|Station|Bus|Ferry|Port Authority)\b/i.test(a.name)) continue;
  if (REMOVED_CODES.has(code)) continue;
  // Metro-area codes (LON, NYC, PAR...) aren't bookable airports.
  if (/^All Airports$/i.test(a.name)) continue;

  const countryCode =
    OVERRIDES[a.country] || countries.getAlpha2Code(a.country, 'en');
  if (!countryCode) {
    unresolved.add(a.country);
    continue;
  }

  seen.add(code);
  const country =
    DISPLAY_NAMES[countryCode] ||
    countries.getName(countryCode, 'en', { select: 'alias' }) ||
    a.country;
  airports.push([code, a.name, a.city || a.name, country, countryCode]);
}

airports.sort((x, y) => x[0].localeCompare(y[0]));

fs.writeFileSync(
  path.join(__dirname, '..', 'data', 'airports.json'),
  JSON.stringify(airports),
);

console.log(`Wrote ${airports.length} airports across ${new Set(airports.map((a) => a[4])).size} countries.`);
if (unresolved.size) console.log('Skipped (unknown country):', [...unresolved].join(', '));
