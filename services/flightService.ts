import { Linking } from 'react-native';
import type { AirportMetadata, FlightItinerary, PriceInsights, TripDetails, TripPreferences, TravelerData } from '../types/trip';

const ENDPOINT = 'https://api.scrape.do/plugin/google/flights';
const AIRLINE_URLS: Record<string, string> = {
  AA:'https://www.aa.com/', DL:'https://www.delta.com/', UA:'https://www.united.com/', EK:'https://www.emirates.com/', QR:'https://www.qatarairways.com/', SQ:'https://www.singaporeair.com/', JL:'https://www.jal.co.jp/', NH:'https://www.ana.co.jp/', PR:'https://www.philippineairlines.com/', CX:'https://www.cathaypacific.com/', AC:'https://www.aircanada.com/', BA:'https://www.britishairways.com/', LH:'https://www.lufthansa.com/', AF:'https://www.airfrance.com/', KL:'https://www.klm.com/', QF:'https://www.qantas.com/', B6:'https://www.jetblue.com/', WN:'https://www.southwest.com/'
};

type RawAirportTime = { name:string; id:string; time:string };
type RawSegment = { departure_airport:RawAirportTime; arrival_airport:RawAirportTime; duration:number; airplane?:string; airline:string; airline_logo?:string; travel_class?:string; flight_number:string; legroom?:string; extensions?:string[]; overnight?:boolean };
type RawItinerary = { flights:RawSegment[]; layovers?:Array<{duration:number;name:string;id:string}>; total_duration:number; carbon_emissions?:{this_flight:number;typical_for_this_route:number;difference_percent:number}; price:number; type:string; airline_logo?:string; booking_token?:string; departure_token?:string };
type RawAirport = { id:string;name:string;city:string;country:string;country_code:string;latitude:number;longitude:number;images?:string[] };
type RawResponse = { best_flights?:RawItinerary[]; other_flights?:RawItinerary[]; price_insights?:{lowest_price?:number;price_level?:string;typical_price_range?:number[];price_history?:Array<[number,number]>}; airports?:Array<{departure?:RawAirport[];arrival?:RawAirport[]}>; error?:string };

export interface FlightSearchResponse { bestFlights:FlightItinerary[]; otherFlights:FlightItinerary[]; priceInsights:PriceInsights; airports:{departure:AirportMetadata[];arrival:AirportMetadata[]}; }

const airlineCode = (number:string) => number.trim().split(/\s+/)[0] || '';
const mapItinerary = (raw:RawItinerary, rank:'best'|'other', index:number):FlightItinerary => ({
  id: `${rank}-${index}-${raw.flights.map(f=>f.flight_number).join('-')}`,
  segments: raw.flights.map(f=>({ departureAirport:f.departure_airport, arrivalAirport:f.arrival_airport, durationMinutes:f.duration, airplane:f.airplane, airline:f.airline, airlineCode:airlineCode(f.flight_number), airlineLogo:f.airline_logo, travelClass:f.travel_class, flightNumber:f.flight_number, legroom:f.legroom, extensions:f.extensions ?? [], overnight:Boolean(f.overnight) })),
  layovers:(raw.layovers ?? []).map(l=>({durationMinutes:l.duration,name:l.name,airportCode:l.id})), totalDurationMinutes:raw.total_duration, price:raw.price, type:raw.type, airlineLogo:raw.airline_logo, bookingToken:raw.booking_token, departureToken:raw.departure_token,
  carbonEmissions:raw.carbon_emissions ? {thisFlightGrams:raw.carbon_emissions.this_flight,typicalForRouteGrams:raw.carbon_emissions.typical_for_this_route,differencePercent:raw.carbon_emissions.difference_percent}:undefined,
  sourceRank:rank,
});
const mapAirport = (a:RawAirport):AirportMetadata => ({id:a.id,name:a.name,city:a.city,country:a.country,countryCode:a.country_code,latitude:a.latitude,longitude:a.longitude,images:a.images ?? []});
const classCode = (v:TripPreferences['cabinClass']) => ({economy:1,premium_economy:2,business:3,first:4}[v]);
const stopsCode = (n:number) => n<=0?1:n===1?2:n===2?3:0;

export async function searchRealFlights(traveler:TravelerData, trip:TripDetails, prefs:TripPreferences):Promise<FlightSearchResponse>{
  const token=process.env.EXPO_PUBLIC_SCRAPE_DO_TOKEN;
  if(!token) throw new Error('Missing EXPO_PUBLIC_SCRAPE_DO_TOKEN.');
  if(!traveler.origin||!trip.destination||!trip.departureDate) throw new Error('Origin, destination, and departure date are required.');
  const params=new URLSearchParams({token,departure_id:traveler.origin.code,arrival_id:trip.destination.code,outbound_date:trip.departureDate,adults:String(Math.min(9,Math.max(1,trip.travelers))),travel_class:String(classCode(prefs.cabinClass)),stops:String(stopsCode(prefs.maximumStops)),sort_by:'1',currency:trip.currency||'USD',gl:'us',hl:'en',type:trip.tripMode==='round_trip'?'1':'2'});
  if(trip.tripMode==='round_trip'){ if(!trip.returnDate) throw new Error('A return date is required for a round trip.'); params.set('return_date',trip.returnDate); }
  const response=await fetch(`${ENDPOINT}?${params}`); const data=(await response.json()) as RawResponse;
  if(!response.ok||data.error) throw new Error(data.error||`Flight search failed (${response.status}).`);
  const airportGroup=data.airports?.[0];
  return { bestFlights:(data.best_flights??[]).map((x,i)=>mapItinerary(x,'best',i)), otherFlights:(data.other_flights??[]).map((x,i)=>mapItinerary(x,'other',i)), priceInsights:{lowestPrice:data.price_insights?.lowest_price,priceLevel:data.price_insights?.price_level,typicalPriceRange:data.price_insights?.typical_price_range?.length===2?data.price_insights.typical_price_range as [number,number]:undefined,priceHistory:data.price_insights?.price_history??[]}, airports:{departure:(airportGroup?.departure??[]).map(mapAirport),arrival:(airportGroup?.arrival??[]).map(mapAirport)} };
}

export function getAirlineBookingUrl(itinerary:FlightItinerary):string{ const first=itinerary.segments[0]; if(!first) return 'https://www.google.com/travel/flights'; return AIRLINE_URLS[first.airlineCode]||`https://www.google.com/search?q=${encodeURIComponent(`${first.airline} official website`)}`; }
export async function openAirlineBooking(itinerary:FlightItinerary){ await Linking.openURL(getAirlineBookingUrl(itinerary)); }
