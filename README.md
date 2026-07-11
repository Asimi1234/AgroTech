# OjàFarm

Mobile-first web app connecting small-scale Nigerian farmers with input
suppliers, aggregators, and buyers. Farmers track commodity prices, browse a
verified marketplace, coordinate through cooperatives, and read crop advisories —
in English, Hausa, Yoruba, or Igbo.

Phase 1 is frontend-only: all data comes from an in-memory mock API behind a
typed interface, so a real backend can drop in without touching the UI.

## What It Does

- **Marketplace** — filter and sort verified product listings, view 30-day price
  history, and contact suppliers directly
- **Dashboard** — commodity prices, weather forecast, crop advisories, and
  quick-stat KPIs at a glance
- **Cooperatives** — browse and join groups, message members, and (for group
  leads) post announcements and edit the group profile
- **Admin** — platform analytics, advisory management, and editable price and
  weather reference data
- **Accounts** — multi-step farmer/supplier signup with validation
- **Four languages** — the entire UI *and* catalog content (products, advisories,
  cooperatives, labels) follow the selected language

## Tech Stack

**Frontend**
- React 18 + TypeScript (strict)
- Vite with route-level code splitting
- Tailwind CSS (mobile-first, high-contrast, 44px tap targets)
- React Router v6
- Zustand for auth and session state (persisted to `localStorage`)
- react-i18next for localization
- Chart.js for price-history charts
- lucide-react icons (behind a shared `Icon` wrapper)

**Data layer**
- A single typed `AgroApi` interface with two implementations: an in-memory
  `MockApi` (Phase 1) and an HTTP `HttpApi` stub ready for the Phase 2 backend

## Getting Started

### Prerequisites
- Node.js 18+

### Local Development

```bash
npm install
cp .env.example .env
npm run dev
```

App runs on `http://localhost:5173` with hot reload.

### Build & Lint

```bash
npm run build     # type-check + production build in dist/
npm run preview   # serve the production build locally
npm run lint      # type-check only (tsc --noEmit)
```

## Project Structure

```
src/
├── components/
│   ├── ui/           # Primitives (Button, Card, Input, Select, Badge, StatTile, BarList, Icon, ...)
│   ├── layout/       # AppLayout, Header, BottomNav, ProfileMenu, Logo
│   ├── dashboard/    # DashboardStats, CommodityPrices, WeatherWidget, AdvisoriesCard, QuickLinks
│   ├── marketplace/  # ProductCard, MarketplaceFilters, PriceRangeSlider, PriceTrendChart
│   ├── admin/        # AdvisoriesManager, AnalyticsPanel
│   ├── motion/       # Reveal, CountUp
│   └── LanguageToggle, HeroImage, LazyImage, ErrorBoundary, ProtectedRoute
├── data/             # mockData.ts — seed products, suppliers, prices, weather, groups
├── hooks/            # useAsync, useProductFeed, useDebouncedValue
├── i18n/             # i18next setup, locale namespaces, catalog.ts (dynamic-data localization)
├── pages/            # One lazy-loaded component per route
├── services/         # api.ts (AgroApi: MockApi + HttpApi), mockAccounts.ts
├── store/            # authStore.ts, groupStore.ts (Zustand)
├── styles/           # animations.css
└── types/            # Shared TypeScript types
```

## How It Works

1. Components read data only through the `api` object in `services/api.ts` —
   never from the mock data directly.
2. `MockApi` serves in-memory data (Phase 1); `HttpApi` calls
   `VITE_API_BASE_URL` (Phase 2). `VITE_USE_MOCK_API` picks the implementation.
3. `useAsync` and `useProductFeed` wrap loaders to power skeletons, inline error
   states, and infinite scroll.
4. UI text comes from react-i18next namespaces; dynamic catalog text (product
   names, advisories, labels) is localized at render time by `i18n/catalog.ts`.
5. Flipping `VITE_USE_MOCK_API=false` swaps in the real backend with no component
   changes — matching the response shapes in `types/index.ts` is all it takes.

## Environment Variables

Configured in `.env` (see `.env.example`):

| Variable               | Purpose                                             | Default                     |
| ---------------------- | --------------------------------------------------- | --------------------------- |
| `VITE_API_BASE_URL`    | Base URL of the Phase 2 backend                     | `http://localhost:4000/api` |
| `VITE_USE_MOCK_API`    | `true` uses the mock layer; `false` uses HTTP calls | `true`                      |
| `VITE_MOCK_LATENCY_MS` | Simulated network delay for mock responses (ms)     | `600`                       |

## Localization

English, Hausa, Yoruba, and Igbo. UI strings live in per-language JSON namespaces
under `src/i18n/locales/`; dynamic catalog content is localized by
`src/i18n/catalog.ts`, which keeps the non-English overrides keyed by entity id
and resolves them against the active language at render time (English is the
source of truth). Switching language updates everything instantly. English is
authoritative; the Hausa, Yoruba, and Igbo strings are best-effort and pending
native-speaker review.

## Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) — stack, routing, data flow, state, and design system
- [API_SPEC.md](API_SPEC.md) — the `AgroApi` contract and data shapes for the Phase 2 backend
- [CONTRIBUTING.md](CONTRIBUTING.md) — code style, color and i18n rules, conventions
