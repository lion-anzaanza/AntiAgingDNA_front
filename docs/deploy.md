# 배포 — release 브랜치 → TestFlight

팀원이 진행 상황을 실기기에서 만져볼 수 있게 하는 파이프라인입니다.

`release` 브랜치에 push하면 `.github/workflows/release.yml`이 돌고, 두 갈래로
갈립니다.

| 무엇이 바뀌었나 | 어떻게 나가나 | 팀원이 받는 법 | 걸리는 시간 |
|---|---|---|---|
| JS·화면만 | EAS Update (OTA) | 앱 재시작 | 수십 초 |
| 네이티브 의존성·`app.json` | EAS Build → TestFlight | TestFlight에서 새 버전 설치 | 10~20분 |

그 판단은 **fingerprint**가 합니다 — 네이티브 입력을 해시해서 기존 빌드와
호환되면 JS만 밀어넣습니다. `app.json`의 `runtimeVersion.policy: "fingerprint"`가
그 전제고, Expo 공식 액션 `continuous-deploy-fingerprint`가 비교를 대신합니다.

## 아직 남은 설정

**이 파이프라인은 아직 한 번도 돌지 않았습니다.** 아래는 저장소 밖의 계정 작업이라
직접 하셔야 합니다.

1. **Expo 계정 연결**
   ```bash
   npx eas login
   npx eas init          # app.json에 owner / extra.eas.projectId 를 써줍니다
   npx eas update:configure   # updates.url 을 써줍니다
   ```
   `eas init`과 `update:configure`가 쓰는 값 없이는 OTA가 어디로 붙을지 모릅니다.

2. **GitHub Secret 등록** — Expo에서 액세스 토큰을 발급해
   저장소 Settings → Secrets → Actions에 **`EXPO_TOKEN`**으로 넣습니다.

3. **App Store Connect에 앱 레코드 생성** — 번들 ID `cloud.anzaanza.lifedna`.
   만들고 나면 앱의 숫자 ID(ascAppId)를 `eas.json`의
   `submit.production.ios.ascAppId`에 넣어야 합니다. 지금은
   `REPLACE_WITH_APP_STORE_CONNECT_APP_ID` 자리표시자입니다.

4. **Apple 자격증명 연결**
   ```bash
   npx eas credentials      # 대화형으로 한 번 — EAS가 인증서를 관리하게 둡니다
   ```

5. **최초 네이티브 빌드는 수동으로 한 번**
   ```bash
   npx eas build --platform ios --profile production --auto-submit
   ```
   `continuous-deploy-fingerprint`는 "비교할 기존 빌드"가 있어야 동작합니다.
   이 한 번이 기준선입니다.

6. **팀원을 내부 테스터로 초대** — App Store Connect → TestFlight.
   내부 테스터는 최대 100명이고 심사를 거치지 않습니다.

## 그다음부터

```bash
git switch -c release      # 최초 1회
git merge main
git push origin release
```

이후로는 `main`에서 작업하고, 공유할 시점에 `release`로 머지해 push하면 됩니다.

## 알아둘 것

- **모든 빌드가 운영 서버를 씁니다.** `API_BASE_URL`(`src/lib/api.ts`)이 운영
  URL로 고정돼 있고 스테이징 스위치가 없습니다. 팀원의 테스트 가입이 실제 DB에
  쌓입니다. 분리하려면 `EXPO_PUBLIC_API_URL`로 빼는 별도 작업이 필요합니다.
- **빌드 번호는 EAS가 서버에서 관리합니다** (`eas.json`의
  `appVersionSource: "remote"` + `autoIncrement`). CI가 저장소로 커밋을 되돌려
  쓰지 않으므로 push 루프가 생기지 않습니다.
- **CI 타입체크는 로컬보다 약합니다.** typedRoutes의 라우트 타입(`.expo/types`)은
  Metro만 생성하고 gitignore 대상이라 CI에는 없습니다. 존재하지 않는 `href`는
  로컬에서 `npx expo start`가 떠 있을 때만 잡힙니다. (확인함: 생성 타입이 없으면
  없는 라우트도 그냥 통과합니다.)
- **`scripts/reset-project.js`는 CI 근처에 두지 마세요** — 파괴적인 템플릿
  초기화 스크립트입니다.
- 앱 아이콘(`assets/images/icon.png`)은 Figma의 DNA 아트워크(`585:1382`)를
  35° 기울여 흰→연보라 배경에 합성한 **임시** 아이콘입니다. iOS는 알파를 허용하지
  않아 불투명 1024×1024로 만들었습니다. 디자이너 아이콘이 나오면 교체하세요.
