# GalleryUK

Art exhibitions across London, in one place.

A responsive web app (and installable PWA in Phase 4) that brings together
what's on at major London galleries and independent venues. Built with
Next.js 14, TypeScript, and Tailwind CSS.

See `CLAUDE.md` for the project plan and `docs/` for the PRD, design system,
wireframes, and component spec.

## Stack

- **Framework**: Next.js 14 (App Router, React Server Components)
- **Language**: TypeScript (strict, `noUncheckedIndexedAccess`)
- **Styling**: Tailwind CSS + CSS-variable design tokens
- **Data**: JSON seed (MVP) — Supabase planned for v1.1
- **Validation**: Zod schemas with runtime data-integrity checks
- **Icons**: Lucide
- **Deployment**: Vercel

## Requirements

- Node.js ≥ 18.17
- pnpm (recommended) or npm

## Getting started

```bash
# Install dependencies
pnpm install

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

## Project structure

```
app/                      Next.js App Router pages
  page.tsx                Home: featured + now on + coming soon
  exhibitions/            List + detail
  galleries/              List + detail
  map/                    Map (Phase 4 — currently a list fallback)
  search/                 Keyword search (basic filter over seed data)
  about/                  About + contact
  offline/                PWA offline fallback (Phase 4)
  not-found.tsx           404
  layout.tsx              Root layout + metadata
  globals.css             Tokens + base styles

components/
  ui/                     Primitives (Button, Badge, Container, ...)
  exhibition/             ExhibitionCard, ExhibitionHero
  gallery/                GalleryCard, GalleryAvatar
  layout/                 Header, Footer, BottomNav

lib/
  schemas.ts              Zod schemas (Gallery, Exhibition, Category)
  data.ts                 Server-only seed loader with integrity checks
  format.ts               en-GB / Europe/London date & price formatters
  constants.ts            Site metadata + category labels
  utils.ts                cn() = twMerge(clsx(...))

public/
  data/galleries.json     10 London galleries
  data/exhibitions.json   16 exhibitions
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

## Accessibility

- Skip-to-main-content link on every page
- Keyboard focus ring via `:focus-visible` (2px, `--color-focus`)
- Touch targets ≥ 44 × 44 on mobile (padding-based)
- Semantic headings, `aria-label` on icon-only controls
- `prefers-reduced-motion` globally honoured

## Deployment

Deploy to Vercel from this repository. Recommended env:

- `NEXT_PUBLIC_SITE_URL` — canonical URL used for metadata & OG tags

## Roadmap

- **Phase 4**: Google Maps integration, official booking deep links, PWA
  (manifest + Service Worker + offline fallback)
- **Phase 5**: Lighthouse ≥ 90 on all four axes, WCAG 2.1 AA verification,
  real-device testing, production launch

## Licence

Private project — all rights reserved.
