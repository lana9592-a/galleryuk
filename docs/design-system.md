# GalleryUK — Design System (v1.0)

> 본 문서의 토큰은 `tailwind.config.ts`와 `app/globals.css`에 **그대로 이식** 가능한 형태로 작성됐다.
> 브랜딩 톤: **미니멀 모노크롬** (아이보리 배경 · 블랙 텍스트 · 포인트 레드)

---

## 1. 브랜드 & 원칙

### 1.1 브랜드 톤 (확정)
- 영국 공공 미술관의 차분한 분위기를 디지털로 번역
- 색은 절제, 타이포와 이미지가 주인공
- 장식 금지. 여백·비율·타이포 대비로 위계 표현

### 1.2 디자인 원칙 (요약)
1. **Content First** — 전시 이미지가 주인공
2. **Mobile First** — 375px 기준으로 먼저 설계
3. **Scannable** — 3초 안에 "오늘 뭐 볼지" 판단 가능
4. **Accessible** — WCAG 2.1 AA 준수
5. **Performance-aware** — 디자인 시점부터 이미지/폰트 수 제한

---

## 2. 색상 토큰

### 2.1 Light (기본)

| Token | Hex | 용도 |
|---|---|---|
| `--color-bg` | `#FAFAF7` | 페이지 배경 (Ivory) |
| `--color-surface` | `#FFFFFF` | 카드/시트 표면 |
| `--color-surface-muted` | `#F3F2EC` | 섹션 구분 배경 |
| `--color-text` | `#1A1A1A` | 본문 |
| `--color-text-muted` | `#6B6B6B` | 메타 텍스트 (기간, 가격 등) |
| `--color-text-faint` | `#9A9A9A` | placeholder, disabled |
| `--color-border` | `#E5E5E0` | 카드 테두리, divider |
| `--color-border-strong` | `#CFCFC8` | 입력 필드 active |
| `--color-primary` | `#B91C1C` | CTA, 링크 강조 (Gallery Red) |
| `--color-primary-hover` | `#991B1B` | Primary hover |
| `--color-primary-soft` | `#FEE2E2` | Primary 배경 (예: Hero overlay) |
| `--color-accent` | `#1E3A8A` | 2차 강조 (Deep Blue) |
| `--color-success` | `#15803D` | 성공 Toast |
| `--color-warning` | `#CA8A04` | 경고 배지 |
| `--color-danger` | `#DC2626` | 에러 |
| `--color-focus` | `#2563EB` | Focus ring |

### 2.2 Dark (v1.1 예약)
```
--color-bg-dark:       #0F0F0E
--color-surface-dark:  #1A1A1A
--color-text-dark:     #F5F5F0
--color-border-dark:   #2A2A28
```
v1.0은 Light 고정. `prefers-color-scheme: dark`는 v1.1에서 활성.

### 2.3 대비율 검증

| 조합 | 비율 | 기준 |
|---|---|---|
| `--color-text` on `--color-bg` | 15.3:1 | AAA ✅ |
| `--color-text-muted` on `--color-bg` | 5.0:1 | AA ✅ |
| `--color-primary` on `--color-bg` | 5.9:1 | AA ✅ |
| 흰 텍스트 on `--color-primary` | 6.4:1 | AA ✅ |
| `--color-text-faint` on `--color-bg` | 2.7:1 | **텍스트 사용 금지**, placeholder 전용 |

---

## 3. 타이포그래피

### 3.1 Font Family

| Role | Stack |
|---|---|
| Display (Serif) | `"Fraunces", "Noto Serif KR", Georgia, serif` |
| Body (Sans) | `"Inter", "Pretendard", system-ui, sans-serif` |
| Mono | `ui-monospace, SFMono-Regular, Menlo, monospace` |

- `font-display: swap`
- 로드 weight: Fraunces 500/700, Inter 400/500/600
- 총 font file 6개 이하

### 3.2 Scale (Perfect Fourth 1.25)

| Token | Size / Line | 용도 |
|---|---|---|
| `text-xs` | 12 / 16 | caption, 메타 |
| `text-sm` | 14 / 20 | 보조 텍스트 |
| `text-base` | 16 / 24 | 본문 (기본) |
| `text-lg` | 18 / 26 | 큰 본문 |
| `text-xl` | 20 / 28 | 카드 제목 |
| `text-2xl` | 24 / 32 | 섹션 제목 |
| `text-3xl` | 30 / 36 | 페이지 H1 (모바일) |
| `text-4xl` | 40 / 44 | Display (전시명) |
| `text-5xl` | 56 / 58 | Hero (Desktop) |

### 3.3 역할별 적용

| 요소 | Class |
|---|---|
| 전시 상세 제목 | `font-serif text-4xl md:text-5xl font-bold tracking-tight` |
| 카드 제목 | `font-sans text-xl font-semibold` |
| 본문 | `font-sans text-base leading-relaxed` |
| 메타 (날짜·가격) | `font-sans text-sm text-text-muted` |
| 버튼 | `font-sans text-sm font-semibold` (모바일) / `text-base` (데스크톱) |

### 3.4 최대 줄길이
- 본문: `max-width: 68ch` (약 640px)
- 카드 제목: 2줄 클램프 (`line-clamp-2`)

---

## 4. 간격 (Spacing)

4px 기반 스케일.

| Token | px |
|---|---|
| `space-1` | 4 |
| `space-2` | 8 |
| `space-3` | 12 |
| `space-4` | 16 |
| `space-5` | 20 |
| `space-6` | 24 |
| `space-8` | 32 |
| `space-10` | 40 |
| `space-12` | 48 |
| `space-16` | 64 |
| `space-20` | 80 |
| `space-24` | 96 |

사용 규칙:
- 컴포넌트 내부 패딩: 12 / 16 / 24
- 카드 간 gap: 16 (모바일) / 24 (데스크톱)
- 섹션 상하 여백: 48 (모바일) / 96 (데스크톱)

---

## 5. 레이아웃 & 반응형

### 5.1 Breakpoints

| Name | Min-width | 주 용도 |
|---|---|---|
| `sm` | 640px | 큰 폰 / 가로 |
| `md` | 768px | 태블릿 세로 |
| `lg` | 1024px | 태블릿 가로 / 작은 노트북 |
| `xl` | 1280px | 데스크톱 |
| `2xl` | 1536px | 넓은 모니터 |

### 5.2 Container

```
max-width: 1280px
padding-x: 16 (sm), 24 (md), 32 (lg+)
```

### 5.3 Grid (카드 목록)

| Breakpoint | 열 수 | gap |
|---|---|---|
| `<sm` | 1 | 16 |
| `sm` | 2 | 16 |
| `lg` | 3 | 24 |
| `xl` | 4 | 24 |

### 5.4 Safe Area (iOS)
- `viewport-fit=cover` + `env(safe-area-inset-*)` 적용
- Bottom Nav 하단 = `env(safe-area-inset-bottom) + 12px`

---

## 6. 모양 (Radius · Shadow · Border)

### Radius
| Token | px |
|---|---|
| `radius-sm` | 4 |
| `radius-md` | 8 |
| `radius-lg` | 16 |
| `radius-xl` | 24 |
| `radius-full` | 9999 |

적용:
- 버튼: `radius-full` (pill) 또는 `radius-md`
- 카드 / 이미지 썸네일: `radius-lg`
- 입력 필드: `radius-md`
- 모달 / 시트: `radius-xl` (상단만)

### Shadow
| Token | Value |
|---|---|
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` |
| `shadow-md` | `0 4px 12px rgba(0,0,0,0.08)` |
| `shadow-lg` | `0 12px 32px rgba(0,0,0,0.12)` |

적용:
- 카드 hover: `shadow-md`
- Bottom sheet / Modal: `shadow-lg`
- Floating action 버튼 (Map FAB): `shadow-lg`

### Border
- 기본 1px `--color-border`
- Focus: `2px solid var(--color-focus)` + `outline-offset: 2px`

---

## 7. 모션

| 상황 | Duration | Easing |
|---|---|---|
| Hover / 색 전환 | 150ms | ease-out |
| 레이아웃 변화 | 220ms | cubic-bezier(0.4, 0, 0.2, 1) |
| 페이지 전환 | 300ms | cubic-bezier(0.4, 0, 0.2, 1) |
| Sheet drag | 거리 비례 | linear |

**Reduced Motion**:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 8. 아이콘

- 세트: **Lucide** (`lucide-react`)
- 크기: 16 / 20 / 24 (px)
- 색상: `currentColor` (텍스트 색 상속)
- 의미 있는 아이콘은 `aria-label` 필수, 장식은 `aria-hidden="true"`

주요 아이콘:
- `Home` · `Map` · `Search` · `Menu` · `X`
- `Heart` (예약 UI, v1.1)
- `ExternalLink` (예매 버튼)
- `ChevronRight` · `ChevronLeft`
- `MapPin` · `Calendar` · `Ticket`

---

## 9. 이미지 정책

### 9.1 크기
- 히어로: 1600w (desktop) / 960w (mobile), aspect 16:9
- 카드 썸네일: 480w / 960w (Next/Image `sizes` 연동)
- Gallery logo: SVG 선호, 없을 시 40x40 PNG

### 9.2 포맷
- 원본 업로드: JPG/PNG
- 서빙: Next/Image가 AVIF/WebP 자동

### 9.3 Alt
- **의미 있는 이미지**: 전시명 + 특징 (예: "Installation view of Turner Prize 2026")
- **장식 이미지**: `alt=""` 허용 (반드시 빈 문자열)

### 9.4 Gallery 로고 아바타 (fallback 규칙)

우선순위: **SVG → PNG → 이니셜 아바타**.

1. `Gallery.logoUrl`이 SVG → 40×40 circle crop, `currentColor` 컬러링 가능
2. `logoUrl`이 PNG/JPG → 40×40 cover, circle mask
3. `logoUrl` 없음 → **이니셜 아바타**:
   - 이름 단어의 첫 글자 최대 2개 (`"Tate Modern"` → `TM`, `"V&A"` → `VA`, 단어 1개면 2글자)
   - 대문자, `font-sans text-sm font-semibold`
   - 배경: `--color-surface-muted`, 텍스트: `--color-text`
   - 원형, 1px `--color-border`

컴포넌트로 `<GalleryAvatar gallery={...} size={40} />` 단일화.

---

## 10. 다크 모드 (v1.1 예약)

- 모든 색상 토큰에 `-dark` 변형 준비됨
- 사용자 선택 기억: `localStorage` (첫 진입은 `prefers-color-scheme`)
- Hero 이미지는 다크 모드에서 약간 어둡게 (overlay `rgba(0,0,0,0.2)`)

---

## 11. PWA 비주얼

### 11.1 아이콘
| 크기 | 용도 |
|---|---|
| 192×192 | 일반 |
| 512×512 | 스플래시 |
| 512×512 (maskable) | Android 마스킹 |
| 180×180 | iOS apple-touch-icon |

### 11.2 스플래시
- 배경: `--color-bg` (`#FAFAF7`)
- 아이콘: 중앙 512×512
- `theme_color`: `--color-primary` (`#B91C1C`)

---

## 12. Tailwind Config 이식 (참고 스니펫)

```ts
// tailwind.config.ts (발췌)
export default {
  theme: {
    screens: {
      sm: '640px', md: '768px', lg: '1024px', xl: '1280px', '2xl': '1536px',
    },
    container: { center: true, padding: { DEFAULT: '1rem', md: '1.5rem', lg: '2rem' }, screens: { '2xl': '1280px' } },
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        surface: { DEFAULT: 'var(--color-surface)', muted: 'var(--color-surface-muted)' },
        text: { DEFAULT: 'var(--color-text)', muted: 'var(--color-text-muted)', faint: 'var(--color-text-faint)' },
        border: { DEFAULT: 'var(--color-border)', strong: 'var(--color-border-strong)' },
        primary: { DEFAULT: 'var(--color-primary)', hover: 'var(--color-primary-hover)', soft: 'var(--color-primary-soft)' },
        accent: 'var(--color-accent)',
        focus: 'var(--color-focus)',
      },
      fontFamily: {
        serif: ['Fraunces', 'Noto Serif KR', 'Georgia', 'serif'],
        sans:  ['Inter', 'Pretendard', 'system-ui', 'sans-serif'],
      },
      borderRadius: { sm: '4px', md: '8px', lg: '16px', xl: '24px' },
      boxShadow: {
        sm: '0 1px 2px rgba(0,0,0,0.05)',
        md: '0 4px 12px rgba(0,0,0,0.08)',
        lg: '0 12px 32px rgba(0,0,0,0.12)',
      },
      maxWidth: { prose: '68ch' },
    },
  },
};
```

```css
/* app/globals.css */
:root {
  --color-bg: #FAFAF7;
  --color-surface: #FFFFFF;
  --color-surface-muted: #F3F2EC;
  --color-text: #1A1A1A;
  --color-text-muted: #6B6B6B;
  --color-text-faint: #9A9A9A;
  --color-border: #E5E5E0;
  --color-border-strong: #CFCFC8;
  --color-primary: #B91C1C;
  --color-primary-hover: #991B1B;
  --color-primary-soft: #FEE2E2;
  --color-accent: #1E3A8A;
  --color-success: #15803D;
  --color-warning: #CA8A04;
  --color-danger: #DC2626;
  --color-focus: #2563EB;
}
```

---

## 12.5 포맷팅 유틸 계약 (Intl)

SSR/CSR 간 날짜 포맷이 달라지면 React hydration mismatch가 발생하므로 **서버/클라이언트 모두 `en-GB` 로케일·UTC 해석**으로 고정한다.

```ts
// lib/format.ts
const DATE_LOCALE = 'en-GB';
const TZ = 'Europe/London';

// "28 Apr" (카드 메타 — 연도 생략, 당해 연도 기준)
export function formatDateShort(iso: string): string {
  return new Intl.DateTimeFormat(DATE_LOCALE, {
    day: '2-digit', month: 'short', timeZone: TZ,
  }).format(new Date(iso));
}

// "24 Sep 2026 – 22 Feb 2027" (상세 헤더 — 풀 포맷)
export function formatDateRange(startIso: string, endIso: string): string {
  const fmt = new Intl.DateTimeFormat(DATE_LOCALE, {
    day: '2-digit', month: 'short', year: 'numeric', timeZone: TZ,
  });
  return `${fmt.format(new Date(startIso))} – ${fmt.format(new Date(endIso))}`;
}

// "From £18" / "Free" / "£18–£24"
export function formatPrice(from: number | null, to?: number | null): string {
  if (from == null) return 'Free';
  const gbp = (n: number) => new Intl.NumberFormat('en-GB', {
    style: 'currency', currency: 'GBP', maximumFractionDigits: 0,
  }).format(n);
  if (to != null && to > from) return `${gbp(from)}–${gbp(to)}`;
  return `From ${gbp(from)}`;
}

// "Ends in 3 days" / "Starts in 5 days" / "Ended"
// (파생 상태 표시 — 클라이언트 전용 사용 권장)
export function formatRelativeDeadline(...): string { /* ... */ }
```

사용처:
| 상황 | 함수 |
|---|---|
| 카드 메타 기간 | `formatDateShort(endDate)` 앞에 `~` 접두 |
| 상세 헤더 기간 | `formatDateRange(startDate, endDate)` |
| 카드/상세 가격 | `formatPrice(priceFrom, priceTo)` |
| 상태 배지 (선택) | `formatRelativeDeadline` — 클라이언트 Hydration 이후 |

---

## 13. 접근성 체크 (디자인 단계)

- [x] 대비율 AA 이상 (§2.3)
- [ ] 터치 타겟 ≥ 44×44 (컴포넌트 스펙에서 재확인)
- [x] Focus ring 토큰 정의
- [x] Reduced motion 대응 (§7)
- [ ] 색상만으로 정보 전달 금지 — 컴포넌트 스펙에서 배지/상태 확인

---

## 14. 변경 이력
- 2026-04-18 v1.0 — 초안 (designer-agent)
