# FlightADVSR Journey Architecture

The results flow no longer calculates or displays a travel score.

1. `services/flightService.ts` maps the Scrape.do Google Flights response without discarding segments, layovers, emissions, price insights, booking tokens, or airport metadata.
2. `services/aiService.ts` continues to provide passport-dataset visa checks and the Gemini results chatbot.
3. `services/journeyService.ts` combines live itineraries and visa checks, selects an explainable recommendation, and produces alerts and a pre-flight checklist.
4. `app/onboarding/analyzing.tsx` creates one `JourneyResult` and stores it in `TripContext`.
5. `app/onboarding/results.tsx` renders the FlightADVSR Pick, recommendation reasons, visa information, alerts, checklist, chatbot, and alternative live flights.

## Environment

```env
EXPO_PUBLIC_GEMINI_API_KEY=your_key
EXPO_PUBLIC_GEMINI_MODEL=gemini-2.5-flash
EXPO_PUBLIC_SCRAPE_DO_TOKEN=your_token
```

For production, proxy both APIs through a backend or serverless function. Values prefixed with `EXPO_PUBLIC_` are bundled into the client.

## Booking behavior

Scrape.do provides listing data and an opaque `booking_token`, but does not expose booking-flow expansion. Instead, `services/googleFlightsLink.ts` builds a Google Flights link that preselects the recommended flights, dates, cabin, and passengers. One-way trips land on that flight's booking options; round trips land with the outbound selected. See `FLIGHT-API-NOTES.md` for details and fallbacks.
