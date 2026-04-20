# GalleryUK — Component Specification (v1.0)

> 개발자가 그대로 TypeScript Props로 옮길 수 있는 형태.
> 접근성/키보드/상태를 포함. 각 컴포넌트는 `components/ui/` 또는 `components/<domain>/`에 위치.
> 관련: `docs/design-system.md` 토큰 / `docs/wireframes.md` 화면 사용 맥락

---

## 0. 작성 규칙

- Props는 TS 타입과 기본값 포함
- Variants는 **시각적** 차이, States는 **상호작용** 차이
- 모든 대화형(버튼/링크/입력)은 키보드 접근 가능
- Focus ring은 `2px var(--color-focus)` + `outline-offset 2px` 고정

---

## 1. Button

**위치**: `components/ui/Button.tsx`

### Props
```ts
type ButtonProps = {
  variant?: 'primary' | 'secondary' | 'ghost' | 'link';  // default 'primary'
  size?: 'sm' | 'md' | 'lg';                             // default 'md'
  fullWidth?: boolean;                                    // default false
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit';                            // default 'button'
  asChild?: boolean;                                      // Radix-style polymorphism
  children: ReactNode;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
};
```

### Variants (시각)
| Variant | bg | text | border | 사용 예 |
|---|---|---|---|---|
| primary | `--color-primary` | white | none | "Book Tickets" |
| secondary | transparent | `--color-text` | `--color-border-strong` | "Show on map" |
| ghost | transparent | `--color-text` | none | 헤더 아이콘 버튼 |
| link | transparent | `--color-primary` | none (underline hover) | 텍스트 링크 강조 |

### Sizes
| Size | 시각 height | **실제 hit area (mobile)** | px padding | text |
|---|---|---|---|---|
| sm | 32 | 44 (패딩으로 확장) | 12 | `text-sm` |
| md | 40 | 44 | 16 | `text-sm` |
| lg | 56 | 56 | 20 | `text-base` |

**터치 타겟 규약**: 모든 버튼은 모바일(`<md`)에서 hit area ≥ 44×44를 보장한다. `sm`은 시각적 높이 32를 유지하되 수직 패딩을 늘려 히트박스를 44로 확장(`py-[6px]` 추가). 데스크톱(`≥md`)에서는 시각 높이 그대로 허용. 같은 규약이 `IconButton`·`FilterChip`에도 적용.

### States
- default / hover / active / focus-visible / disabled / loading
- hover: primary → `--color-primary-hover`, secondary → `bg: --color-surface-muted`
- loading: 스피너(아이콘 자리) + 텍스트 opacity 60, 클릭 막기
- disabled: opacity 50, `cursor-not-allowed`

### A11y
- 아이콘만인 경우 `aria-label` 필수
- loading 중 `aria-busy="true"` + `aria-live="polite"`
- 외부 링크로 쓰일 땐 `asChild` + `<a target="_blank" rel="noopener noreferrer">` + "opens in new tab" 안내

---

## 2. IconButton

**위치**: `components/ui/IconButton.tsx`

### Props
```ts
type IconButtonProps = {
  icon: ReactNode;
  label: string;              // aria-label, 필수
  variant?: 'ghost' | 'solid'; // default 'ghost'
  size?: 'sm' | 'md' | 'lg';   // 32 / 40 / 48
  onClick?: MouseEventHandler;
};
```

- 터치 타겟 ≥ 44×44 보장 (패딩으로 확장)
- 헤더 검색, 닫기(×), 메뉴(☰), Share 등에 사용

---

## 3. Input

**위치**: `components/ui/Input.tsx`

### Props
```ts
type InputProps = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: 'text' | 'search' | 'email';  // default 'text'
  leftIcon?: ReactNode;
  rightSlot?: ReactNode;                // 예: clear 버튼
  error?: string;
  label?: string;                       // 시각 또는 sr-only
  hideLabel?: boolean;
  id?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  maxLength?: number;
  inputMode?: 'text' | 'search' | 'email';
};
```

### States
- default / focus / filled / error / disabled
- focus: `border-color --color-focus`, `ring 2px`
- error: `border-color --color-danger`, 하단 에러 메시지 `text-sm text-danger`

### A11y
- `<label htmlFor={id}>` 필수 (숨기려면 `sr-only`)
- error는 `aria-describedby` + `aria-invalid="true"`
- 검색용은 `role="searchbox"` + Enter 시 submit

---

## 4. ExhibitionCard

**위치**: `components/exhibition/ExhibitionCard.tsx`

### Props
```ts
type ExhibitionCardProps = {
  exhibition: Pick<Exhibition,
    'id'|'title'|'heroImage'|'heroImageAlt'|'startDate'|'endDate'|'category'|'priceFrom'>;
  gallery: Pick<Gallery, 'id'|'name'|'shortName'>;
  variant?: 'default' | 'featured' | 'compact' | 'horizontal';
  priority?: boolean;  // Next/Image LCP
};
```

### Variants
| Variant | 이미지 비율 | 쓰임 |
|---|---|---|
| default | 4:3 | `/` Home grid, `/exhibitions` list |
| featured | 16:9 | `/` Hero |
| compact | 1:1 | Map Sheet, 검색 결과 |
| horizontal | 16:9 + 옆 텍스트 | "Other at this gallery" |

### 구성 요소
- 이미지 (Next/Image, `sizes` 반응형)
- 제목 (2줄 clamp)
- 메타: 미술관명 · `dateDisplay` · price 배지 또는 `Free`
- Category tag (text-xs uppercase tracking-wide)

### 상태
- default / hover (shadow-md, scale 1.01) / active (scale 0.99) / pressed
- ended: 전체 opacity 60 + "Ended" 배지

### 링크
- 카드 전체가 `<Link href="/exhibitions/[slug]">` (전체 클릭 영역)
- 내부의 "Gallery name"은 `<Link>` 중첩 금지 → 별도 텍스트로 처리

### 접근성
- 이미지 alt: `heroImageAlt`
- 카드 링크의 accessible name: 제목 + 미술관 + 기간이 읽히도록 `aria-label`

---

## 5. GalleryCard

**위치**: `components/gallery/GalleryCard.tsx`

### Props
```ts
type GalleryCardProps = {
  gallery: Pick<Gallery, 'id'|'name'|'logoUrl'|'borough'>;
  activeCount: number;     // 현재 진행 중 전시 수
  distanceKm?: number;     // near-me 정렬 시
  variant?: 'list' | 'sheet';
};
```

- 좌측: 로고 아바타 (40×40 circle, 규칙은 `design-system.md §9.4` 참조)
- 중앙: 이름(`text-lg`) · borough(`text-sm muted`)
- 우측: "N exhibitions" 또는 "2.3 km"
- 전체 클릭 → `/galleries/[slug]`

---

## 6. FilterChip

**위치**: `components/ui/FilterChip.tsx`

### Props
```ts
type FilterChipProps = {
  label: string;
  count?: number;         // 선택된 개수 배지
  active?: boolean;
  onClick: () => void;
  icon?: ReactNode;
};
```

- pill, 시각 height 32 / 모바일 hit area ≥ 44 (수직 패딩 확장)
- active: `bg: --color-text`, `text: white`
- inactive: `bg: --color-surface`, `border: --color-border`
- count > 0이면 `label · N` 형태
- 키보드: Enter/Space 토글, `aria-pressed`

---

## 7. FilterSheet / FilterPopover

**위치**: `components/ui/FilterSheet.tsx`

- 모바일: `BottomSheet`
- 데스크톱: `Popover` (Radix UI)

### Props
```ts
type FilterSheetProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  children: ReactNode;      // 체크박스/라디오 리스트
  onApply: () => void;
  onClear: () => void;
};
```

- 하단 sticky bar: [Clear] [Apply (N)]
- Esc 닫기, 외부 탭 닫기

---

## 8. Tabs

**위치**: `components/ui/Tabs.tsx`

Radix UI `Tabs` 기반 wrap.

### Props
```ts
type TabsProps = {
  value: string;
  onValueChange: (v: string) => void;
  items: { value: string; label: string; count?: number }[];
};
```

- Underline 스타일 (active: border-b 2px primary, text primary)
- 키보드: ← → 전환, Home/End
- ARIA: `role="tablist"`, `tab`, `tabpanel`

---

## 9. Modal / Dialog

**위치**: `components/ui/Dialog.tsx`

- Radix Dialog 기반
- 데스크톱: center, max-width 480, radius-xl
- 모바일: 풀스크린에 가까움 (top 40, border-radius 상단만)
- 애니메이션: 페이드 + 약간의 상향

### Props
```ts
type DialogProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
};
```

- 타이틀: `DialogTitle` → `h2`
- `aria-describedby`로 description 연결
- Esc / outside click / 상단 × 로 닫기

---

## 10. BottomSheet

**위치**: `components/ui/BottomSheet.tsx`

- `vaul` 라이브러리 또는 자체 구현
- Snap points: [0.3, 0.9] (뷰포트 비율)
- 드래그 핸들(2px 40w divider)
- iOS bounce 방지

### Props
```ts
type BottomSheetProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  snap?: number;
  onSnapChange?: (n: number) => void;
  children: ReactNode;
};
```

---

## 11. Map & Marker

**위치**: `components/gallery/MapView.tsx`, `MapMarker.tsx`

### MapView Props
```ts
type MapViewProps = {
  galleries: Gallery[];
  center?: { lat: number; lng: number };  // default 런던
  zoom?: number;                           // default 12
  selectedGalleryId?: string;
  onMarkerClick: (id: string) => void;
  onBoundsChange?: (bounds: google.maps.LatLngBounds) => void;
};
```

### MapMarker
- default: SVG circle, `--color-primary`, 28×28
- selected: 40×40 + 외곽 ring
- cluster: 원형에 숫자, `--color-accent`

- `@googlemaps/markerclusterer`로 클러스터링
- 모바일은 `gestureHandling: 'greedy'` 금지 (지도에 갇힘 방지), `'cooperative'`
- 키보드: 지도는 W3C 권장대로 focus 시 이동 안내

---

## 12. SearchBar

**위치**: `components/ui/SearchBar.tsx`

### Props
```ts
type SearchBarProps = {
  value: string;
  onChange: (v: string) => void;
  onSubmit?: (v: string) => void;
  autoFocus?: boolean;
  placeholder?: string;  // default "Search exhibitions, galleries..."
  size?: 'sm' | 'md';
};
```

- 좌측: search icon
- 우측: clear (× ) 버튼 — value 있을 때만
- Enter → onSubmit (데스크톱 헤더) 또는 debounce onChange (search 페이지)

---

## 13. Skeleton

**위치**: `components/ui/Skeleton.tsx`

### Props
```ts
type SkeletonProps = {
  variant: 'card' | 'text' | 'image' | 'circle';
  count?: number;
  className?: string;
};
```

- `animate-pulse`, `bg-surface-muted`
- `prefers-reduced-motion` 시 정적

---

## 14. EmptyState

**위치**: `components/ui/EmptyState.tsx`

### Props
```ts
type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: { label: string; href?: string; onClick?: () => void };
};
```

- 중앙 정렬, 상하 패딩 64
- 최대 2개 액션 (Primary + Secondary)

---

## 15. ErrorState

**위치**: `components/ui/ErrorState.tsx`

### Props
```ts
type ErrorStateProps = {
  kind: '404' | '500' | 'offline' | 'generic';
  title: string;
  description?: string;
  onRetry?: () => void;
};
```

- offline 시 Retry 버튼은 disabled 해제가 `navigator.onLine` 감지 시 자동

---

## 16. Toast

**위치**: `components/ui/Toast.tsx` (Sonner 또는 자체)

### API
```ts
toast.info(message: string);
toast.success(message: string);
toast.error(message: string);
```

- 하단 중앙 (모바일은 Bottom Nav 위로 offset)
- 자동 dismiss 4s
- `role="status"` (info/success) / `role="alert"` (error)

---

## 17. Header / TopNav

**위치**: `components/layout/Header.tsx`

- 공통 구조: logo + nav + search
- 데스크톱에서 Nav 항목: Home / Exhibitions / Map / Galleries / About
- Active 표시: `aria-current="page"` + 밑줄

---

## 18. BottomNav (Mobile)

**위치**: `components/layout/BottomNav.tsx`

- 4개 아이템: Home / Map / Search / More
- active 색 `--color-primary`, 나머지 `--color-text-muted`
- 텍스트 `text-xs`
- `env(safe-area-inset-bottom)` 반영

---

## 19. Footer (Desktop)

**위치**: `components/layout/Footer.tsx`

- 단일 행, 좌측 `© GalleryUK v1.0`, 우측 About · Contact · Data source
- 모바일에서는 `/about`으로 통합

---

## 20. Lightbox

**위치**: `components/ui/Lightbox.tsx`

### Props
```ts
type LightboxProps = {
  images: { url: string; alt: string; caption?: string }[];
  index: number;
  open: boolean;
  onOpenChange: (v: boolean) => void;
};
```

- 키보드: ← → 이동, Esc 닫기, Home/End
- 모바일: 스와이프
- 이미지 pinch-zoom 허용
- alt 누락 금지

---

## 21. InstallPrompt (PWA)

**위치**: `components/pwa/InstallPrompt.tsx`

### 동작
- `beforeinstallprompt` 이벤트 훅 (Android/Chrome)
- 조건 만족 시 상단 얇은 배너 렌더
- 클릭 → `prompt.prompt()`
- iOS Safari: `isIOS && !isStandalone` 시 1회 Modal로 대체
- dismiss 14일간 `localStorage`에 저장

---

## 22. OfflineBanner

**위치**: `components/layout/OfflineBanner.tsx`

- `useOnline()` 훅으로 상태 감지
- 오프라인 시 상단 배너 `Offline — Showing cached content`
- 복구 시 자동 숨김

---

## 23. Share

**위치**: `components/ui/ShareButton.tsx`

- `navigator.share` 지원 시 네이티브 Share Sheet
- 미지원: 클립보드 복사 + Toast
- `aria-label="Share"`

---

## 24. 공통 접근성 규약

| 요구 | 적용 |
|---|---|
| Focus ring | 2px `--color-focus`, offset 2px |
| 터치 타겟 | 최소 44×44 |
| 이미지 | 의미 있음 → alt 필수, 장식 → `alt=""` |
| 아이콘만 버튼 | `aria-label` 필수 |
| Esc로 닫힘 | Modal/Sheet/Lightbox |
| 탭 순서 | DOM 순서 = 시각 순서 |
| 색상만으로 정보 | 금지 (아이콘/텍스트 보조) |
| Reduced Motion | 애니메이션 disable |

---

## 25. 개발자 핸드오프 체크리스트

- [x] 디자인 토큰 → `design-system.md` §12
- [x] 컴포넌트 Props TS 인터페이스 명시
- [x] Variants / States 표준화
- [x] 에셋 포맷 (SVG 아이콘 with `currentColor`)
- [x] PWA 아이콘 세트 스펙 (`design-system.md` §11)
- [x] `/offline` 디자인 (`wireframes.md` §8)
- [x] 접근성 체크리스트 각 컴포넌트 반영

---

## 26. 변경 이력
- 2026-04-18 v1.0 — 초안 (designer-agent). 컴포넌트 23종 정의.
