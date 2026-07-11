# Contributing

## Setup

```bash
npm install
cp .env.example .env
npm run dev        # http://localhost:5173
npm run build      # type-check + production build
npm run lint       # tsc --noEmit
```

## Code style

- **TypeScript strict; no `any`.** Type every data structure in `src/types`.
- **Self-documenting names** over comments. Keep comments rare and only for
  non-obvious *why* (never restate the code). Animation code has none by design.
- **Functional components + hooks.** Shared logic goes in `src/hooks`.
- **Tailwind** for styling; use the design tokens (`brand`, `earth`, `accent`),
  not raw hex. Interactive elements: `min-h-tap` (44px) and a visible focus ring
  (`focus-ring`).
- Data access only through the `api` object (`services/api.ts`) — never import
  `data/mockData.ts` for network-shaped data in a component.

## Naming

- Components `PascalCase.tsx`; hooks `useThing.ts`; helpers `camelCase.ts`.
- One page per route in `src/pages`, default-exported for lazy loading.
- Icons: use `<Icon name="…" />` (`components/ui/Icon.tsx`, backed by Lucide). To
  add one, import the Lucide glyph there and map it to a new `IconName` — don't
  inline raw SVG or import Lucide directly in feature code.

## Color usage

- **brand (green)** — primary/default actions and identity.
- **earth (tan)** — surfaces, borders, muted text.
- **accent (orange)** — reserved for the **sign-up conversion path only**
  (header "Sign up free", hero/CTA "Sign up as a farmer", signup submit). Do not
  spread it across ordinary buttons.

## Internationalization

- All user-facing **UI text** must come from a namespace under
  `src/i18n/locales/<lang>/`, via `useTranslation('<ns>')` and `t('key')`.
- **English (`en`) is the source of truth.** When you add a key, add it to all
  four languages; HA/YO/IG values are best-effort until a native-speaker review.
- **Dynamic catalog data is localized too**, but not through the JSON namespaces —
  it goes through `src/i18n/catalog.ts`. English stays the source in
  `data/mockData.ts`; add the HA/YO/IG variant (keyed by the entity id) to
  `catalog.ts` and render via its helpers (`productName`, `commodityLabel`,
  `cooperativeName`, `unitLabel`, `cropLabel`, …). Never render a raw
  `product.name` / `commodity.label` / etc. directly — always through a helper so
  it follows the language.
- **Never translate personal names** (a farmer's or member's name). Everything
  else — including supplier/cooperative/region names — is localized.
- Plurals: `t('key', { count })` with `key_one` / `key_other`. Interpolation:
  `t('key', { name })` with `{{name}}` in the JSON.

## Accessibility

- Semantic HTML; `aria-label` on icon-only controls.
- Maintain ≥ 4.5:1 text contrast; keep all flows keyboard-navigable.
- Respect `prefers-reduced-motion` (handled globally in `animations.css`).

## Anti-"AI-prototype" rules

No emojis, particle effects, floating/bouncing elements, glows, gradients, or
auto-looping decorative animations. No AI-generated imagery. No hype words
("revolutionary", "game-changing"). CTAs use specific verbs ("View prices",
"Sign up"), never "Learn more".

## Pull requests

1. Branch from `main`; keep PRs focused.
2. `npm run build` must pass (type-check clean) with no new console errors.
3. Verify affected pages in the browser, including mobile width (≥ 375px) and at
   least one non-English language.
4. Describe the change and how you tested it.
