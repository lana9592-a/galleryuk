# GalleryUK QA Plan

> Scope: v1.0 MVP release candidate (Phase 5). 4-axis quality targets, test
> pyramid, environments, entry/exit criteria, and concrete scenarios. Used
> by `agents/qa.md` to execute and record results.

## 1. Quality Targets

| Axis | Target | Measurement |
|---|---|---|
| Functional | 100% AC in `docs/user-stories.md` pass | Manual + E2E |
| A11y | WCAG 2.1 AA + axe violations = 0 | axe-core scan per page |
| Performance | Lighthouse mobile Perf/A11y/Best/SEO ≥ 90 | Lighthouse CI |
| Compat | Latest two Chrome/Safari/Firefox + iOS Safari + Android Chrome | Manual + BrowserStack |
| Security | Ext-link rel ok, API Zod reject invalid | Static scan + E2E |
| PWA | Installable + offline fallback | Lighthouse + device |

Exit criteria: **Blocker 0, Major 0, Lighthouse 4/4 ≥ 90, a11y violations 0, 3+ real devices green.**

## 2. Test Pyramid

```
          ┌──────────────┐
          │   E2E (6)    │  Playwright, core flows only
          ├──────────────┤
          │ Integration  │  Route Handler schema + server page render
          │     (~6)     │
          ├──────────────┤
          │  Unit (47)   │  ✅ shipped: schemas / format / api filter / routes
          └──────────────┘
```

Current status:
- Unit: **47 tests passing** (`tests/unit/*.spec.ts` via Vitest).
- Integration + E2E: **planned**, not yet executed in this sandbox environment.

## 3. Environments

| Env | Purpose | URL |
|---|---|---|
| Local | `pnpm dev` for fast iteration | http://localhost:3000 |
| Preview | Branch auto-deploy on Vercel | `claude-*.vercel.app` |
| Production | `main` on Vercel | TBD |

Real devices for compat pass: iPhone 12 / Safari, Pixel 5 / Chrome, MacBook / Safari, Windows / Edge, iPad / Safari.

## 4. Functional Scenarios

Derived from `docs/user-stories.md` and PRD §5. Each row maps to an Acceptance Criterion.

| ID | Scenario | Expected |
|---|---|---|
| F-01 | Home first paint | Featured hero + 'Now on' + 'Coming soon' sections render, LCP ≤ 2.5 s on Moto G4 / 4G |
| F-02 | Exhibition detail nav | Card click → `/exhibitions/[slug]`, OG tag includes hero image |
| F-03 | "Book tickets" CTA | Opens new tab, DevTools: no `Referer` header sent, `rel=noopener noreferrer` on anchor |
| F-04 | Map page | With key: ≥ 10 markers, cluster forms + expands on zoom. Without key: fallback card + gallery list still visible |
| F-05 | Marker tap | Aside opens with gallery name + borough, "View gallery" navigates |
| F-06 | Search debounce | Typing "turner" → last keystroke + 250 ms, one `/api/exhibitions?q=turner` request visible in Network |
| F-07 | Filter chips | Combine status + category on `/exhibitions`, URL updates, browser back restores previous chip state |
| F-08 | Unknown slug | `/exhibitions/does-not-exist` renders root `not-found.tsx` |
| F-09 | API failure surface | Override `/api/exhibitions` to 500, search page shows `EmptyState` ("Search failed"), no crash |
| F-10 | Offline fallback | Disable network, refresh: `/offline` renders via Service Worker navigation fallback |
| F-11 | Gallery detail | `/galleries/[slug]` shows opening hours + now-on + coming-soon lists; website button is external |
| F-12 | Deep link preserved | Reloading `/search?q=turner` re-populates input and results |

## 5. Accessibility Scenarios

| ID | Check |
|---|---|
| A-01 | Tab through home: Skip-to-main first, then header nav, then sections; every focused element has visible 2 px ring |
| A-02 | Map aside closes on Esc and returns focus to the opening marker |
| A-03 | Exhibition card is announced as "{title}, {gallery}, {date hint}" by VoiceOver |
| A-04 | Hero/gallery images have non-empty alt; decorative gradients marked `aria-hidden` |
| A-05 | Status ('Now on' / 'Coming soon' / 'Ended') is also conveyed via text, not color alone |
| A-06 | `prefers-reduced-motion: reduce` disables hover scale on hero + map transitions |
| A-07 | axe-core on `/`, `/exhibitions`, `/galleries`, `/map`, a single detail page, `/search`, `/about`, `/offline` — expect **0 violations** |

## 6. Performance Scenarios

| ID | Check | Source |
|---|---|---|
| P-01 | LCP ≤ 2.5 s (mobile, throttled 4G) | Lighthouse |
| P-02 | CLS ≤ 0.05 | Lighthouse |
| P-03 | INP ≤ 200 ms on map marker tap | Lighthouse / DevTools |
| P-04 | First-load JS ≤ 170 kB gzip on `/` | Next build output |
| P-05 | Lighthouse 4 axes ≥ 90 on mobile preset | `lhci autorun` |
| P-06 | `/map` route first-load is isolated (not loaded on `/`) | Build output + Network |

## 7. Compatibility Matrix

| Env | Required |
|---|---|
| iPhone 12 / iOS 17 Safari | Install from Share sheet, offline load of installed PWA, deep link new tab |
| Pixel 5 / Chrome latest | Install banner, offline load, map cluster responsive |
| MacBook / Safari latest | Skip-link, focus ring on keyboard only |
| Windows 11 / Edge latest | External booking link opens in new tab without referrer |
| iPad / Safari latest | Layout adapts (no horizontal scroll at 1024 px) |

## 8. Automation Setup

- **Unit (Vitest)** — wired and green: `pnpm test` (47 tests). Covers Zod schemas, format helpers, API query/filter, route helpers.
- **Integration (planned)** — Route Handlers invoked via `next/server` in-memory to assert 400 on invalid q / 200 payload shape.
- **E2E (planned, Playwright)** — scripts to add under `tests/e2e/`:
  - `booking-link.spec.ts`: F-03
  - `search-debounce.spec.ts`: F-06
  - `offline.spec.ts`: F-10
  - `map-fallback.spec.ts`: F-04
  - `a11y.spec.ts`: axe-core across the 8 pages in A-07
- **Lighthouse CI** — `lighthouserc.json` budget with Perf/A11y/Best/SEO ≥ 0.9, run against `pnpm start` after `pnpm build`.

## 9. Bug Lifecycle

1. Reproduce on Preview build.
2. File `docs/bugs/BUG-<nnn>.md` following `agents/qa.md §5` template.
3. Severity: Blocker / Major / Minor / Nit.
4. Fix on `claude/*` branch with a regression test.
5. Reviewer closes via Gate 5 sign-off.

## 10. Gate 5 (Release) Checklist

- [ ] Functional scenarios F-01…F-12 green.
- [ ] Accessibility: axe 0 violations on all 8 key pages, manual keyboard pass.
- [ ] Performance: Lighthouse mobile ≥ 90 on all four axes for `/`, `/exhibitions`, `/exhibitions/[slug]`, `/galleries`, `/map`, `/search`.
- [ ] Compat: iPhone + Android + desktop Safari/Chrome pass.
- [ ] PWA: install + offline confirmed on ≥ 2 devices.
- [ ] Production URL live, HTTPS, `robots.txt`/`sitemap.xml`/OG image reachable.
- [ ] Google Maps API key restricted by HTTP referrer.
- [ ] README updated with final URLs and env vars.

## 11. Deferred to v1.1 (out of scope for Gate 5)

- Favourites, notifications, auth (v1.1).
- Multi-language (v1.2).
- Capacitor native wrapper (v2.0).
- Admin CMS for editors (track in `docs/backlog.md`).
