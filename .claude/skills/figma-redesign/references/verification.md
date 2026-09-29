# 에뮬레이터 확인

AGENTS.md "Verifying on the Android emulator"가 기본 절차다. 여기는 개편 작업을 하며
새로 겪은 것과, 위치를 숫자로 비교하는 방법이다. 명령은 Git Bash 기준.

## 환경 — 먼저 확인할 것

- **adb 서버 포트.** 이 PC에서는 Android Studio가 띄운 adb가 **15037**에서 듣고
  5037은 비어 있다. `adb devices`가 `could not read ok from ADB Server`로 실패하면
  서버를 새로 띄우려 하지 말고 떠 있는 adb의 포트를 찾는다:
  `tasklist | grep -i adb` → `netstat -ano | grep <PID>`의 `LISTENING` 줄.
  그 뒤 명령마다 `export ANDROID_ADB_SERVER_PORT=15037`.
- **원래 폴더에서 Metro가 8081을 쓰고 있을 수 있다.** 개편 작업 폴더(worktree)는
  다른 포트로 띄운다: `npx expo start --port 8082` (백그라운드),
  `adb reverse tcp:8082 tcp:8082`, 딥링크는 `exp://127.0.0.1:8082/--/...`.
  띄우기 전에 `netstat -ano | grep ":8082 .*LISTEN"`으로 이미 떠 있는지 본다 —
  떠 있으면 그 Metro를 쓴다. 남의 Metro(8081)는 끄지 않는다.
- **`CI=1`을 붙이지 않는다.** CI 모드의 Metro는 파일 감시를 꺼서 **처음 읽은 코드만
  계속 내보낸다** — 고쳐도 기기에 반영되지 않고, Fast Refresh도 force-stop도 옛 화면을
  보여준다. 로그에 `Metro is running in CI mode, reloads are disabled`가 있으면 그
  Metro를 끄고 다시 띄운다. 끌 때는 자식 node 프로세스까지 (`taskkill //PID <pid> //T //F`).
- **`--clear`는 폰트·`tailwind.config.js`를 바꿨을 때 필수다** (그때만 붙인다). 캐시가 비면 첫 번들이
  25초쯤 걸린다. 로그에 `Android Bundled`가 찍힌 뒤에도 Expo Go 스플래시가 몇 초 더
  남으니, 스플래시를 찍었으면 기다렸다 다시 찍는다.
- **로그인 화면·회원가입은 로그인된 상태에서 딥링크로 열리지 않는다**
  (`Stack.Protected`). MY → 로그아웃으로 나간다. 원래 폴더의 세션도 같이 풀린다 —
  다시 들어갈 계정이 없으면 회원가입으로 새로 만든다(사용자가 허락함).
- 탭 이동은 딥링크(`--/my`)가 무시될 때가 있다. 하단 탭을 좌표로 누른다.
  스크린샷이 축소돼 보이면 좌표에 표시된 배율(1080 폭이면 ×1.2)을 곱한다.

## 위치 비교 (AGENTS 규칙 13)

1. Figma 프레임을 `download_assets`(`defaultFormat: png`, `defaultScale: 4`)로 받는다.
   그림자 때문에 880보다 넓게 오면 프레임 부분만 잘라낸다.
2. 에뮬레이터 스크린샷을 받는다(1080×2400).
3. 비교한다:

   ```bash
   python .claude/skills/figma-redesign/scripts/compare_bands.py figma.png device.png --bg f6f3fa
   ```

   두 이미지에서 잉크가 있는 가로 띠를 pt 단위로 찾아 짝지어 차이를 출력한다.
   기본으로 x 0~175pt만 본다(오른쪽 위 Expo 개발 메뉴 버튼을 피하려고).
   - 아이콘과 글자가 한 띠로 뭉쳐 원인이 섞이면 `--x-range 20 60`처럼 열을 좁혀
     따로 돌린다.
   - 흰 카드는 `#F6F3FA` 배경과 차이가 작아(60 미만) 띠로 안 잡힌다. 카드 가장자리를
     재려면 `--threshold 15`로 낮춘다.

**읽는 법.** 차이가 모두 비슷하면(로그인: 24.6~25.2, 합의값 약 24.8) 정상이다.
그 값은 38pt 목업과 기기 실제 상태바의 차이일 뿐이다. 합의값에서 1pt 넘게 벗어난
띠가 버그 후보다. 단 다음은 예외다:

- 입력창처럼 Figma와 **글자가 다른** 띠(값 "nosleep" vs 자리표시 문구)
- 비활성 버튼처럼 투명도가 낮아 잉크가 옅은 띠
- 화면 **아래에 붙인** 요소 — 기기 높이가 달라 합의값이 적용되지 않는다

## 공용 컴포넌트를 바꿨다면

그 컴포넌트를 쓰는 **다른 화면도 최소 하나** 열어 본다. 옛 화면에 새 모양이 섞이는
건 정상이지만, 높이가 달라져 글자가 잘리거나 버튼이 화면 밖으로 밀리면 고친다.
