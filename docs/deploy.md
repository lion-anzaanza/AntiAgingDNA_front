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

## 설정 완료 — 파이프라인이 돌고 있습니다

2026-08-17에 처음부터 끝까지 검증했습니다.

| 항목 | 값 |
|---|---|
| EAS 프로젝트 | `@jiseong02/lifedna` (`563d1ebe-8bca-4256-b0d1-8d2be077cdbd`) |
| GitHub Secret | `EXPO_TOKEN` |
| Apple 팀 | `AD7L447NHY` |
| App ID | `cloud.anzaanza.lifedna` |
| App Store Connect 앱 | `LifeDNA` · `6802059100` · SKU `lifedna-ios` |
| 인증서 / 프로파일 / API Key | EAS 보관 (`eas credentials`로 생성) |

**수동 최초 빌드는 필요 없었습니다.** fingerprint에 맞는 빌드가 없으면 워크플로가
알아서 빌드를 시작합니다 — 첫 push가 그대로 첫 빌드가 됐습니다.

검증 결과:

- **1차 push** — `No existing iOS build found for fingerprint, starting a new build...`
  → 빌드 `7103a386` (build number 2) → TestFlight 제출 `finished`
- **2차 push** (빈 커밋, fingerprint 동일) —
  `Existing iOS build found with matching fingerprint` → **빌드 없이 업데이트만 발행**

빌드는 여전히 1개, 업데이트만 그 위에 쌓입니다.

## GitHub Releases

**네이티브 빌드가 나갈 때만** 릴리스가 만들어집니다 — 태그는
`v<앱버전>-<빌드번호>`(예: `v1.0.0-2`), 본문은 직전 릴리스 이후의 커밋 목록과
EAS 빌드 링크입니다.

OTA 업데이트는 릴리스를 만들지 않습니다. 하루에 여러 번 나가는 업데이트마다
릴리스를 찍으면 목록이 금세 쓸모없어지기 때문입니다.

빌드가 **성공했을 때만** 만듭니다. 워크플로가 EAS 빌드가 끝날 때까지 기다렸다가
(최대 30분) `FINISHED`인 경우에만 릴리스를 생성합니다 — 저장소가 public이라
Actions 분은 무료입니다. 실패한 빌드를 가리키는 릴리스는 "이게 나갔다"는
릴리스의 의미를 망칩니다.

`.ipa`는 첨부하지 않습니다. iOS는 서명·프로비저닝 때문에 파일만 받아서는 설치할
수 없어서(그래서 TestFlight를 씁니다) 용량만 차지합니다. 아카이브는 EAS에
남아 있고 링크로 닿습니다.

> 저장소의 기본 워크플로 토큰 권한이 `read`라, `deploy` 잡에만
> `permissions: contents: write`를 줬습니다. 이게 없으면 릴리스 생성이 403으로
> 실패합니다.

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
