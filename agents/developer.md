# 💻 Developer Agent — 개발 에이전트 (Next.js 14 · Web + PWA)

> **역할**: 시니어 풀스택 엔지니어
> **목표**: 디자인 명세를 **프로덕션 품질 코드**로 구현한다. 하나의 코드베이스로 웹과 앱(PWA)을 동시에 출시한다.
> **입력**: `docs/PRD.md`, `docs/design-system.md`, `docs/component-spec.md`
> **출력**: 동작하는 Next.js 앱, `README.md`, 배포 URL

---

## 1. 기술 스택 (확정)

- **Next.js 14** App Router + React Server Components
- **TypeScript** `strict: true`
- **Tailwind CSS** + CSS Variables (디자인 토큰)
- **shadcn/ui** (선택적) — 접근성 내장 primitives
- **`@react-google-maps/api`** — 지도
- **Zod** — 런타임 validation
- **Vitest** + **@testing-library/react** — 단위 테스트
- **Playwright** — E2E
- **ESLint (next/core-web-vitals)** + **Prettier**
- **`next-pwa`** 또는 App Router 수동 SW — PWA

데이터 레이어는 2단계:
1. **MVP**: `/public/data/*.json` 시드 + Server Component에서 fs 로드
2. **v1.1**: Supabase (Postgres + Row-Level Security)

---

## 2. 프로젝트 구조

```
/
├─ app/
│  ├─ (site)/
│  │  ├─ layout.tsx              # 공통 Header/Footer/Nav
│  │  ├─ page.tsx                # Home
│  │  ├─ exhibitions/
│  │  │  ├─ page.tsx             # List
│  │  │  └─ [slug]/page.tsx      # Detail
│  │  ├─ galleries/
│  │  │  ├─ page.tsx
│  │  │  └─ [slug]/page.tsx
│  │  ├─ map/page.tsx
│  │  ├─ search/page.tsx
│  │  └─ about/page.tsx
│  ├─ api/
│  │  ├─ exhibitions/route.ts
│  │  └─ galleries/route.ts
│  ├─ offline/page.tsx
│  ├─ manifest.webmanifest       # PWA
│  ├─ opengraph-image.tsx
│  └─ globals.css                # 디자인 토큰 CSS vars
├─ components/
│  ├─ ui/                        # Button, Card, Input ...
│  ├─ exhibition/                # ExhibitionCard, Hero ...
│  ├─ gallery/                   # GalleryMap, Marker ...
│  └─ layout/                    # Header, Footer, BottomNav
├─ lib/
│  ├─ data.ts                    # JSON seed 로더
│  ├─ schemas.ts                 # Zod schemas
│  ├─ utils.ts
│  └─ constants.ts
├─ public/
│  ├─ data/
│  │  ├─ exhibitions.json
│  │  └─ galleries.json
│  ├─ icons/                     # PWA icons
│  └─ sw.js                      # Service Worker (수동 시)
├─ tests/
│  ├─ unit/
│  └─ e2e/
├─ tailwind.config.ts
├─ next.config.js
├─ tsconfig.json
└─ package.json
```

---

## 3. 필수 설정 (Project Bootstrap)

### 3.1 생성 명령
```bash
pnpm create next-app@14 galleryuk \
  --typescript --tailwind --eslint \
  --app --src-dir=false --import-alias "@/*"
```

### 3.2 `tsconfig.json` 핵심
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "paths": { "@/*": ["./*"] }
  }
}
```

### 3.3 `tailwind.config.ts` — 디자인 토큰 반영
```ts
theme: {
  extend: {
    colors: {
      bg: 'var(--color-bg)',
      surface: 'var(--color-surface)',
      text: { DEFAULT: 'var(--color-text)', muted: 'var(--color-text-muted)' },
      primary: { DEFAULT: 'var(--color-primary)', hover: 'var(--color-primary-hover)' },
      accent: 'var(--color-accent)',
      border: 'var(--color-border)',
    },
    fontFamily: {
      serif: ['Fraunces', 'Noto Serif KR', 'Georgia', 'serif'],
      sans:  ['Inter', 'Pretendard', 'system-ui', 'sans-serif'],
    },
    borderRadius: { sm: '4px', md: '8px', lg: '16px' },
  },
}
```

### 3.4 `app/globals.css`
- CSS 변수로 토큰 선언
- `@media (prefers-color-scheme: dark)` 블록 준비 (v1.1)
- `@media (prefers-reduced-motion: reduce)` 글로벌 처리

### 3.5 `next.config.js`
```js
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'tate.org.uk' },
    { protocol: 'https', hostname: 'nationalgallery.org.uk' },
    // whitelist only
  ],
},
experimental: { typedRoutes: true },
```

---

## 4. 데이터 레이어

### 4.1 Zod Schema (`lib/schemas.ts`)
```ts
export const ExhibitionSchema = z.object({
  id: z.string().min(1),
  title: z.string(),
  galleryId: z.string(),
  startDate: z.string(),  // ISO
  endDate: z.string(),
  priceFrom: z.number().nullable(),
  ticketUrl: z.string().url().nullable(),
  category: z.enum(['painting','photo','sculpture','mixed']),
  description: z.string(),
  heroImage: z.string().url(),
  images: z.array(z.string().url()).optional(),
});
export type Exhibition = z.infer<typeof ExhibitionSchema>;
```

### 4.2 Loader (`lib/data.ts`)
- Server-only (`import 'server-only'`)
- JSON 파일 읽고 Zod로 검증 후 캐시
- 실패 시 빌드 에러로 크러시 — 런타임 방어 NO

### 4.3 API Route Handlers
- `/api/exhibitions?category=&from=&to=&q=`
- 응답은 JSON, `Cache-Control: public, s-maxage=300, stale-while-revalidate=60`

---

## 5. 라우팅 & 렌더링 전략

| 경로 | 전략 | 이유 |
|---|---|---|
| `/` | SSG + ISR(1h) | 홈은 자주 업데이트되지만 실시간 아님 |
| `/exhibitions` | SSG + ISR | 동일 |
| `/exhibitions/[slug]` | SSG (generateStaticParams) | 상세는 슬러그마다 정적 |
| `/map` | CSR (client island) | 지도 SDK는 클라이언트 전용 |
| `/search` | CSR | 입력 반응형 |
| `/api/*` | Dynamic | 필터/쿼리 동적 |

---

## 6. PWA 구현

### 6.1 `app/manifest.webmanifest`
```json
{
  "name": "GalleryUK",
  "short_name": "GalleryUK",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#B91C1C",
  "background_color": "#FAFAF7",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

### 6.2 Service Worker 전략
- **App shell**: 정적 자산 `precache`
- **이미지**: `CacheFirst`, 50개 LRU
- **API**: `StaleWhileRevalidate`, 5분
- **내비게이션 fallback**: 오프라인 시 `/offline`

### 6.3 iOS 대응
- `apple-touch-icon`
- `apple-mobile-web-app-capable`
- `viewport-fit=cover` + safe-area-inset

### 6.4 설치 유도
- 방문 3회 이상 + 표준 트리거 시 "홈 화면에 추가" 배너 표시
- iOS는 수동 안내 도움말 노출

---

## 7. 지도 (Google Maps)

- API Key는 `.env.local`의 `NEXT_PUBLIC_GMAPS_KEY` (도메인 제한 필수)
- 클라이언트 전용 컴포넌트에서 로드 (`'use client'`)
- `@googlemaps/markerclusterer`로 클러스터링
- 모바일 Bottom Sheet는 `vaul` 또는 자체 구현
- 지도 타일 캐시: SW로 과도 캐시 금지 (약관 준수)

---

## 8. 코딩 컨벤션

- 파일명: `PascalCase.tsx` (컴포넌트) / `camelCase.ts` (유틸)
- 컴포넌트는 **Props 타입 export** (스토리/테스트 재사용)
- Server Component 기본, 필요한 부분만 `'use client'`
- `any`, `@ts-ignore` 금지. 예외는 주석으로 사유 명시
- 부수 효과 있는 함수는 `async` 또는 이벤트 핸들러 안에서만
- 매직 넘버/문자열 금지 → `lib/constants.ts`
- 국가/날짜는 `Intl` API 사용 (서버/클라이언트 일치 주의)

---

## 9. 성능 예산

| 지표 | 목표 |
|---|---|
| LCP | ≤ 2.5s (4G, moto-g4) |
| CLS | ≤ 0.05 |
| INP | ≤ 200ms |
| JS (초기) | ≤ 170KB gzip |
| 이미지 | 페이지당 ≤ 1.5MB (opt 후) |

체크: `pnpm build && pnpm dlx @next/bundle-analyzer` + Lighthouse CI

---

## 10. 보안 체크리스트

- [ ] 외부 이미지 도메인 whitelist
- [ ] `dangerouslySetInnerHTML` 사용 금지 (불가피하면 DOMPurify)
- [ ] API Route에 Zod로 입력 검증
- [ ] `.env*` 커밋 금지, `.env.example` 제공
- [ ] Google Maps API Key HTTP referrer 제한
- [ ] CSP 헤더 (최소 `default-src 'self'`)
- [ ] 예매 링크는 `rel="noopener noreferrer"` + `target="_blank"`

---

## 11. 커밋 & 배포 규칙

### Git
- Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `test:`
- 브랜치: `claude/<topic>` (이미 설정됨)
- PR은 사용자가 명시적으로 요청할 때만 생성

### CI (GitHub Actions — 선택)
- `pnpm install --frozen-lockfile`
- `pnpm typecheck && pnpm lint && pnpm test && pnpm build`

### Vercel
- `main` → Production
- `claude/*` → Preview
- 환경변수: `NEXT_PUBLIC_GMAPS_KEY`, `NEXT_PUBLIC_SITE_URL`

---

## 12. Definition of Done (개발 단계)

- [ ] 각 화면이 디자인 스펙과 시각적으로 일치
- [ ] 키보드로 모든 기능 접근 가능
- [ ] Lighthouse 모바일 Perf/A11y/BP/SEO ≥ 90
- [ ] `pnpm test` 전부 통과
- [ ] E2E 핵심 시나리오 통과 (홈→상세→예매링크)
- [ ] 오프라인 시 `/offline` 노출
- [ ] README에 실행/빌드/환경변수 설명

---

## 13. 리뷰어에게 넘길 때

- 변경 요약 5줄 이하
- 주요 결정 사항 (왜 A 대신 B를 선택했는지)
- 알려진 이슈 / 후속 작업 목록
- Preview URL
