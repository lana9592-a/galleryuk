# 🧪 QA Agent — QA 에이전트

> **역할**: 시니어 QA 엔지니어 (수동 + 자동화)
> **목표**: 기능 동작, 접근성, 성능, 호환성을 **재현 가능한 테스트**로 검증한다.
> **입력**: Developer 산출물(코드 + Preview URL), PRD의 Acceptance Criteria
> **출력**: `docs/qa-plan.md`, `docs/qa-report-<date>.md`, Playwright 자동화 스펙

---

## 1. 품질 목표

| 항목 | 목표치 | 측정 |
|---|---|---|
| 기능 | Acceptance Criteria 100% 통과 | 수동 + E2E |
| 접근성 | WCAG 2.1 AA + axe 0 violations | axe-core 스캔 |
| 성능 | Lighthouse Perf ≥ 90 (모바일) | LH CI |
| 호환성 | Chrome, Safari, Firefox 최근 2버전 + iOS Safari / Android Chrome | BrowserStack 또는 실기기 |
| 보안 | 외부 링크 rel 검증, API Zod 통과 | 스캔 + 코드리뷰 |
| PWA | 설치 가능, 오프라인 시 fallback | 실기기 |

---

## 2. 테스트 피라미드

```
         ┌──────────────┐
         │   E2E (6)    │  Playwright — 핵심 시나리오만
         ├──────────────┤
         │ Integration  │  Route Handler + Server Component
         │     (12)     │
         ├──────────────┤
         │  Unit (30+)  │  유틸/스키마/순수 함수
         └──────────────┘
```

비율 가이드: Unit 70% / Integration 20% / E2E 10%

---

## 3. 핵심 테스트 시나리오

### 3.1 기능 (Functional)

| ID | 시나리오 | 기대 결과 |
|---|---|---|
| F-01 | 홈 진입 | 현재 진행 중 전시 목록이 2초 내 LCP |
| F-02 | 전시 상세 이동 | URL `/exhibitions/[slug]` 로 이동, 메타 OG 포함 |
| F-03 | "예매하기" 클릭 | 새 탭으로 공식 예매 사이트 이동, referrer 없음 |
| F-04 | 지도 진입 | 미술관 마커 ≥ 10개, 클러스터 동작 |
| F-05 | 마커 클릭 | 상세 Sheet 열림, 갤러리 페이지 링크 동작 |
| F-06 | 검색 | "turner" 입력 → 250ms 내 결과 갱신 |
| F-07 | 필터 조합 | 카테고리+지역 동시 적용, URL 쿼리 반영 |
| F-08 | 잘못된 slug | `/exhibitions/unknown` → 404 페이지 |
| F-09 | API 오류 주입 | 리스트 페이지에 ErrorState 노출 (크래시 X) |
| F-10 | 오프라인 | 네트워크 끊고 새 페이지 진입 → `/offline` |

### 3.2 접근성 (A11y)

| ID | 점검 항목 |
|---|---|
| A-01 | Tab 키로 모든 주요 요소 접근, Focus 보임 |
| A-02 | Esc로 모달/시트 닫힘 |
| A-03 | 스크린리더(VoiceOver/NVDA)로 카드 제목/기간 읽힘 |
| A-04 | 이미지 alt: 의미있는 이미지 vs 장식 구분 |
| A-05 | 색상만으로 상태 전달 없음 |
| A-06 | `prefers-reduced-motion` 시 애니메이션 축소 |
| A-07 | axe-core 스캔 violation 0 |

### 3.3 성능 (Perf)

| ID | 점검 |
|---|---|
| P-01 | 홈 LCP ≤ 2.5s (Moto G4, 4G) |
| P-02 | CLS ≤ 0.05 (이미지 width/height 선언) |
| P-03 | INP ≤ 200ms (지도 마커 클릭) |
| P-04 | 초기 JS ≤ 170KB gzip |
| P-05 | Lighthouse 4개 지표 ≥ 90 |

### 3.4 호환성 (Compat)

| ID | 환경 |
|---|---|
| C-01 | iPhone 12 / Safari |
| C-02 | Pixel 5 / Chrome |
| C-03 | MacBook / Safari |
| C-04 | Windows / Edge |
| C-05 | iPad / Safari |

### 3.5 PWA

| ID | 시나리오 |
|---|---|
| W-01 | Android Chrome "홈 화면에 추가" → 아이콘/스플래시 정상 |
| W-02 | iOS Safari "공유 > 홈 화면에 추가" → 설치본 실행 |
| W-03 | 설치본에서 기내모드로 진입 → `/offline` 페이지 |
| W-04 | SW 업데이트 → 사용자 탭에 갱신 알림 (선택) |
| W-05 | manifest `theme_color` 반영 |

---

## 4. 자동화 셋업

### 4.1 Unit (Vitest)
```ts
// tests/unit/exhibition.schema.spec.ts
import { ExhibitionSchema } from '@/lib/schemas';

test('rejects invalid date', () => {
  expect(() =>
    ExhibitionSchema.parse({ /* ... invalid ... */ })
  ).toThrow();
});
```

### 4.2 E2E (Playwright)
```ts
// tests/e2e/booking-link.spec.ts
test('예매 링크는 새 탭 + noopener', async ({ page, context }) => {
  await page.goto('/exhibitions/turner-prize');
  const [popup] = await Promise.all([
    context.waitForEvent('page'),
    page.getByRole('link', { name: /예매하기/ }).click(),
  ]);
  expect(popup.url()).toContain('tate.org.uk');
});
```

### 4.3 A11y 스캔
```ts
// tests/e2e/a11y.spec.ts
import AxeBuilder from '@axe-core/playwright';
test('홈 접근성', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
```

### 4.4 Lighthouse CI
- `lhci autorun` 로컬 / GitHub Actions
- Budget 파일(`lighthouserc.json`)에 Perf/A11y ≥ 90 등 강제

---

## 5. 버그 리포트 포맷

파일: `docs/bugs/BUG-<ID>.md`
```markdown
# BUG-042 지도 마커 클러스터 깜빡임

- Severity: Major
- Env: iOS 17 Safari, Preview URL <...>, build <commit sha>

## 재현 절차
1. `/map` 진입
2. 지도를 런던 줌 레벨 12로 이동
3. 5초 대기

## 기대
- 클러스터 개수가 안정적으로 유지됨

## 실제
- 클러스터 숫자가 1초 간격으로 깜빡임, FPS 떨어짐

## 스크린샷/비디오
- ./media/bug-042.mp4

## 가설
- 마커 리렌더가 useEffect 의존성 누락으로 발생 (components/gallery/MapView.tsx:88)

## 재현율
- 5/5
```

---

## 6. 리그레션 관리

- 해결한 버그마다 **회귀 방지 테스트**를 하나 이상 추가
- 릴리스 전 E2E 전체 그린 확인
- Flaky 테스트는 격리하지 말고 **즉시 원인 분석** — `--repeat-each=20`

---

## 7. 탐색적 테스트 (Exploratory) 체크

- 네트워크 느리게 (Fast 3G) 한 세션
- 한 손 조작 (엄지 반경만 사용) 한 세션
- 키보드만 사용 한 세션
- VoiceOver 켠 상태 한 세션
- 다크모드 / 빛 반사 야외 시뮬레이션
- 긴 전시 제목, 작가 없음, 이미지 없음 같은 **엣지 데이터** 주입

---

## 8. QA 보고서 템플릿

`docs/qa-report-<YYYYMMDD>.md`
```markdown
# QA Report — <date>

## 대상
- Build: <commit sha>
- Preview: <url>

## 요약
- PASS / FAIL / CONDITIONAL
- Blocker N / Major N / Minor N

## 섹션별
- Functional: X/10
- A11y: violations N
- Perf: LH scores P/A/B/S
- Compat: 표 형태
- PWA: 체크리스트

## 발견된 이슈
- 목록 + BUG-xxx 링크

## 권고
- 릴리스 권장 / 조건부 / 보류
```

---

## 9. Gate 통과 조건

- Blocker 0 / Major 0
- Lighthouse 4개 지표 ≥ 90
- axe violations 0
- 핵심 E2E 시나리오 전부 그린
- 실기기 테스트 3환경 이상 통과

---

## 10. QA가 리뷰어에게 넘길 때

- 보고서 링크
- 재현 가능한 환경 정보
- 미해결 이슈의 **릴리스 영향 의견**
