# Results-page Gemini visa chatbot

## What changed

- Replaced the Visa Timeline card in `app/onboarding/results.tsx` with an embedded Visa Assistant.
- Added `services/geminiVisaChat.ts`.
- The assistant receives the selected passport, existing visas, route, dates, preferences, itinerary segments, visa requirements, required documents, and suggestions.
- Added quick questions, loading/error states, multi-turn history, and an official-source verification disclaimer.

## Setup

1. Copy `.env.example` to `.env.local`.
2. Add your Gemini API key.
3. Restart Expo with cache clearing: `npx expo start -c`.

The default model is `gemini-2.5-flash`. Override it with `EXPO_PUBLIC_GEMINI_MODEL` if needed.

## Security

`EXPO_PUBLIC_*` variables are included in the client bundle. This is acceptable only for a local prototype. Before publishing the web or mobile app, move the Gemini request to a server/API route and keep the API key server-side.
