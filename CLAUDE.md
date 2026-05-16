# 🎯 GalleryUK — PM 에이전트 (메인 지휘관)

> 이 문서는 프로젝트의 **최상위 지휘자(PM)** 역할을 합니다.
> 모든 세부 에이전트(`agents/*.md`)는 이 문서의 목표와 단계에 맞춰 움직입니다.
> Claude Code 세션이 시작되면 **가장 먼저 이 파일을 읽고** 현재 단계를 확인하세요.

---

## 1. 프로젝트 개요

**GalleryUK** — 영국 전시/미술관 정보 서비스 (Web + Mobile PWA 동시 개발)

### 핵심 가치 제안
1. 영국 전역의 전시 일정을 **한 곳에서** 볼 수 있다
2. 미술관 위치를 **지도 기반**으로 탐색할 수 있다
3. 원하는 전시의 **공식 예매 페이지로 1-탭 이동**할 수 있다

### 주요 기능
| 영역 | 기능 |
|---|---|
| 전시 정보 | 목록/상세, 기간·장소·가격·작가·설명, 이미지 갤러리 |
| 탐색 | 키워드 검색, 카테고리/기간/지역 필터, 정렬 |
| 지도 | 런던 중심 지도, 미술관 마커, 현재 위치 기반 근처 보기 |
| 예매 연결 | 공식 예매 사이트 Deep Link (Tate / NG / V&A 등) |
| 개인화(v1.1+) | 즐겨찾기, 캘린더 알림, 최근 본 전시 |

### 타깃 사용자
- 런던/영국 여행자 (단기 방문, 1~2주)
- 영국 거주 미술 애호가
- 미술 전공 학생 / 큐레이터

### 비즈니스 제약 (v1.0 기준)
- 예산: 무료 티어 범위 (Vercel / Supabase / Google Maps 무료 쿼터)
- 일정: MVP 4~6주
- 운영: 1인 개발 + Claude 에이전트

---

## 2. Web + App 동시 개발 전략

앱을 별도로 만들지 않고 **Next.js 14 App Router + PWA**로 하나의 코드베이스에서 웹/앱을 동시에 출시합니다.

```
┌──────────────────────────────────────────────┐
│          Next.js 14 (단일 코드베이스)          │
├──────────────────────────────────────────────┤
│  Desktop Web   │  Mobile Web  │  Installed   │
│  (≥1024px)     │  (<768px)    │  PWA (앱)    │
└──────────────────────────────────────────────┘
        ↑ 반응형 + PWA manifest + Service Worker
```

- **웹**: 반응형 레이아웃, SEO 최적화, OG 이미지
- **앱(PWA)**: `manifest.webmanifest`, Service Worker로 오프라인 캐시, "홈 화면 추가" 유도
- **향후 네이티브(v2.0+)**: 필요 시 Capacitor로 iOS/Android 스토어 배포 (동일 코드 재사용)

---

## 3. 진행 단계 (Phase & Gate)

각 단계는 **리뷰 에이전트 통과 = Gate 통과**로 다음 단계 진입 가능합니다.

### Phase 1 — 기획 (Week 1)
- [x] `agents/planner.md` 실행
- [x] PRD (제품 요구서) 작성 → `docs/PRD.md`
- [x] 기능 목록 & 우선순위 (MoSCoW) → `docs/PRD.md §5`
- [x] 화면 목록 (Sitemap) — 웹/모바일 공통 → `docs/sitemap.md`
- [x] 사용자 스토리 10개 이상 → `docs/user-stories.md` (19개)
- [x] 데이터 모델 초안 (Exhibition, Gallery, Category) → `docs/data-model.md`
- [x] **Gate 1**: `agents/reviewer.md`로 기획 검토 통과 → `docs/reviews/phase-1-20260418.md` (PASS, Minor 5 / Nit 4)

### Phase 2 — 디자인 (Week 2)
- [x] `agents/designer.md` 실행
- [x] 디자인 토큰 (색상/타이포/간격) 확정 → `docs/design-system.md`
- [x] 웹 와이어프레임 (Home / List / Detail / Map / Search) → `docs/wireframes.md`
- [x] 모바일 와이어프레임 (같은 화면, 세로형) → `docs/wireframes.md`
- [x] 컴포넌트 인벤토리 (버튼/카드/필터 등) → `docs/component-spec.md` (23종)
- [x] **Gate 2**: 리뷰 검토 통과 + 디자인-개발 핸드오프 문서 → `docs/reviews/phase-2-20260418.md` (PASS, Minor 6 / Nit 4)

### Phase 3 — 개발: 기반 (Week 3)
- [x] `agents/developer.md` 실행
- [x] Next.js 14 + TypeScript + Tailwind 프로젝트 생성
- [x] 폴더 구조, ESLint/Prettier, 절대경로 설정
- [x] 디자인 토큰을 Tailwind config에 반영
- [x] 공통 레이아웃 / 네비게이션 / 반응형 breakpoint
- [x] 더미 데이터 기반 화면 5개 구현 (Home / Exhibitions 목록·상세 / Galleries 목록·상세, + Map·Search·About·Offline·404 보조 화면)
- [x] **Gate 3**: 리뷰 통과 → `docs/reviews/phase-3-20260421.md` (PASS, Minor 6 / Nit 4)

### Phase 4 — API 연결 & PWA (Week 4)
- [x] 데이터 소스 결정: **JSON Seed 유지 (MVP)** — Supabase는 v1.1로 연기 (`docs/backlog.md` 기록, `lib/data.ts` 단일 경로)
- [x] `/api/*` Route Handlers 구현 (`app/api/exhibitions/route.ts`, `app/api/galleries/route.ts`, Zod 검증 + `stale-while-revalidate`)
- [x] Google Maps 연동 (`components/map/LondonMap.tsx` + `@react-google-maps/api` + MarkerClusterer, API 키 부재 시 리스트 fallback)
- [x] 예매 Deep Link 연결 (`app/(site)/exhibitions/[slug]/page.tsx` `target="_blank" rel="noopener noreferrer"`)
- [x] PWA 설정: `app/manifest.ts`, `public/icons/*.svg`, `public/sw.js` + `ServiceWorkerRegistrar`
- [x] 오프라인 fallback 페이지 (`app/offline/page.tsx` — `(site)` 그룹 밖이라 크롬 없이 단독 렌더; SW navigate fallback으로 연결)
- [x] **Gate 4**: 리뷰 통과 → `docs/reviews/phase-4-20260421.md` (PASS, Minor 7 / Nit 4)

### Phase 5 — QA & 배포 (Week 5~6)
- [x] Gate 4 우선 Minor 6건 반영 ([m-01]~[m-06]) — `docs/qa-report-20260421.md §2`
- [x] `agents/qa.md` 실행: 테스트 계획 수립 및 정적 게이트 실행 — `docs/qa-plan.md`, `docs/qa-report-20260421.md`
- [x] Vitest 단위 테스트 47건 그린 (`pnpm test`) — schemas/format/api/routes
- [x] SEO 아티팩트 추가 — `app/robots.ts`, `app/sitemap.ts`, `app/opengraph-image.tsx`
- [x] PNG 아이콘 PWA/HTML 레벨 정비 — `app/icon.tsx`, `app/apple-icon.tsx`
- [x] SW 버전 자동화 — `scripts/build-sw.mjs` (`$BUILD_ID`/git sha/timestamp 폴백)
- [x] Vercel 배포 가이드 — `docs/deployment.md` (초보자용 step-by-step)
- [x] **사용자 작업 완료**: Vercel Preview 배포 → `https://galleryuk.vercel.app` 확보 (2026-04-24)
- [x] Lighthouse 점수 Perf/A11y/Best/SEO ≥ 90 — Mobile 97/100/100/92, Desktop 100/100/100/92 (`docs/qa-report-20260421.md`)
- [x] axe-core 접근성 스캔 0 violation (axe DevTools on live Preview — 0 site issues)
- [x] 모바일 실기기 테스트 (사용자 확인 — 2026-04-24)
- [x] PWA 설치 테스트 (사용자 확인 — 2026-04-24)
- [x] Vercel 프로덕션 배포 (Hobby 기본 alias `galleryuk.vercel.app` 활성화, `main` 자동 배포)
- [x] Maps 키 HTTP referrer 제한 (완료 — `galleryuk.vercel.app/*` + `localhost:3000/*`, Maps JavaScript API only)
- [ ] 도메인 연결 (v1.0 선택 — 커스텀 도메인 미확보, 사용자가 추후 결정)
- [x] **Gate 5 (최종)**: 모든 Acceptance Criteria 통과 — `docs/reviews/phase-5-20260424.md` (PASS)

#### 🔔 다음 세션 재진입 가이드 (PM 본인용)

이 프로젝트는 현재 **정적 게이트는 전부 그린**, **동적 게이트는 Preview URL 대기 중** 상태입니다.
새 세션이 시작되면 사용자가 아래 패턴 중 하나를 보낼 수 있으니 맞춰 대응:

| 사용자 메시지 형태 | 대응 |
|---|---|
| "Preview URL은 `https://...` 야" 또는 URL 단독 | Playwright + Lighthouse 스켈레톤 깔고 해당 URL로 돌리기. 결과를 `docs/qa-report-<date>.md`에 추가. |
| "배포 끝났어 / 다음 단계?" | 위 체크리스트의 남은 `[ ]` 항목을 순서대로 안내 (Lighthouse → axe → 실기기 → 프로덕션 승격). |
| "배포 에러 났어: <로그>" | `docs/deployment.md §7` 트러블슈팅 기준으로 진단. |
| "계속해줘" 만 | 사용자 의향 재확인. 기본 추천: E2E/Lighthouse CI 스켈레톤을 로컬 `pnpm start` 대상으로 미리 깔아두기 (B 옵션). |

사용자는 **개발 초보자**이므로 한 번에 한 단계씩, 클릭/명령어 레벨로 안내할 것.

---

## v1.1 — 데이터 레이어 + 개인화 (시작 2026-04-25)

v1.0 MVP 완성 후 시작. JSON seed → Supabase Postgres로 전환하고, 그 위에 CMS·즐겨찾기·알림을 점진적으로 쌓는 다단계 트랙입니다.

### Sub-phase 로드맵

| Sub-phase | 목표 | 상태 |
|---|---|---|
| **B**. Supabase 마이그레이션 | JSON → Postgres, `lib/data.ts` 인터페이스 유지, 페이지 그대로 동작 | ✅ 완료 (2026-05-03, Lighthouse Mobile Perf 98) |
| C. 어드민 CMS | 브라우저에서 갤러리/전시 CRUD | ✅ 완료 (2026-05-03, magic link login + CRUD 다 검증) |
| A'. 데이터 리프레시 | V&A East Storehouse 등 실 갤러리·전시로 채우기 (CMS 사용) | 🔄 다음 |
| D. 즐겨찾기 + Auth | Supabase Auth + 사용자별 saved exhibitions | ⏳ |
| E. 알림 | 시작/종료 임박 이메일 | ⏳ |

> 원래 v1.0에서 우선순위 A(데이터)였지만, B 먼저 가는 게 노력 대비 결과 큼 (어차피 옮길 데이터는 한 번만 입력하는 게 유리). 데이터는 `A'`로 리네이밍해서 CMS 이후로 미룸.

### Phase B 체크리스트

- [x] B-1: 사용자 — Supabase 가입 (GitHub 로그인) + `galleryuk` 프로젝트 생성 (London region)
- [x] B-2: Claude — `galleries`, `exhibitions` 테이블 스키마 SQL 생성 → 사용자가 SQL Editor에 붙여넣기 (`supabase/schema.sql`)
- [x] B-3: Claude — 현재 `public/data/*.json` → SQL INSERT 생성 → 사용자 실행 (`scripts/build-seed-sql.mjs` → `supabase/seed.sql`, 10 갤러리 / 16 전시)
- [x] B-4: 사용자 — Settings → API에서 URL + anon key 복사해서 Vercel env 등록 (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) — URL 끝의 `/rest/v1/` 슬래시 제거 트러블슈팅 1회
- [x] B-5: Claude — `@supabase/supabase-js` 추가, `lib/data.ts` Supabase 쿼리로 교체 (인터페이스 동일 유지), `lib/supabase.ts` lazy 싱글톤, 단위 테스트 47/47 그린 유지
- [x] B-6: 사용자 — PR merge → Vercel 재배포 → 모든 페이지 동작 확인 (홈/전시/갤러리/검색/지도)
- [x] **Gate B**: Blocker 0, 모든 페이지 정상, **Lighthouse Mobile Perf 98** (목표 ≥ 90 충족)

### Phase B 설계 결정

- **Service role key는 코드에 안 쓴다** — 모든 쿼리는 anon key + RLS read-only policy로 충분 (MVP는 read-only 페이지만)
- **API surface 불변** — `getAllGalleries`, `getExhibition` 등 함수 시그니처 그대로 유지. 페이지 코드 수정 0
- **JSON 파일은 보존** — `public/data/*.json` 유지 (참조용, 시드 재실행 가능)
- **빌드 타임 SSG 유지** — `revalidate = 3600` 그대로, Supabase에서 데이터 가져와도 정적 페이지로 prerender

### 다음 세션 재진입 가이드 (PM 본인용)

| 사용자 메시지 형태 | 대응 |
|---|---|
| "Supabase 프로젝트 만들었어" | B-2 (스키마 SQL) 진행 |
| "테이블 만들었어" / "스키마 박았어" | B-3 (seed INSERT) 진행 |
| "Vercel에 키 등록했어" | B-5 (코드 마이그레이션) 진행 |
| "재배포 끝났어 / 사이트 잘 떠" | Gate B 검증 후 다음 sub-phase 안내 |
| "에러 떴어: <로그>" | 단계별 트러블슈팅 |

---

## v1.1 Phase C — 어드민 CMS (시작 2026-05-03)

`/admin` 라우트 아래에 본인 전용 CMS. magic link 로그인 → 갤러리/전시 CRUD.

### Phase C 체크리스트

- [x] C-1: 사용자 — Supabase Authentication > Email provider ON, Users 탭에서 본인 계정 수동 추가
- [x] C-2: 사용자 — Vercel env에 `ADMIN_EMAIL`, `SUPABASE_SERVICE_ROLE_KEY` 등록 (둘 다 NEXT_PUBLIC 접두사 X)
- [x] C-3: Claude — Supabase 클라이언트 3종 (`lib/supabase-server.ts`, `lib/supabase-admin.ts`, `lib/supabase-browser.ts`)
- [x] C-4: Claude — `/admin/login` 페이지 (`LoginForm.tsx`) + `sendMagicLink` Server Action (`actions.ts`)
- [x] C-5: Claude — `/admin/auth/callback/route.ts` 코드 교환 + 세션 쿠키
- [x] C-6: Claude — `app/admin/(authed)/layout.tsx` auth gate (ADMIN_EMAIL 매칭 검증, 실패 시 `/admin/login` 리다이렉트)
- [x] C-7: Claude — `/admin` 대시보드 (galleries/exhibitions count) + `/admin/logout` POST 라우트, stub 페이지 `/admin/galleries`, `/admin/exhibitions`
- [x] C-8: Claude — `/admin/galleries` CRUD (list/create/edit/delete) + 사용자 검증 완료 (V&A East Storehouse 추가/수정/삭제 + revalidatePath 동작)
- [x] C-9: Claude — `/admin/exhibitions` CRUD (list/create/edit/delete + status badge + gallery 드롭다운 + 사용자 검증 완료)
- [ ] C-10: Claude — 단위/통합 테스트 보강 (선택, A'로 미룰 수 있음)
- [x] C-11: 사용자 — Supabase Redirect URL 등록 + 로그인 + 대시보드 진입 + CRUD 검증 완료
- [x] **Gate C**: Blocker 0, magic link 로그인 동작, 갤러리·전시 CRUD 다 작동 (PASS, 2026-05-03)

### Phase C 설계 결정

- **Service-role 키는 서버 전용** — `lib/supabase-admin.ts` 는 `'server-only'` 마킹, 환경변수 이름도 `NEXT_PUBLIC_` 접두사 없음
- **모든 쓰기는 Server Actions** — 클라이언트엔 service role 절대 노출 금지
- **`/admin/(authed)` route group** — URL 영향 없이 layout만 공유. login/callback 페이지는 그룹 밖 (인증 게이트 통과 안 해도 됨)
- **Magic link 발송 노출 최소화** — 누가 요청해도 200 OK; 실제 발송은 admin 이메일 일치 시에만 (timing attack 회피)
- **`shouldCreateUser: false`** — magic link로는 새 사용자 못 만듦. 본인 계정은 Supabase Users 탭에서 수동 생성

### 다음 세션 재진입 가이드 (Phase C 후속)

| 사용자 메시지 형태 | 대응 |
|---|---|
| "C 환경변수 다 등록했어" | C-3~C-7 코드 작성 (이번 세션에 완료) |
| "merge 했고 로그인 됐어" | C-8 (galleries CRUD) 시작 |
| "redirect URL 못 받아 / 매직 링크 안 와" | Supabase URL Configuration + 메일 폴더(스팸함) 확인 안내 |
| "C-8부터 시작해줘" | galleries CRUD 폼 작성 시작 |

---

## v1.2 — 데이터 자동화 (시작 2026-05-03)

CMS 위에 LLM-powered 스크래퍼를 얹어서 갤러리 사이트의 "What's on" 페이지를 매일 자동으로 끌어와 Supabase에 upsert. v1.1 A' (수동 데이터 리프레시)는 v1.2가 흡수해서 사라짐.

### 결정 배경

사용자 우려: "어드민 CMS 만들고 또 손으로 데이터 입력하는 건 자동화 정신에 위배". 동의 → A' 스킵, 자동화 dedicated phase로 격상. v1.1 D/E보다 자동화 먼저 (D/E를 진짜 데이터 위에서 빌드하는 게 디자인 결정 더 정확).

### 아키텍처

```
Vercel Cron (daily 02:00 UTC)
    ↓ POST /api/cron/scrape (CRON_SECRET 인증)
    ↓
For each gallery WHERE whats_on_url IS NOT NULL:
    fetch(whats_on_url) → HTML
    Anthropic Claude Haiku 4.5 → JSON 추출
    parse + Zod 검증
    upsert into exhibitions WHERE NOT verified
    log to scrape_log
```

### Sub-step 로드맵

| # | 단계 | 시간 | 산출물 |
|---|---|---|---|
| **v1.2.1** | ✅ 인프라 — 스키마 추가, Anthropic API 키 등록 (2026-05-03) | 1 세션 | 스키마 마이그레이션 SQL, env 셋업 |
| **v1.2.2** | ✅ 1개 갤러리 PoC + admin /scrape UI (2026-05-03, Tate Modern 15 exhibitions 추출) | 2 세션 | `lib/scrape/*`, `/api/cron/scrape-one`, `/admin/scrape` |
| v1.2.3 | 모든 갤러리로 확장 + 에러 처리 | 1~2 세션 | CMS whats_on_url 필드, 일괄 처리, 갤러리별 URL |
| v1.2.4 | Vercel Cron 연결 + 어드민 로그 페이지 강화 | 1 세션 | `vercel.json`, scrape_log 필터링/페이지네이션 |
| v1.2.5 | 중복 감지 + verified 보호 + 알림 | 1~2 세션 | upsert 로직 강화, admin verified 토글 UI |
| **Gate v1.2** | 7일 연속 cron 성공, verified 보호 검증, 운영비 < $5/월 |

### v1.2.1 체크리스트

- [x] 사용자 — Anthropic Console 가입 (https://console.anthropic.com), API 키 발급, $5 무료 크레딧 확인
- [x] 사용자 — Vercel env에 `ANTHROPIC_API_KEY`, `CRON_SECRET` (랜덤 UUID v4) 등록 (둘 다 NEXT_PUBLIC 접두사 X, Production + Preview)
- [x] Claude — 스키마 마이그레이션 SQL 작성 (`supabase/migrations/v1.2.1-scrape-infrastructure.sql`)
- [x] 사용자 — Supabase SQL Editor에서 마이그레이션 실행 (galleries.whats_on_url, exhibitions.{source_url, last_scraped_at, verified}, 새 테이블 scrape_log + RLS lockdown)
- [ ] 사용자 — CMS에서 각 갤러리에 `whats_on_url` 채우기 (다음 세션 PoC 시작 전 1~2개만)

### v1.2 설계 결정

- **Anthropic Claude Haiku 4.5** — 가성비 최고. 입력 $1/MTok, 출력 $5/MTok. 페이지당 ~$0.005, 월 운영비 ~$1.5
- **Server-only API key** — `ANTHROPIC_API_KEY` (NEXT_PUBLIC_ 없음), 서버 라우트에서만 사용
- **Vercel Cron** — Hobby 플랜에 daily 1회 무료. `vercel.json`에 schedule 정의
- **`verified` 플래그** — admin이 CMS로 수정한 row는 verified=true, scraper 무시. 자동/수동 데이터 충돌 방지
- **`source_url` 추적** — 어느 페이지에서 왔는지 기록, 나중에 출처 표시 / 재검증 시 활용
- **Zod 검증 유지** — LLM이 헛소리해도 ExhibitionSchema에 안 맞으면 reject
- **Rate limit 보호** — cron 호출에 `CRON_SECRET` 헤더 검증 (외부 트리거 방지)

### v1.2.2 Post-mortem — 다음 작업에서 피해야 할 실수 6개

1. **외부 SDK 헬퍼 쓰기 전 의존성 버전 호환성 확인.** `@anthropic-ai/sdk`의 `zodOutputFormat`가 Zod 4의 `.def` 접근자를 썼는데 우리는 Zod 3 (`._def`). 헬퍼가 런타임에 터짐. → 라이브러리 helper 도입 시 우리 의존성 버전 명시 + 실패 시 raw JSON Schema로 우회.
2. **LLM이 뽑는 외부 URL은 출처 도메인이 다양하다.** 갤러리 메인 도메인뿐 아니라 CDN 서브도메인(`prod-images.tate.org.uk` 등)에서 자산이 나옴. `next.config.mjs`의 `images.remotePatterns`을 좁게 잡으면 즉시 깨짐. → 자동 추출 콘텐츠는 `hostname: '**'` 권장.
3. **프롬프트의 모호함 = 데이터 품질 손실.** "ticketUrl is the booking page URL" 같은 일반론은 LLM이 갤러리 메인 페이지나 일반 결제 링크를 잡아옴. → per-record vs per-page, 절대 URL vs 상대 URL을 명시 + post-processing(`new URL(value, base)`)으로 이중 방어.
4. **SSG는 per-instance 캐시다.** `revalidatePath('/exhibitions')`은 리스트만 무효화. `/exhibitions/[slug]`은 슬러그마다 별도 캐시 키. → DB write 후 touched ID마다 `revalidatePath('/exhibitions/{id}')` 호출. 빠뜨리면 사용자는 stale 페이지를 봄.
5. **시드 데이터 + 스크랩 데이터 공존 정책 필요.** 동일 갤러리에 시드와 스크랩이 다른 슬러그로 같이 살면 사용자는 둘 다 봄. → (a) 시드 row를 `verified=true`로 마킹해 보호하거나, (b) 스크래퍼가 verified=false 중 "이번 run에 못 본 row"를 자동 정리.
6. **무료 전시도 외부 사이트로 가는 CTA가 필요하다.** `ticketUrl ? button : 'Free entry' 정적`은 무료 전시 사용자를 막다른 길로 보냄. → 가격과 무관하게 URL 있으면 버튼 (라벨만 "View exhibition" 등으로 바꾸기).

### 스크래퍼/데이터 파이프라인 체크리스트 (v1.2.3+ 적용)

새 스크래핑 코드 또는 데이터 변경하는 admin action 만들 때 마지막에 한 번씩 훑기:

- [ ] 프롬프트가 per-record(전시별) vs per-page(갤러리 전체) 구분을 명시했나
- [ ] LLM 응답의 URL을 `new URL(value, pageUrl)`로 절대 URL 정규화하나
- [ ] `next.config.mjs` `images.remotePatterns`이 새 데이터 출처 도메인을 허용하나
- [ ] DB write 후 SSG-backed 페이지마다 `revalidatePath` 호출 (리스트 + 디테일 둘 다)
- [ ] 시드 row와 새 row의 lifecycle 정책 명시 (verified 보호 + stale 자동 정리 OR 수동 정리)
- [ ] UI에서 가격 / URL 둘 다 없거나, URL만 있거나, 가격만 있는 모든 조합을 처리
- [ ] 외부 SDK helper 도입 시 Zod / 다른 의존성 버전 호환성 확인
- [ ] 로컬 빌드(`pnpm build`)가 stub env로 'Compiled successfully'까지 가나
- [ ] 단위 테스트(`pnpm test`) 그린 유지

### 다음 세션 재진입 가이드 (v1.2 후속)

| 사용자 메시지 형태 | 대응 |
|---|---|
| "Anthropic API 키 받았어" | 스키마 마이그레이션 SQL 생성 안내 |
| "스키마 마이그레이션 끝났어" | v1.2.2 (PoC 스크래퍼) 시작 |
| "Cron 연결됐어" | v1.2.5 (verified 보호 + 알림) 시작 |
| "스크래퍼 에러: <로그>" | LLM 응답 / Zod / API 키 단계별 디버깅 |

---

## 4. 기술 스택 (확정)

| 레이어 | 선택 | 이유 |
|---|---|---|
| 프레임워크 | Next.js 14 (App Router) | SSR+SSG+ISR, 이미지 최적화, API Route |
| 언어 | TypeScript (strict) | 타입 안정성, 협업 명확성 |
| 스타일 | Tailwind CSS + CSS Variables | 빠른 개발, 토큰 관리 용이 |
| UI 킷 | shadcn/ui (선택적 채택) | 접근성 기본 내장, 커스터마이징 가능 |
| 지도 | Google Maps JavaScript API + `@react-google-maps/api` | 영국 데이터 커버리지, 무료 쿼터 충분 |
| 상태 관리 | React Server Components + `useState` / URL state | 오버엔지니어링 회피 |
| 데이터 | (1) JSON seed → (2) Supabase | MVP는 정적, 이후 CMS화 |
| PWA | `next-pwa` 또는 App Router 수동 SW | 앱 경험 제공 |
| 테스트 | Vitest + Playwright + axe-core | 단위/E2E/접근성 |
| 배포 | Vercel | Next.js 최적화, 무료 티어 |
| 분석 | Vercel Analytics (선택) | 개인정보 친화적 |

---

## 5. 에이전트 역할 맵

| 에이전트 | 파일 | 주 책임 | 산출물 |
|---|---|---|---|
| 기획자 | `agents/planner.md` | PRD, 유저스토리, 데이터 모델 | `docs/PRD.md`, `docs/user-stories.md` |
| 디자이너 | `agents/designer.md` | 디자인 토큰, 와이어프레임 | `docs/design-system.md`, 스크린 스펙 |
| 개발자 | `agents/developer.md` | 구현, 배포 | 코드, `README.md` |
| 리뷰어 | `agents/reviewer.md` | 각 Gate 검수 | 리뷰 보고서 (issue 형태) |
| QA | `agents/qa.md` | 테스트 전략/실행 | `docs/qa-plan.md`, 버그 리포트 |

---

## 6. PM(본 문서)의 세션별 행동 규칙

Claude Code가 이 프로젝트에서 세션을 시작할 때:

1. **현재 Phase 확인** — 위 체크리스트에서 체크 안 된 첫 단계
2. **해당 에이전트 파일을 읽고** 역할 컨텍스트 로드
3. 이전 산출물(`docs/*.md`, 코드) 확인 후 이어서 작업
4. 작업 완료 시 **PM 체크리스트의 해당 항목 체크**
5. **Gate 통과 전에는 다음 Phase 파일로 넘어가지 않기**
6. 모든 코드/문서 변경은 `claude/*` 브랜치에 커밋 & 푸시

### 충돌/불확실성 처리
- 요구사항이 모호하면 → Planner 먼저 참조, 그래도 불명확하면 사용자에게 질문
- 디자인 vs 개발 충돌 → 디자이너 문서 우선, 기술 제약 있으면 Reviewer 판단
- 범위 초과(Scope Creep) 징후 → v1.0에서 제외, `docs/backlog.md`에 기록

---

## 7. 성공 기준 (Definition of Done — v1.0)

- [ ] 핵심 5개 화면 웹/모바일 모두 동작
- [ ] 전시 최소 30개, 미술관 최소 10개 실제 데이터
- [ ] 지도에서 미술관 위치 표시 + 상세 이동
- [ ] 전시 상세 → 공식 예매 페이지 이동 정상
- [ ] PWA 설치 가능 (iOS/Android)
- [ ] Lighthouse 4개 지표 ≥ 90
- [ ] WCAG 2.1 AA 기본 충족 (키보드 내비, 대체텍스트, 대비)
- [ ] 프로덕션 URL 정상 동작
- [ ] README에 실행법/배포법 명시

---

## 8. 백로그 / 차후 버전

- v1.1: 즐겨찾기, 알림, 로그인
- v1.2: 다국어 (한국어/영어)
- v1.3: 리뷰/평점
- v2.0: Capacitor 네이티브 래퍼 (스토어 배포)
