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

## 설정 진행 상황

**파이프라인은 아직 한 번도 돌지 않았습니다.** 1~3은 끝났고, 남은 건 4·5입니다 —
둘 다 Apple 로그인을 거치는 대화형 명령이라 터미널에서 직접 실행해야 합니다.

1. ~~Expo 계정 연결~~ — **완료**. `@jiseong02/lifedna`
   (projectId `563d1ebe-8bca-4256-b0d1-8d2be077cdbd`), `updates.url` 설정됨.
   <details><summary>당시 사용한 명령</summary>
   ```bash
   npx eas-cli@latest login
   npx eas-cli@latest init             # app.json에 owner / extra.eas.projectId 를 써줍니다
   npx eas-cli@latest update:configure # updates.url 을 써줍니다
   ```
   패키지 이름은 `eas-cli`입니다 — `npx eas`로는 실행되지 않습니다
   (`could not determine executable to run`).
   </details>

2. ~~GitHub Secret 등록~~ — **완료**. Expo 토큰 `github-actions-lifedna`를
   발급해 저장소 Secret `EXPO_TOKEN`으로 등록했습니다.

3. ~~App Store Connect에 앱 레코드 생성~~ — **완료 (2026-08-17)**.
   Apple Developer 팀 `AD7L447NHY`에 App ID `cloud.anzaanza.lifedna`(설명
   `LifeDNA`)를 등록하고, App Store Connect에 `LifeDNA` 앱을 만들었습니다
   (기본 언어 한국어, SKU `lifedna-ios`, 앱 ID `6802059100`).
   `eas.json`의 `ascAppId`에 반영돼 있습니다.

4. **Apple 자격증명 연결**
   ```bash
   npx eas-cli@latest credentials   # 대화형으로 한 번 — EAS가 인증서를 관리하게 둡니다
   ```

5. **최초 네이티브 빌드는 수동으로 한 번**
   ```bash
   npx eas-cli@latest build --platform ios --profile production --auto-submit
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
