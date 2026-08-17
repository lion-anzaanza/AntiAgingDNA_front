---
name: figma-build-ui
description: lifeDNA 앱(React Native/Expo)에서 Figma 화면(들)을 실제 라우트/화면으로 종합 조립할 때 사용 — 여러 컴포넌트를 배치해 화면을 만들고, 라우팅을 연결하고, 에뮬레이터에서 검증하는 전체 흐름을 다룬다. 개별 컴포넌트 구현은 figma-implement-component 스킬, Figma 파일 자체의 컴포넌트화는 figma-componentize 스킬을 대신 쓸 것. get_design_context를 쓰기 전에 figma-design-to-code 스킬과 함께 로드.
---

# Figma → 화면 종합 구현 규칙 (lifeDNA)

이 스킬은 **화면 단위 조립**(라우팅, 여러 컴포넌트 배치, 화면 간 흐름, 실기기 검증)을 다룬다. 컴포넌트 하나를 코드로 옮기는 세부 규칙은 `figma-implement-component`를, Figma 파일 자체를 정리하는 작업은 `figma-componentize`를 참고한다.

## 프로젝트 컨텍스트

- Figma 파일: `lifeDNA` (fileKey `dltRYbBH0KHuBe86A6Vr2G`), 페이지 `0:1`
- 스택: React Native + Expo + Expo Router + TypeScript + NativeWind
- 화면 = `src/app/` 아래의 라우트 파일 (파일 기반 라우팅)

## Figma 파일 구조 → 코드 위치 매핑

| Figma 섹션 | 내용 | 코드 위치 |
|---|---|---|
| `00_디자인_시스템` (`457:658`) | 컬러 스타일 + 재사용 컴포넌트 원본 | `tailwind.config.js`(색상 토큰), `src/components/ui/`(컴포넌트) |
| `01_로그인` (`457:659`) | 로그인 | `src/app/(auth)/sign-in.tsx` |
| `02_회원가입` (`153:281`) | 회원가입 3스텝 | `src/app/(auth)/sign-up/` |
| `03_홈` (`153:282`) | 홈 | `src/app/(tabs)/home.tsx` |
| `04_일지` (`153:284`) | 일지 메인·오늘의 기록·캘린더·상세보기 | `src/app/(tabs)/journal/` |
| `05_사용자_맞춤_개선책` (`153:286`) | 개선책 메인·영양제·리포트·한달뒤 | `src/app/(tabs)/plan/` |
| `06_마이페이지` (`153:288`) | 마이페이지·웨어러블·개인정보·구독관리 | `src/app/(tabs)/my/` |

**섹션 번호는 이름의 일부다** — 한때 이 표가 한 칸씩 밀려 있었고(`02_홈`으로 적힌 것이 실제로는 `03_홈`), 마지막 줄은 존재하지도 않는 `05_한_달_뒤_모습`을 가리키고 있었다. 한 달 뒤 내 모습은 독립 섹션이 아니라 `05_사용자_맞춤_개선책` 안의 프레임(`523:490`)이다. 노드 ID가 맞더라도 이름이 어긋나면 다음 사람이 엉뚱한 섹션을 찾는다 — 표를 고칠 땐 `get_metadata`로 이름까지 확인한다.

실제 라우트 이름·경로는 화면 흐름(뒤로가기/탭 구조)을 `get_design_context`로 확인한 뒤 착수 시점에 확정한다. 위 매핑은 "어느 Figma 섹션이 어느 화면 묶음인지" 참고용이지 최종 라우트명을 강제하지 않는다.

**진행 상태 (2026-08-17 기준)**: **일곱 섹션 모두 코드 구현 완료.** 미포팅 화면은 없다. 남아 있는 것은 새로 그려지거나 바뀐 부분을 따라가는 일이고, 착수 전에 **반드시 Figma를 다시 당겨 대조한다** — 이미 여러 번 바뀌었다(`완료!` 알약 → 체크박스, 지난 기록 카오모지 텍스트 → `Diary_Status` 컴포넌트, 마이페이지의 미디자인 두 화면 완성).

현재 알려진 진행 중 항목:

- **나의 LifeDNA 정보 카드**(홈)가 탭 구조로 재설계됐고 **디자인이 미완성**이다 — 감정·사회·환경 탭에 아이콘이 없고, 한 프레임은 정신 칩이 빠져 있으며, 다른 프레임은 두 탭이 동시에 선택 상태다. 코드는 임시 아이콘으로 붙여둔 상태.
- `Logo` 컴포넌트(`730:1894`)가 새로 생겼다 — 앱 아이콘용.

바뀐 노드 ID와 재대조 결과는 `docs/figma-reference.md`의 "2026-08-17 재대조에서 바뀐 것" 표에 정리돼 있다. 서버를 붙이는 작업은 `backend-wire` 스킬을 쓴다.

## 라우팅 구조

루트 `_layout.tsx`는 `Stack`으로 `(tabs)`와 `(auth)` 두 그룹을 감싼다(`headerShown: false`, 각 그룹이 자기 헤더를 화면 안에서 직접 그림). 새 플로우를 추가할 때:

- 탭 없이 독립적으로 움직이는 화면 묶음(로그인, 회원가입 등)은 `src/app/(auth)/` 같은 새 그룹으로 추가
- 그룹 폴더명(`(auth)` 등)은 실제 URL 경로에 나타나지 않는다 — `src/app/(auth)/sign-in.tsx`는 `/sign-in`으로 접근
- 여러 스텝이 있는 플로우(회원가입 등)는 하위 폴더로 묶는다: `src/app/(auth)/sign-up/index.tsx`(인트로), `personal-info.tsx`, `survey.tsx`, `terms.tsx`

## 작업 절차 (화면/플로우 1개 기준)

1. `get_metadata`로 대상 Figma 섹션의 노드 구조를 훑고, 이미 `figma-componentize`로 정리되어 있는지 확인한다(안 되어 있으면 그 스킬로 먼저 처리).
2. `get_design_context`로 실제 스타일/레이아웃/텍스트를 가져온다.
3. 필요한 컴포넌트가 `src/components/ui/`에 있는지 확인 — 없으면 `figma-implement-component` 스킬로 먼저 만든다.
4. 화면 컴포넌트를 조립하고 라우트 파일에 배치한다. 화면 간 이동은 다음 컴포넌트로 연결한다(다음 스텝 버튼, 뒤로가기 등).
5. 아래 "실기기 검증"으로 실제로 띄워서 확인한다.
6. 새로 만든 라우트를 이 문서의 매핑 표에 반영한다.

## 실기기 검증 (Android 에뮬레이터)

UI 작업은 실제로 띄워서 확인하기 전엔 끝난 게 아니다. `run` 스킬을 우선 확인하되, 이 프로젝트에서 실제로 통한 절차는 다음과 같다.

1. 에뮬레이터 기동: `emulator -avd <AVD이름> -no-snapshot-load` 백그라운드 실행 → `adb wait-for-device shell 'while [[ -z $(getprop sys.boot_completed) ]]; do sleep 2; done'`으로 부팅 대기.
2. 번들러 기동: `npx expo start --android --port <포트>` 백그라운드 실행 (Expo Go로 자동 설치·실행됨).
3. **`adb reverse tcp:8081 tcp:8081`을 걸고 `127.0.0.1`로 접속한다.** LAN을 타면 번들이 전송 중에 깨져서 기기가 스플래시에 멈춰 있는데 Metro 로그에는 번들 성공이 찍힌다 — 코드 문제로 오인하기 딱 좋다. `logcat`에 `BundleDownloader.processMultipartResponse`의 `ProtocolException: Expected leading [0-9a-fA-F] character`가 보이면 이 경우다. 네트워크를 우회하는 게 답이지 앱을 디버깅할 일이 아니다.

   ```bash
   adb reverse tcp:8081 tcp:8081
   adb shell am start -a android.intent.action.VIEW \
     -d "exp://127.0.0.1:8081/--/journal" host.exp.exponent
   ```

   터널은 조용히 풀린다 — 화면이 안 뜨면 `adb reverse --list`부터 확인하고 다시 건다. 의존성을 추가한 직후에는 번들을 통째로 다시 만들기 때문에 첫 로드에 30초쯤 걸린다. **스크린샷 전에 창이 뜰 때까지 기다린다**: `until adb shell dumpsys window | grep -q ExperienceActivity; do sleep 3; done` — 안 그러면 스플래시를 찍어놓고 화면이 깨졌다고 읽는다.
4. **스크린샷은 `adb shell screencap` + `adb pull`로 뜬다.** Git Bash(MSYS)에서는 `/sdcard/...` 같은 POSIX 경로가 Windows 경로로 오작동 변환되니 원격 경로가 들어가는 명령에 `MSYS_NO_PATHCONV=1`을 붙인다. 로컬 목적지는 현재 디렉터리 상대경로(`./emulator-screen.png`)로 pull한 뒤 `Read` 툴로 연다.
5. **특정 화면으로 바로 이동해서 확인하려면 딥링크를 쓴다**: `adb shell am start -a android.intent.action.VIEW -d "exp://127.0.0.1:8081/--/<라우트경로>"` (그룹 폴더명은 URL에서 빠진다 — `(auth)/sign-in` → `/sign-in`).
6. **탭으로 상호작용을 검증할 땐 좌표 스케일을 주의한다.** 스크린샷 뷰어가 "displayed at WxH, multiply by N" 식으로 축소해서 보여주면, 그 이미지에서 읽은 좌표에 N을 곱해야 실제 기기 좌표가 된다(`adb shell input tap`은 실기기 해상도 기준).
7. **Fast Refresh는 이전 라우트를 유지한다.** 코드 수정 직후 딥링크로 다른 화면을 열어도, 겹쳐서 온 Fast Refresh가 이전 화면으로 되돌려 놓을 수 있다. 확실히 초기화하려면 `adb shell am force-stop host.exp.exponent` 후 딥링크를 다시 연다(콜드 스타트라 스플래시~로드까지 몇 초 더 걸림, 첫 딥링크가 무시되고 기본 라우트로 뜰 수 있으니 한 번 더 같은 딥링크를 보낸다).
8. 체크박스/필 선택 같은 상태 토글, 화면 간 이동(다음 버튼/링크/뒤로가기)까지 실제로 탭해서 확인한다. 렌더만 확인하고 끝내지 않는다.

## 체크리스트

- [ ] 이 화면에 필요한 컴포넌트가 전부 `figma-implement-component`로 구현되어 있는가
- [ ] 라우트 그룹 구조가 기존 `(tabs)`/`(auth)` 패턴과 일관되는가
- [ ] 화면 간 이동(다음/뒤로가기/링크)이 전부 연결되어 있는가
- [ ] 에뮬레이터에서 실제로 렌더 + 상호작용을 확인했는가
- [ ] 매핑 표와 진행 상태를 갱신했는가
