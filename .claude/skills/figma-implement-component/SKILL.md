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

## 색상 토큰 — `primary`(teal)와 `brand`(보라)를 혼동하지 말 것

**실제 겪은 버그**: 컬러 스타일 페이지의 "Primary" 스와치는 라벨이 "메인/안전 Teal"이고, 실제로는 DNA/오브 상태의 "안전(good)" 같은 **상태 색상**이지 브랜드 색이 아니다. 로그인/버튼/링크/선택된 필 등 실제 화면에서 쓰이는 보라-파랑 그라데이션(`#4655F6→#9423FF`, `#4B52F6→#BC40F6`, 링크 텍스트 `#8B2AFE` 등)은 컬러 스타일 페이지에 **별도로 정의되어 있지 않다**. `tailwind.config.js`에 이미 두 스케일이 등록되어 있다:

```js
brand: { 400: '#4655F6', 500: '#8B2AFE', 600: '#9423FF' },
primary: { 50: '#E1F5EE', 100: '#9FE1CB', 200: '#5DCAA5', 400: '#1D9E75', 600: '#0F6E56', 900: '#04342C' },
```

규칙:
- 헤딩/바디 텍스트가 짙은 청록색(`#00352C` 계열)이면 → `primary-900` (맞음, 그대로 사용)
- 버튼 배경, 링크 텍스트("회원가입", "로그인"), 선택된 필/체크박스, 슬라이더 핸들, 진행 바 등 **인터랙션 강조색**이면 → `brand-400`/`brand-500`/`brand-600` (`primary`가 아님)
- 헷갈리면 실제 hex를 `get_design_context`로 다시 확인하고 어느 스케일에 속하는지 판단할 것, 이름만 보고 추정하지 말 것.
- `gray`/`error`/`warning` 토큰도 `tailwind.config.js`에 등록되어 있다 (각 50/100/200/400/600/900). 하드코딩된 hex 대신 이 토큰들을 쓴다.
- `src/constants/theme.ts`의 `Colors`(light/dark)는 Tailwind로 표현하기 애매한 네이티브 전용 값(상태바, 스플래시 배경)에만 쓰고, 컴포넌트 스타일링은 NativeWind 클래스가 기본이다.

## 크기/폰트 스케일 변환 — 기준 폭 375 확정

Figma 프레임은 220pt 폭으로, 실제 iPhone 375pt 폭 기준 디자인을 축소해서 작업한 것이다(비율 375/220 ≈ 1.7045). `get_design_context`로 뽑은 실제 폰트 크기(7px, 10px, 14px 등)를 이 비율로 역산하면 12px/17px/24px 같은 흔한 앱 폰트 크기와 정확히 맞아떨어져 **검증된 값**이다.

```ts
// src/lib/scale.ts
const FIGMA_FRAME_WIDTH = 220;
const DESIGN_BASE_WIDTH = 375;
export function scale(figmaValue: number) {
  return figmaValue * (DESIGN_BASE_WIDTH / FIGMA_FRAME_WIDTH);
}
```

`get_design_context`가 주는 모든 px 값(폰트 크기, padding, radius, 위치)은 코드에 그대로 쓰지 말고 `scale()`을 통과시킨다.

## 폰트 — Pretendard 실제 로드

Figma Plugin API에서는 Pretendard를 못 불러오지만(→ `figma-componentize` 스킬의 TEMP-FONT 참고), **코드에서는 진짜 Pretendard 폰트 파일을 쓴다**. 이미 세팅되어 있다:

- `assets/fonts/Pretendard-{Regular,Medium,Bold,ExtraBold,Black}.otf`
- 루트 `_layout.tsx`에서 `expo-font`의 `useFonts()`로 로드, 로드 전엔 `null` 반환(스플래시 유지)
- `tailwind.config.js`의 `fontFamily`에 `pretendard`/`pretendard-medium`/`pretendard-bold`/`pretendard-extrabold`/`pretendard-black` 등록됨 → `className="font-pretendard-bold"` 형태로 사용
- 새 굵기가 필요하면(SemiBold 등) `assets/fonts/`에 otf 추가 + `_layout.tsx`의 `useFonts` + `tailwind.config.js` `fontFamily` 둘 다 갱신

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
| `TextInputField` | `text-input.tsx` | `TextInput` |
| `PillGroup` | `pill-group.tsx` | `SelectItem3/4_1/4_2/5` (단일·다중 선택 모두 지원, `columns`/`size` prop으로 배치·크기 조절) |
| `Slider0To10` | `slider-0-to-10.tsx` | `Select0To10` |
| `LikertCard` | `likert-card.tsx` | `SelectItem6_Card` (0~5 리커트 척도용) |
| `DateInputRow` | `date-input-row.tsx` | (대응 컴포넌트 없음 — 생년월일 3분할 입력 전용) |
| `Checkbox` | `checkbox.tsx` | (대응 컴포넌트 없음 — 약관동의 체크박스) |
| `GradientText` | `gradient-text.tsx` | (그라데이션 텍스트 범용 유틸) |
| `StepHeader` | `step-header.tsx` | (뒤로가기+타이틀+진행바+스텝라벨 조합, 화면 전용) |

새 컴포넌트를 만들면 이 표에 추가한다.

## 체크리스트

- [ ] PhoneHeader를 코드로 옮기려 하지 않았는가(SafeAreaView로 대체)
- [ ] 모든 px 값에 `scale()`을 적용했는가
- [ ] 색상은 하드코딩 대신 토큰을 썼고, `primary`/`brand`를 헷갈리지 않았는가
- [ ] 텍스트에 실제 Pretendard 폰트(`font-pretendard-*`)를 적용했는가
- [ ] className에 동적 템플릿 리터럴을 쓰지 않았는가
- [ ] 강조 텍스트가 섞인 링크는 `Pressable`+`router.push`로 만들었는가
- [ ] 새로 만든 컴포넌트를 위 표에 기록했는가
