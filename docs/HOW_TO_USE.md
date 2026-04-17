# 📘 GalleryUK — 에이전트 사용 가이드

이 문서는 **비개발자도** GalleryUK 프로젝트를 Claude Code 에이전트들과 함께 진행할 수 있도록 쓰여 있습니다.

---

## 1. 프로젝트 파일 구조 한눈에

```
galleryuk/
├─ CLAUDE.md                  ← 🎯 PM. 세션 시작 시 항상 먼저 로드
├─ agents/
│  ├─ planner.md              ← 📝 기획
│  ├─ designer.md             ← 🎨 디자인
│  ├─ developer.md            ← 💻 개발
│  ├─ reviewer.md             ← 🔍 각 단계 검수(Gate)
│  └─ qa.md                   ← 🧪 테스트
├─ docs/
│  ├─ HOW_TO_USE.md           ← (이 문서)
│  ├─ PRD.md                  ← Planner가 생성
│  ├─ user-stories.md         ← Planner가 생성
│  ├─ data-model.md           ← Planner가 생성
│  ├─ sitemap.md              ← Planner가 생성
│  ├─ design-system.md        ← Designer가 생성
│  ├─ wireframes.md           ← Designer가 생성
│  ├─ component-spec.md       ← Designer가 생성
│  ├─ reviews/                ← Reviewer 보고서
│  ├─ qa-plan.md              ← QA가 생성
│  └─ qa-report-*.md          ← QA가 생성
├─ app/ components/ lib/ ...  ← Developer가 생성 (Phase 3부터)
└─ README.md
```

---

## 2. 워크플로 (전체 흐름)

```
[Phase 1 기획]  planner → reviewer  → (Gate 1)
       ↓
[Phase 2 디자인] designer → reviewer → (Gate 2)
       ↓
[Phase 3 개발]  developer → reviewer → (Gate 3)
       ↓
[Phase 4 API/PWA] developer → reviewer → (Gate 4)
       ↓
[Phase 5 QA/배포] qa → reviewer → 🚀 배포
```

**Gate**는 리뷰 통과를 의미합니다. Gate 통과 전에는 다음 단계로 넘어가지 않습니다.

---

## 3. Claude Code에서 쓰는 법 (Step-by-Step)

### 3.1 처음 시작할 때
1. 터미널에서 `cd /home/user/galleryuk`
2. `claude` 명령으로 Claude Code 실행
3. 첫 프롬프트는 짧게:
   ```
   CLAUDE.md 읽고 현재 Phase 확인해줘.
   ```
4. Claude는 `CLAUDE.md`의 체크리스트에서 체크 안 된 첫 항목을 알려줍니다.

### 3.2 각 Phase를 시작할 때 (복붙용 프롬프트)

#### Phase 1 — 기획
```
agents/planner.md 지시대로 Phase 1을 진행해줘.
산출물은 docs/PRD.md, docs/user-stories.md, docs/data-model.md, docs/sitemap.md 로 저장.
결정이 필요한 항목은 "❓ 결정 필요" 블록으로 모아줘.
완료되면 CLAUDE.md의 Phase 1 체크박스를 업데이트해줘.
```

#### Phase 1 리뷰
```
agents/reviewer.md 지시대로 Phase 1 산출물을 검수하고
docs/reviews/phase-1-<오늘날짜>.md 로 보고서를 저장해줘.
판정은 PASS / CHANGES_REQUESTED / BLOCK 중 하나.
```

#### Phase 2 — 디자인
```
agents/designer.md 지시대로 Phase 2를 진행해줘.
Planner 산출물을 기반으로
docs/design-system.md, docs/wireframes.md, docs/component-spec.md 생성.
토큰은 tailwind.config.ts에 바로 붙일 수 있는 형태로.
```

#### Phase 3 — 개발 기반
```
agents/developer.md 지시대로 Next.js 14 프로젝트를 부트스트랩하고
폴더 구조, Tailwind 토큰, 공통 레이아웃, 더미 데이터 기반 5개 화면을 구현해줘.
모든 변경은 claude/* 브랜치에 커밋.
```

#### Phase 4 — API/PWA
```
agents/developer.md Phase 4 체크리스트대로
/api/* Route Handler, 지도, 예매 링크, PWA(manifest + SW + /offline) 구현해줘.
```

#### Phase 5 — QA & 배포
```
agents/qa.md 지시대로 docs/qa-plan.md와 자동화 테스트를 작성하고 실행해줘.
보고서는 docs/qa-report-<날짜>.md.
통과되면 agents/reviewer.md의 최종 리뷰 실행.
```

---

## 4. 자주 묻는 질문 (FAQ)

**Q. 중간에 세션이 꺼지면?**
A. 다시 `claude` 실행하고 "지금 어느 Phase야?"라고 물어보세요. CLAUDE.md 체크리스트가 상태를 유지합니다.

**Q. 에이전트가 임의로 다음 단계로 넘어가려고 하면?**
A. "Gate 통과 전에는 다음 Phase로 가지 마"라고 상기시키세요. Reviewer 보고서가 PASS여야 합니다.

**Q. 결정해야 할 사항이 있을 때는?**
A. 각 에이전트 문서에 "❓ 결정 필요"를 쌓아둡니다. 마무리 시점에 일괄 답변하세요.

**Q. 기존 문서가 마음에 안 들면?**
A. 해당 문서만 삭제하고 해당 Phase를 다시 돌리세요. CLAUDE.md 체크박스도 해제.

**Q. 코드가 망가졌어요.**
A. `git status`로 변경 확인 → `git restore <file>`로 되돌리기. 커밋된 상태라면 `git log`에서 좋은 커밋을 찾아 `git checkout <sha> -- <path>`.

**Q. 배포는 꼭 Vercel이어야 하나?**
A. 아니요. Netlify / Cloudflare Pages / 자체 호스팅도 가능합니다. `developer.md`의 배포 섹션을 조정하세요.

---

## 5. 품질 게이트 요약 (절대 스킵 금지)

| Phase | 통과 조건 |
|---|---|
| 1 | PRD/유저스토리/데이터모델/사이트맵 완성 + 리뷰 PASS |
| 2 | 디자인 토큰 + 와이어프레임 + 컴포넌트 스펙 + 리뷰 PASS |
| 3 | 5개 화면 동작 + 타입체크/린트 0에러 + 리뷰 PASS |
| 4 | API/지도/예매/PWA 동작 + Lighthouse PWA Pass + 리뷰 PASS |
| 5 | LH 4지표 ≥ 90, axe 0, E2E 그린, 실기기 3환경 통과 |

---

## 6. 에이전트별 1줄 요약

- **Planner**: "무엇을 만들지"를 명세로 바꾼다
- **Designer**: "어떻게 보일지"를 토큰과 와이어프레임으로 바꾼다
- **Developer**: "어떻게 동작할지"를 Next.js 코드로 만든다
- **Reviewer**: "이대로 넘어가도 되는지"를 판정한다
- **QA**: "실제로 잘 동작하는지"를 재현 가능하게 검증한다
- **PM (CLAUDE.md)**: 위 다섯을 **순서대로** 움직이게 한다

---

## 7. 운영 팁

- **커밋은 작게 자주** — Conventional Commits 권장 (`feat:`, `fix:`, `docs:`)
- **환경변수** — `.env.local` 로컬, Vercel Dashboard에 프로덕션 값
- **Google Maps API Key** — HTTP referrer 제한 필수
- **이미지 저작권** — 공식 사이트 공개 이미지만 사용, 출처 표기
- **개인정보** — v1.0은 수집하지 않음 (로그인/쿠키/Analytics 없음 또는 익명)

---

## 8. 다음에 읽으면 좋은 문서

1. [CLAUDE.md](../CLAUDE.md) — 전체 지휘
2. [agents/planner.md](../agents/planner.md) — 지금 당장 시작할 때
3. [agents/reviewer.md](../agents/reviewer.md) — 각 단계 통과 기준
