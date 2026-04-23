# Vercel 배포 가이드 (초보자용)

> **대상**: Git/배포 처음 해보는 개발자.
> **목표**: 이 Repo를 Vercel에 올려서 `https://<프로젝트>.vercel.app` 주소로 접속 가능하게 만들기.
> **시간**: 처음이면 20~40분, 익숙해지면 5분.
> **비용**: Vercel Hobby + Google Maps 무료 쿼터 범위 — **결제 수단 없어도 됩니다.**

---

## 0. 준비물 체크

- [ ] GitHub 계정이 있고, 이 Repo(`lana9592-a/galleryuk`)를 볼 수 있다.
- [ ] 노트북에서 이메일을 받을 수 있다 (Vercel이 인증 메일을 보냅니다).
- [ ] Google 계정이 하나 있다 (Maps API 키용 — 선택이지만 권장).

없어도 되는 것:
- ❌ 신용카드 (Hobby 플랜은 무료)
- ❌ 도메인 (`.vercel.app` 하위 도메인 자동 발급)

---

## 1. Vercel 계정 만들기

1. **https://vercel.com/signup** 접속.
2. **"Continue with GitHub"** 클릭 → GitHub 로그인 → "Authorize Vercel".
3. 요금제 선택 창이 뜨면 **"Hobby (Free)"** 고릅니다. Pro는 필요 없어요.
4. 프로필 이름/슬러그는 기본값 둬도 됩니다.

---

## 2. Repo를 Vercel 프로젝트로 import

1. Vercel 대시보드(`https://vercel.com/dashboard`)에서 우측 상단 **"Add New…" → "Project"** 클릭.
2. **"Import Git Repository"** 섹션에서 `lana9592-a/galleryuk`을 찾아 **Import**.
   - 목록에 없으면 **"Adjust GitHub App Permissions"** 또는 **"Configure"** 눌러서 이 Repo를 Vercel이 접근할 수 있게 권한을 열어주세요.
3. **"Configure Project"** 화면에서:
   - **Framework Preset**: Next.js (자동 감지됨 — 확인만)
   - **Root Directory**: `./` (비워두기)
   - **Build Command**, **Output Directory**, **Install Command**: **전부 기본값 유지** (건드리지 마세요)

---

## 3. 환경 변수 설정 (이 단계가 제일 실수 많음)

"Configure Project" 화면 하단에 **"Environment Variables"** 섹션이 있습니다. 다음 두 개를 추가:

| Name | Value | 비고 |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://galleryuk.vercel.app` | 배포 후 실제 URL로 나중에 업데이트 가능 |
| `NEXT_PUBLIC_GMAPS_KEY` | (5번에서 받을 값) | 지금 없으면 **비워두고 넘어가세요.** `/map` 페이지가 리스트-only로 자동 fallback 됩니다. |

입력 방법:
1. **"Key"** 칸에 변수 이름 붙여넣기.
2. **"Value"** 칸에 값 붙여넣기.
3. **"Add"** 버튼 누르기. 세 환경(`Production`, `Preview`, `Development`) 전부 체크되어 있는 기본 설정 유지.

> ⚠️ **자주 하는 실수**: `Name`에 공백 넣거나, 끝에 `=` 붙이거나, 따옴표 감싸기. 그냥 값만 깔끔하게.

---

## 4. 첫 배포 실행

1. **"Deploy"** 파란 버튼 클릭.
2. 1~2분 기다립니다. 로그가 실시간으로 흐르고 "Building…" → "Deploying…" 순서로 진행.
3. 성공하면 🎉 컨페티가 뜨고 프리뷰 스크린샷이 보입니다.
4. **"Continue to Dashboard"** 누르면 프로젝트 페이지에 진입.
5. 우측 상단 **"Visit"** 버튼 누르면 실제 사이트 열립니다.

이 시점 URL은 보통 `https://galleryuk.vercel.app` 또는 `https://galleryuk-<랜덤>.vercel.app` 형태.

---

## 5. Google Maps API 키 발급 (선택, 약 10분)

`/map` 페이지를 인터랙티브 지도로 쓰고 싶다면 필요합니다. **안 해도 사이트는 동작**합니다 (리스트 fallback).

### 5.1 키 발급

1. **https://console.cloud.google.com/** 접속, 구글 계정 로그인.
2. 상단 프로젝트 드롭다운 → **"New Project"** → 이름 "galleryuk" → **Create**.
3. 좌측 메뉴 **"APIs & Services" → "Library"** → 검색창에 **"Maps JavaScript API"** → 선택 → **"Enable"**.
4. **"APIs & Services" → "Credentials"** → 상단 **"+ CREATE CREDENTIALS" → "API key"**.
5. 팝업에 키가 뜹니다 (`AIzaSy…`로 시작). **복사해서 메모장에 저장**. 창 닫아도 나중에 다시 볼 수 있습니다.

### 5.2 referrer 제한 (보안상 필수)

키를 그대로 두면 누가 복사해서 본인들 사이트에서 돌릴 수 있어서 쿼터를 뺏길 수 있습니다.

1. 방금 만든 키 옆 **연필 아이콘(Edit)** 클릭.
2. **"Application restrictions"** → **"Websites"** 선택.
3. **"Add"** 눌러서 다음 두 개를 넣습니다 (본인 Vercel URL에 맞춰 조정):
   - `https://galleryuk.vercel.app/*`
   - `https://galleryuk-*.vercel.app/*` (Preview 배포용 와일드카드)
4. 로컬 개발까지 하려면 추가: `http://localhost:3000/*`
5. **"API restrictions"** → **"Restrict key"** → **"Maps JavaScript API"** 만 체크.
6. **Save**. 변경 사항이 퍼지는 데 최대 5분 걸릴 수 있습니다.

### 5.3 Vercel에 키 등록

1. Vercel 프로젝트 → **Settings → Environment Variables**.
2. `NEXT_PUBLIC_GMAPS_KEY` 있으면 편집, 없으면 추가해서 값 붙여넣기.
3. 저장 후 **Deployments 탭** → 최신 배포 우측 **"…" → "Redeploy"**. 환경 변수는 재배포해야 반영됩니다.

---

## 6. 배포 후 확인 체크리스트

배포된 URL에서 다음을 직접 눌러보세요. 전부 정상이면 Phase 5 "Dynamic Gates" 들어갈 준비 끝.

- [ ] 홈 `/` — 히어로 이미지 보임, "Now on" 그리드 렌더
- [ ] `/exhibitions` — 16개 카드 보임, 필터 칩 클릭 시 URL에 `?status=now` 붙음
- [ ] `/exhibitions/turner-prize-2026` — 상세 페이지 열림, **"Book tickets"** 클릭 시 새 탭으로 공식 사이트 이동
- [ ] `/galleries` — 10개 갤러리 리스트
- [ ] `/map` — Maps 키 있으면 지도+마커, 없으면 안내 문구+리스트
- [ ] `/search?q=turner` — 검색 결과 나옴
- [ ] `/offline` — 빈 네트워크용 안내 화면
- [ ] `/manifest.webmanifest` — JSON 내려옴
- [ ] `/sitemap.xml` — 32개 URL XML
- [ ] `/robots.txt` — `Disallow: /api/` 포함
- [ ] `/opengraph-image` — 1200×630 빨간 그라디언트 카드 이미지
- [ ] 모바일 Chrome에서 주소창 메뉴 → **"앱 설치"** 또는 "홈 화면에 추가" 메뉴 뜸

---

## 7. 자주 걸리는 오류

### "Build failed: Module not found"
보통 `pnpm install`이 Vercel에서 제대로 돌지 않은 경우. Vercel Settings → General → **Install Command**가 `pnpm install`인지 확인.

### 지도가 안 뜨고 회색 네모만 보임
`NEXT_PUBLIC_GMAPS_KEY`가 빈 값이거나, 5.2에서 referrer 제한이 현재 URL을 막고 있음. DevTools Console 열어서 빨간 에러 메시지 확인:
- `RefererNotAllowedMapError` → 5.2 referrer 리스트에 현재 URL 추가
- `ApiNotActivatedMapError` → Maps JavaScript API 활성화 안 됨
- `InvalidKeyMapError` → 키 오타

### `NEXT_PUBLIC_SITE_URL`을 실제 배포 URL로 바꿀 때
Vercel이 처음 뽑아준 URL이 예상과 다르면:
1. Settings → Environment Variables → `NEXT_PUBLIC_SITE_URL` 편집.
2. 새 값 저장 후 Deployments → Redeploy.
3. 바꿔야 하는 이유: OG 이미지, 사이트맵, canonical URL 전부 이 값을 기준으로 만들어집니다.

### SW 캐시 때문에 오래된 버전이 보임
이 프로젝트는 `scripts/build-sw.mjs`가 매 배포마다 새 VERSION을 주입하므로 이론상 **자동 해결**됩니다. 그래도 문제 보이면 브라우저 DevTools → Application → Service Workers → **Unregister** 후 새로고침.

---

## 8. Preview vs Production

| 상황 | 트리거 | URL |
|---|---|---|
| PR 올리거나 `claude/*` 브랜치에 push | 자동 Preview 배포 | `https://galleryuk-<브랜치>-<user>.vercel.app` |
| `main`에 merge | 자동 Production 배포 | `https://galleryuk.vercel.app` |

**Preview**는 공유 OK이지만 Google Maps referrer에 와일드카드(`galleryuk-*.vercel.app`)가 들어있어야 지도가 뜹니다 (5.2 참고).

---

## 9. 다음 세션에서 Claude에게 말하기 (중요)

배포가 끝나면, 다음 세션에서 아래 **세 줄 중 하나**만 저한테 보내주시면 바로 이어갑니다. 길게 설명 안 하셔도 됩니다.

### 9.1 배포 성공 + Preview URL이 있을 때
```
Vercel Preview URL은 https://<본인-URL>.vercel.app 이야.
Phase 5 남은 동적 게이트(Lighthouse, axe, 실기기) 진행해줘.
```

### 9.2 배포는 했는데 뭐부터 해야 할지 모를 때
```
배포는 끝났어. 다음 단계 뭐야?
```
→ 제가 `CLAUDE.md` 읽고 남은 항목 안내합니다.

### 9.3 배포하다 막혔을 때
```
배포하다 이 에러 떴어: <에러 메시지 전체 붙여넣기>
```
→ 제가 `docs/deployment.md` 기준으로 진단 도와드립니다.

---

## 10. 참고 링크

- Vercel 공식 Next.js 가이드: https://vercel.com/docs/frameworks/nextjs
- Google Maps Platform 요금 (무료 쿼터): https://mapsplatform.google.com/pricing/
- 이 프로젝트 QA 계획: `docs/qa-plan.md`
- 이 프로젝트 현재 상태: `CLAUDE.md` Phase 5 체크리스트
