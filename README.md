# OjàFarm — Frontend (Phase 1)

A mobile-first web application connecting small-scale Nigerian farmers with input
suppliers, aggregators, and buyers. This repository contains the **frontend UI
prototype only**. All data is served by an in-memory mock API layer; a real
backend is planned for Phase 2.

## Tech stack

- **React 18 + TypeScript**
- **Vite** build tooling with route-level code splitting
- **Tailwind CSS** for styling (mobile-first, high-contrast, 44px tap targets)
- **React Router v6** for navigation
- **Zustand** for lightweight auth state (persisted to `localStorage`)

## Getting started

Requires Node.js 18+.

```bash
# 1. Install dependencies
npm install

# 2. Create your local environment file
cp .env.example .env

# 3. Start the dev server
npm run dev
```

Then open the printed URL (default http://localhost:5173).

### Other scripts

```bash
npm run build     # Type-check and produce a production build in dist/
npm run preview   # Serve the production build locally
npm run lint      # Type-check only (tsc --noEmit)
```

## Demo login

The mock auth layer accepts the following accounts (shared PIN: **1234**). Use
the **Fill demo credentials** button on the login screen to auto-fill the
selected role.

| Role     | Phone         | PIN  |
| -------- | ------------- | ---- |
| Farmer   | 08034451200   | 1234 |
| Supplier | 08031112200   | 1234 |
| Admin    | 07000000000   | 1234 |

The **Admin** account additionally unlocks the Admin Dashboard route.

## Pages

| Route            | Description                                                        |
| ---------------- | ----------------------------------------------------------------- |
| `/`              | Public landing page (hero, features, CTAs, language toggle)       |
| `/login`         | Role selection (farmer / supplier / admin) + mock sign in         |
| `/signup`        | New farmer/supplier registration with validation (stored locally) |
| `/dashboard`     | KPI stat row, commodity prices, weather, crop advisories, quick links |
| `/marketplace`   | Filterable, sortable product listings with lazy-loaded images     |
| `/product/:id`   | Product detail, supplier info, price history, reviews, inquiry    |
| `/groups`        | Browse/join cooperatives, member lists, lead editing + announcements, messaging UI |
| `/admin`         | Platform analytics, advisory management, editable price/weather tables, user activity (admin only) |

## Project structure

```
src/
├── components/
│   ├── ui/            Reusable primitives (Button, Card, Input, StarRating, ...)
│   ├── layout/        Header, BottomNav, ProfileMenu, AppLayout
│   ├── dashboard/     Dashboard widgets
│   ├── marketplace/   Product card, filters, price slider, price chart
│   ├── LazyImage.tsx  IntersectionObserver-based lazy image loader
│   └── ErrorBoundary.tsx
├── config/env.ts      Typed environment-variable access
├── data/mockData.ts   Farmers, suppliers, products, prices, weather, groups
├── hooks/             useAsync, useDebouncedValue
├── pages/             One file per route (lazy-loaded)
├── services/api.ts    Mock + HTTP API implementations of a shared interface
├── store/authStore.ts Zustand auth store
└── types/index.ts     Shared TypeScript types for all data structures
```

## Environment variables

Configured in `.env` (see `.env.example`):

| Variable                | Purpose                                             | Default                     |
| ----------------------- | --------------------------------------------------- | --------------------------- |
| `VITE_API_BASE_URL`     | Base URL of the Phase 2 backend                     | `http://localhost:4000/api` |
| `VITE_USE_MOCK_API`     | `true` uses the mock layer; `false` uses HTTP calls | `true`                      |
| `VITE_MOCK_LATENCY_MS`  | Simulated network delay for mock responses (ms)     | `600`                       |

## Design notes

- **No decorative imagery or emojis.** Product images are lightweight generated
  SVG placeholders; text is prioritized for outdoor readability.
- **Skeleton loaders** cover every async fetch for fast perceived load times.
- **Lazy loading**: routes are code-split and listing images load on scroll.
- **Accessibility**: high-contrast text, keyboard-focusable controls with focus
  rings, ARIA labels on ratings and status regions, and 44px minimum tap targets.
- **Error handling**: an `ErrorBoundary` wraps the app and each route; every data
  fetch has an inline error state with a retry action.

## Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) — stack, routing, data flow, state, design
  system, and key decisions.
- [API_SPEC.md](API_SPEC.md) — the `AgroApi` mock/HTTP contract and data shapes
  for the Phase 2 backend.
- [CONTRIBUTING.md](CONTRIBUTING.md) — code style, color/i18n rules, and the
  anti-"AI-prototype" checklist.

## Hero photo

The hero uses a **real photograph**, not an illustration. Add your image and it
appears automatically; until then a dashed "add a real photo here" placeholder is
shown.

1. Save an authentic photo as `public/hero.jpg` (a 4:3 landscape crop works best).
2. Update the `alt` text in `src/components/HeroImage.tsx` to describe the actual
   photo.

**Sourcing policy:**

- Use your own photography, or real photography you have licensed for commercial
  use. Show authentic farming context — a person in a field, a market
  transaction, or close-up hands.
- **Do not** use AI-generated images, generic startup stock art, or unlicensed
  images.
- If you want an illustration instead, commission a human artist (e.g. Fiverr) —
  don't substitute an AI-generated one.

## Languages (i18n)

The landing page has a language toggle (English / Hausa / Yoruba / Igbo) that
translates **every section** — nav, hero, all cards, CTA, and footer. It's built
on **[react-i18next](https://react.i18next.com/)**:

- Strings live in per-language JSON namespaces under
  [`src/i18n/locales/<lang>/`](src/i18n/locales/) — `landing`, `auth`
  (login/signup), `common` (nav, profile menu, error states), `dashboard`,
  `marketplace`, `groups`, `product` and `admin` — the standard,
  translator-friendly format.
- The language toggle is a shared component
  ([`src/components/LanguageToggle.tsx`](src/components/LanguageToggle.tsx)) shown
  in the landing header, on the auth screens, and in the authenticated app header.
- i18next is initialised once in [`src/i18n/index.ts`](src/i18n/index.ts)
  (imported from `main.tsx`) with `fallbackLng: 'en'`.
- Language auto-detects and persists via `i18next-browser-languagedetector`
  (localStorage key `agrotech-lang`); the `languageChanged` event keeps
  `<html lang>` in sync.
- Components read strings with `useTranslation('landing')` and `t('hero.badge')`;
  structured lists use `t('why.items', { returnObjects: true })`.
- The toggle calls `i18n.changeLanguage(code)`.

> ⚠️ **English is authoritative. The Hausa / Yoruba / Igbo files are best-effort
> machine translations and must be reviewed by a native speaker before launch.**
> To correct a string, edit its value in the relevant `locales/<lang>/landing.json`.

**Catalog content is localized as well.** Product names/descriptions, commodity,
crop, category, region and unit labels, supplier and cooperative names,
advisories, member roles, reviews and messages all follow the language — via
[`src/i18n/catalog.ts`](src/i18n/catalog.ts), which holds the HA/YO/IG overrides
keyed by entity id and resolves them at render time (English source in
`data/mockData.ts` is the fallback). Only personal names are left untranslated.

**Coverage:** **every page is translated** — landing, auth (login/signup), the app
shell (top nav, mobile bottom nav, profile menu, error states), the farmer
dashboard, the marketplace, the groups page, the product-detail page, and the
admin dashboard.

Both UI chrome **and** catalog content are translated. Switching language updates
catalog text instantly (resolution happens at render time, so no re-fetch). In
Phase 2 the backend serves already-localized content and the override layer in
`catalog.ts` drops away.

**Adding a new page/namespace:** the i18next instance is global, so it's just
adding a namespace JSON under each `locales/<lang>/` folder and calling
`useTranslation('<namespace>')` in the page.

## Landing page animations

All landing-page motion is vanilla CSS transitions/keyframes + the Intersection
Observer API (no animation libraries). Timing and easing live as CSS variables in
[`src/styles/animations.css`](src/styles/animations.css); scroll-progress logic is
in [`src/lib/animations.ts`](src/lib/animations.ts). Everything is disabled under
`@media (prefers-reduced-motion: reduce)`, and only GPU-friendly properties
(`opacity`, `transform`) are animated.

### Easing & timing reference

| Token             | Value                                    | Used for                                             |
| ----------------- | ---------------------------------------- | ---------------------------------------------------- |
| `--ease-out`      | `cubic-bezier(0.16, 1, 0.3, 1)`          | Scroll reveals & hero fade-up (expressive entrance)  |
| `--ease-standard` | `cubic-bezier(0.25, 0.46, 0.45, 0.94)`   | Hover lift, icon scale, underline, CTA hover         |
| `--dur-fast`      | `200ms`                                  | Hover interactions (lift, icon scale, CTA)           |
| `--dur-base`      | `400ms`                                  | Fade-in / slide-up reveals, hero stagger             |
| `--dur-slow`      | `600ms`                                  | Reserved for longer sequences                        |

### What animates where

| Section        | Animation                                                              |
| -------------- | ---------------------------------------------------------------------- |
| Hero           | Staggered fade-up on load (100ms apart); illustration is static        |
| Problem cards  | Fade-in on scroll; `translateY(-4px)` lift on hover                     |
| How it works   | Sequential reveal (150ms apart); progress line fills L→R on scroll      |
| Feature cards  | Fade-in on scroll; icon `scale(1.1)` on hover                          |
| Testimonials   | Fade-in on scroll; quote underline wipes in (`scaleX` 0→1) on hover     |
| CTA buttons    | Color transition + shadow deepen on hover (200ms)                      |
| Page chrome    | Top scroll-progress bar (`scaleX`); header shadow appears on scroll     |

## Phase 2 handoff

The entire data contract lives in [`src/services/api.ts`](src/services/api.ts),
which exports a single `AgroApi` interface with two implementations:

- `MockApi` — the current in-memory layer (Phase 1).
- `HttpApi` — a stub that calls `fetch` against `VITE_API_BASE_URL` (Phase 2).

To connect a real backend:

1. Fill in the `HttpApi` methods to match your endpoints (paths are already
   stubbed).
2. Ensure responses match the types in `src/types/index.ts`.
3. Set `VITE_USE_MOCK_API=false` in `.env`.

No page or component imports the mock data directly for network-shaped data —
they depend only on the `api` object — so **no component changes are required**
to switch to the real backend.
# AgroTech
