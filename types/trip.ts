export type TripType = 'leisure' | 'business' | 'family' | 'study' | 'backpacking' | 'other';
export type CabinClass = 'economy' | 'premium_economy' | 'business' | 'first';
export type OptimizationPriority = 'best_value' | 'lowest_price' | 'shortest_duration';
export type DeparturePreference = 'any' | 'morning' | 'afternoon' | 'evening' | 'overnight';

export interface AirportSelection { code: string; city: string; country: string; countryCode?: string; label: string; }
export interface TravelerData { passportCountry: string; passportCode: string; existingVisas: string[]; origin: AirportSelection | null; tripType: TripType | ''; }
export interface TripDetails { destination: AirportSelection | null; additionalStops: AirportSelection[]; departureDate: string; returnDate: string; tripMode: 'round_trip' | 'one_way'; travelers: number; budget: number; currency: string; notes: string; }
export interface TripPreferences { cabinClass: CabinClass; preferredAirlines: string[]; avoidedAirlines: string[]; maximumStops: number; maximumLayoverHours: number; checkedBaggage: boolean; flexibleDates: boolean; departurePreference: DeparturePreference; optimizationPriority: OptimizationPriority; accessibilityNeeds: string; includeHotels: boolean; }
export type AnalysisStepStatus = 'pending' | 'active' | 'completed' | 'error';
export interface AnalysisStep { id: string; label: string; status: AnalysisStepStatus; }

export interface FlightAirportTime { name: string; id: string; time: string; }
export interface FlightSegment { departureAirport: FlightAirportTime; arrivalAirport: FlightAirportTime; durationMinutes: number; airplane?: string; airline: string; airlineCode: string; airlineLogo?: string; travelClass?: string; flightNumber: string; legroom?: string; extensions: string[]; overnight: boolean; }
export interface FlightLayover { durationMinutes: number; name: string; airportCode: string; }
export interface CarbonEmissions { thisFlightGrams: number; typicalForRouteGrams: number; differencePercent: number; }
export interface FlightItinerary { id: string; segments: FlightSegment[]; layovers: FlightLayover[]; totalDurationMinutes: number; price: number; type: string; airlineLogo?: string; bookingToken?: string; departureToken?: string; carbonEmissions?: CarbonEmissions; sourceRank: 'best' | 'other'; }
export interface PriceInsights { lowestPrice?: number; priceLevel?: 'low' | 'typical' | 'high' | string; typicalPriceRange?: [number, number]; priceHistory: Array<[number, number]>; }
export interface AirportMetadata { id: string; name: string; city: string; country: string; countryCode: string; latitude: number; longitude: number; images: string[]; }

export interface VisaRequirement { countryCode: string; countryName: string; status: 'visa_free' | 'visa_required' | 'evisa' | 'visa_on_arrival' | 'transit_visa'; allowedStay?: string; note: string; }
export interface RecommendationReason { icon: 'price' | 'time' | 'visa' | 'layover' | 'emissions' | 'arrival'; title: string; detail: string; }
export interface TravelAlert { severity: 'info' | 'warning' | 'critical'; title: string; detail: string; }
export interface ChecklistItem { id: string; label: string; detail: string; required: boolean; }
export interface DestinationInsight { label: string; value: string; icon: string; }

export interface JourneyResult {
  recommendation: { label: 'FlightADVSR Pick'; headline: string; explanation: string; reasons: RecommendationReason[]; };
  primaryFlight: FlightItinerary;
  alternativeFlights: FlightItinerary[];
  priceInsights: PriceInsights;
  airportMetadata: { departure: AirportMetadata[]; arrival: AirportMetadata[]; };
  visaRequirements: VisaRequirement[];
  requiredDocuments: string[];
  checklist: ChecklistItem[];
  travelAlerts: TravelAlert[];
  destinationInsights: DestinationInsight[];
  currency: string;
  generatedAt: string;
  isLiveData: boolean;
}
