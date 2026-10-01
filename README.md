# AntiAgingDNA_front

LifeDNA 만들기 프로젝트.

매일의 기록을 모아 사용자별 '유전자'를 만들어가는 앱입니다. 현재 **Figma에 그려진 화면이 전부** 구현돼 있습니다 (로그인·회원가입, 홈,
일지, 개선책, 마이페이지).
**백엔드는 연결돼 있습니다** — 인증, 일지 저장, 홈·일지의 점수·기록 조회 (아래
"동작하지 않는 것" 참고). 개선책은 아직 API 엔드포인트가 없습니다.

## 기술 스택

- React Native (Expo SDK 57) + Expo Router
- TypeScript
- NativeWind (Tailwind CSS)
- react-native-svg (일지 주간 컨디션 그래프 전용. Expo Go에 포함돼 있어
  개발용 빌드가 따로 필요하지 않습니다)
- iOS/Android 타겟 (`app.json`의 `platforms`). 웹은 지원하지 않고, 웹 전용
  잔재(`react-dom` 등)도 2026-08-17에 지웠습니다 — AGENTS.md 참고

## 시작하기

```bash
npm install
npx expo start          # QR을 Expo Go로 스캔
npx expo start --android   # 안드로이드 에뮬레이터로 바로 열기
```

확인용 명령 — 둘 다 통과 상태를 유지해주세요.

```bash
npx tsc --noEmit
npx expo lint
npm test
```

## 현재 상태

**구현 완료** — Figma 디자인을 옮긴 부분

| 경로 | 화면 |
|---|---|
| `/` | `(auth)/sign-in`으로 리다이렉트 |
| `(auth)/sign-in` | 로그인 |
| `(auth)/sign-up/index` | 회원가입 인트로 ※ |
| `(auth)/sign-up/personal-info` | STEP 1 · 개인정보 입력 |
| `(auth)/sign-up/survey` | STEP 2 · 초기 진단 |
| `(auth)/sign-up/terms` | STEP 3 · 약관 동의 |
| `(tabs)/home` | 홈 · 메인 ※※ |
| `(tabs)/journal` | 일지 · 메인 ※※ |
| `(tabs)/journal/today` | 일지 · 오늘의 기록 |
| `(tabs)/journal/calendar` | 일지 · 기록 캘린더 |
| `(tabs)/journal/[date]` | 일지 · 상세보기 (읽기 전용) |
| `(tabs)/plan` | 개선책 · 맞춤 개선책 ※※ |
| `(tabs)/plan/supplements` | 개선책 · 맞춤 영양제 |
| `(tabs)/plan/report` | 개선책 · 주간 리포트 |
| `(tabs)/plan/forecast` | 개선책 · 한 달 뒤 내 모습 |
| `(tabs)/my` | MY · 마이페이지 ※※ |
| `(tabs)/my/wearable` | MY · 웨어러블 연동 |
| `(tabs)/my/privacy` | MY · 데이터 개인정보 |
| `(tabs)/my/subscription` | MY · 구독관리 |

라우트 파일은 한 줄 re-export이고, 화면 본체는 `src/features/<탭>/*-screen.tsx`에
있습니다 (아래 디렉터리 구조 참고).

캘린더에서 날짜를 누르면 **하루 요약 카드**가 먼저 뜨고, 그 카드의 "입력 기록 보기"로
상세보기에 들어갑니다.

※ 회원가입 인트로는 Figma에서 `hidden` 처리된 폐기 초안(`457:738`)을 옮긴 것이라,
로그인과 다른 구형 DNA 아이콘을 씁니다. 손대기 전 AGENTS.md의 미해결 항목을 보세요.

※※ 탭 루트입니다. Figma 하단 탭 바 4개(홈 · 오늘의 일지 · 개선책 · MY)가
**모두 실제 화면으로 연결돼 있습니다.**

05_개선책은 네 화면 모두 구현돼 있고 서로 연결됩니다. 다만 담기·정기구독
버튼은 눌러도 아무 일도 하지 않습니다 — 장바구니가 없고 API에도 커머스
엔드포인트가 없습니다.

06_마이페이지는 네 프레임(마이페이지·웨어러블 연동·데이터 개인정보·구독관리)이
모두 구현돼 있습니다.

일지 탭 안에서 메인 → 오늘의 기록 / 캘린더 / 상세보기로 이동합니다. 홈의
"오늘 기록하기 →"는 오늘의 기록으로 바로 갑니다. **전부 데이터 계층이 없어서
숫자·문구는 Figma 값을 그대로 박아둔 상태입니다.**

**템플릿 잔재는 2026-08-17에 전부 삭제했습니다.** Figma 화면이 모두 포팅돼서
템플릿에서 더 가져올 게 없어졌기 때문입니다. `(tabs)/explore`와 그것만
살려두고 있던 `themed-*` · `external-link` · `hint-row` · `web-badge` ·
`ui/collapsible` · `constants/` · `hooks/`가 함께 없어졌습니다.
`components/animated-icon*`는 스플래시에 실제로 쓰이므로 남아 있습니다.

**동작하지 않는 것** (UI만 있고 로직이 없습니다)

- **인증은 연결돼 있습니다.** 로그인·회원가입이 실제 서버로 나가고, JWT는
  expo-secure-store에 저장돼 재실행 시 복원됩니다. 탭은 `Stack.Protected`로
  막혀 있습니다.
- **일지 저장도 연결돼 있습니다.** 오늘의 기록의 저장 버튼이
  `PUT /api/diaries/{date}`로 실제 저장합니다 (`lib/diary-request.ts`가 한국어
  선택지를 enum으로 옮깁니다). 다만 **취침·기상 시각은 빠집니다** — 시간 피커가
  디자인에 없어서 수집 자체가 안 됩니다 (백로그 29).
- **읽는 쪽도 연결됐습니다.** 홈·일지 메인·캘린더·상세보기가 전부 실제
  데이터를 그립니다 (`GET /api/scores?from&to`, `GET /api/diaries`).
  `src/lib/use-api-query.ts`가 공용 조회 훅이고, `src/lib/score.ts`가 점수를
  등급·캘린더 색·얼굴로 바꿉니다. **단일 날짜 점수 조회는 쓰지 않습니다** —
  `GET /api/scores/{date}`는 조회만 해도 그 날짜의 점수 행을 만듭니다
  (백로그 31). 개선책은 아직 엔드포인트 자체가 없습니다.
- **못 채운 자리는 `—`로 둡니다.** 홈의 수면 카드(`sleepMinutes`가 항상 null,
  백로그 29), 5개 영역 중 감정·환경(백로그 33), 캘린더 코멘트와 그래프 요약
  문장(백로그 27), 일지 하단의 오늘 날씨(백로그 12 — 저장에 위경도를 안 보내 기록되는
  날씨가 없습니다)가 그렇습니다. 홈 지표 카드의 등급 뱃지는 **Figma 문구가
  그대로 박혀 있습니다** — 지표별 등급 규칙이 없습니다(백로그 10).
  **무엇이 남았는지는 `docs/frontend-status.md`가 목록입니다.**
- 입력 검증은 화면마다 다릅니다. **오늘의 기록은 저장을 누르면 미응답 항목을
  빨갛게 표시**하고 그 자리로 스크롤합니다(`SelectFeel5_NeedAnswer`). 회원가입
  단계는 여전히 **다음 버튼 비활성화**까지만이라 왜 막혔는지 알려주지 못합니다 —
  그 컨트롤들에는 미응답 디자인이 없습니다. 서버가 거절한 경우만 `Alert`로
  서버 메시지를 그대로 보여줍니다.
- 회원가입 입력값은 3단계에 걸쳐 유지되고(`features/auth/sign-up-form.tsx`),
  `features/auth/sign-up-request.ts`가 서버 enum으로 변환해 실제로 전송합니다.

## 디렉터리 구조

```
src/
  app/                 Expo Router 라우트 전용 (파일 = 경로)
    index.tsx          "/" → 로그인으로 리다이렉트
    (auth)/ (tabs)/    화면 파일은 features를 가리키는 한 줄 re-export
    **/_layout.tsx     레이아웃만 실제 코드 (폰트·global.css·스택 앵커·탭 바)
  features/            탭 하나 = 폴더 하나. 담당도 이 단위로 나눕니다
    auth/              로그인·회원가입 화면 + sign-up-form(입력 상태)·sign-up-request
    home/              홈 화면 + components/ (OrbCard, StatCard, JournalCta)
    journal/           일지 4화면 + components/ + journal-options(선택지)
    plan/              개선책 4화면 + components/
    my/                MY 4화면 + components/
  components/ui/       Figma 디자인 시스템 컴포넌트 (아래 표)
  components/          animated-icon (스플래시)
  lib/                 둘 이상의 feature가 쓰는 것
    api.ts auth.tsx use-api-query.ts   서버 호출·세션·조회 훅
    dates.ts score.ts diary-request.ts 날짜·점수·일지 변환 (홈과 일지가 공유)
    scale.ts           Figma 220pt 좌표 → 실기기 dp 변환
    design.ts          그림자·그라디언트 등 Figma 원시값
    motion.ts          오브·DNA 모션 튜닝값 (Figma 기준 아님 — 기기에서 조정)
  global.css           NativeWind 진입점 (_layout.tsx 에서 1회 import)
```

**import는 한 방향으로만 흐릅니다: `lib`·`components` → `features` → `app`.**
feature끼리는 서로 import하지 않습니다 — 두 탭이 함께 쓰게 되면 `lib`이나
`components/ui`로 올립니다. `eslint.config.js`의 `import/no-restricted-paths`가
이것을 강제하므로 어기면 `npx expo lint`가 실패합니다. 새 feature 폴더를
만들면 그 파일의 `FEATURES` 목록에도 추가해주세요.

어디에 둘지 헷갈리면:

- **Figma 컴포넌트 마스터**를 옮긴 것 → `components/ui/` (한 화면에서만 써도)
- Figma에서 컴포넌트가 아닌 **수작업 카드·블록** → `features/<탭>/components/`
- 화면 하나에서만 쓰는 작은 도우미 → 그 화면 파일 안에 그대로
- 파일은 kebab-case, export는 이름 있는 export, barrel(`index.ts`) 파일은 만들지 않습니다

경로 별칭은 `@/*` → `src/*`, **`@/assets/*` → `assets/*`** 두 가지입니다
(두 번째는 `src` 밖을 가리키므로 주의). `app.json`의 `typedRoutes` 때문에
`href` 문자열은 타입 검사를 받습니다.

라우트는 파일 위치로 자동 등록됩니다. 새 화면을 추가할 때 레이아웃에
`<Stack.Screen>`을 넣을 필요는 없습니다 — 루트 레이아웃의 목록은 시작 화면을
고정하기 위한 것입니다.

괄호 폴더(`(auth)`, `(tabs)`)는 **경로에 포함되지 않는 그룹**입니다. 즉
`(auth)/sign-in`의 실제 경로는 `/sign-in`입니다.

## 디자인 시스템 컴포넌트

`src/components/ui/`의 아래 항목은 전부 Figma 마스터를 옮긴 것입니다. 화면을 새로
만들 때는 직접 스타일을 쓰지 말고 이것들을 조합해주세요.

모든 컴포넌트는 **v3(`99_개선안_v3`, `1307:1533`) — 2026-10-01에 디자인 완성본으로
확정된 섹션**을 따릅니다. v3는 390pt 프레임이라 코드의 값은 ×220/390입니다. 값을
어떻게 정했는지는 두 문서에 나눠 있습니다: v4 개편(2026-09-30, v3를 220으로 줄인
사본 — 지금은 Figma에서 지워짐) 때의 결정은
[docs/redesign-v4-inventory.md](docs/redesign-v4-inventory.md), 그 뒤 v3에서 바뀐
것은 [docs/redesign-v3-delta.md](docs/redesign-v3-delta.md).

| 컴포넌트 | Figma | 용도 |
|---|---|---|
| `icon` | Icon/* | v3 선 아이콘 38종 (`SvgXml`, 색은 호출부가 `currentColor`로) |
| `button` | ButtonNextUI | 하단 주요 액션 버튼 |
| `button-back` | ButtonBack | 22.56 정사각 뒤로가기 타일 + `Icon/Arrow-Left` (빈 스택 가드 포함) |
| `select-button` | SelectButton1~5 | 선택 알약 (`size`: 일지·회원가입·리커트 × 3상태) |
| `pill-group` | SelectItem3_1/3_2/4_1/4_2/5_1 | 라벨 + 알약 그리드 (2~4열, 카드 없음) |
| `select-card` | SelectItem{3,4,6}[_Caption]_Card | 카드 + 라벨 + 설명 + 알약 한 줄 |
| `likert-card` | SelectItem6_Card | 0~5 숫자 척도 카드 |
| `feel-select` | SelectFeel5 / _NeedAnswer | 5단계 컨디션 (v3 `Icon/Mood-*` 얼굴 5종) |
| `input-time-card` | InputTime_Card | 시작/종료 시각 + 소요시간 뱃지 |
| `slider-0-to-10` | Select0To10 / _Card / _History | 0~10 슬라이더 (`card`·`history` prop) |
| `text-input` (`TextInputField`) | TextInput | 라벨 + 입력 필드 |
| `checkbox` | 약관 체크박스 | |
| `step-header` | 회원가입 헤더 | 뒤로가기 + 제목 + 진행바 |
| `bottom-bar` | TabBar | 하단 탭 바 (`Icon/Tab-*`, 활성 탭은 알약 배경 + 보라 아이콘·글자) |
| `date-cell` | Date | 캘린더 날짜 칸 (없음/낮음/중간/높음) |
| `daily-summary-card` | 일간_컨디션_요약 | 날짜 탭 시 뜨는 하루 요약 카드 |
| `living-artwork` | (Figma에 모션 없음) | 오브·DNA 상시 미세 운동 + 누름 반응 |
| `dna-kind` | DNAKind | 5개 영역 분류 칩 (좋음/주의/위험/기본) |
| `weekly-info-card` | LifeDNA_WeeklyInfo_Card | 지표 1개 + 주간 점수 막대 |
| `weekly-condition-chart` | 주간_컨디션_그래프 | 7일 컨디션 꺾은선 (react-native-svg) |
| `diary-status` | Diary_Status | 일지/메인 지난 기록의 등급별 얼굴 (`Icon/Mood-*` 3종) |
| `plan-card` | (개선책 더 알아보기·인사이트 카드) | 아이콘 + 제목 + 설명 행 (`layout`: `link`·`insight`) |
| `area-delta-card` | 지난 주 대비 영역별 변화 | 6개 영역 변화 표 (주간 리포트·한 달 뒤) |

**`pill-group`과 `select-card`는 형제입니다.** Figma가 같은 알약 묶음을 카드 없는
`SelectItem*`(회원가입)과 카드 있는 `SelectItem*_Card`(일지) 두 벌로 그려두었고,
크기가 달라서(그룹은 179.385 폭·필 24.8, 카드는 열 폭 197.44·필 22.56) 별도 컴포넌트로 두었습니다.

**필은 3상태입니다** — `inactive` / `active` / `history`. `history`는 지난 기록을
읽기 전용으로 되비출 때 쓰는 상태로, v4부터 `active`와 같은 색이고 눌리지만 않습니다.
`PillGroup`·`SelectCard`·`LikertCard`·`FeelSelect`는 `history` boolean으로 넘깁니다.

크기·간격은 모두 Figma 값을 `scale()`로 감싸서 씁니다 (`scale(17)` = Figma 17pt).
색상은 `src/lib/design.ts`(`COLOR`)와 명시적 hex를 씁니다. `tailwind.config.js`에는
`fontFamily`만 남아 있습니다 — 색상 스케일은 2026-08-17에 지웠으니 다시 만들지
마세요 (AGENTS.md 참고).

**단, 아래 세 곳은 이 규칙을 따르지 않습니다.** Figma 원본이 컴포넌트가 아닌
수작업 도형이거나 `PillGroup`이 표현할 수 없는 배치라서 직접 조립했습니다.
새 화면의 본보기로 삼지 마세요.

- `features/auth/survey-screen.tsx` — 수면 유형 알약(`Icon/Mood-*` 얼굴)은 `Pressable`로, 수면의 질·운동량은
  줄을 채우는 `SelectButton`으로 직접 배치 (v3의 `NoSelect`·수작업 도형)
- `features/journal/today-screen.tsx`·`detail-screen.tsx` — 카페인 섭취(질문 두 개가 한 카드)·운동 습관
  카드. Figma 원본이 컴포넌트가 아닌 낱개 도형이라 `journal/components/form-text`의 조각으로
  조립합니다. 일곱 문항은 v3가 글자 길이에 맞춘 고르지 않은 폭을 그려서 `SelectCard`의
  `widths`로 그대로 씁니다 (`journal-options.ts`의 `*_WIDTHS`)
- `features/home/components/` — 오브 카드·지표 카드·일지 CTA. 전부 Figma에서 컴포넌트가
  아니고, 오브 카드는 절대 위치로 조립해야 하는 배치입니다

## 함께 읽을 것

- **[AGENTS.md](AGENTS.md)** — 작업 규칙. 그림자 처리, NativeWind 크래시, 라우팅,
  에뮬레이터 검증 절차 등 **이미 한 번씩 버그를 낸 항목들**이라 코드를 고치기 전에
  꼭 확인해주세요. 미해결 항목과 판단이 필요한 사안도 여기 정리돼 있습니다.
- **[docs/figma-reference.md](docs/figma-reference.md)** — Figma 노드 ID와
  컴포넌트 치수 캐시.
- **[docs/backend-api.md](docs/backend-api.md)** — 백엔드 API 레퍼런스. 엔드포인트,
  스키마, 그리고 **enum ↔ 화면 선택지 대응표**. 연동할 때 여기부터 보세요.
- **[docs/backend-backlog.md](docs/backend-backlog.md)** — 백엔드에 넘기는 열린
  요청. 디자인에는 있는데 API가 못 하는 게 보이면 **즉시 여기 적어주세요.**
- **[docs/frontend-status.md](docs/frontend-status.md)** — 우리가 붙일 것(🟡)과
  기획 결정 대기(🟣), 화면별 API 커버리지.
- **[docs/deploy.md](docs/deploy.md)** — `release` 브랜치 → TestFlight 배포.
  동작 중입니다: JS 변경은 OTA로 수십 초, 네이티브 변경만 새 빌드.

Figma가 항상 기준이며 아직 변경되고 있습니다. 화면을 고치기 전에 반드시 최신
상태를 다시 확인해주세요.
