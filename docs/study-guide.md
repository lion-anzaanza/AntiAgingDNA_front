# 사전 학습 가이드

이 프로젝트에 들어오기 전에 공부해두면 좋은 것들을 정리했습니다. 기술마다
**이 프로젝트에서 왜 중요한지**와 **먼저 읽을 자료**를 함께 적었습니다.
자료는 공식 문서를 우선했고 2026-09-30에 링크를 확인했습니다.

버전은 `package.json` 기준입니다. Expo는 SDK마다 API가 바뀌므로, 검색해서 나온
글보다 **SDK 57 버전 문서**(<https://docs.expo.dev/versions/v57.0.0/>)를 우선하세요.

## 한눈에 보기

| 영역 | 기술 | 버전 | 우선순위 |
|---|---|---|---|
| 언어 | TypeScript | ~6.0 | 필수 |
| UI 라이브러리 | React | 19.2 | 필수 |
| 모바일 런타임 | React Native | 0.86 (New Architecture) | 필수 |
| 프레임워크 | Expo | SDK 57 | 필수 |
| 라우팅 | Expo Router | 57.x | 필수 |
| 스타일 | NativeWind + Tailwind CSS | v4 / 3.4 | 필수 |
| 애니메이션 | Reanimated + Worklets | 4.5 / 0.10 | 모션을 만질 때 |
| 그래픽 | react-native-svg, expo-linear-gradient | 15.15 | 그래프를 만질 때 |
| 인증 | JWT, expo-secure-store | — | 필수 |
| 백엔드 계약 | REST, OpenAPI 3.1, RFC 9457 | — | 필수 |
| 테스트·품질 | Jest(jest-expo), ESLint | 29 / 9 | 필수 |
| 배포 | EAS Build / EAS Update, GitHub Actions | — | 배포를 만질 때 |
| 디자인 | Figma (+ Figma MCP) | — | 필수 |

### DB에 대해

**이 저장소에는 DB가 없습니다.** 앱이 기기에 저장하는 것은 로그인 토큰 하나뿐이고
(`expo-secure-store`), 나머지 데이터는 전부 백엔드 API에서 읽고 씁니다.

백엔드는 별도 저장소이고 이쪽에서 보이는 단서로는 **Spring Boot**입니다
(`/v3/api-docs`는 springdoc-openapi의 기본 경로이고 응답 헤더가 Spring Security
기본값입니다). **어떤 DB를 쓰는지는 이 저장소에서 알 수 없습니다** — 필요하면
백엔드 팀에 물어보고 이 문서에 적어주세요. 프론트 작업에는 DB 지식보다 **API
계약**(아래 6장)이 훨씬 중요합니다.

---

## 1. TypeScript

모든 코드가 TypeScript이고 `npx tsc --noEmit`이 통과 상태를 유지해야 합니다.
`app.json`의 `typedRoutes` 때문에 `href` 문자열까지 타입 검사를 받습니다.

알아둘 것: 유니온 타입과 좁히기(narrowing), 제네릭(`useApiQuery<T>`), `type` vs
`interface`, `as const`, 모듈 import/export.

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html) — 공식. "Everyday Types"와 "Narrowing"까지만 읽어도 충분합니다
- [TypeScript for JavaScript Programmers](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html) — JS를 안다면 여기서 시작

## 2. React 19

화면은 전부 함수 컴포넌트 + 훅입니다. 이 프로젝트는 **React Compiler 규칙**을
lint로 강제합니다(`react-hooks/immutability` 등). 렌더 중에 값을 바꾸거나 훅을
조건부로 부르면 lint가 실패합니다.

알아둘 것: 컴포넌트와 props, `useState`/`useEffect`/`useMemo`/`useCallback`,
Context(`lib/auth.tsx`가 세션을 Context로 돌립니다), 커스텀 훅, 훅의 규칙.

- [React 공식 문서 (한국어)](https://ko.react.dev/learn) — "빠르게 시작하기" → "React로 사고하기" 순서 추천
- [Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks)
- [커스텀 Hook으로 로직 재사용하기](https://ko.react.dev/learn/reusing-logic-with-custom-hooks) — `use-api-query.ts`를 읽기 전에
- [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect) — effect 남용을 막는 데 가장 도움이 되는 글

## 3. React Native 0.86

웹 React와 다른 점이 핵심입니다: `div` 대신 `View`, 모든 텍스트는 `Text` 안에,
레이아웃은 기본이 `flexDirection: 'column'`인 Flexbox. 0.86은 **New
Architecture(Fabric/JSI)** 전용입니다.

이 프로젝트에서 특히 중요한 것:

- **Flexbox와 절대 위치.** Figma를 옮길 때 가장 많이 틀린 곳입니다. `position:
  'absolute'`의 기준이 패딩이 아니라 border box라는 점(AGENTS 규칙 15)을 알고 있어야 합니다.
- **`boxShadow` 스타일.** RN 0.76+의 CSS식 그림자를 씁니다. `elevation`은 쓰지 않습니다 (규칙 2).
- **폰트 스케일.** `Text`는 시스템 글자 크기를 따릅니다 (규칙 14).

- [React Native 공식 문서 — Core Components](https://reactnative.dev/docs/intro-react-native-components)
- [Layout with Flexbox](https://reactnative.dev/docs/flexbox) — 꼭 읽으세요
- [About the New Architecture](https://reactnative.dev/architecture/landing-page)
- [React Native 문서 한국어 번역 (비공식)](https://github.com/dev-seomoon/react-native-docs-ko) — 오래된 버전 기준이니 개념용으로만

## 4. Expo SDK 57

React Native 위의 프레임워크입니다. 개발은 **Expo Go**로 하고(개발용 빌드 없음),
네이티브 모듈은 Expo Go에 들어 있는 것만 씁니다. 새 네이티브 의존성을 넣으면
Expo Go로 못 여는 경우가 있으니 추가 전에 확인하세요.

알아둘 것: `npx expo start`, Expo Go와 개발용 빌드의 차이, `app.json` 설정,
`npx expo install`이 SDK에 맞는 버전을 골라준다는 점.

- [Expo 공식 튜토리얼](https://docs.expo.dev/tutorial/introduction/) — 탭 2개짜리 앱을 만들며 Router까지 다룹니다. 처음이라면 이것부터
- [Expo SDK 57 레퍼런스](https://docs.expo.dev/versions/v57.0.0/)
- [Expo Go vs 개발용 빌드](https://docs.expo.dev/develop/development-builds/introduction/)
- [React Native's New Architecture (Expo 가이드)](https://docs.expo.dev/guides/new-architecture/)

## 5. Expo Router

파일 경로가 곧 URL인 파일 기반 라우팅입니다. `src/app/`의 파일이 라우트이고
`(auth)`·`(tabs)` 같은 괄호 폴더는 URL에 포함되지 않는 그룹입니다.

이 프로젝트에서 특히 중요한 것:

- **`Stack.Protected`로 로그인 게이트**를 겁니다 (`src/app/_layout.tsx`).
- **탭 바는 headless API(`expo-router/ui`의 `TabList`/`TabTrigger`)** 로 직접 그립니다. 레이아웃 함정이 있으니 AGENTS.md "Routing"을 같이 읽으세요.
- **`router.back()`은 가드가 필요합니다** (규칙 4) — 딥링크로 열면 스택이 비어 있습니다.

- [Introduction to Expo Router](https://docs.expo.dev/router/introduction/) → "Router 101" 섹션 전체
- [Protected routes](https://docs.expo.dev/router/advanced/protected/)
- [Authentication in Expo Router](https://docs.expo.dev/router/advanced/authentication/)
- [Simplifying auth flows with protected routes (Expo 블로그)](https://expo.dev/blog/simplifying-auth-flows-with-protected-routes)
- [Custom tab layouts (`expo-router/ui`)](https://docs.expo.dev/router/advanced/custom-tabs/)

## 6. 백엔드 API 계약 — REST · OpenAPI · 에러 형식

프론트는 DB 대신 이것을 다룹니다. 서버는
`https://antiaging-dna.anzaanza.cloud`이고 명세는
[Swagger UI](https://antiaging-dna.anzaanza.cloud/swagger-ui/index.html)에서 볼 수
있습니다. 이 저장소의 정리본은 [backend-api.md](backend-api.md)입니다.

알아둘 것:

- **HTTP 메서드의 의미.** 특히 `PUT`은 **통째로 교체**합니다. 일지를 `PUT`하면서
  필드를 빼먹으면 서버에서 지워집니다 — 이 프로젝트의 실제 버그였습니다.
- **`GET`이 부작용을 가질 수도 있다는 것.** `GET /api/scores/{date}`는 조회만 해도
  행이 생깁니다(백로그 31). 명세만 믿지 말고 서버로 확인하는 습관이 필요합니다.
- **상태 코드**: 401/403(토큰 문제) vs 404(데이터 없음) vs 5xx(서버 문제)를
  구분해서 처리해야 합니다. 이걸 뭉뚱그린 것이 지금 열려 있는 버그의 원인입니다.
- **RFC 9457 Problem Details** — 에러 응답이 `application/problem+json`의
  `type`/`title`/`status`/`detail` 형식입니다. `lib/api.ts`의 `ApiError`가 이걸 파싱합니다.
- **날짜와 시간대.** `toISOString()`은 UTC라 한국 시간 오전 9시 전에는 어제
  날짜가 나옵니다. 가장 심각했던 버그 중 하나입니다 (`lib/dates.ts` 참고).

- [MDN — HTTP 요청 메서드](https://developer.mozilla.org/ko/docs/Web/HTTP/Methods) · [HTTP 상태 코드](https://developer.mozilla.org/ko/docs/Web/HTTP/Status)
- [MDN — Fetch API 사용하기](https://developer.mozilla.org/ko/docs/Web/API/Fetch_API/Using_Fetch)
- [OpenAPI Specification 소개](https://learn.openapis.org/)
- [RFC 9457 — Problem Details for HTTP APIs](https://www.rfc-editor.org/rfc/rfc9457)
- [Spring Framework — Error Responses (ProblemDetail)](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-ann-rest-exceptions.html) — 서버가 에러를 어떻게 만드는지 궁금할 때

## 7. 인증 — JWT와 안전한 저장소

로그인하면 서버가 JWT(access token)를 주고 앱은 그것을 `expo-secure-store`에
넣었다가 요청마다 `Authorization: Bearer <토큰>`으로 보냅니다. 앱을 다시 켜면
`GET /api/auth/me`로 토큰이 아직 유효한지 확인합니다. **refresh token은 없습니다.**

- [JWT 소개 (jwt.io)](https://www.jwt.io/introduction) — 구조(header.payload.signature)와 서명의 의미
- [RFC 7519 — JWT](https://datatracker.ietf.org/doc/html/rfc7519) — 필요할 때만
- [Expo SecureStore](https://docs.expo.dev/versions/v57.0.0/sdk/securestore/) — iOS Keychain / Android Keystore 기반. AsyncStorage에 토큰을 넣으면 안 되는 이유
- [Encrypted local storage in React Native (LogRocket)](https://blog.logrocket.com/encrypted-local-storage-in-react-native/)

## 8. NativeWind (Tailwind CSS)

`className="..."`으로 스타일을 줍니다. 다만 이 프로젝트에서는 **크기·간격은
`scale()`로 감싼 `style`** 로 주고, NativeWind는 주로 폰트 클래스
(`font-pretendard-*`)에 씁니다. 색은 `src/lib/design.ts`와 hex를 씁니다.

반드시 알아둘 함정: **렌더마다 `className`을 붙였다 뗐다 하면 서브트리가
리마운트됩니다** (규칙 3). 값만 바뀌는 건 `style`로 처리하세요.

- [NativeWind 설치 (Expo)](https://www.nativewind.dev/docs/getting-started/installation)
- [Tailwind CSS v3 문서](https://v3.tailwindcss.com/docs/utility-first) — 유틸리티 클래스 개념
- 설정(`tailwind.config.js`)을 바꾸면 `npx expo start --clear`로 재시작해야 합니다

## 9. Reanimated 4 · Worklets (모션)

홈의 오브·DNA가 숨 쉬듯 움직이는 것이 Reanimated입니다. 애니메이션 코드는
**UI 스레드에서 도는 worklet**이라, 일반 JS 함수(`scale()` 포함)를 안에서 부르면
앱이 죽습니다 (규칙 10). 이 프로젝트는 shared value에 `.value` 대신
`.get()`/`.set()`을 씁니다.

- [Reanimated — Getting started](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started/)
- [Worklets 가이드](https://docs.swmansion.com/react-native-reanimated/docs/guides/worklets/) — 꼭 읽으세요
- [Reanimated 3 → 4 마이그레이션](https://docs.swmansion.com/react-native-reanimated/docs/guides/migration-from-3.x/) — 검색해서 나오는 글 상당수가 3.x 기준이라, 차이를 알아두면 헷갈리지 않습니다

## 10. 그래픽 — SVG와 그라디언트

일지의 주간 컨디션 그래프는 `react-native-svg`로 직접 그립니다 (Catmull-Rom →
cubic bezier). 버튼·카드의 그라디언트는 `expo-linear-gradient`입니다.

- [react-native-svg 사용법](https://github.com/software-mansion/react-native-svg/blob/main/USAGE.md)
- [MDN — SVG `<path>`의 d 속성](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/d) — 곡선 명령(`C`)을 읽을 수 있을 정도면 충분
- [Expo LinearGradient](https://docs.expo.dev/versions/v57.0.0/sdk/linear-gradient/)

## 11. 테스트와 코드 품질

`npm test`(Jest), `npx expo lint`(ESLint), `npx tsc --noEmit` 세 가지가 항상
통과해야 합니다. 테스트는 화면이 아니라 `src/lib`의 **순수 로직**(날짜, 점수,
일지 변환)만 다룹니다 — 이 프로젝트의 가장 심각한 버그 두 개가 거기 있었습니다.

- [Unit testing with Jest (Expo)](https://docs.expo.dev/develop/unit-testing/)
- [Jest — Getting Started](https://jestjs.io/docs/getting-started) · [Expect 매처 목록](https://jestjs.io/docs/expect)
- [ESLint 설정 파일 (flat config)](https://eslint.org/docs/latest/use/configure/configuration-files) — `eslint.config.js`가 feature 간 import를 막는 규칙을 가지고 있습니다

## 12. 배포 — EAS

`release` 브랜치에 push하면 GitHub Actions가 돌고 **JS만 바뀌었으면 OTA 업데이트**,
**네이티브가 바뀌었으면 새 빌드**를 냅니다. 이 판단은 fingerprint가 합니다.
자세한 내용은 [deploy.md](deploy.md).

- [EAS Update 소개](https://docs.expo.dev/eas-update/introduction/)
- [Runtime versions and updates](https://docs.expo.dev/eas-update/runtime-versions/) — `fingerprint` 정책
- [continuous-deploy-fingerprint 액션](https://github.com/expo/expo-github-action/tree/main/continuous-deploy-fingerprint)
- [EAS Build 소개](https://docs.expo.dev/build/introduction/)

## 13. Figma → 코드

**Figma가 기준**입니다. 화면을 고치기 전에 항상 최신 노드를 다시 확인해야 합니다.
Figma의 220pt 프레임 폭을 기기 폭으로 환산하는 `scale()`을 이해하는 것이 첫걸음입니다.

알아둘 것: Figma의 Auto Layout과 절대 위치, 컴포넌트와 인스턴스, variants,
Dev Mode에서 수치 읽기. Claude Code로 작업한다면 Figma MCP 서버도 씁니다.

- [Figma — Guide to Dev Mode](https://help.figma.com/hc/en-us/articles/15023124644247-Guide-to-Dev-Mode)
- [Figma — Guide to auto layout](https://help.figma.com/hc/en-us/articles/360040451373-Guide-to-auto-layout)
- [Figma — Components, instances, variants](https://help.figma.com/hc/en-us/articles/360038662654-Guide-to-components-in-Figma)
- [Figma MCP 서버 가이드](https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Figma-MCP-server)
- 이 프로젝트의 노드 ID와 치수는 [figma-reference.md](figma-reference.md)

## 14. 개발 환경 — Android 에뮬레이터와 adb

UI 변경은 **에뮬레이터에서 직접 봐야 검증된 것**으로 칩니다. 딥링크로 화면을 열고
`adb`로 스크린샷을 찍는 흐름을 익혀두세요. 구체적인 명령은 AGENTS.md
"Verifying on the Android emulator"에 있습니다.

- [Expo — Android Studio 에뮬레이터 설정](https://docs.expo.dev/workflow/android-studio-emulator/)
- [Android Debug Bridge (adb)](https://developer.android.com/tools/adb)
- [Expo — Linking / 딥링크](https://docs.expo.dev/linking/overview/)

---

## 추천 학습 순서

처음 합류한다면 다음 순서로 보는 것을 추천합니다.

1. **TypeScript 기초 + React 공식 문서 "빠르게 시작하기"** — 1~2일
2. **Expo 공식 튜토리얼**을 직접 따라 만들기 — Expo · RN · Router를 한 번에 맛봅니다
3. **RN Flexbox 문서** — Figma를 옮기려면 필수
4. 이 저장소의 **README.md → AGENTS.md "Rules that were learned the hard way"** —
   위에서 배운 것이 이 프로젝트에서 실제로 어떻게 발목을 잡았는지가 적혀 있습니다
5. **HTTP 메서드·상태 코드 + JWT 소개** → `src/lib/api.ts`, `src/lib/auth.tsx` 읽기
6. 필요할 때: Reanimated(모션), react-native-svg(그래프), EAS(배포)
