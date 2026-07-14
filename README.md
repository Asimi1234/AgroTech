# OjàFarm

Mobile-first web app connecting small-scale Nigerian farmers with input
suppliers, aggregators, and buyers. Farmers track commodity prices, browse a
verified marketplace, coordinate through cooperatives, and read crop advisories —
in English, Hausa, Yoruba, or Igbo.

The UI talks only to a typed `AgroApi` interface, which has three
implementations: a zero-setup **in-memory mock**, an **HTTP stub**, and a **live
Supabase backend** (Auth, Postgres with Row Level Security, and Edge Functions).
Run it fully mock with no backend, or point it at Supabase — no component changes
either way.

## What It Does

- **Marketplace** — filter and sort verified product listings, view 30-day price
  history, and contact suppliers directly.
- **Dashboard** — commodity prices, a live 5-day weather forecast, crop
  advisories, and quick-stat KPIs at a glance.
- **Supplier tools** — suppliers add, edit, and delete their own listings; buyer
  inquiries land on their dashboard.
- **Admin** — platform analytics plus editable, persisted reference data: set
  commodity prices, add/remove commodities, edit regional weather, manage crop
  advisories, and activate/deactivate users.
- **Cooperatives** — browse and join groups, message members, and (for group
  leads) post announcements and edit the group profile.
- **Accounts** — sign up as a farmer or supplier with phone + an optional email;
  log in with **email or phone + PIN**. Sessions time out on inactivity.
- **Live weather** — a scheduled job ingests a 5-day forecast for every Nigerian
  state from Open-Meteo, so the dashboard shows real data (admins can override).
- **Four languages** — the entire UI *and* dynamic content (products, advisories,
  cooperatives, labels) follow the selected language.

## Tech Stack

**Frontend**
- React 18 + TypeScript (strict)
- Vite with route-level code splitting
- Tailwind CSS (mobile-first, high-contrast, 44px tap targets)
- React Router v6
- Zustand for auth/session state (persisted to `localStorage`)
- react-i18next for localization
- Chart.js for price-history charts
- lucide-react icons (behind a shared `Icon` wrapper)

**Backend (Supabase)**
- Supabase Auth (email/password; phone maps to a synthetic email, PIN → password)
- Postgres with Row Level Security on every table
- An Edge Function (`sync-weather`) + `pg_cron` that refreshes weather from
  [Open-Meteo](https://open-meteo.com) every 3 hours (no API key required)

**Data layer**
- One typed `AgroApi` interface with three implementations — `MockApi`
  (in-memory), `HttpApi` (REST stub), and `SupabaseApi` (live). `VITE_USE_MOCK_API`
  and the presence of Supabase credentials pick the backend.

**Testing & tooling**
- Vitest unit tests over the core logic
- GitHub Actions CI: typecheck → tests → build on every push/PR

## Getting Started

### Prerequisites
- Node.js 22+ (the Supabase SDK requires ≥22; CI runs Node 24). Node 20 is fine
  for mock-only development.

### Local development (mock backend, zero setup)

```bash
npm install
cp .env.example .env      # defaults to the mock API — no backend needed
npm run dev
```

App runs on `http://localhost:5173` with hot reload. Demo logins (phone + PIN
`1234`) appear on the sign-in screen in dev.

### Running against Supabase

1. Set `VITE_USE_MOCK_API=false` and fill `VITE_SUPABASE_URL` /
   `VITE_SUPABASE_ANON_KEY` in `.env`.
2. Apply the SQL in `supabase/` (see [Backend & Supabase](#backend--supabase)).
3. Deploy the `sync-weather` Edge Function and schedule it.

### Build, lint & test

```bash
npm run build     # type-check (tsc) + production build in dist/
npm run preview   # serve the production build locally
npm run lint      # type-check only (tsc --noEmit)
npm run test      # run the Vitest suite
npm run test:watch
```

## Project Structure

```
src/
├── components/
│   ├── ui/           # Primitives (Button, Card, Input, Select, Badge, StatTile, Icon, ...)
│   ├── layout/       # AppLayout, Header, BottomNav, ProfileMenu, Logo
│   ├── dashboard/    # CommodityPrices, WeatherWidget, AdvisoriesCard, QuickLinks
│   ├── marketplace/  # ProductCard, MarketplaceFilters, PriceRangeSlider, PriceTrendChart
│   ├── admin/        # AdvisoriesManager, AnalyticsPanel
│   ├── motion/       # Reveal, CountUp
│   └── LanguageToggle, LazyImage, ErrorBoundary, ProtectedRoute
├── config/           # env.ts — typed environment config
├── data/
│   ├── reference.ts  # fixed reference data shared by all backends (states, categories, crops, labels)
│   └── mockData.ts   # mock-backend fixtures only
├── hooks/            # useAsync, useProductFeed, useIdleTimeout, useDebouncedValue
├── i18n/             # i18next setup, locale namespaces, catalog.ts (dynamic-data localization)
├── pages/            # One lazy-loaded component per route
├── services/
│   ├── api.ts        # AgroApi: MockApi + HttpApi + SupabaseApi (+ api.test.ts)
│   ├── supabase.ts   # shared Supabase client
│   ├── session.ts    # client-side inactivity timeout
│   └── mockAccounts.ts
├── store/            # authStore.ts, groupStore.ts (Zustand)
└── types/            # Shared TypeScript types

supabase/
├── align_schema.sql          # schema alignment + backfills
├── auth_rls.sql              # Supabase Auth model + RLS policies + role-guard trigger
├── security_hardening.sql    # closes the demo-admin path; scopes inquiry reads
├── users_directory_rls.sql   # scopes who can read user contact info
├── commodities.sql           # commodity reference table (names/units), admin-managed
├── seed_weather.sql          # optional seed forecast
├── content_i18n.sql          # optional backend-served translations
├── schedule_weather_sync.sql # pg_cron schedule for the weather job
└── functions/sync-weather/   # Edge Function: Open-Meteo → weather table
```

## How It Works

1. Components read/write data only through the `api` object in `services/api.ts` —
   never from mock data directly.
2. `VITE_USE_MOCK_API=true` selects `MockApi`; `false` selects `SupabaseApi` when
   credentials are present (or `HttpApi` otherwise). All three satisfy the same
   `AgroApi` contract, so swapping backends needs no component changes.
3. Auth runs on Supabase Auth: a real email (if provided) or a synthetic
   `<phone>@ojafarm.local` is the login identity, with the PIN as the password.
   Login accepts email or phone; the role comes from the profile.
4. `useAsync` / `useProductFeed` wrap loaders to power skeletons, inline error
   states, and infinite scroll.
5. UI text comes from react-i18next namespaces; dynamic content (product names,
   advisories, labels) is localized at render time by `i18n/catalog.ts`, with the
   backend able to serve per-row translations that take precedence.

## Backend & Supabase

Apply the SQL files in the Supabase SQL editor in this order (each is idempotent):

1. `align_schema.sql`
2. `auth_rls.sql` — then, in the dashboard, **uncheck "Confirm email"** under
   Authentication → Providers → Email (synthetic phone emails can't be confirmed).
3. `security_hardening.sql`
4. `users_directory_rls.sql`
5. `commodities.sql`
6. `seed_weather.sql` and `content_i18n.sql` (optional seeds)

Then set up automatic weather ingestion:

```bash
supabase functions deploy sync-weather --no-verify-jwt
supabase secrets set CRON_SECRET=<a-long-random-string>
```

…and run `schedule_weather_sync.sql` (with your `CRON_SECRET` filled in) to run
the job every 3 hours via `pg_cron`.

Bootstrap the first admin from the SQL editor (owner bypasses the role guard):

```sql
update public.users set role = 'admin' where phone = '<your-phone>';
```

## Security

- **Row Level Security on every table** — public read where appropriate; writes
  scoped to the owner (e.g. a supplier edits only their own products) or admins.
- **Role-escalation guard** — a trigger prevents non-admins from creating or
  self-assigning the `admin` role.
- **PII scoped** — buyer inquiry contact details are readable only by the owning
  supplier; the user directory is not bulk-readable by arbitrary accounts.
- **Auth hardening** — 6-digit PINs for new accounts, tightened sign-in rate
  limits, and a client + (optionally) server session inactivity timeout.
- Demo credentials are gated behind `VITE_ENABLE_DEMO` and never shipped to
  production builds.

## Testing & CI

- `npm run test` runs Vitest over the trickiest pure logic — price aggregation,
  weather-forecast building, email/phone identifier resolution, crop-vocabulary
  mapping, slug generation, and account lookup.
- `.github/workflows/ci.yml` runs typecheck + tests + build on every push and PR.

## Environment Variables

Configured in `.env` (see `.env.example`):

| Variable                 | Purpose                                                        | Default                       |
| ------------------------ | -------------------------------------------------------------- | ----------------------------- |
| `VITE_USE_MOCK_API`      | `true` uses the in-memory mock; `false` uses Supabase/HTTP     | `true`                        |
| `VITE_SUPABASE_URL`      | Supabase project URL (used when mock is off)                   | —                             |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key                                         | —                             |
| `VITE_API_BASE_URL`      | HTTP backend base URL (also normalized to the project URL)     | `http://localhost:4000/api`   |
| `VITE_MOCK_LATENCY_MS`   | Simulated network delay for mock responses (ms)                | `600`                         |
| `VITE_ENABLE_DEMO`       | Show demo-login helpers (on in dev, off in prod unless set)    | dev-only                      |

## Localization

English, Hausa, Yoruba, and Igbo. UI strings live in per-language JSON namespaces
under `src/i18n/locales/`; dynamic content is localized by `src/i18n/catalog.ts`,
which resolves per-language overrides against the active language at render time.
The Supabase backend can serve per-row translations (a `translations` column) that
take precedence over the static catalog, which then acts as a fallback. English is
authoritative; the Hausa, Yoruba, and Igbo strings are best-effort and pending
native-speaker review.

## Deployment

The frontend deploys to Vercel (`vercel.json`); the backend is Supabase (Postgres,
Auth, Edge Functions, cron). Set the `VITE_*` variables in the host's environment
and keep `VITE_ENABLE_DEMO` unset in production.

## Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) — stack, routing, data flow, state, and design system
- [API_SPEC.md](API_SPEC.md) — the `AgroApi` contract and data shapes
- [CONTRIBUTING.md](CONTRIBUTING.md) — code style, color and i18n rules, conventions
