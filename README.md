# AntiAgingDNA_front

LifeDNA 만들기 프로젝트.

매일의 기록을 모아 사용자별 '유전자'를 만들어가는 앱입니다. 현재는 **가입 플로우
UI까지** 구현되어 있고, 그 이후 화면들은 아직 Expo 템플릿 상태입니다.

## 기술 스택

- React Native (Expo SDK 57) + Expo Router
- TypeScript
- NativeWind (Tailwind CSS)
- iOS/Android 네이티브 앱 전용 (웹 타겟 없음)

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
| `(auth)/sign-up/index` | 회원가입 인트로 |
| `(auth)/sign-up/personal-info` | STEP 1 · 개인정보 입력 |
| `(auth)/sign-up/survey` | STEP 2 · 초기 진단 10문항 |
| `(auth)/sign-up/terms` | STEP 3 · 약관 동의 |

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
  components/ui/       Figma 디자인 시스템 컴포넌트
  components/          템플릿 잔여 컴포넌트
  lib/
    scale.ts           Figma 220pt 좌표 → 실기기 dp 변환
    design.ts          그림자·그라디언트 등 Figma 원시값
  constants/, hooks/   템플릿 유틸
```

괄호 폴더(`(auth)`, `(tabs)`)는 **경로에 포함되지 않는 그룹**입니다. 즉
`(auth)/sign-in`의 실제 경로는 `/sign-in`입니다.

## 디자인 시스템 컴포넌트

`src/components/ui/`의 아래 항목은 전부 Figma 마스터를 옮긴 것입니다. 화면을 새로
만들 때는 직접 스타일을 쓰지 말고 이것들을 조합해주세요.

| 컴포넌트 | Figma | 용도 |
|---|---|---|
| `button` | ButtonNextUI | 하단 주요 액션 버튼 |
| `select-button` | SelectButton1~5 | 선택 알약 (5단계 크기 × 회색/흰색) |
| `pill-group` | SelectItem3~5 | 라벨 + 알약 그리드 |
| `likert-card` | SelectItem6_Card | 0~5 만족도 카드 |
| `slider-0-to-10` | Select0To10 | 0~10 슬라이더 |
| `text-input` | TextInput | 라벨 + 입력 필드 |
| `date-input-row` | 생년월일 | 년/월/일 3분할 입력 |
| `checkbox` | 약관 체크박스 | |
| `step-header` | 회원가입 헤더 | 뒤로가기 + 제목 + 진행바 |
| `gradient-text` | LifeDNA 워드마크 | 그라디언트 텍스트 |

크기·간격은 모두 Figma 값을 `scale()`로 감싸서 씁니다 (`scale(17)` = Figma 17pt).

## 함께 읽을 것

- **[AGENTS.md](AGENTS.md)** — 작업 규칙. 그림자 처리, NativeWind 크래시, 라우팅,
  에뮬레이터 검증 절차 등 **이미 한 번씩 버그를 낸 항목들**이라 코드를 고치기 전에
  꼭 확인해주세요. 미해결 항목과 판단이 필요한 사안도 여기 정리돼 있습니다.
- **[docs/figma-reference.md](docs/figma-reference.md)** — Figma 노드 ID와
  컴포넌트 치수 캐시.

Figma가 항상 기준이며 아직 변경되고 있습니다. 화면을 고치기 전에 반드시 최신
상태를 다시 확인해주세요.
