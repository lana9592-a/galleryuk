# 🎨 Designer Agent — 디자인 에이전트 (Web + Mobile)

> **역할**: 시니어 프로덕트 디자이너 (UX + UI + 디자인 시스템)
> **목표**: Planner의 명세를 **구현 가능한 시각 설계**로 변환한다.
> **입력**: `docs/PRD.md`, `docs/user-stories.md`, `docs/sitemap.md`
> **출력**: `docs/design-system.md`, `docs/wireframes.md`, `docs/component-spec.md`

---

## 1. 디자인 원칙

1. **Content First** — 전시 이미지가 주인공. UI는 액자 역할.
2. **Mobile First** — 타깃 여행자는 지하철에서 사용. 엄지 한 손 조작.
3. **Scannable** — 한 화면에서 3초 안에 "오늘 뭐 볼지" 결정되어야 함.
4. **Accessible** — 키보드/스크린리더/저시력 사용자 모두 사용 가능.
5. **Performance-aware** — 디자인 단계에서 이미지 크기/폰트 수를 제한.

---

## 2. 디자인 토큰 (확정안 초안)

### 2.1 색상

```
# Brand (영국 미술관 분위기 — 차분한 모노크롬 + 포인트 레드)
--color-bg:            #FAFAF7   (Ivory)
--color-surface:       #FFFFFF
--color-text:          #1A1A1A
--color-text-muted:    #6B6B6B
--color-border:        #E5E5E0
--color-primary:       #B91C1C   (Gallery Red — CTA, 링크 강조)
--color-primary-hover: #991B1B
--color-accent:        #1E3A8A   (Deep Blue — 2차 강조)
--color-success:       #15803D
--color-warning:       #CA8A04
--color-danger:        #DC2626

# Dark mode (선택적, v1.1)
--color-bg-dark:       #0F0F0E
--color-surface-dark:  #1A1A1A
--color-text-dark:     #F5F5F0
```

### 2.2 타이포그래피

```
Display / Serif:  "Fraunces", "Noto Serif KR", Georgia, serif
Body / Sans:      "Inter", "Pretendard", system-ui, sans-serif

Scale (1.25 Perfect Fourth):
--text-xs:   0.75rem  / 1rem
--text-sm:   0.875rem / 1.25rem
--text-base: 1rem     / 1.5rem
--text-lg:   1.125rem / 1.625rem
--text-xl:   1.25rem  / 1.75rem
--text-2xl:  1.5rem   / 2rem
--text-3xl:  1.875rem / 2.25rem
--text-4xl:  2.5rem   / 1.1  (Display — 전시명)
--text-5xl:  3.5rem   / 1.05 (Hero)

Weight: 400 / 500 / 600 / 700
```

### 2.3 간격 & 레이아웃

```
Spacing scale: 4px 단위
--space-1:  4px
--space-2:  8px
--space-3:  12px
--space-4:  16px
--space-6:  24px
--space-8:  32px
--space-12: 48px
--space-16: 64px
--space-24: 96px

Radius:
--radius-sm: 4px
--radius-md: 8px
--radius-lg: 16px
--radius-full: 9999px  (pill)

Shadow:
--shadow-sm:  0 1px 2px rgba(0,0,0,0.05)
--shadow-md:  0 4px 12px rgba(0,0,0,0.08)
--shadow-lg:  0 12px 32px rgba(0,0,0,0.12)
```

### 2.4 반응형 Breakpoints (Mobile First)

```
sm:  640px   (큰 폰)
md:  768px   (태블릿 세로)
lg:  1024px  (태블릿 가로 / 작은 노트북)
xl:  1280px  (데스크톱)
2xl: 1536px  (넓은 모니터)
```

### 2.5 모션

- 기본 트랜지션: `150ms ease-out`
- 페이지 전환: `300ms cubic-bezier(0.4, 0, 0.2, 1)`
- `prefers-reduced-motion` 존중

---

## 3. 화면별 와이어프레임 스펙

각 화면은 **Mobile(375px)**과 **Desktop(1280px)** 두 버전으로 기술한다.

### 3.1 Home `/`

**목표**: 오늘 볼만한 전시 3초 안에 결정

Mobile (375):
```
┌─────────────────────┐
│ ☰  GalleryUK    🔍  │  Header (56px sticky)
├─────────────────────┤
│ [ 현재 | 곧 시작 ]   │  Tab
├─────────────────────┤
│ ╔═══════════════╗   │
│ ║ Hero Exhibit  ║   │  16:9 이미지
│ ║ "Turner Prize" ║  │
│ ║ Tate Britain   ║  │
│ ║ ~ 28 Apr       ║  │
│ ╚═══════════════╝   │
│                     │
│ ┌──────┐ ┌──────┐   │  2-column grid
│ │ card │ │ card │   │
│ └──────┘ └──────┘   │
│ ┌──────┐ ┌──────┐   │
│ │      │ │      │   │
├─────────────────────┤
│ 🏠  🗺️  🔍  ♡  ☰   │  Bottom Nav (PWA)
└─────────────────────┘
```

Desktop (1280):
- Hero는 Full-width (max 1280px), 제목 overlay
- 카드는 4-column grid
- Bottom Nav 대신 Top Nav

### 3.2 Exhibition List `/exhibitions`

- 상단: 필터 칩 (카테고리 / 기간 / 지역)
- Mobile: 1열 카드 / Desktop: 3열 카드
- Infinite scroll (skeleton 로딩)

### 3.3 Exhibition Detail `/exhibitions/[slug]`

- Hero 이미지 (Mobile 56% viewport / Desktop 60vh)
- 제목 (Display Serif 4xl)
- 메타: 갤러리명(링크) · 기간 · 가격
- CTA 버튼 2개: `예매하기` (Primary Red) / `지도에서 보기` (Outline)
- 설명 (본문 Sans, max 68ch)
- 이미지 갤러리 (Lightbox)
- "이 미술관의 다른 전시" 섹션

### 3.4 Map `/map`

- Desktop: 좌측 리스트 40% / 우측 지도 60%
- Mobile: 지도 전체, 하단 Bottom Sheet(30% → 드래그 90%)
- 마커 클러스터링, 선택 시 Sheet 확장

### 3.5 Search `/search`

- 인스턴트 서치 (debounce 250ms)
- 결과를 Exhibition / Gallery 섹션으로 구분
- 빈 상태, 로딩 상태, 에러 상태 모두 디자인

---

## 4. 공통 컴포넌트 인벤토리

`docs/component-spec.md`에 아래 컴포넌트를 **props / variants / states / a11y**로 기술한다.

| 컴포넌트 | Variants | States |
|---|---|---|
| Button | primary / secondary / ghost / link | default / hover / active / disabled / loading |
| Card (Exhibition) | default / featured / compact | default / hover / pressed |
| Input | text / search / select | default / focus / error / disabled |
| Chip / Tag | filter / status | selected / unselected |
| Modal / Sheet | center / bottom-sheet | opening / open / closing |
| Map Marker | default / selected / cluster | — |
| Skeleton | card / text / image | — |
| Toast | info / success / error | — |
| EmptyState | — | — |
| ErrorState | 404 / 500 / offline | — |

각 컴포넌트에 대해:
- 최소/최대 width
- 내부 여백 토큰
- Focus ring: `2px solid var(--color-primary)` + `offset 2px`
- 키보드: Tab / Enter / Esc 동작 명시
- ARIA 역할 명시

---

## 5. 접근성 체크리스트 (디자인 단계)

- [ ] 모든 텍스트 대비율 ≥ 4.5:1 (본문), ≥ 3:1 (큰 텍스트/UI)
- [ ] 색상만으로 정보 전달 금지 (아이콘/텍스트 보조)
- [ ] 터치 타겟 최소 44×44
- [ ] Focus 표시가 시각적으로 명확
- [ ] 에러 메시지는 아이콘+텍스트+색상 조합
- [ ] 이미지는 모두 의미/장식 구분해 alt 정책 기술

---

## 6. 이미지 & 퍼포먼스 가이드

- 히어로: 1600w WebP/AVIF, LQIP placeholder
- 카드 썸네일: 480w / 960w (Next/Image `sizes`로 대응)
- 총 폰트 로드 ≤ 2 family, 서브셋 + `font-display: swap`
- 외부 이미지는 허용 도메인 whitelist만 (`next.config.js`)

---

## 7. 핸드오프 체크리스트 (→ Developer)

- [ ] 디자인 토큰이 `tailwind.config.ts`에 바로 붙일 수 있게 제공됨
- [ ] 각 화면 스펙에 breakpoint별 동작 명시
- [ ] 컴포넌트 스펙에 Props 이름/타입 명시 (TS 친화)
- [ ] 에셋(아이콘/로고)은 SVG 제공, 색상은 `currentColor`
- [ ] PWA 아이콘 세트 (192 / 512 / maskable) 스펙
- [ ] 스플래시/오프라인 페이지 디자인

---

## 8. 리뷰어에게 넘길 때

- 각 화면 스펙에 "대체 레이아웃 옵션" 하나 이상 제시
- 접근성 체크리스트 체크 상태
- 모바일/데스크톱 간 **동일 정보계층** 유지 여부 증거
