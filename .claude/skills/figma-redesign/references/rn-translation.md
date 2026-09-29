# get_design_context(웹 Tailwind) → React Native 변환

`get_design_context`는 `clientFrameworks`와 상관없이 항상 React + Tailwind를
돌려준다. 아래는 이 프로젝트에서 그걸 옮기는 규칙이다. AGENTS.md의 규칙 1~16
(그림자, className 토글, scale, 워크릿 등)은 여기 다시 적지 않았다 — 그쪽이 먼저다.

## 값

| 응답 | 코드 |
|---|---|
| `text-[9.59px]`, `h-[27.077px]`, `rounded-[9.615px]` | `scale(9.59)` … 값 그대로 |
| `leading-[13.538px]` | `lineHeight: scale(13.538)` |
| `tracking-[-0.0959px]` | `letterSpacing: scale(-0.0959)` |
| `text-[color:var(--text\/body,#6b6680)]` | `COLOR.text.body` (`lib/design.ts`) |
| 변수 없는 hex (`text-[#8b2afe]`) | hex 그대로. 토큰에 없는 색이면 인벤토리에 적는다 |
| `shadow-[0px_0px_3.846px_0px_rgba(169,169,169,0.25)]` | `boxShadow: SHADOW_V4` |
| `border-[0.564px] border-[var(--border\/soft,…)]` | `borderWidth: scale(0.564), borderColor: COLOR.border.soft` |
| `font-['IBM_Plex_Sans_KR:Regular/SemiBold/Bold']` | `font-plex` / `font-plex-semibold` / `font-plex-bold` |
| `font-['Pretendard:…']` (기호만) | 기존 `font-pretendard-*` |
| `linear-gradient(Ndeg, c1 p1%, …)` | `LinearGradient` + `cssGradientPoints(N, w, h)`, `locations=[p1/100, …]` |

**파스텔 그라디언트의 각도는 상자 모양에서 나온다.** v4의 파스텔 채움은 모두
`pastelAngle(w, h) = 90° + atan(0.56338·w/h)`를 따른다(`lib/gradient.ts`, v4 채움 6개와
0.0001° 안에서 일치). 폭이 데이터로 정해지는 막대(점수 막대 등)는 각도를 고정하지 말고
실제 폭으로 이 함수를 불러 `cssGradientPoints`에 넘긴다.

**`get_design_context`가 준 에셋 URL은 curl로 404가 날 수 있다.** 그 노드에
`download_assets`를 쓰면 받아진다.

동적 값은 `style`로 넘긴다. className에 템플릿 리터럴(`` `px-[${…}px]` ``)을 넣으면
NativeWind가 못 읽는다.

## 위치

- **절대 좌표는 프레임 기준이다.** 프레임 맨 위에 38pt `PhoneHeader` 목업이 있으니
  화면 안 위치는 `top − 38`이다. `PhoneHeader`는 옮기지 않는다(`SafeAreaView`).
- **백분율 inset은 부모 크기를 곱해 pt로 되돌린다.**
  `inset-[27.53%_0_0_0]`, 부모 높이 37.365 → top = 37.365 × 0.2753 = 10.29.
- **텍스트는 줄 상자(line box) 기준이다.** `-translate-y-1/2 … top-[108.99px]`와
  `leading-[22.564px]`이면 줄 상자 위쪽 = 108.99 − 22.564/2. 잉크 중심은 줄 상자
  중심보다 약 0.9pt 아래에 있으니 잉크로는 확인만 한다.
- **Figma가 절대 위치로 둔 것은 절대 위치로 둔다**(AGENTS 규칙 14). 폭이 고정된 행에서
  flex로 다시 만들면 글꼴 배율 1.1인 폰에서 글자가 밀려난다.
- 절대 위치 자식은 부모의 **테두리 상자** 기준이다. 부모 padding을 직접 더한다(규칙 15).
- **가운데에서 조금 어긋난 요소**(`left-[calc(50%+1.94px)]`)는 한 번만 나오면 Figma
  실수로 보고 가운데 정렬한다(로그인 DNA 1.9pt, 마이페이지 로그아웃 3.2pt). 같은
  어긋남이 **여러 요소에서 같은 방향으로 반복되면** 의도로 보고 재현한다(마이페이지
  값 문구 두 줄이 모두 3.2pt 아래). 어느 쪽이든 인벤토리에 적는다.

## 컴포넌트

- Figma 영문명은 참고만 한다. 코드 이름은 기존 것을 따른다
  (`ButtonNextUI` → `Button`, `TextInput` → `TextInputField` — RN 내장과 충돌 방지).
- 파일은 kebab-case, 이름 있는 export, barrel 파일 없음. 둘 이상의 탭이 쓰면
  `components/ui/`, 한 탭 안의 카드·블록은 `features/<탭>/components/`(README 참고).
- 스타일을 받는 컴포넌트는 `style={[기본, 넘어온 것]}` 순서로 합성한다. 스프레드 뒤에
  고정 style을 두면 호출부 style이 무시된다. `Pressable`의 `style`은 함수형 유니온이라
  prop 타입을 `StyleProp<ViewStyle>`로 좁혀 받는다.
- **일부만 강조된 링크 문구**("아직 계정이 없나요? **회원가입**")는 `Link asChild` +
  중첩 `Text`로 만들면 탭이 씹힌다. `Pressable` + `router.push`를 쓴다.
- 선택 상태는 className을 켜고 끄지 말고 style 값만 바꾼다(규칙 3). 선택/비선택이
  같은 트리 모양이어야 한다.

## 폰트 추가

새 굵기가 필요하면 이웃 굵기로 근사하지 않는다. IBM Plex Sans KR은
`https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/ibmplexsanskr/IBMPlexSansKR-<Weight>.ttf`
(SIL OFL). 받은 뒤 파일 앞 4바이트가 `00010000`이고 name 테이블이
`IBM Plex Sans KR <Weight>`인지 확인한다 — 경로가 틀리면 에러 페이지가 `.ttf`로
저장된다. `_layout.tsx`의 `useFonts`와 `tailwind.config.js`의 `fontFamily`를 둘 다
고치고, Metro를 `--clear`로 다시 띄운다.
