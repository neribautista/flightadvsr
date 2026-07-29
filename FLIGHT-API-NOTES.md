# Live flight integration

The onboarding analysis now calls `GET https://api.scrape.do/plugin/google/flights` using the selected IATA airports, dates, passenger count, cabin class, stop preference, sort priority, and currency.

Set `EXPO_PUBLIC_SCRAPE_DO_TOKEN` in `.env.local`, then restart Expo with `npx expo start -c`.

Important limitation: Scrape.do returns a `booking_token`, but its current Flights API documentation says fare-detail / booking-flow expansion is not exposed. Therefore the app opens the operating airline's official website rather than pretending it has an exact itinerary deep link. When Scrape.do exposes booking expansion, `getAirlineBookingUrl()` in `services/flightService.ts` is the one place to replace.

For production, do not keep the Scrape.do token in an `EXPO_PUBLIC_` variable. Put the API call behind a serverless/backend endpoint so users cannot extract the token from the app bundle.
