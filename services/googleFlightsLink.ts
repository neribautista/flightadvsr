import type {
  FlightItinerary,
  FlightSegment,
  TripDetails,
  TripPreferences,
} from '../types/trip';

/**
 * Builds a Google Flights link that opens on the itinerary we recommended.
 *
 * Google Flights encodes a search in the `tfs` query parameter as a
 * base64url protobuf. Besides route, dates, cabin and passengers it can carry
 * the exact flights to preselect:
 *  - one-way: lands on the "Booking options" page for that flight, where the
 *    traveler picks the airline (or agency) and continues to its checkout;
 *  - round trip: the outbound is preselected and the traveler picks a return.
 *
 * The format is undocumented. If a segment's flight number or date can't be
 * parsed we drop the preselection, because an unknown flight shows Google's
 * "itinerary no longer available" page instead of search results.
 */

const GOOGLE_FLIGHTS_SEARCH = 'https://www.google.com/travel/flights/search';

const SEAT_CODE: Record<TripPreferences['cabinClass'], number> = {
  economy: 1,
  premium_economy: 2,
  business: 3,
  first: 4,
};

const TRIP_ROUND = 1;
const TRIP_ONE_WAY = 2;
const PASSENGER_ADULT = 1;

// ─── Minimal protobuf writer ────────────────────────────────────────────────

type Bytes = number[];

function varint(value: number): Bytes {
  const out: Bytes = [];
  let n = value;
  while (n > 127) {
    out.push((n & 127) | 128);
    n >>>= 7;
  }
  out.push(n);
  return out;
}

const key = (field: number, wireType: 0 | 2) => varint((field << 3) | wireType);

function intField(field: number, value: number): Bytes {
  return [...key(field, 0), ...varint(value)];
}

function bytesField(field: number, bytes: Bytes): Bytes {
  return [...key(field, 2), ...varint(bytes.length), ...bytes];
}

function stringField(field: number, value: string): Bytes {
  // Values are IATA codes, dates and flight numbers, so ASCII is enough.
  return bytesField(
    field,
    Array.from(value, (char) => char.charCodeAt(0) & 0xff),
  );
}

const BASE64URL =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

function toBase64Url(bytes: Bytes): string {
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const [a, b = 0, c = 0] = bytes.slice(i, i + 3);
    const triple = (a << 16) | (b << 8) | c;
    const chars = Math.min(4, bytes.length - i + 1);
    for (let j = 0; j < chars; j += 1) {
      out += BASE64URL[(triple >> (18 - j * 6)) & 63];
    }
  }
  return out;
}

// ─── Google Flights messages ────────────────────────────────────────────────

interface SelectedFlight {
  from: string;
  to: string;
  date: string;
  airline: string;
  number: string;
}

interface Leg {
  date: string;
  from: string;
  to: string;
  selected: SelectedFlight[];
}

function airportMessage(code: string): Bytes {
  return [...intField(1, 1), ...stringField(2, code)];
}

function legMessage(leg: Leg): Bytes {
  return [
    ...stringField(2, leg.date),
    ...leg.selected.flatMap((flight) =>
      bytesField(4, [
        ...stringField(1, flight.from),
        ...stringField(2, flight.date),
        ...stringField(3, flight.to),
        ...stringField(5, flight.airline),
        ...stringField(6, flight.number),
      ]),
    ),
    ...bytesField(13, airportMessage(leg.from)),
    ...bytesField(14, airportMessage(leg.to)),
  ];
}

function encodeSearch(
  legs: Leg[],
  seat: number,
  adults: number,
  trip: number,
): string {
  return toBase64Url([
    ...legs.flatMap((leg) => bytesField(3, legMessage(leg))),
    ...Array.from({ length: adults }).flatMap(() =>
      intField(8, PASSENGER_ADULT),
    ),
    ...intField(9, seat),
    ...intField(19, trip),
  ]);
}

// ─── Mapping our itinerary ──────────────────────────────────────────────────

const IATA = /^[A-Z0-9]{3}$/;
const DATE = /^\d{4}-\d{2}-\d{2}/;

/** "AA 61" → { airline: "AA", number: "61" } */
function parseFlightNumber(value: string) {
  const match = value.trim().toUpperCase().match(/^([A-Z0-9]{2})\s*(\d{1,4})$/);
  return match ? { airline: match[1], number: match[2] } : null;
}

function toSelectedFlight(segment: FlightSegment): SelectedFlight | null {
  const flight = parseFlightNumber(segment.flightNumber);
  const date = segment.departureAirport.time?.match(DATE)?.[0];
  const from = segment.departureAirport.id;
  const to = segment.arrivalAirport.id;

  if (!flight || !date || !IATA.test(from) || !IATA.test(to)) {
    return null;
  }

  return { from, to, date, ...flight };
}

export function getGoogleFlightsUrl(
  itinerary: FlightItinerary,
  trip: TripDetails,
  preferences: TripPreferences,
  currency: string,
): string {
  const segments = itinerary.segments;
  const origin = segments[0]?.departureAirport.id;
  const destination = segments[segments.length - 1]?.arrivalAirport.id;

  if (!origin || !destination || !trip.departureDate) {
    return 'https://www.google.com/travel/flights';
  }

  const selected = segments.map(toSelectedFlight);
  const canPreselect = selected.every(Boolean);

  const legs: Leg[] = [
    {
      date: trip.departureDate,
      from: origin,
      to: destination,
      selected: canPreselect ? (selected as SelectedFlight[]) : [],
    },
  ];

  const roundTrip = trip.tripMode === 'round_trip' && Boolean(trip.returnDate);
  if (roundTrip) {
    legs.push({
      date: trip.returnDate,
      from: destination,
      to: origin,
      selected: [],
    });
  }

  const tfs = encodeSearch(
    legs,
    SEAT_CODE[preferences.cabinClass] ?? SEAT_CODE.economy,
    Math.min(9, Math.max(1, trip.travelers || 1)),
    roundTrip ? TRIP_ROUND : TRIP_ONE_WAY,
  );

  const params = new URLSearchParams({
    tfs,
    hl: 'en',
    curr: currency || 'USD',
  });

  return `${GOOGLE_FLIGHTS_SEARCH}?${params.toString()}`;
}
