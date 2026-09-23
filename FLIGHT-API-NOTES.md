# Live flight integration

The onboarding analysis now calls `GET https://api.scrape.do/plugin/google/flights` using the selected IATA airports, dates, passenger count, cabin class, stop preference, sort priority, and currency.

Set `EXPO_PUBLIC_SCRAPE_DO_TOKEN` in `.env.local`, then restart Expo with `npx expo start -c`.

Booking links: Scrape.do returns a `booking_token`, but it doesn't expose Google's booking-options call, so we can't get the airline's checkout URL directly. Instead, `services/googleFlightsLink.ts` builds a Google Flights link (`tfs` parameter) that preselects the recommended flight numbers, dates, cabin and passenger count:

- One-way trips open Google Flights' "Booking options" page for that exact flight; one click continues to the airline's checkout.
- Round trips open with the outbound flight selected; the traveler picks a return, then books.
- If a segment's flight number or date can't be parsed, the link falls back to a prefilled search for the same route, dates, cabin and passengers.

The `tfs` format is undocumented and could change. If links start landing on Google's "itinerary no longer available" page, check the encoding there first.

For production, do not keep the Scrape.do token in an `EXPO_PUBLIC_` variable. Put the API call behind a serverless/backend endpoint so users cannot extract the token from the app bundle.
