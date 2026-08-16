# AntiAgingDNA_front

LifeDNA 만들기 프로젝트.

매일의 기록을 모아 사용자별 '유전자'를 만들어가는 앱입니다. 현재 **Figma에 그려진 화면이 전부** 구현돼 있습니다 (로그인·회원가입, 홈,
일지, 개선책, 마이페이지).
**백엔드에는 아직 아무것도 연결돼 있지 않습니다.**

## 기술 스택

- React Native (Expo SDK 57) + Expo Router
- TypeScript
- NativeWind (Tailwind CSS)
- react-native-svg (일지 주간 컨디션 그래프 전용. Expo Go에 포함돼 있어
  개발용 빌드가 따로 필요하지 않습니다)
- iOS/Android 타겟 (`app.json`의 `platforms`). 웹은 지원 대상이 아니지만
  템플릿 잔재가 남아 있습니다 — AGENTS.md의 미해결 항목 참고

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

캘린더에서 날짜를 누르면 **하루 요약 카드**가 먼저 뜨고, 그 카드의 "입력 기록 보기"로
상세보기에 들어갑니다.

※ 회원가입 인트로는 Figma에서 `hidden` 처리된 폐기 초안(`457:738`)을 옮긴 것이라,
로그인과 다른 구형 DNA 아이콘을 씁니다. 손대기 전 AGENTS.md의 미해결 항목을 보세요.

※※ 탭 루트입니다. Figma 하단 탭 바 4개(홈 · 오늘의 일지 · 개선책 · MY)가
**모두 실제 화면으로 연결돼 있습니다.**

05_개선책은 네 화면 모두 구현돼 있고 서로 연결됩니다. 다만 담기·정기구독
버튼은 눌러도 아무 일도 하지 않습니다 — 장바구니가 없고 API에도 커머스
엔드포인트가 없습니다.

06_마이페이지는 **네 프레임 중 둘만 실제로 디자인돼 있어** 그 둘만 옮겼습니다.
데이터 개인정보는 같은 메뉴를 제목만 바꿔 반복하고, 구독관리는 제목 아래 빈
상자뿐입니다. 두 메뉴 행은 눌러도 아무 일도 하지 않습니다.

일지 탭 안에서 메인 → 오늘의 기록 / 캘린더 / 상세보기로 이동합니다. 홈의
"오늘 기록하기 →"는 오늘의 기록으로 바로 갑니다. **전부 데이터 계층이 없어서
숫자·문구는 Figma 값을 그대로 박아둔 상태입니다.**

**아직 손대지 않은 것** — Expo 템플릿 그대로입니다. 잘못된 게 아니라 미착수 상태입니다.

- `(tabs)/explore` — "Welcome to Expo" 기본 화면. 이제 탭 바에 없지만
  `/explore`로는 여전히 열립니다. 템플릿 탭 바(`components/app-tabs*.tsx`)는
  Figma 탭 바(`ui/bottom-bar.tsx`)로 대체되면서 삭제했습니다.
- `components/` 중 `themed-*`, `external-link`, `hint-row`, `web-badge`,
  `animated-icon*`, `ui/collapsible` — 위 탭 화면들이 쓰는 템플릿 코드.
- `constants/theme.ts`, `hooks/` — 템플릿의 라이트/다크 테마 유틸.

**동작하지 않는 것** (UI만 있고 로직이 없습니다)

- **인증은 연결돼 있습니다.** 로그인·회원가입이 실제 서버로 나가고, JWT는
  expo-secure-store에 저장돼 재실행 시 복원됩니다. 탭은 `Stack.Protected`로
  막혀 있습니다.
- **데이터를 읽는 쪽은 아직입니다.** 홈·일지·개선책의 숫자는 전부 Figma 값
  그대로이고 `/api/scores`·`/api/diaries`·`/api/dna`는 쓰이지 않습니다.
  개선책은 아직 엔드포인트 자체가 없습니다.
- 입력 검증은 **다음 버튼 비활성화까지만** 있습니다. 왜 막혔는지는 알려주지
  못합니다 — 디자인에 입력 필드의 에러 상태가 없습니다. 서버가 거절한 경우만
  `Alert`로 서버 메시지를 그대로 보여줍니다.
- 회원가입 입력값은 3단계에 걸쳐 유지되고(`lib/sign-up-form.tsx`),
  `lib/sign-up-request.ts`가 서버 enum으로 변환해 실제로 전송합니다.

## 디렉터리 구조

```
src/
  app/                 Expo Router 라우트 (파일 = 경로)
    index.tsx          "/" → 로그인으로 리다이렉트
    (auth)/            가입 플로우 — 구현 완료
    (tabs)/            가입 이후 앱 — 홈/일지 구현, 탭 바는 Figma BottomBar
    _layout.tsx        폰트 로드 + global.css + 스택 앵커
  components/ui/       Figma 디자인 시스템 컴포넌트 (collapsible 은 템플릿)
  components/          템플릿 잔여 컴포넌트
  lib/
    scale.ts           Figma 220pt 좌표 → 실기기 dp 변환
    design.ts          그림자·그라디언트 등 Figma 원시값
    motion.ts          오브·DNA 모션 튜닝값 (Figma 기준 아님 — 기기에서 조정)
    sign-up-form.tsx   회원가입 3단계 공용 입력 상태 (Context)
    journal-options.ts 일지 선택지 (오늘의 기록·상세보기 공용)
  global.css           NativeWind 진입점 (_layout.tsx 에서 1회 import)
  constants/, hooks/   템플릿 유틸
```

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

| 컴포넌트 | Figma | 용도 |
|---|---|---|
| `button` | ButtonNextUI | 하단 주요 액션 버튼 |
| `button-back` | ButtonBack | 14×13 뒤로가기 칩 (빈 스택 가드 포함) |
| `select-button` | SelectButton1~5 | 선택 알약 (5단계 × 회색/흰색 × 3상태) |
| `pill-group` | SelectItem3_1/3_2/4_1/4_2/5_1 | 라벨 + 알약 그리드 (2~4열, 카드 없음) |
| `select-card` | SelectItem{3,4,6}[_Caption]_Card | 카드 + 라벨 + 설명 + 알약 한 줄 |
| `likert-card` | SelectItem6_Card | 0~5 숫자 척도 카드 |
| `feel-select` | SelectFeel5 / _NeedAnswer | 5단계 컨디션 (이모지 5종) |
| `input-time-card` | InputTime_Card | 시작/종료 시각 + 소요시간 뱃지 |
| `slider-0-to-10` | Select0To10 / _Card / _History | 0~10 슬라이더 (`card`·`history` prop) |
| `text-input` (`TextInputField`) | TextInput | 라벨 + 입력 필드 |
| `checkbox` | 약관 체크박스 | |
| `step-header` | 회원가입 헤더 | 뒤로가기 + 제목 + 진행바 |
| `bottom-bar` | BottomBar0~4 | 하단 탭 바 (활성 시 아이콘만 바뀜) |
| `date-cell` | Date | 캘린더 날짜 칸 (없음/낮음/중간/높음) |
| `daily-summary-card` | 일간_컨디션_요약 | 날짜 탭 시 뜨는 하루 요약 카드 |
| `living-artwork` | (Figma에 모션 없음) | 오브·DNA 상시 미세 운동 + 누름 반응 |
| `dna-kind` | DNAKind | 5개 영역 분류 칩 (좋음/주의/위험/기본) |
| `weekly-info-card` | LifeDNA_WeeklyInfo_Card | 지표 1개 + 주간 점수 막대 |
| `weekly-condition-chart` | 주간_컨디션_그래프 | 7일 컨디션 꺾은선 (react-native-svg) |
| `gradient-text` | LifeDNA 워드마크 | 그라디언트 텍스트 |

**`pill-group`과 `select-card`는 형제입니다.** Figma가 같은 알약 묶음을 카드 없는
`SelectItem*`(회원가입)과 카드 있는 `SelectItem*_Card`(일지) 두 벌로 그려두었고,
콘텐츠 폭(186 vs 182)과 안쪽 여백이 달라서 별도 컴포넌트로 두었습니다.

**필은 3상태입니다** — `inactive` / `active` / `history`. `history`는 지난 기록을
읽기 전용으로 되비출 때 쓰는 회청색(`#7786A8`) 상태로, 눌리지 않습니다.
`PillGroup`·`SelectCard`·`LikertCard`·`FeelSelect`는 `history` boolean으로 넘깁니다.

크기·간격은 모두 Figma 값을 `scale()`로 감싸서 씁니다 (`scale(17)` = Figma 17pt).
색상은 `src/lib/design.ts`와 명시적 hex를 씁니다. `tailwind.config.js`의 색상
스케일은 쓰이지 않고 값도 일부 어긋나 있으니 `text-primary-900` 같은 클래스에
손대지 마세요 (AGENTS.md 참고).

**단, 아래 두 화면은 이 규칙을 따르지 않습니다.** Figma 원본이 컴포넌트가 아닌
수작업 도형이거나 `PillGroup`이 표현할 수 없는 배치라서 직접 조립했습니다.
새 화면의 본보기로 삼지 마세요.

- `survey.tsx` — 수면 유형·수면의 질 알약을 `Pressable`로 직접 구성
- `personal-info.tsx` — 직업 5열 배치 (`PillGroup`의 `columns`는 최대 4)
- `journal/today.tsx` — 카페인 섭취·운동 습관 카드. Figma 원본이 컴포넌트가 아닌
  낱개 도형이고, 알약 폭이 균등 그리드가 아니라 글자 길이에 맞춰져 있습니다
- `(tabs)/home.tsx` — 오브 카드·지표 카드·일지 CTA. 전부 Figma에서 컴포넌트가
  아니고, 오브 카드는 절대 위치로 조립해야 하는 배치입니다

## 함께 읽을 것

- **[AGENTS.md](AGENTS.md)** — 작업 규칙. 그림자 처리, NativeWind 크래시, 라우팅,
  에뮬레이터 검증 절차 등 **이미 한 번씩 버그를 낸 항목들**이라 코드를 고치기 전에
  꼭 확인해주세요. 미해결 항목과 판단이 필요한 사안도 여기 정리돼 있습니다.
- **[docs/figma-reference.md](docs/figma-reference.md)** — Figma 노드 ID와
  컴포넌트 치수 캐시.
- **[docs/backend-api.md](docs/backend-api.md)** — 백엔드 API 레퍼런스. 엔드포인트,
  스키마, 그리고 **enum ↔ 화면 선택지 대응표**. 연동할 때 여기부터 보세요.
- **[docs/backend-backlog.md](docs/backend-backlog.md)** — 백엔드에 요청·확인할
  것들. 디자인에는 있는데 API가 못 하는 게 보이면 **즉시 여기 적어주세요.**

Figma가 항상 기준이며 아직 변경되고 있습니다. 화면을 고치기 전에 반드시 최신
상태를 다시 확인해주세요.
