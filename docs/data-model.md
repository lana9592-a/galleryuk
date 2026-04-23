# GalleryUK — Data Model (v1.0)

> MVP 저장소: `/public/data/*.json` (정적 시드)
> 향후(v1.1+): Supabase Postgres로 이관 가능하도록 필드명은 snake_case 대신 **camelCase** 유지

---

## 1. 엔티티 개요

| Entity | 목적 | 최소 레코드 수 (v1.0) |
|---|---|---|
| `Gallery` | 미술관/기관 | 10 |
| `Exhibition` | 전시 | 30 |
| `Category` | 전시 카테고리 | 5 (enum) |

관계:
- `Exhibition.galleryId` → `Gallery.id` (N:1)
- `Exhibition.category` → `Category` enum

---

## 2. Entity: Gallery

| Field | Type | Required | Example | Note |
|---|---|---|---|---|
| `id` | string (slug) | ✅ | `"tate-modern"` | URL-safe, 소문자-하이픈, globally unique |
| `name` | string | ✅ | `"Tate Modern"` | 공식 표기 |
| `shortName` | string | — | `"Tate Modern"` | 카드에 쓸 축약 (없으면 name) |
| `lat` | number | ✅ | `51.5076` | 위도 (WGS84) |
| `lng` | number | ✅ | `-0.0994` | 경도 |
| `address` | string | ✅ | `"Bankside, London SE1 9TG"` | 전체 주소 |
| `city` | string | ✅ | `"London"` | 기본값 London |
| `borough` | string | — | `"Southwark"` | 런던 자치구 필터용 |
| `website` | url | ✅ | `"https://www.tate.org.uk/visit/tate-modern"` | |
| `logoUrl` | url | — | `"/images/galleries/tate-modern.svg"` | 없을 시 이니셜 |
| `openingHours` | JSON | — | `{ "mon": "10:00-18:00", ... }` | 요일 단위 |
| `description` | string | — | 최대 400자 | About 섹션 |
| `tags` | string[] | — | `["contemporary","free-entry"]` | 선택적 메타 |

### 예시
```json
{
  "id": "tate-modern",
  "name": "Tate Modern",
  "lat": 51.5076,
  "lng": -0.0994,
  "address": "Bankside, London SE1 9TG",
  "city": "London",
  "borough": "Southwark",
  "website": "https://www.tate.org.uk/visit/tate-modern",
  "openingHours": { "mon": "10:00-18:00", "sun": "10:00-18:00" },
  "tags": ["modern","free-entry"]
}
```

---

## 3. Entity: Exhibition

| Field | Type | Required | Example | Note |
|---|---|---|---|---|
| `id` | string (slug) | ✅ | `"turner-prize-2026"` | URL-safe, globally unique |
| `title` | string | ✅ | `"Turner Prize 2026"` | |
| `galleryId` | string | ✅ | `"tate-britain"` | FK → Gallery.id |
| `startDate` | ISO date | ✅ | `"2026-04-24"` | YYYY-MM-DD |
| `endDate` | ISO date | ✅ | `"2026-09-15"` | 포함 |
| `priceFrom` | number \| null | — | `18` | GBP, 무료/티켓불필요 시 null |
| `priceTo` | number \| null | — | `24` | 가격대 있을 때 상한 |
| `ticketUrl` | url \| null | — | `"https://www.tate.org.uk/..."` | null이면 티켓 불필요 |
| `category` | enum | ✅ | `"painting"` | 아래 Category enum |
| `tags` | string[] | — | `["contemporary","group-show"]` | 검색 보조 |
| `summary` | string | ✅ | 최대 160자 | OG/카드용 한 줄 요약 |
| `description` | markdown | ✅ | 500~1000자 | 본문 |
| `artists` | string[] | — | `["Jadé Fadojutimi", "..."]` | |
| `curator` | string | — | `"Alex Farquharson"` | |
| `heroImage` | url | ✅ | `"https://..."` | 16:9 권장 |
| `heroImageAlt` | string | ✅ | `"..."` | 비어있으면 의미 손실 |
| `images` | `{url, alt, caption?}[]` | — | 최대 8장 | |
| `featured` | boolean | — | `true` | 홈 Hero 노출 여부 |
| `free` | boolean | — | `false` | priceFrom=null일 때 자동 계산 가능 |

### Category enum
```
"painting" | "photography" | "sculpture" | "installation" | "mixed"
```

### 예시
```json
{
  "id": "turner-prize-2026",
  "title": "Turner Prize 2026",
  "galleryId": "tate-britain",
  "startDate": "2026-09-24",
  "endDate": "2027-02-22",
  "priceFrom": 18,
  "priceTo": 18,
  "ticketUrl": "https://www.tate.org.uk/whats-on/tate-britain/turner-prize-2026",
  "category": "mixed",
  "tags": ["contemporary","award"],
  "summary": "The most important prize for contemporary art in the UK returns to Tate Britain.",
  "description": "# Turner Prize 2026\nThis year's shortlist ...",
  "artists": ["Artist A", "Artist B", "Artist C", "Artist D"],
  "heroImage": "https://.../turner-prize-2026.jpg",
  "heroImageAlt": "Installation view of Turner Prize 2026",
  "images": [],
  "featured": true,
  "free": false
}
```

---

## 4. Zod 스키마 매핑 (lib/schemas.ts 초안)

```ts
import { z } from 'zod';

export const CategoryEnum = z.enum([
  'painting','photography','sculpture','installation','mixed',
]);

export const GallerySchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  shortName: z.string().optional(),
  lat: z.number().min(49).max(61),      // UK 대략 범위
  lng: z.number().min(-8).max(2),
  address: z.string().min(1),
  city: z.string().default('London'),
  borough: z.string().optional(),
  website: z.string().url(),
  logoUrl: z.string().url().optional(),
  openingHours: z.record(z.string()).optional(),
  description: z.string().max(400).optional(),
  tags: z.array(z.string()).optional(),
});
export type Gallery = z.infer<typeof GallerySchema>;

export const ExhibitionSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  galleryId: z.string(),
  startDate: z.string().date(),
  endDate: z.string().date(),
  priceFrom: z.number().nonnegative().nullable().optional(),
  priceTo: z.number().nonnegative().nullable().optional(),
  ticketUrl: z.string().url().nullable().optional(),
  category: CategoryEnum,
  tags: z.array(z.string()).optional(),
  summary: z.string().max(160),
  description: z.string().min(1),
  artists: z.array(z.string()).optional(),
  curator: z.string().optional(),
  heroImage: z.string().url(),
  heroImageAlt: z.string().min(1),
  images: z.array(z.object({
    url: z.string().url(),
    alt: z.string().min(1),
    caption: z.string().optional(),
  })).max(8).optional(),
  featured: z.boolean().optional(),
  free: z.boolean().optional(),
}).refine(
  (e) => new Date(e.startDate) <= new Date(e.endDate),
  { message: 'startDate must be ≤ endDate', path: ['endDate'] }
);
export type Exhibition = z.infer<typeof ExhibitionSchema>;
```

참조 무결성은 `lib/data.ts` 로더에서:
```ts
if (!galleries.find(g => g.id === ex.galleryId)) {
  throw new Error(`Exhibition ${ex.id} references unknown galleryId ${ex.galleryId}`);
}
```

---

## 5. 시드 작성 규칙

- 파일: `public/data/galleries.json`, `public/data/exhibitions.json`
- 정렬: `id` 알파벳순
- 날짜: `YYYY-MM-DD` ISO
- 가격: 정수 GBP (£)
- 이미지: 공식 사이트 공개 자산에 한함, 혹은 자체 촬영
- `heroImageAlt`는 장식용이어도 **의미 있는 대체텍스트**

---

## 6. 파생(Derived) 필드 (런타임 계산)

런타임에만 쓰이고 저장하지 않는 값:
- `status`: `"upcoming" | "now" | "ended"` — 오늘 날짜와 start/endDate 비교
- `daysLeft`: `status === "now"`일 때 `endDate - today`
- `startsInDays`: `status === "upcoming"`일 때 `startDate - today`
- `priceDisplay`: `priceFrom==null → "Free"` / 아니면 `"From £N"`

---

## 7. v1.1 마이그레이션 (Supabase)

구조는 유지. 주요 변경점:
- 테이블: `galleries`, `exhibitions`
- PK: `id text`
- FK: `exhibitions.gallery_id` REFERENCES `galleries(id)`
- 필드명은 DB 컨벤션에 맞춰 **snake_case**로 변환 (API 경계에서 camelCase로 직렬화)
- RLS: 익명 read-only, write는 서비스 롤 키
- 인덱스: `(start_date, end_date)`, `(category)`, `(gallery_id)`

---

## 8. 결정 이력 / 열린 질문

**확정 (2026-04-18):**
- Q-D1 `category` enum → **`"photography"`** 정식 명칭 채택 (URL/UI 모두 동일)

**v1.1 이후 재검토:**
- Q-D2 상시 전시(Permanent) 처리 (별도 필드 `isPermanent: boolean` 유력)
- Q-D3 다국어 확장 전략 (i18n 도입 시 결정)
- Q-D4 `Artist` 엔티티 정규화
