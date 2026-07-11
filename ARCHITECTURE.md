# Architecture

OjàFarm is a single-page React application (Vite + TypeScript + Tailwind). Phase 1
is frontend-only: all data comes from an in-memory mock layer behind a typed API
interface, so Phase 2 can swap in real endpoints without touching components.

## Stack

| Concern         | Choice                                             |
| --------------- | -------------------------------------------------- |
| Build/dev       | Vite 5                                             |
| UI              | React 18 + TypeScript (strict)                     |
| Styling         | Tailwind CSS 3 (design tokens in `tailwind.config.js`) |
| Routing         | React Router 6, lazy-loaded routes                 |
| Auth/session    | Zustand + `persist` (localStorage)                 |
| i18n            | react-i18next (+ browser language detector)        |
| Charts          | Chart.js + react-chartjs-2 (product price history) |

## Routing & code-splitting (`src/App.tsx`)

Every page is `React.lazy`-imported, so each route ships its own chunk.

- **Public:** `/` (landing), `/login`, `/signup`
- **Protected** (wrapped in `ProtectedRoute` → `AppLayout`): `/dashboard`,
  `/marketplace`, `/product/:id`, `/groups`, `/admin`
- `/admin` is additionally gated to `role === 'admin'`.
- Unauthenticated access to a protected route redirects to `/login`; wrong-role
  access redirects to `/dashboard`.

## Data flow

```
page/component → api (services/api.ts)
                   ├── MockApi   ← data/mockData.ts   (VITE_USE_MOCK_API=true)
                   └── HttpApi   ← fetch(VITE_API_BASE_URL)  (Phase 2)
```

- **`services/api.ts`** exports a single `AgroApi` interface and picks the
  implementation from `env.useMockApi`. Components import the `api` object only —
  never the mock data directly (for network-shaped data). See `API_SPEC.md`.
- **`hooks/useAsync.ts`** wraps a loader and returns `{ data, loading, error,
  reload }` — this powers the skeleton loaders and inline error states.
- **`hooks/useProductFeed.ts`** adds pagination/infinite-scroll on top of
  `getProducts`, accumulating pages and exposing `loadMore`.

## State management

| State                    | Where                                   | Persistence (localStorage) |
| ------------------------ | --------------------------------------- | -------------------------- |
| User session            | `store/authStore.ts` (Zustand)          | `agrotech-auth`            |
| Signed-up accounts (mock)| `services/mockAccounts.ts`              | `agrotech-accounts`        |
| Group membership & edits | `store/groupStore.ts` (Zustand)         | `agrotech-groups`          |
| Language                 | react-i18next + detector                | `agrotech-lang`            |
| Filters / UI toggles     | Local component state                   | —                          |

There is no global cart — the platform connects buyers and suppliers directly
(contact/inquiry), so no checkout state is needed.

## Internationalization

react-i18next with per-language JSON namespaces under `src/i18n/locales/<lang>/`
(`landing`, `auth`, `common`, `dashboard`, `marketplace`, `groups`, `product`,
`admin`). Components call `useTranslation('<ns>')`. English is authoritative;
`fallbackLng: 'en'`. The choice persists and syncs `<html lang>`.

**Both UI chrome _and_ catalog content follow the language.** UI strings live in
the JSON namespaces above. Dynamic catalog content (product names/descriptions,
commodity/crop/category/region/unit labels, supplier & cooperative names,
advisories, member roles, reviews, messages) is localized by
`src/i18n/catalog.ts`: English is the source of truth in `data/mockData.ts`, and
`catalog.ts` holds only the HA/YO/IG overrides, resolved at **render time** by
helpers (`productName`, `commodityLabel`, `cooperativeName`, …) that read the
active language with an English fallback. Because resolution is at render time,
switching language updates catalog text instantly without re-fetching. Genuine
proper nouns — people's names — are never translated. In Phase 2 the backend
serves already-localized content and this override layer drops away. HA/YO/IG
strings are best-effort and need native-speaker review.

## Design system

Tokens live in `tailwind.config.js`:

- **brand** (forest green) — primary actions, identity
- **earth** (warm tan/sand) — surfaces, borders, neutrals
- **accent** (terracotta orange) — used *sparingly*, only on the sign-up
  conversion path (see `CONTRIBUTING.md`)
- Type: Inter. Tap targets ≥ 44px (`min-h-tap`). Animations in
  `src/styles/animations.css` (300–600ms, `prefers-reduced-motion` aware).
- Icons: **Lucide** (Feather-family, tree-shaken) behind the shared
  `components/ui/Icon.tsx` wrapper — components reference `<Icon name="…" />`, not
  the library directly, so the set can be swapped in one file.

## Error handling

`components/ErrorBoundary.tsx` wraps the app and each route group; every async
fetch renders `components/ui/ErrorState.tsx` with a retry action on failure.

## Component hierarchy

```
src/components/
├── ui/          primitives (Button, Card, Input, Select, Badge, StarRating, Skeleton, StatTile, BarList, Icon…)
├── layout/      AppLayout, Header, BottomNav, ProfileMenu, Logo, navConfig
├── dashboard/   DashboardStats, CommodityPrices, WeatherWidget, AdvisoriesCard, QuickLinks
├── marketplace/ ProductCard, MarketplaceFilters, PriceRangeSlider, PriceTrendChart
├── admin/       AdvisoriesManager, AnalyticsPanel
├── motion/      Reveal, CountUp
├── LanguageToggle, HeroImage, LazyImage, ErrorBoundary, ProtectedRoute
```

The dashboard opens with a `StatTile` KPI row (`DashboardStats`) driven by
`getDashboardSummary`. The groups page splits cooperatives into *my groups* vs
*discover*, lets members join/leave, and gives a group's lead (a member holding a
lead role) inline description editing plus pinned announcements — all persisted in
`groupStore`. The admin dashboard adds an `AnalyticsPanel` (KPI tiles + `BarList`
breakdowns) and an `AdvisoriesManager` that creates/edits/deletes advisories
through the API, so edits surface on the farmer dashboard within the session.

## Key decisions

- **Mobile-first navigation:** sticky top nav on desktop + fixed bottom nav on
  mobile, instead of a sidebar — the audience is largely on phones.
- **Real photography only** for the hero (`public/hero.jpg`); no AI/stock imagery.
  Marketplace product images are lightweight generated placeholders pending real
  photos from the backend.
- **Internal identifiers stay `agrotech-*`** (storage keys, package name) even
  though the brand is OjàFarm — renaming would drop existing sessions/accounts.
