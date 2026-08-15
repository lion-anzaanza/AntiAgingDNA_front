# AntiAgingDNA_front

LifeDNA 만들기 프로젝트.

매일의 기록을 모아 사용자별 '유전자'를 만들어가는 앱입니다. 현재는 **가입 플로우
UI까지** 구현되어 있고, 그 이후 화면들은 아직 Expo 템플릿 상태입니다.

## 기술 스택

- React Native (Expo SDK 57) + Expo Router
- TypeScript
- NativeWind (Tailwind CSS)
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
| `journal/today` | 일지 · 오늘의 기록 ※※ |

※ 회원가입 인트로는 Figma에서 `hidden` 처리된 폐기 초안(`457:738`)을 옮긴 것이라,
로그인과 다른 구형 DNA 아이콘을 씁니다. 손대기 전 AGENTS.md의 미해결 항목을 보세요.

※※ 일지 섹션 컴포넌트를 실제로 렌더해 검증하려고 만든 화면입니다. 아직 어디서도
링크되지 않고(`/journal/today`로 직접 들어가야 합니다) 하단 탭 바도 없습니다 —
BottomBar는 탭 셸 구조와 함께 만들어야 해서 미착수입니다. AGENTS.md 참고.

**아직 손대지 않은 것** — Expo 템플릿 그대로입니다. 잘못된 게 아니라 미착수 상태입니다.

- `(tabs)/home`, `(tabs)/explore` — "Welcome to Expo" 기본 화면. 약관 동의를
  마치면 여기로 이동합니다.
- `components/` 중 `themed-*`, `external-link`, `hint-row`, `web-badge`,
  `animated-icon*`, `app-tabs*`, `ui/collapsible` — 위 탭 화면들이 쓰는
  템플릿 코드.
- `constants/theme.ts`, `hooks/` — 템플릿의 라이트/다크 테마 유틸.

**동작하지 않는 것** (UI만 있고 로직이 없습니다)

- 인증 없음. 로그인 버튼은 아무것도 하지 않고, 약관 동의는 그냥 탭으로 넘어갑니다.
- 입력 검증 없음. 비밀번호 불일치·잘못된 이메일·불가능한 날짜가 모두 통과합니다.
- 폼 상태가 화면 밖으로 나가지 않습니다. 입력값은 화면 이동 시 사라지고,
  약관 동의 화면이 서버로 보내는 데이터도 없습니다.

## 디렉터리 구조

```
src/
  app/                 Expo Router 라우트 (파일 = 경로)
    index.tsx          "/" → 로그인으로 리다이렉트
    (auth)/            가입 플로우 — 구현 완료
    (tabs)/            가입 이후 앱 — 템플릿 상태
    _layout.tsx        폰트 로드 + global.css + 스택 앵커
  components/ui/       Figma 디자인 시스템 컴포넌트 (collapsible 은 템플릿)
  components/          템플릿 잔여 컴포넌트
  lib/
    scale.ts           Figma 220pt 좌표 → 실기기 dp 변환
    design.ts          그림자·그라디언트 등 Figma 원시값
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
| `slider-0-to-10` | Select0To10 / _Card | 0~10 슬라이더 (`card` prop) |
| `text-input` (`TextInputField`) | TextInput | 라벨 + 입력 필드 |
| `date-input-row` | 생년월일 | 년/월/일 3분할 입력 |
| `checkbox` | 약관 체크박스 | |
| `step-header` | 회원가입 헤더 | 뒤로가기 + 제목 + 진행바 |
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

## 함께 읽을 것

- **[AGENTS.md](AGENTS.md)** — 작업 규칙. 그림자 처리, NativeWind 크래시, 라우팅,
  에뮬레이터 검증 절차 등 **이미 한 번씩 버그를 낸 항목들**이라 코드를 고치기 전에
  꼭 확인해주세요. 미해결 항목과 판단이 필요한 사안도 여기 정리돼 있습니다.
- **[docs/figma-reference.md](docs/figma-reference.md)** — Figma 노드 ID와
  컴포넌트 치수 캐시.

Figma가 항상 기준이며 아직 변경되고 있습니다. 화면을 고치기 전에 반드시 최신
상태를 다시 확인해주세요.
