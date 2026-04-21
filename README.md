# GalleryUK

Art exhibitions across London, in one place.

A responsive web app + installable PWA that brings together what's on at
major London galleries and independent venues. Built with Next.js 14,
TypeScript, and Tailwind CSS.

See `CLAUDE.md` for the project plan and `docs/` for the PRD, design system,
wireframes, and component spec.

## Stack

- **Framework**: Next.js 14 (App Router, React Server Components)
- **Language**: TypeScript (strict, `noUncheckedIndexedAccess`)
- **Styling**: Tailwind CSS + CSS-variable design tokens
- **Data**: JSON seed (MVP) — Supabase planned for v1.1
- **Validation**: Zod (schemas + API query validation)
- **Icons**: Lucide
- **Maps**: Google Maps JS API via `@react-google-maps/api` (+ MarkerClusterer)
- **PWA**: Next 14 manifest + handcrafted Service Worker in `public/sw.js`
- **Deployment**: Vercel

## Requirements

- Node.js ≥ 18.17
- pnpm (recommended) or npm

## Getting started

```bash
# Install dependencies
pnpm install

# Copy env template and fill in keys as needed
cp .env.example .env.local

# Run the dev server (http://localhost:3000)
pnpm dev

# Type-check
pnpm typecheck

# Lint
pnpm lint

# Production build
pnpm build
pnpm start
```

## Environment variables

| Name | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | No | Canonical URL for metadata / OG tags. Defaults to `https://galleryuk.vercel.app`. |
| `NEXT_PUBLIC_GMAPS_KEY` | No (recommended) | Google Maps JS API key used on `/map`. Without it the map page falls back to a list-only view. Restrict the production key by HTTP referrer. |

## Project structure

```
app/
  layout.tsx                Root: html/body, metadata, SW registration
  globals.css               Tokens + base styles
  manifest.ts               PWA Web App Manifest (served as /manifest.webmanifest)
  not-found.tsx             Root 404
  offline/page.tsx          PWA navigation fallback
  (site)/                   Route group that owns the site chrome
    layout.tsx              Header + Footer + BottomNav + skip link
    page.tsx                Home: featured + now on + coming soon
    exhibitions/            List + detail (SSG)
    galleries/              List + detail (SSG)
    map/                    Google Maps with graceful fallback
    search/                 Debounced client search over /api
    about/                  About + contact
  api/
    exhibitions/route.ts    GET: filter by status/category/q/limit
    galleries/route.ts      GET: galleries with activeCount

components/
  ui/                       Primitives (Button, Badge, Container, ...)
  exhibition/               ExhibitionCard, ExhibitionHero
  gallery/                  GalleryCard, GalleryAvatar
  layout/                   Header, Footer, BottomNav
  map/LondonMap.tsx         Google Maps client island
  search/SearchClient.tsx   Debounced CSR search
  pwa/ServiceWorkerRegistrar.tsx

lib/
  schemas.ts                Zod schemas (Gallery, Exhibition, Category)
  data.ts                   Server-only seed loader with integrity checks
  api.ts                    Query schemas + shared exhibition filter
  format.ts                 en-GB / Europe/London date & price formatters
  constants.ts              Site metadata + category labels
  utils.ts                  cn() = twMerge(clsx(...))

public/
  data/galleries.json       10 London galleries
  data/exhibitions.json     16 exhibitions
  icons/                    SVG app icons (see below for PNG note)
  sw.js                     Service Worker (manual)
```

## Data

The MVP uses static JSON seed files in `public/data/`. Both files are
validated with Zod on first read; the loader throws at build time if any
exhibition references an unknown `galleryId`, so broken data fails fast.

Add a new exhibition:

1. Add an entry to `public/data/exhibitions.json` that matches
   `ExhibitionSchema` in `lib/schemas.ts`.
2. Use an existing `galleryId` (or add the gallery first).
3. Rebuild — the cache is keyed per process.

## API

Route handlers are read-only for the MVP and live under `app/api/*`.

- `GET /api/exhibitions?status=&category=&q=&limit=` — `ExhibitionsQuerySchema`
  in `lib/api.ts` validates input; returns `{ count, exhibitions }` with
  `Cache-Control: public, s-maxage=300, stale-while-revalidate=60`.
- `GET /api/galleries` — returns `{ count, galleries }` where each gallery
  carries an `activeCount` of exhibitions currently on.

## PWA

- Manifest is generated from `app/manifest.ts` (served as
  `/manifest.webmanifest`).
- Icons are SVG (`public/icons/*.svg`). For store-grade polish, export
  512 / 192 / 180 PNGs from `icon.svg` and add them to the manifest; the
  current SVGs are valid per spec but some older Androids prefer PNG.
- `public/sw.js` implements:
  - network-first for navigations, fallback to cache, then `/offline`;
  - stale-while-revalidate for `/api/*` and same-origin static assets;
  - cache-first (LRU ~60) for images.
- Registration happens in `ServiceWorkerRegistrar` only when
  `NODE_ENV === 'production'`. Test with `pnpm build && pnpm start`.

## Accessibility

- Skip-to-main-content link on every site page
- Keyboard focus ring via `:focus-visible` (2px, `--color-focus`)
- Touch targets ≥ 44 × 44 on mobile (padding-based)
- Semantic headings, `aria-label` on icon-only controls
- `prefers-reduced-motion` globally honoured

## Deployment

Deploy to Vercel from this repository.

1. Set `NEXT_PUBLIC_SITE_URL` to your canonical URL.
2. Set `NEXT_PUBLIC_GMAPS_KEY` if you want the interactive map.
3. In Google Cloud Console, restrict the key to your production domains
   by HTTP referrer.
4. Deploy — `main` is Production, `claude/*` branches are Preview.

## Roadmap

- **Phase 5**: Lighthouse ≥ 90 on all four axes, WCAG 2.1 AA verification,
  real-device testing, production launch.
- **v1.1+**: Supabase data layer, favourites, notifications.

## Licence

Private project — all rights reserved.
