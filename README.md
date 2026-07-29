# FlightAdvsr — AI-Powered Travel Intelligence App

**Student:** Neri Bautista  
**Course:** Practical Submission — SPARE (25 pts)  
**Professor:** Steven Singer  
**Semester:** Spring 2026  

---

## 🛫 What I Built

**FlightAdvsr** is a full-stack AI-powered travel intelligence web/mobile application that helps travelers check visa requirements, flight routes, and entry restrictions in real time — all based on their passport nationality.

Instead of manually searching embassy websites or third-party visa checkers, users simply type a route like `JFK to Tokyo` or `PHL to AUS` and FlightAdvsr instantly:

- Detects whether the route is **domestic or international**
- Checks **visa requirements** for the user's passport (190+ countries)
- Flags **layover transit visa rules** (e.g. a US passport holder transiting Dubai)
- Provides an **AI chat assistant** built into the dashboard for natural language travel queries
- Displays **flight cards** with pricing, duration, stops, and booking links

**Live App:** https://flightadvsr.vercel.app/  
**GitHub:** https://github.com/neribautista/flightadvsr

---

## 🛠 Tools & Technologies Used

| Category | Technology |
|----------|-----------|
| Framework | React Native + Expo (web + mobile) |
| Language | TypeScript |
| Routing | Expo Router (file-based routing) |
| AI Integration | Anthropic Claude API (claude-sonnet) |
| Deployment | Vercel (free tier) |
| Styling | React Native StyleSheet |
| Data | Passport Index JSON (190+ countries) |
| Package Manager | npm |

---

## 📁 Project File Structure

```
flightadvsr-app/
├── app/
│   ├── index.tsx          # Main dashboard screen (sidebar, stats, flight cards, AI chat)
│   ├── _layout.tsx        # Root layout with Expo Router Stack
│   └── +not-found.tsx     # 404 fallback route
├── components/
│   ├── FlightCard.tsx     # Flight result card with visa pill badges
│   ├── VisaBanner.tsx     # Destination visa status banner
│   └── PassportSelector.tsx  # Country passport picker modal
├── services/
│   └── aiService.ts       # Core AI service: route parsing, visa lookup, message handling
├── data/
│   └── passportIndex.json # Passport visa data for 190+ countries
├── constants/
│   └── theme.ts           # Global color tokens and design system
└── README.md
```

---

## ✨ Key Features

### 1. AI Chat Assistant
Integrated directly into the dashboard via a floating chat button. Users can ask in plain English:
- `"PHL to AUS"` → detects domestic US route, no visa needed
- `"JFK to Tokyo"` → returns visa-free status for US passport, 90 days
- `"fly from Manila to Dubai"` → returns visa on arrival info for PH passport

### 2. Passport Intelligence
Users select their passport country from 20+ options. All visa results are calculated based on that selection dynamically.

### 3. Dashboard Layout
- Left sidebar navigation (tablet) / top nav (mobile)
- Stats row: avg fare, routes, visa-free %, savings
- Flight results section using real FlightCard components
- Visa Intelligence section with "Ask AI" shortcuts
- Right panel: featured deal, passport intel, recent activity

### 4. Domestic Route Detection
The app automatically detects when both origin and destination are in the same country and responds accordingly instead of showing unnecessary visa info.

---

## ⚙️ How to Run Locally

```bash
# Clone the repository
git clone https://github.com/neribautista/flightadvsr.git
cd flightadvsr

# Install dependencies
npm install

# Start development server
npx expo start --clear

# Open in browser
Press W to open web
```

**Environment Variables Required:**  
Create a `.env.local` file:
```
EXPO_PUBLIC_GEMINI_API_KEY=your_key_here
```

---

## 🧱 Challenges Encountered

### 1. Metro Bundler — Dynamic Require Error
**Problem:** The `i18n-iso-countries` and `airport-codes` packages used dynamic `require()` calls inside loops, which Metro (React Native's bundler) does not support.  
**Solution:** Removed both packages entirely and replaced them with a comprehensive inline IATA → ISO country code map (200+ airports) and a city/country name map directly in `aiService.ts`.

### 2. Expo Router — Unmatched Route
**Problem:** After restructuring files, Expo Router showed "Unmatched Route" on the web build.  
**Solution:** Ensured `app/index.tsx` was the correct entry point, added the required `app/+not-found.tsx` fallback route, and confirmed `"main": "expo-router/entry"` in `package.json`.

### 3. Natural Language Route Parsing
**Problem:** Users typed routes in many formats (`PHL to AUS`, `fly from Manila to Tokyo`, `I want to go to Japan`) — a single regex couldn't handle all cases.  
**Solution:** Built a multi-step parser with 4 pattern matchers: IATA pair, "from X to Y", natural language intent, and simple "to [place]" fallback.

### 4. UI Contrast & Readability
**Problem:** On dark backgrounds, many text elements using muted color tokens were nearly invisible on web.  
**Solution:** Audited every style and replaced dim `Colors.textMuted` / `Colors.textSub` references with explicit high-contrast hex values across 20+ style rules.

### 5. Domestic vs. International Logic
**Problem:** Users searching domestic routes (e.g. PHL to AUS — both US airports) were getting no response because the visa lookup returned null for same-country routes.  
**Solution:** Added a `isDomestic` check comparing `fromCountry === toCountry` before the visa lookup, returning a friendly domestic flight message instead.

---

## 📸 Screenshots

> See `/screenshots` folder for UI screenshots of:
> - Dashboard view (desktop)
> - AI chat panel open
> - Flight cards with visa badges
> - Passport selector modal

---

## 🎓 Reflection

This project pushed me to apply real-world software engineering practices under a tight deadline — one week from idea to deployed product. The biggest lesson was that **building something real surfaces problems that tutorials never show you**: bundler incompatibilities, routing edge cases, API integration quirks, and UI issues that only appear on actual devices.

The experience of shipping a live, working AI-integrated application is something I'll carry directly into my career.

---

*Built with 💙 in one week | Spring 2026 | FlightAdvsr*
