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
- [ ] `agents/designer.md` 실행
- [ ] 디자인 토큰 (색상/타이포/간격) 확정
- [ ] 웹 와이어프레임 (Home / List / Detail / Map / Search)
- [ ] 모바일 와이어프레임 (같은 화면, 세로형)
- [ ] 컴포넌트 인벤토리 (버튼/카드/필터 등)
- [ ] **Gate 2**: 리뷰 검토 통과 + 디자인-개발 핸드오프 문서

### Phase 3 — 개발: 기반 (Week 3)
- [ ] `agents/developer.md` 실행
- [ ] Next.js 14 + TypeScript + Tailwind 프로젝트 생성
- [ ] 폴더 구조, ESLint/Prettier, 절대경로 설정
- [ ] 디자인 토큰을 Tailwind config에 반영
- [ ] 공통 레이아웃 / 네비게이션 / 반응형 breakpoint
- [ ] 더미 데이터 기반 화면 5개 구현
- [ ] **Gate 3**: 리뷰 통과

### Phase 4 — API 연결 & PWA (Week 4)
- [ ] 데이터 소스 결정: Supabase / JSON Seed / External API
- [ ] `/api/*` Route Handlers 구현
- [ ] Google Maps 연동 (지도 + 마커 + 클러스터)
- [ ] 예매 Deep Link 연결
- [ ] PWA 설정: `manifest.webmanifest`, icons, Service Worker
- [ ] 오프라인 fallback 페이지
- [ ] **Gate 4**: 리뷰 통과

### Phase 5 — QA & 배포 (Week 5~6)
- [ ] `agents/qa.md` 실행: 테스트 계획 수립 및 실행
- [ ] Lighthouse 점수 Perf/A11y/Best/SEO ≥ 90
- [ ] 모바일 실기기 테스트 (iOS Safari / Android Chrome)
- [ ] PWA 설치 테스트
- [ ] Vercel 프로덕션 배포
- [ ] 도메인 연결 (선택)
- [ ] **Gate 5 (최종)**: 모든 Acceptance Criteria 통과

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
