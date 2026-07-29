import React, {
    createContext,
    ReactNode,
    useContext,
    useMemo,
    useState,
  } from 'react';
  
  import {
    AnalysisStep,
    JourneyResult,
    TravelerData,
    TripDetails,
    TripPreferences,
  } from '../types/trip';
  
  const initialTravelerData: TravelerData = {
    passportCountry: '',
    passportCode: '',
    existingVisas: [],
    origin: null,
    tripType: '',
  };
  
  const initialTripDetails: TripDetails = {
    destination: null,
    additionalStops: [],
    departureDate: '',
    returnDate: '',
    tripMode: 'round_trip',
    travelers: 1,
    budget: 0,
    currency: 'USD',
    notes: '',
  };
  
  const initialPreferences: TripPreferences = {
    cabinClass: 'economy',
    preferredAirlines: [],
    avoidedAirlines: [],
    maximumStops: 1,
    maximumLayoverHours: 6,
    checkedBaggage: false,
    flexibleDates: false,
    departurePreference: 'any',
    optimizationPriority: 'best_value',
    accessibilityNeeds: '',
    includeHotels: true,
  };
  
  const initialAnalysisSteps: AnalysisStep[] = [
    {
      id: 'airlines',
      label: 'Searching available airlines',
      status: 'pending',
    },
    {
      id: 'nearby-airports',
      label: 'Checking nearby airports',
      status: 'pending',
    },
    {
      id: 'passport',
      label: 'Checking passport validity',
      status: 'pending',
    },
    {
      id: 'destination-visas',
      label: 'Checking destination visas',
      status: 'pending',
    },
    {
      id: 'transit-visas',
      label: 'Checking transit visas',
      status: 'pending',
    },
    {
      id: 'layovers',
      label: 'Optimizing layovers',
      status: 'pending',
    },
    {
      id: 'savings',
      label: 'Looking for hidden savings',
      status: 'pending',
    },
    {
      id: 'alliances',
      label: 'Comparing airline alliances',
      status: 'pending',
    },
    {
      id: 'nearby-dates',
      label: 'Checking flexible nearby dates',
      status: 'pending',
    },
    {
      id: 'recommendation',
      label: 'Preparing your explainable recommendation',
      status: 'pending',
    },
  ];
  
  interface TripContextValue {
    travelerData: TravelerData;
    tripDetails: TripDetails;
    preferences: TripPreferences;
    analysisSteps: AnalysisStep[];
    result: JourneyResult | null;
  
    updateTravelerData: (updates: Partial<TravelerData>) => void;
    updateTripDetails: (updates: Partial<TripDetails>) => void;
    updatePreferences: (updates: Partial<TripPreferences>) => void;
  
    setAnalysisSteps: React.Dispatch<React.SetStateAction<AnalysisStep[]>>;
    setResult: React.Dispatch<React.SetStateAction<JourneyResult | null>>;
  
    resetAnalysis: () => void;
    resetTrip: () => void;
  }
  
  const TripContext = createContext<TripContextValue | undefined>(undefined);
  
  export function TripProvider({ children }: { children: ReactNode }) {
    const [travelerData, setTravelerData] =
      useState<TravelerData>(initialTravelerData);
  
    const [tripDetails, setTripDetails] =
      useState<TripDetails>(initialTripDetails);
  
    const [preferences, setPreferences] =
      useState<TripPreferences>(initialPreferences);
  
    const [analysisSteps, setAnalysisSteps] =
      useState<AnalysisStep[]>(initialAnalysisSteps);
  
    const [result, setResult] = useState<JourneyResult | null>(null);
  
    const updateTravelerData = (updates: Partial<TravelerData>) => {
      setTravelerData((current) => ({
        ...current,
        ...updates,
      }));
    };
  
    const updateTripDetails = (updates: Partial<TripDetails>) => {
      setTripDetails((current) => ({
        ...current,
        ...updates,
      }));
    };
  
    const updatePreferences = (updates: Partial<TripPreferences>) => {
      setPreferences((current) => ({
        ...current,
        ...updates,
      }));
    };
  
    const resetAnalysis = () => {
      setAnalysisSteps(initialAnalysisSteps);
      setResult(null);
    };
  
    const resetTrip = () => {
      setTravelerData(initialTravelerData);
      setTripDetails(initialTripDetails);
      setPreferences(initialPreferences);
      setAnalysisSteps(initialAnalysisSteps);
      setResult(null);
    };
  
    const value = useMemo(
      () => ({
        travelerData,
        tripDetails,
        preferences,
        analysisSteps,
        result,
        updateTravelerData,
        updateTripDetails,
        updatePreferences,
        setAnalysisSteps,
        setResult,
        resetAnalysis,
        resetTrip,
      }),
      [
        travelerData,
        tripDetails,
        preferences,
        analysisSteps,
        result,
      ],
    );
  
    return (
      <TripContext.Provider value={value}>
        {children}
      </TripContext.Provider>
    );
  }
  
  export function useTrip() {
    const context = useContext(TripContext);
  
    if (!context) {
      throw new Error('useTrip must be used inside TripProvider.');
    }
  
    return context;
  }