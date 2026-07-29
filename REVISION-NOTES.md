# Final Architecture Revision

- Removed the travel score from types, analysis steps, result generation, and UI.
- Added a schema-aligned Scrape.do flight response mapper.
- Preserved multi-segment itineraries, layovers, airline logos, aircraft details, amenities, carbon emissions, price insights, booking tokens, and airport metadata.
- Added deterministic, explainable FlightADVSR recommendation logic.
- Added visa-aware reasons, transit/connection alerts, budget warnings, and a dynamic before-you-fly checklist.
- Rebuilt the results page around FlightADVSR Pick, Why We Recommend This, Visa & Entry, Travel Alerts, Before You Fly, Ask FlightADVSR, and Other Flight Options.
- Airline booking buttons open the airline's official website because exact booking-token expansion is not exposed by the documented endpoint.
