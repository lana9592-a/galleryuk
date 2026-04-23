# GalleryUK — Sitemap (v1.0)

> 모든 경로는 Next.js 14 App Router 기준. 경로명은 영어.
> 모바일/데스크톱 동일 경로, 레이아웃만 반응형 분기.

---

## 1. 경로 목록

| 경로 | 화면 | 렌더링 | 주요 유저스토리 | 상태 |
|---|---|---|---|---|
| `/` | Home (Hero + Now on / Coming Soon) | SSG + ISR 1h | US-01, US-02 | Must |
| `/exhibitions` | 전시 목록 (필터/정렬) | SSG + ISR 1h | US-01, US-03, US-04 | Must |
| `/exhibitions/[slug]` | 전시 상세 | SSG (generateStaticParams) | US-05, US-06, US-07 | Must |
| `/galleries` | 미술관 목록 | SSG | US-08 보조 | Must |
| `/galleries/[slug]` | 미술관 상세 | SSG | F-08 | Must |
| `/map` | 지도 뷰 | CSR (client island) | US-08, US-09 | Must |
| `/search` | 검색 결과 | CSR | US-10, US-11 | Must |
| `/about` | 소개 / 제보 | SSG | US-19 | Could |
| `/offline` | 오프라인 fallback | SSG (no-cache 예외) | US-13 | Must |
| `/not-found` (404) | 404 | SSG | US-12 | Must |
| `/api/exhibitions` | 전시 목록 API | Dynamic | 필터/검색 | — |
| `/api/galleries` | 미술관 목록 API | Dynamic | — | — |

---

## 2. 내비게이션 구조

### Desktop (≥1024px) — 상단 수평 Nav
```
[Logo: GalleryUK]     Home   Exhibitions   Map   Galleries   About    [🔍 Search]
```

### Mobile (<768px) — 하단 Bottom Nav (PWA 느낌)
```
┌─────────────────────────────────────┐
│ 🏠 Home   🗺 Map   🔍 Search   ☰ More │
└─────────────────────────────────────┘
```
`☰ More`에 Galleries / About / Install App / 제보 연결.

### Tablet (768~1023px)
상단 Nav를 유지하되 항목은 축약. Search는 아이콘 토글.

---

## 3. 사이트 트리

```
/
├─ exhibitions
│  └─ [slug]
├─ galleries
│  └─ [slug]
├─ map
├─ search
├─ about
├─ offline
└─ api
   ├─ exhibitions
   └─ galleries
```

깊이 2를 넘지 않는다. (클릭 1~2회로 모든 화면 도달)

---

## 4. URL 쿼리 파라미터 규격

각 목록/지도/검색은 URL 쿼리로 상태를 보존해 **공유 가능**하게 만든다.

### `/exhibitions`
| 파라미터 | 값 예시 | 설명 |
|---|---|---|
| `category` | `painting,photo` | 카테고리 다중 (콤마) |
| `tab` | `now` \| `soon` | 기본 `now` |
| `when` | `today` \| `week` \| `weekend` \| `month` \| `YYYY-MM-DD..YYYY-MM-DD` | 기간 |
| `borough` | `southwark,westminster` | 런던 자치구 필터 |
| `priceMax` | `20` | 최대 가격 (GBP) |
| `sort` | `popular` \| `ending-soon` \| `newest` \| `near-me` | 기본 `newest` |

### `/map`
| 파라미터 | 값 예시 | 설명 |
|---|---|---|
| `gallery` | `tate-modern` | 진입 시 해당 마커 선택 |
| `lat`, `lng`, `zoom` | `51.5,-0.1,13` | 뷰 상태 보존 |
| `category` | `photo` | 지도에도 동일 필터 적용 |

### `/search`
| 파라미터 | 값 예시 | 설명 |
|---|---|---|
| `q` | `turner` | 키워드 (2자 이상) |

---

## 5. 화면 간 이동 플로우 (골든 패스)

### Flow A — "이번 주 뭐 볼까?"
```
/ (Home)
  → [Now on 탭 스크롤]
  → [카드 탭]
  → /exhibitions/turner-prize-2026
  → [Book Tickets]
  → (external) tate.org.uk
```

### Flow B — "지도에서 둘러보기"
```
/ (Home)
  → [Bottom Nav: Map]
  → /map
  → [마커 탭]
  → Sheet에서 [Open details]
  → /exhibitions/<slug>
```

### Flow C — "아는 전시 검색"
```
/ (any page)
  → [Search icon]
  → /search?q=turner
  → 결과 카드 탭
  → /exhibitions/<slug>
```

### Flow D — "오프라인 기내모드"
```
(offline) / (any page)
  → SW fallback
  → /offline
  → [캐시된 최근 방문 목록]
```

---

## 6. 화면별 정보 아키텍처 요약

### `/` Home
1. Header (Logo + Search)
2. Hero: featured 전시 1개 (이미지 + 제목 + CTA)
3. Tabs: Now on / Coming Soon
4. Grid: 카드 리스트 (초기 12개, 더 보기 / 무한 스크롤)
5. Section: "Near me" (권한 있을 때)
6. Footer (Bottom Nav 모바일)

### `/exhibitions`
1. Filter bar (sticky): 카테고리 · 기간 · 지역 · 정렬
2. Result count + 현재 쿼리 요약 ("12 exhibitions · Photography · This weekend")
3. Grid (1/2/3/4 열 반응형)
4. 빈 상태 / 로딩 skeleton / 에러 상태

### `/exhibitions/[slug]`
1. Hero 이미지 + 상단 네비 back 버튼
2. Title + Meta (Gallery · dates · price)
3. Primary CTA (Book Tickets) + Secondary (Show on map) + Share (C)
4. Summary (160자) → Description (본문)
5. Image gallery (Lightbox)
6. "Other exhibitions at this gallery"
7. Footer

### `/galleries` / `/galleries/[slug]`
- 목록: 이름·borough·현재 전시 수 카드
- 상세: 기본정보, 지도 미니맵, 현재/예정 전시 그리드

### `/map`
Desktop:
- 좌 40%: 리스트 + 필터
- 우 60%: 지도 + 마커
Mobile:
- 지도 풀스크린
- 하단 Bottom Sheet (30% → 드래그 90%)
- 상단 필터 칩

### `/search`
- Sticky 검색 바
- 섹션: Exhibitions (n) / Galleries (n)
- 0건: "Try another keyword" + 인기 검색어 (수작업 리스트)

### `/about`
- 서비스 소개 (200자)
- 데이터 출처 / 저작권 / 제보 링크
- 버전 / GitHub 링크 (선택)

### `/offline`
- 큰 타이틀 "You're offline"
- 재시도 버튼
- 최근 캐시된 전시 리스트

### `/not-found`
- "Exhibition not found"
- Home / Search 링크

---

## 7. SEO & 공유 메타

| 경로 | title (예) | description | OG 이미지 |
|---|---|---|---|
| `/` | "GalleryUK — Art exhibitions in the UK" | "One place to find what's on in UK galleries." | `/opengraph-image` (동적) |
| `/exhibitions` | "Exhibitions · GalleryUK" | 필터 상태 반영 | 동일 |
| `/exhibitions/[slug]` | "<title> · <gallery> · GalleryUK" | 전시 summary | 전시 heroImage |
| `/map` | "Map · GalleryUK" | "Explore galleries on a map." | 기본 |

- `robots.txt` + `sitemap.xml` 자동 생성
- 구조화 데이터: `Event` schema.org JSON-LD (전시 상세)

---

## 8. 접근성 내비게이션 요구

- Skip link: "Skip to main content"
- 각 페이지 `<h1>` 단 하나
- Focus order: Header → Main → Footer
- 브레드크럼(선택): `Home / Exhibitions / <Title>`

---

## 9. 결정 이력 / 열린 질문

**확정 (2026-04-18):**
- Q-S1 미술관 상세 → **v1.0 Must 포함** (Sheet의 "Open details" dead-end 방지)
- Q-S3 Borough 필터 → **공식 런던 32개 자치구** 기준 (정확성 우선)

**배포 전 확정 필요:**
- Q-S2 `/about` 제보 수단 → `mailto:` 링크 + 대상 이메일 주소
