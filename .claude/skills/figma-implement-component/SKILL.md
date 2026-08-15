---
name: figma-implement-component
description: lifeDNA 앱(React Native/Expo)에서 Figma 디자인 시스템 컴포넌트 하나(버튼, 입력창, 선택지 필 등)를 `src/components/ui/`의 실제 코드 컴포넌트로 옮겨 만들 때 사용. 화면 전체를 조립하는 작업은 figma-build-ui 스킬을, Figma 파일 자체를 정리하는 작업은 figma-componentize 스킬을 대신 쓸 것. get_design_context를 쓰기 전에 figma-design-to-code 스킬과 함께 로드.
---

# Figma 컴포넌트 → 코드 컴포넌트 구현 규칙 (lifeDNA)

이 스킬은 **Figma 컴포넌트 1개를 RN/Expo 코드 컴포넌트 1개로 옮기는 단계**에 쓴다. 화면 조립이나 라우팅은 다루지 않는다 — 그건 `figma-build-ui`.

## 스택

React Native + Expo + Expo Router + TypeScript + NativeWind(Tailwind). 웹 타겟 없음(`app.json`의 `platforms`가 `["ios", "android"]`로 고정) — `Platform.select`의 `web` 분기나 `.web.tsx` 파일을 새로 만들지 않는다.

## PhoneHeader는 코드로 옮기지 않는다

Figma의 `PhoneHeader` 컴포넌트는 상단 상태바(시계·와이파이·배터리) **목업**이다. 실제 앱에서는 OS가 알아서 그려주므로 이걸 그대로 컴포넌트화하면 안 된다. `SafeAreaView`만 쓰고 넘어간다.

## 네이밍 변환

- Figma 컴포넌트 영문명(`ButtonNextUI`, `TextInput` 등)은 의미상 참고만 하고, 실제 코드 컴포넌트명은 프로젝트 컨벤션에 맞게 짓는다(예: `ButtonNextUI` → `Button`, `TextInput` → `TextInputField` — RN 내장 `TextInput`과 이름 충돌 피하려고 `Field` 접미사 사용).
- 파일명은 kebab-case (`button.tsx`, `text-input.tsx`), 기존 스캐폴드 파일들(`themed-text.tsx` 등)과 동일한 컨벤션.
- Figma 레이어의 한글명(`컬러 스타일`, `만족도` 등)은 코드 식별자로 쓰지 않는다.

## 색상 — `tailwind.config.js`의 색상 스케일은 쓰지 않는다

**이 절은 한 번 뒤집혔다.** 예전에는 `brand-*`/`primary-*` 같은 Tailwind 색상 클래스를 쓰라고 안내했지만, 그 스케일은 현재 **죽어 있고 값도 Figma와 어긋난다**(`primary.900` `#04342C` vs 실제 `#00352C`, `gray.100` `#D3D1C7` vs `#D3D1C6`, `gray.400` `#888780` vs `#88877F`). `src` 어디에서도 쓰지 않는다. AGENTS.md의 미해결 항목 참고.

지금 규칙:
- 그림자·그라디언트 등 여러 곳이 공유하는 값 → `src/lib/design.ts`
- 그 외 색은 `get_design_context`가 준 **hex를 그대로** 명시한다
- `tailwind.config.js`에서 실제로 쓰는 건 `fontFamily` 블록뿐이다
- `src/constants/theme.ts`의 `Colors`(light/dark)는 템플릿 잔재다. 새 컴포넌트에서 쓰지 않는다

이름만 보고 추정하지 말 것 — 컬러 스타일 페이지의 "Primary"는 브랜드색이 아니라 DNA/오브의 **상태 색상**(안전 teal)이고, 화면에서 쓰이는 보라-파랑 그라데이션은 그 페이지에 정의돼 있지 않다.

## 크기/폰트 스케일 변환 — 기준은 **기기 폭**이다

**이 절도 한 번 뒤집혔다.** 예전 안내(고정 375pt 기준)는 틀렸고, 실제로 화면 전체가 ~5% 작게 나오는 버그를 냈다. Figma 프레임 220pt는 **폰 전체 폭**을 나타내므로 실제 창 폭을 220으로 나눈다.

```ts
// src/lib/scale.ts
const FIGMA_FRAME_WIDTH = 220;
const FIGMA_TO_DP = Dimensions.get('window').width / FIGMA_FRAME_WIDTH;
export function scale(figmaValue: number) {
  return figmaValue * FIGMA_TO_DP;
}
```

`get_design_context`가 주는 모든 px 값(폰트 크기, padding, radius, 위치)은 코드에 그대로 쓰지 말고 `scale()`을 통과시킨다.

## 백분율 inset을 실제 pt로 되돌리는 법

`get_design_context`는 자식 위치를 `inset-[10.61%_40.66%_74.24%_6.59%]`(top/right/bottom/left) 같은 백분율로 준다. 부모의 선언된 크기를 곱하면 Figma pt가 정확히 복원된다.

```
부모 182×66 → top 66×0.1061 = 7, left 182×0.0659 = 12,
              폭 = 182 − left − right
```

텍스트는 `leading-[N]`(line-height)이 박스 높이보다 큰 경우가 흔하다. RN에서는 **line box 기준**으로 배치한다 — 박스 중심에서 `lineHeight/2`만큼 위아래로 벌린 값이 실제 차지하는 영역이다. 이 방식으로 카드 높이를 합산하면 Figma 값과 정확히 맞아떨어지므로, 합이 안 맞으면 어딘가 잘못 읽은 것이다.

## 폰트 — Pretendard 실제 로드

Figma Plugin API에서는 Pretendard를 못 불러오지만(→ `figma-componentize` 스킬의 TEMP-FONT 참고), **코드에서는 진짜 Pretendard 폰트 파일을 쓴다**. 이미 세팅되어 있다:

- `assets/fonts/Pretendard-{Light,Regular,Medium,SemiBold,Bold,ExtraBold,Black}.otf`
- 루트 `_layout.tsx`에서 `expo-font`의 `useFonts()`로 로드
- `tailwind.config.js`의 `fontFamily`에 등록됨 → `className="font-pretendard-bold"` 형태로 사용.
  Regular만 접미사 없이 `font-pretendard`
- 새 굵기가 필요하면 `assets/fonts/`에 otf 추가 + `_layout.tsx`의 `useFonts` + `tailwind.config.js`
  `fontFamily` 둘 다 갱신한다. **이웃 굵기로 근사하지 말 것.** jsDelivr 경로:
  `orioncactus/pretendard@v1.3.9/packages/pretendard/dist/public/static/Pretendard-<Weight>.otf`
  (받은 뒤 sfnt 태그가 `OTTO`인지, name 테이블의 이름·버전이 맞는지 확인할 것 —
  경로가 틀리면 몇백 바이트짜리 에러 페이지가 `.otf`로 저장된다)

## 그라데이션 / 그라데이션 텍스트

- 배경 그라데이션(버튼 등): `expo-linear-gradient`의 `<LinearGradient colors={[...]} start={{x:0,y:0}} end={{x:1,y:0}} />`
- 그라데이션 텍스트("LifeDNA" 타이틀 등): `@react-native-masked-view/masked-view` + `LinearGradient`로 마스킹. 프로젝트에 `src/components/ui/gradient-text.tsx`로 이미 만들어져 있으니 재사용.
- 두 패키지 다 `npx expo install`로 이미 설치되어 있다.

## NativeWind 사용 시 주의

- **className에 동적 값을 템플릿 리터럴로 넣지 않는다** (예: `` `px-[${scale(8)}px]` ``). NativeWind의 정적 스캐너가 인식 못 한다. 동적 수치는 `style` prop으로 뺀다.
- 커스텀 컴포넌트가 `style` prop을 받아 내부 기본 스타일과 합성해야 하면, `style={[기본스타일, 넘어온style]}` 배열 합성을 쓴다 — `{...props} style={기본값}` 순서로 스프레드 뒤에 고정 style을 두면 호출부가 넘긴 style이 무시된다.
- RN `Pressable`의 `style` prop은 함수형(`(state) => style`)도 허용하는 유니온 타입이라 배열 합성과 타입이 안 맞을 수 있다. 컴포넌트 자체 prop 타입에서 `style?: StyleProp<ViewStyle>`로 좁혀서 받는다.

## 링크/네비게이션: `Link asChild` + 중첩 `Text`는 탭이 안 먹힐 수 있다

**실제 겪은 버그**: `<Link href=".." asChild><Text>일부는 진하게 <Text>강조</Text></Text></Link>` 패턴에서 탭이 씹혔다. 문구 중 일부만 다른 스타일로 강조해야 하는 링크(예: "아직 계정이 없나요? **회원가입**")는 `Link asChild` 대신 아래처럼 `Pressable` + `router.push`를 쓴다:

```tsx
<Pressable onPress={() => router.push('/(auth)/sign-up')}>
  <Text>아직 계정이 없나요? <Text className="text-brand-500 font-pretendard-bold">회원가입</Text></Text>
</Pressable>
```

단순 버튼(`Pressable` 기반 컴포넌트, 중첩 `Text` 없음)을 감싸는 `<Link asChild><Button .../></Link>`는 정상 동작하니 그대로 써도 된다.

## 지금까지 만든 컴포넌트 (`src/components/ui/`)

| 컴포넌트 | 파일 | 대응 Figma 컴포넌트 |
|---|---|---|
| `Button` | `button.tsx` | `ButtonNextUI` |
| `SelectButton` | `select-button.tsx` | `SelectButton1~5` (5단계 × gray/white × `inactive`/`active`/`history`) |
| `TextInputField` | `text-input.tsx` | `TextInput` |
| `PillGroup` | `pill-group.tsx` | `SelectItem3/4_1/4_2/5` — 카드 없는 형태, 여러 줄 wrap |
| `SelectCard` | `select-card.tsx` | `SelectItem{3,4,6}[_Caption]_Card` — 카드 있는 형태, 한 줄 |
| `Slider0To10` | `slider-0-to-10.tsx` | `Select0To10` / `Select0To10_Card` (`card` prop) |
| `LikertCard` | `likert-card.tsx` | `SelectItem6_Card` 중 0~5 숫자 척도 전용. 문자열 선택지는 `SelectCard` |
| `FeelSelect` | `feel-select.tsx` | `SelectFeel5` / `SelectFeel5_NeedAnswer` (5단계 컨디션) |
| `InputTimeCard` | `input-time-card.tsx` | `InputTime_Card` |
| `ButtonBack` | `button-back.tsx` | `ButtonBack` |
| `BottomBar` / `BottomBarButton` | `bottom-bar.tsx` | `BottomBar0`~`4` (헤드리스 탭 API 전용 — AGENTS.md 라우팅 참고) |
| `DnaKind` | `dna-kind.tsx` | `DNAKind` (좋음/주의/위험/기본) |
| `WeeklyInfoCard` | `weekly-info-card.tsx` | `LifeDNA_WeeklyInfo_Card` (+ `_Word`/`_ProgressBar`/`_ScoreBar`) |
| `DateInputRow` | `date-input-row.tsx` | (대응 컴포넌트 없음 — 생년월일 3분할 입력 전용) |
| `Checkbox` | `checkbox.tsx` | (대응 컴포넌트 없음 — 약관동의 체크박스) |
| `GradientText` | `gradient-text.tsx` | (그라데이션 텍스트 범용 유틸) |
| `StepHeader` | `step-header.tsx` | (`ButtonBack`+타이틀+진행바+스텝라벨 조합, 화면 전용) |

새 컴포넌트를 만들면 이 표에 추가한다.

## `history` 상태 — 지난 기록을 다시 보여줄 때

Figma가 필 계열 전체에 세 번째 상태 `*_History`를 추가했다. 일지/상세보기처럼 **이전에 기록한 답을 읽기 전용으로** 되비출 때 쓴다.

- 배경 `#7786A8`, 텍스트 `#F7F8FA`(`SelectFeel5`만 `#F1F1F1`), 그림자 유지
- 선택된 항목만 `history`가 되고 나머지는 `inactive` 그대로다
- `disabled` 처리되어 눌리지 않는다

`SelectButton`은 `state` prop(`'inactive' | 'active' | 'history'`)을 받고, 이를 감싸는 `PillGroup`/`SelectCard`/`LikertCard`/`FeelSelect`는 `history` boolean을 넘겨받아 변환한다.

## 체크리스트

- [ ] PhoneHeader를 코드로 옮기려 하지 않았는가(SafeAreaView로 대체)
- [ ] 모든 px 값에 `scale()`을 적용했는가
- [ ] 색상은 `src/lib/design.ts` 아니면 Figma가 준 hex 그대로인가 (`text-primary-900` 류 금지)
- [ ] 그림자는 `boxShadow`인가 (`shadow-*`/`elevation` 금지 — AGENTS.md #2)
- [ ] 선택 상태를 `className` 토글이 아니라 style 값 변경으로 처리했는가 (AGENTS.md #3)
- [ ] 텍스트에 실제 Pretendard 폰트(`font-pretendard-*`)를 적용했는가
- [ ] className에 동적 템플릿 리터럴을 쓰지 않았는가
- [ ] 강조 텍스트가 섞인 링크는 `Pressable`+`router.push`로 만들었는가
- [ ] 새로 만든 컴포넌트를 위 표에 기록했는가
