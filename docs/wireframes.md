# GalleryUK — Wireframes (v1.0)

> 각 화면은 **Mobile(375px)**와 **Desktop(≥1024px)** 두 기준으로 기술.
> ASCII 와이어프레임 + 치수/인터랙션/데이터 바인딩을 함께 기록.
> 관련: `docs/sitemap.md` (URL 쿼리), `docs/design-system.md` (토큰)

---

## 0. 공통 레이아웃

### Mobile (<768px)
```
┌───────────────────────────────┐
│ [Logo]         [🔍] [☰]       │  Header (56px sticky, bg, border-b)
├───────────────────────────────┤
│                               │
│          Main                 │
│                               │
├───────────────────────────────┤
│ 🏠 Home  🗺 Map  🔍 More  ☰   │  Bottom Nav (64px + safe-area)
└───────────────────────────────┘
```

### Desktop (≥1024px)
```
┌────────────────────────────────────────────────────────────┐
│ [Logo]  Home  Exhibitions  Map  Galleries  About    [🔍]   │  72px
├────────────────────────────────────────────────────────────┤
│                                                            │
│                          Main                              │
│                                                            │
├────────────────────────────────────────────────────────────┤
│  © GalleryUK · About · Contact · Data source               │  Footer
└────────────────────────────────────────────────────────────┘
```

공통:
- Header bg: `--color-surface`, border-b `--color-border`
- Logo: 좌측, 클릭 시 `/`
- Search: Desktop은 아이콘 토글 → 인라인 입력, Mobile은 전용 페이지 `/search`
- Bottom Nav (모바일): `fixed bottom-0`, 4개 아이콘 + 텍스트, active는 `--color-primary`

---

## 1. `/` Home

### 목표
3초 안에 "오늘 볼만한 전시" 결정. LCP ≤ 2.5s.

### Mobile (375px)
```
┌───────────────────────────────┐
│ Header                        │
├───────────────────────────────┤
│ ┌─────────────────────────┐   │
│ │                         │   │  Hero (16:9)
│ │   featured 전시 이미지   │   │  - 이미지 overlay 하단 40%
│ │                         │   │  - 제목 (text-4xl serif)
│ │   Turner Prize 2026     │   │  - 미술관 · 기간 (text-sm)
│ │   Tate Britain · ~15 Sep│   │  - "View" 버튼 (Primary)
│ └─────────────────────────┘   │
│                               │
│ [ Now on | Coming Soon ]      │  Tab (sticky 아래, border-b active)
│                               │
│ ┌──────────┐ ┌──────────┐     │  2-col grid (gap 16)
│ │  img 1:1 │ │  img 1:1 │     │  - aspect 4:3 실제
│ │          │ │          │     │
│ │ Title    │ │ Title    │     │  - Card title (text-lg, 2줄 클램프)
│ │ Gallery  │ │ Gallery  │     │  - meta (text-sm muted)
│ │ ~28 Apr  │ │ ~05 Jun  │     │
│ └──────────┘ └──────────┘     │
│ ┌──────────┐ ┌──────────┐     │
│ ...                           │  무한 스크롤 (skeleton 4개)
│                               │
├───────────────────────────────┤
│ Bottom Nav                    │
└───────────────────────────────┘
```

### Desktop (1280px)
- Hero: container 안에 max-width 1280, 좌 60% 이미지 / 우 40% 메타+CTA
- Grid: 4열, gap 24
- Tab은 그대로

### 데이터 바인딩
- Hero: `featured === true`인 전시 1건 (없으면 가장 최신 `startDate`)
- Tab "Now on": `startDate ≤ today ≤ endDate`
- Tab "Coming Soon": `today < startDate ≤ today+60d`

### 인터랙션
- Hero CTA → `/exhibitions/[slug]`
- 카드 탭 → `/exhibitions/[slug]`
- Tab 전환은 URL `?tab=now|soon`로 반영

### 상태
- Loading: Skeleton 6개
- Empty: "No exhibitions at the moment." + 링크
- Error: "Unable to load. Retry." + 버튼

### 접근성
- Hero 이미지 `alt`는 전시 제목 기반
- Tab은 `role="tablist"`/`tab`
- h1: "GalleryUK — Art exhibitions in the UK" (시각적으로는 Hero 타이틀이 h1 역할, Hero 타이틀이 h1)

---

## 2. `/exhibitions` List

### Mobile
```
┌───────────────────────────────┐
│ Header                        │
├───────────────────────────────┤
│ ← Exhibitions                 │  H1 (text-3xl)
│                               │
│ [Category ▾] [When ▾] [More▾] │  Filter chips (sticky, scroll-x)
│                               │
│ 24 results · Now on           │  result summary (text-sm muted)
│                               │
│ ┌─────────────────────────┐   │  1-col card (aspect 16:9)
│ │   img                   │   │
│ │ Title                   │   │
│ │ Gallery · ~28 Apr       │   │
│ │ [Photography] £18       │   │  category tag + 가격
│ └─────────────────────────┘   │
│ ...                           │
│                               │
│ [ Load more ]                 │  or infinite scroll
└───────────────────────────────┘
```

### Desktop
```
┌────────────────────────────────────────────────────────────┐
│ Header                                                     │
├────────────────────────────────────────────────────────────┤
│ Exhibitions                              [ Grid | Map ▸ ]  │  view toggle
│                                                            │
│ [Category ▾][When ▾][Borough ▾][Price ▾][Sort ▾]  24 result│
│                                                            │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐                                │  4-col
│ │    │ │    │ │    │ │    │                                │
│ ...                                                        │
└────────────────────────────────────────────────────────────┘
```

### 필터 UX
- Chip 탭 → 모바일은 Bottom Sheet, 데스크톱은 Popover
- 선택 시 칩이 채워지고 배지로 개수 (`Category · 2`)
- "Clear all" 링크 상단 우측

### 빈 상태
```
┌─────────────────────────────┐
│      (illustration)         │
│  No matching exhibitions    │
│  Try removing a filter.     │
│  [ Clear filters ]          │
└─────────────────────────────┘
```

### 쿼리 (sitemap §4.1)
`?category=&tab=&when=&borough=&priceMax=&sort=`

---

## 3. `/exhibitions/[slug]` Detail

### Mobile
```
┌───────────────────────────────┐
│ [←]                   [Share] │  Transparent header overlay
├───────────────────────────────┤
│                               │
│                               │  Hero (aspect 16:9, 56vh max)
│       Hero image              │
│                               │
├───────────────────────────────┤
│ Turner Prize 2026             │  H1 (serif, text-4xl)
│                               │
│ Tate Britain →                │  Gallery link (text-sm)
│ 24 Sep 2026 – 22 Feb 2027     │  Dates
│ From £18 · [Photography]      │  Price · category tag
│                               │
│ [ Book Tickets ↗ ]            │  Primary CTA (full-width, 56h)
│ [ Show on map ]               │  Secondary CTA (outline)
│                               │
│ ────────────────────          │  divider
│                               │
│ (Markdown description, 68ch)  │
│ This year's shortlist...      │
│                               │
│ ── Images (3) ──              │
│ ┌──┐ ┌──┐ ┌──┐                │  3-col gallery, tap → lightbox
│ │  │ │  │ │  │                │
│ └──┘ └──┘ └──┘                │
│                               │
│ ── Other at this gallery ──   │
│ ┌──────────┐ ┌──────────┐     │  horizontal scroll, 2 visible
│ │          │ │          │     │
│ └──────────┘ └──────────┘     │
└───────────────────────────────┘
```

### Desktop
- 2-column: 좌 60% 이미지 (sticky), 우 40% 메타+CTA+본문
- Hero는 viewport 60vh

### Ticketless 상태
- `ticketUrl === null` → CTA 자리에 `[Free · No ticket required]` 배지
- Secondary CTA만 노출 (지도에서 보기)

### 종료된 전시
- `endDate < today` → 상단 배지 `[Exhibition ended]`
- CTA 비활성화

### 접근성
- h1: 전시 제목
- 이미지 alt: `heroImageAlt` 필드
- Lightbox: Esc 닫기, 좌우 화살표 / 스와이프

---

## 4. `/galleries` List & `/galleries/[slug]`

### 목록 (Mobile)
```
┌───────────────────────────────┐
│ Header                        │
├───────────────────────────────┤
│ Galleries                     │  H1
│                               │
│ ┌─────────────────────────┐   │
│ │ (logo 40)  Tate Modern  │   │  단순 리스트 (아바타 + 이름)
│ │            Southwark     │   │  borough (text-sm muted)
│ │            3 exhibitions │   │  active 전시 수
│ └─────────────────────────┘   │
│ ...                           │
└───────────────────────────────┘
```

### 상세 (Mobile)
```
┌───────────────────────────────┐
│ [←]             Tate Modern   │
├───────────────────────────────┤
│ Bankside, SE1 9TG             │  address
│ Open today 10:00 – 18:00      │  opening hours (오늘)
│ [ Website ↗ ]                 │
│                               │
│ ┌──── Mini-map ──────────┐    │  180h, 마커 1개
│ │       🔴                │    │
│ │   [ Show on full map ] │    │
│ └────────────────────────┘    │
│                               │
│ ── Now on (2) ──              │
│ ┌──────────┐ ┌──────────┐     │  전시 카드 2열
│ │          │ │          │     │
│ └──────────┘ └──────────┘     │
│                               │
│ ── Coming soon (1) ──         │
│ ...                           │
│                               │
│ ── About ──                   │
│ (description 400자)           │
└───────────────────────────────┘
```

### Desktop
- 상세는 2-column: 좌 정보+미니맵 / 우 전시 그리드

---

## 5. `/map` Map

### Mobile
```
┌───────────────────────────────┐
│ Header (overlay, gradient)    │
│ [Category ▾] [Free ▾] [×]     │  filter chips overlay top
│                               │
│                               │
│       🔴         🔴            │
│          🔴                   │  Map (full screen, Google Maps)
│     🔴                        │
│               🔴              │
│                               │
│                               │
├═══════════════════════════════┤
│ ═══  handle  ═══              │  Bottom Sheet (30% 기본, 드래그 90%)
│ 12 galleries visible          │  count
│ ┌─────────────────────────┐   │  스크롤 리스트 (아바타 + 이름 + 전시 수)
│ │ Tate Modern · 3 now     │   │
│ └─────────────────────────┘   │
│ ...                           │
└───────────────────────────────┘
```

### Desktop
```
┌────────────────────────────────────────────────────────────┐
│ Header                                                     │
├──────────────────────┬─────────────────────────────────────┤
│ Filters              │                                     │
│ [Category ▾]         │                                     │
│ [When ▾]             │            MAP                      │
│ [Price ▾]            │      (60% width, full height)       │
│                      │                                     │
│ 12 galleries         │         🔴    🔴                    │
│ ┌──────────────────┐ │      🔴                             │
│ │ card             │ │   🔴                                │
│ └──────────────────┘ │                                     │
│ ...                  │                                     │
│ (40% scrollable)     │                                     │
└──────────────────────┴─────────────────────────────────────┘
```

### 마커 선택 시
- Sheet 확장 (모바일) / 우측 마커 강조 + 좌측 리스트 스크롤
- 미술관 헤더 + 현재 전시 2~3개 + "Open gallery details" 링크

### 상태
- 권한 거부: 배너 "Showing central London. Enable location for near-me."
- 네트워크 오류: 지도 자리에 placeholder + 재시도 버튼

---

## 6. `/search`

### Mobile
```
┌───────────────────────────────┐
│ [←] [🔍 search input    ][×]  │  Sticky search bar (autofocus)
├───────────────────────────────┤
│                               │
│  (2자 이상 입력 전)            │
│  ── Popular searches ──       │  수작업 키워드 리스트
│  [Turner] [Photography]       │
│                               │
│  (결과 있을 때)                │
│  ── Exhibitions (5) ──        │
│  ┌─────────────────────────┐  │  카드 리스트 (간소화)
│  │ img Title · Gallery      │  │
│  └─────────────────────────┘  │
│                               │
│  ── Galleries (2) ──          │
│  ┌─────────────────────────┐  │
│  │ logo Tate Modern         │  │
│  └─────────────────────────┘  │
│                               │
│  (0건일 때)                   │
│  "No results for 'xyz'"       │
│  [ Browse all exhibitions ]   │
└───────────────────────────────┘
```

- Debounce 250ms, 2자 미만 미발동
- 결과 라우팅: `/search?q=...`

---

## 7. `/about`

```
┌───────────────────────────────┐
│ About GalleryUK               │  H1
│                               │
│ (미션 / 서비스 설명, ~200자)   │
│                               │
│ ── Data source ──             │
│ Exhibition information is     │
│ sourced from official...      │
│                               │
│ ── Contact ──                 │
│ Missing an exhibition?        │
│ [ Email us ↗ ]                │  mailto:
│                               │
│ ── Install ──                 │
│ (iOS: "Add to Home Screen"    │
│  설명 + 아이콘 이미지)         │
│                               │
│ ── Credits ──                 │
│ v1.0 · Built with Next.js     │
└───────────────────────────────┘
```

---

## 8. `/offline`

```
┌───────────────────────────────┐
│                               │
│        (📡 illustration)       │
│                               │
│      You're offline           │  text-3xl
│                               │
│   Some features are limited.  │
│   Cached content is available.│
│                               │
│   [ Try again ]               │  Primary button
│                               │
│   ── Recently viewed ──       │  localStorage에서 최근 3~5개
│   ┌────────────────────────┐  │
│   │ card (tap OK, SW 캐시)│  │
│   └────────────────────────┘  │
└───────────────────────────────┘
```

---

## 9. `/not-found` (404)

```
Exhibition not found.
The page may have ended or moved.

[ Back to home ]
[ Search exhibitions ]
```

간결하게. 유머 없이 정중한 어조.

---

## 10. 공통 상태 UI

### 10.1 Loading Skeleton
- 카드: 이미지(block) + 제목 2줄 + 메타 1줄
- `animate-pulse`, 색은 `--color-surface-muted`

### 10.2 Empty State
- 중앙 정렬 (세로)
- 선형 아이콘 + 제목 + 안내문 + 주요 액션

### 10.3 Error State
- Danger 아이콘 + 메시지 + "Retry" 버튼
- 서버 에러와 네트워크 에러 문구 구분

### 10.4 Toast
- 하단 fixed (모바일은 Bottom Nav 위)
- 4초 자동 dismiss, 스와이프 닫기
- 타입: info / success / error

---

## 11. PWA Install Prompt

### Android (Chrome)
- 방문 3회 이상 + 세션 > 30초 조건 충족 시 브라우저 beforeinstallprompt 트리거
- 상단 얇은 배너:
```
Install GalleryUK for quick access   [ Install ] [×]
```

### iOS (Safari)
- 같은 조건에서 1회 Modal:
```
┌────────────────────┐
│ Add to Home Screen │
│ (ios share icon)   │
│ 1. Tap Share       │
│ 2. "Add to Home"   │
│ [ Got it ]         │
└────────────────────┘
```
- `localStorage`로 dismiss 상태 저장 → 14일간 미노출

---

## 12. 화면별 h1 매트릭스

| 경로 | h1 |
|---|---|
| `/` | 전시 제목 (Hero) — 동적 |
| `/exhibitions` | "Exhibitions" |
| `/exhibitions/[slug]` | 전시 제목 |
| `/galleries` | "Galleries" |
| `/galleries/[slug]` | 미술관명 |
| `/map` | "Map" (시각적으로는 숨김, `sr-only`) |
| `/search` | "Search" (sr-only) |
| `/about` | "About GalleryUK" |
| `/offline` | "You're offline" |
| `/not-found` | "Page not found" |

---

## 13. 변경 이력
- 2026-04-18 v1.0 — 초안 (designer-agent)
