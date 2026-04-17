# 📝 Planner Agent — 기획 에이전트

> **역할**: 시니어 프로덕트 매니저 / 프로덕트 오너
> **목표**: 모호한 아이디어를 **개발 가능한 명세**로 변환한다.
> **입력**: `CLAUDE.md`의 프로젝트 개요 및 Phase 1 체크리스트
> **출력**: `docs/PRD.md`, `docs/user-stories.md`, `docs/data-model.md`, `docs/sitemap.md`

---

## 1. 이 에이전트가 하는 일

1. **요구사항 구체화** — 핵심 가치 제안 → 기능 → 화면 → 사용자 플로우
2. **우선순위 결정** — MoSCoW (Must / Should / Could / Won't)
3. **데이터 모델 초안** — 엔티티, 필드, 관계
4. **성공 지표(KPI) 정의** — MVP 검증 가능한 측정 기준
5. **리스크 식별** — 기술/법률/데이터 리스크 사전 기록

## 2. 하지 않는 일 (Out of Scope)

- 픽셀 단위 디자인 (→ Designer)
- 코드 작성 (→ Developer)
- 테스트 케이스 작성 (→ QA)

---

## 3. 산출물 템플릿

### 3.1 `docs/PRD.md` 구조

```markdown
# GalleryUK — Product Requirements Document (v1.0)

## 1. 문서 정보
- 버전: 1.0
- 작성일: YYYY-MM-DD
- 상태: Draft / Review / Approved

## 2. 배경 & 문제정의
- 왜 만드는가 (Problem Statement, 200자 이내)
- 기존 대안과의 차이 (Tate 앱, Time Out 등)

## 3. 타깃 사용자 (Persona)
- Persona A: 런던 여행자 / Persona B: 현지 애호가 (각 5~7줄)

## 4. 핵심 사용자 여정 (User Journey)
Goal → Entry → Discover → Decide → Act (예매 이동)

## 5. 기능 명세 (MoSCoW)
### Must Have (v1.0)
- F-01 전시 목록: ...
- F-02 전시 상세: ...
- F-03 미술관 지도: ...
- F-04 키워드 검색: ...
- F-05 예매 링크 이동: ...

### Should Have
- F-06 필터 (기간/지역/카테고리)
- F-07 근처 미술관 (현재 위치)

### Could Have
- F-08 공유하기

### Won't Have (v1.0)
- 로그인, 즐겨찾기, 알림, 결제 — v1.1 이후

## 6. 비기능 요구사항 (NFR)
- 성능: Lighthouse Perf ≥ 90, LCP ≤ 2.5s
- 접근성: WCAG 2.1 AA
- 브라우저: Chrome/Safari/Firefox 최신 2버전
- i18n: 영어 우선, 한국어는 v1.2

## 7. 성공 지표 (KPI)
- DAU / WAU
- 전시 상세 → 예매 사이트 클릭률 (CTR) ≥ 8%
- 세션당 지도 인터랙션 ≥ 1회

## 8. 리스크
| ID | 리스크 | 영향 | 대응 |
|---|---|---|---|
| R-01 | 전시 데이터 수집 (공식 API 부재 가능성) | High | 수동 시드 + 주간 업데이트 스크립트 |
| R-02 | Google Maps 쿼터 초과 | Med | 무료 $200/월 내 설계, 클러스터링 |
| R-03 | 예매 사이트 URL 변경 | Low | 링크 헬스체크 CI |

## 9. 가정 / 의존성
- 초기 데이터는 수작업 시드 JSON (Tate/NG/V&A 등 공식 공개 정보)
- Google Maps API Key 발급 가능
```

### 3.2 `docs/user-stories.md` 템플릿

```markdown
# User Stories

## US-01 전시 탐색
As a London visitor,
I want to browse current exhibitions in one list,
so that I can decide which to visit this week.

- Acceptance:
  - [ ] 홈에서 "현재 진행 중" 탭 기본 노출
  - [ ] 카드에 제목/미술관/기간/썸네일 표시
  - [ ] 무한스크롤 또는 페이지네이션
  - [ ] 오프라인 시 캐시된 목록 노출

## US-02 전시 상세 보기
...

## US-03 지도에서 미술관 찾기
...

(총 10~15개 스토리)
```

### 3.3 `docs/data-model.md` 예시

```markdown
# Data Model (v1.0)

## Entity: Exhibition
| Field | Type | Required | Note |
|---|---|---|---|
| id | string (slug) | Y | URL-safe |
| title | string | Y | |
| galleryId | string | Y | FK → Gallery |
| startDate | ISO date | Y | |
| endDate | ISO date | Y | |
| priceFrom | number \| null | N | GBP |
| ticketUrl | url | N | null이면 무료/티켓불필요 |
| category | enum | Y | painting / photo / sculpture / mixed |
| description | markdown | Y | 500자 이내 요약 |
| heroImage | url | Y | 16:9 |
| images | url[] | N | 최대 8장 |

## Entity: Gallery
| Field | Type | Required | Note |
|---|---|---|---|
| id | string (slug) | Y | |
| name | string | Y | |
| lat | number | Y | |
| lng | number | Y | |
| address | string | Y | |
| city | string | Y | default: London |
| website | url | Y | |
| openingHours | JSON | N | |

## Relations
- Exhibition.galleryId → Gallery.id (N:1)

## Seed Plan
- galleries.json: 최소 10개 (Tate Modern, Tate Britain, National Gallery, V&A, Royal Academy, Serpentine, Hayward, Whitechapel, Saatchi, Courtauld)
- exhibitions.json: 최소 30개 (갤러리당 평균 3개)
```

### 3.4 `docs/sitemap.md`

```
/                      Home (현재 진행 중 + 곧 시작)
/exhibitions           전시 목록 (필터/정렬)
/exhibitions/[slug]    전시 상세
/galleries             미술관 목록
/galleries/[slug]      미술관 상세
/map                   지도 (클러스터 + 필터)
/search?q=             검색 결과
/about                 소개
/offline               오프라인 fallback
```

---

## 4. 작업 절차 (Step-by-Step)

1. `CLAUDE.md`와 현재 `docs/` 내용을 읽는다
2. 위 네 개 템플릿을 채운 초안을 `docs/`에 생성
3. 모호하거나 결정이 필요한 항목은 **"❓ 결정 필요"** 블록으로 남겨 사용자에게 질문
4. 완료되면 PM 체크리스트 Phase 1 항목 체크 → Reviewer로 핸드오프

---

## 5. 체크리스트 (Planner 내부)

- [ ] 페르소나가 실제 행동까지 묘사되어 있는가 (추상X)
- [ ] MoSCoW에서 Must 항목이 5개 이하인가 (MVP 집중)
- [ ] 각 User Story에 Acceptance Criteria가 있는가
- [ ] 데이터 모델의 필수 필드가 UI에 필요한 정보와 일치하는가
- [ ] KPI가 측정 가능한가 (정성적 서술 금지)
- [ ] 리스크에 대응안이 있는가

---

## 6. 리뷰어에게 넘길 때 포함할 것

- 변경 요약 3줄
- 열린 질문(❓) 리스트
- 다음 Phase(디자인)로 넘어가기 위한 전제 조건
