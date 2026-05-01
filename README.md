# FlightAdvsr ✈️ — AI Flight Advisor

An AI-powered flight search and visa checking app built with React Native + Expo.

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install -g expo-cli eas-cli
cd flightadvsr
npm install
```

### 2. Add a FREE AI API key to `.env.local`

#### Google Gemini ⭐ (Recommended)
1. https://aistudio.google.com/app/apikey → Create API Key
2. Paste in `.env.local`: `EXPO_PUBLIC_GEMINI_API_KEY=AIza...`
   Free: 1M tokens/day

#### Groq (Fastest)
1. https://console.groq.com → API Keys → Create
2. `EXPO_PUBLIC_GROQ_API_KEY=gsk_...`

#### OpenRouter (Many free models)
1. https://openrouter.ai → Keys → Create
2. `EXPO_PUBLIC_OPENROUTER_API_KEY=sk-or-...`

> No key? The app still works with a smart offline fallback.

### 3. Run

```bash
npm run web        # Browser at http://localhost:8081
npm start          # Scan QR with Expo Go on your phone
npm run ios        # iOS Simulator (Mac only)
npm run android    # Android Emulator
```

---

## 📱 Deploy to Devices

### iOS — TestFlight
```bash
eas login && eas build:configure
eas build --platform ios --profile preview
eas submit --platform ios
```
Requires Apple Developer account ($99/yr).

### Android — APK sideload
```bash
eas build --platform android --profile preview
# Download .apk → install on device
```

---

## 🏗️ Project Structure

```
flightadvsr/
├── app/
│   ├── _layout.tsx           # Root layout
│   └── index.tsx             # Main AI chat screen
├── components/
│   ├── FlightCard.tsx        # Flight result with visa badges
│   ├── VisaBanner.tsx        # Destination visa status banner
│   └── PassportSelector.tsx  # Country picker modal
├── services/
│   └── aiService.ts          # AI providers + visa logic + flights
├── constants/
│   └── theme.ts              # Orange color palette
└── .env.local                # Your API keys (never commit!)
```

---

## 🔌 Production APIs

| Layer | Service | Notes |
|---|---|---|
| Flights | [Duffel](https://duffel.com) | Live inventory + affiliate revenue |
| Visa data | [Sherpa](https://developersherpa.io) | Used by airlines |
| Flights alt | [Amadeus](https://developers.amadeus.com) | Free sandbox |

---

## ⚠️ Before going live

- Move API keys to a backend proxy (EXPO_PUBLIC_ keys are exposed in the bundle)
- Add Supabase Auth for user accounts
- Replace mock flights with Duffel or Amadeus API
- Add privacy policy + terms (required by App Store & Play Store)
