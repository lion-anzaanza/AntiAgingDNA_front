# v4 개편 — 인터페이스 인벤토리

`99_개선안_v4`(`1363:1533`)를 코드로 옮기기 위한 목록. 2026-09-30에 Figma를
읽기만 해서 만들었다 (Figma 파일은 고치지 않았다).

## 이 문서가 필요한 이유

v4에는 **컴포넌트 인스턴스가 하나도 없다.** 모든 버튼·입력창·카드가 낱개
도형이고, 레이어 이름(`ButtonNextUI`, `SelectButton3` 등)만 남아 있다. 그래서
Figma가 "이건 같은 컴포넌트"라고 알려주지 않는다 — 같은 요소가 프레임마다
조금씩 다르게 그려져 있어도 그대로 둔다.

그 판단을 여기서 한다. **어긋난 값은 다수결로 정하고 아래 "결정" 표에 남긴다.**
v4를 Figma에서 컴포넌트화하는 대신 이 방식을 고른 이유: 파일이 더 이상 편집되지
않아 컴포넌트화의 이득(마스터 하나로 전체 수정, Code Connect)이 없고, 필요한
숫자는 낱개 도형에서도 그대로 나온다.

## 기반 — 화면보다 먼저

| 항목 | v4 | 코드 | 상태 |
|---|---|---|---|
| 본문 폰트 | IBM Plex Sans KR Regular/SemiBold/Bold | `font-plex`, `font-plex-semibold`, `font-plex-bold` | ✅ |
| 기호 폰트 | Pretendard (← → ✓ > X 등만) | 기존 `font-pretendard-*` | 유지 |
| 색상 토큰 | 변수 컬렉션 `LifeDNA 색상` (텍스트 731개 중 692개 연결) | `COLOR` in `lib/design.ts` | ✅ |
| 간격·반경 토큰 | `LifeDNA 간격·반경` — **390 단위**라 220에서 그대로 못 씀 | 쓰지 않음, 노드 값을 읽는다 | — |
| 그림자 | `0 0 3.846px rgba(169,169,169,.25)` | `SHADOW_V4` | ✅ |
| 그라디언트 | CSS 각도 + stop으로 나옴 | `cssGradientPoints` in `lib/gradient.ts` | ✅ |
| 배경 | `surface/bg` `#F6F3FA` | 화면마다 | 화면 작업 때 |

## 공용 컴포넌트 — 레이어 이름으로 찾은 것

`n` = v4 전체 등장 횟수. "쓰는 곳"은 지금 코드에서 import하는 파일 수.

| v4 레이어 이름 | n | 등장 프레임 | 코드 컴포넌트 | 쓰는 곳 | 상태 |
|---|---|---|---|---|---|
| `ButtonNextUI` | 5 | 로그인, 회원가입/1·2·3, 일지/메인 | `Button` | 7 | ✅ 리뷰 1 |
| `TextInput` | 6 | 로그인, 회원가입/1 | `TextInputField` | 2 | ✅ 리뷰 1 |
| `ButtonBack` | 5 (+이름 없는 것 10) | 로그인·홈 빼고 15화면 전부 | `ButtonBack` | 12 | ✅ 리뷰 |
| (그라디언트 글자) | 0 | 없음 — 아래 "`GradientText`" 참고 | `GradientText` | 14 | 🔶 조사만 |
| `SelectButton1~5`, `_White` | 150+ | 회원가입/1·2, 일지/오늘의기록·상세보기 | `SelectButton` | 2 | ✅ 리뷰 |
| `SelectItem{3,4}[_Caption]_Card` | 각 2 | 일지/오늘의기록·상세보기 | `SelectCard` | 2 | ✅ 리뷰 |
| `SelectItem4_1` | 3 | 회원가입/2 | `PillGroup` | 1 | ✅ 리뷰 |
| `SelectItem6_Card` | 5 | 회원가입/2 | `LikertCard` | 1 | ✅ 리뷰 |
| `Select0To10` | 3 (+`_Card`·`_History` 각 1) | 회원가입/2, 일지/오늘의기록·상세보기 | `Slider0To10` | 2 | ✅ 리뷰 |
| `SelectFeel5` + `VeryBad`~`VeryGood` | 2 (+얼굴 20) | 일지/오늘의기록·상세보기 | `FeelSelect` | 3 | ✅ 리뷰 |
| `InputTime_Card` | 2 | 일지/오늘의기록·상세보기 | `InputTimeCard` | 2 | ✅ 리뷰 |
| `BottomBar2`, `BottomBar3` (+홈·MY는 이름 없음) | 7 | 탭 루트·일지·개선책 | `BottomBar` | 1 | |
| `LifeDNA_WeeklyInfo_*` | 18 | 홈 | `WeeklyInfoCard` | 1 | |
| `Diary_Status` | 5 | 일지/메인 | `DiaryStatus` | 1 | |
| `PhoneHeader` | 17 | 전부 | 옮기지 않음 (safe area) | — | — |

## 이름 없이 반복되는 것 — 스크린샷으로 찾은 것

스크립트는 레이어 이름으로만 모으므로 아래는 눈으로 찾았다. 새 공용 컴포넌트
후보이고, 두 화면 이상에서 같은 모양일 때만 만든다.

- **화면 헤더** — `ButtonBack` + 제목(+오른쪽 날짜·캡션). 거의 모든 하위 화면.
  지금은 회원가입만 `StepHeader`가 있고 나머지는 화면마다 직접 그린다.
- **흰 카드** — `surface/card`, 반경 9.6, `SHADOW_V4`. 모든 탭.
- **파스텔 그라디언트 카드** — 일지/오늘의기록 상단 배너, 홈 일지 CTA,
  개선책 티저, 한달뒤 히어로, 구독관리 연간 플랜.
- **아이콘 + 라벨 + 값 + `>` 행** — 마이페이지, 데이터개인정보 (코드에
  `features/my/components/menu-row`·`setting-row`가 이미 있다).
- **토글 스위치** — 데이터개인정보. 코드에 대응 컴포넌트가 있는지 화면 작업 때 확인.
- **섹션 제목** — "오늘의 컨디션", "수면습관" 등. 텍스트 스타일만 같다.

## 결정 — 어긋난 값을 이렇게 정했다

| 대상 | v4에서 본 것 | 결정 | 근거 |
|---|---|---|---|
| `ButtonNextUI` 반경 | 9.62 (로그인·회원가입/1·일지/메인) vs 7.90 (회원가입/2·3) | 9.62 | 3 대 2 |
| `TextInput` 높이 | 37.4 (로그인) vs 36.2 (회원가입/1) | 필드 27.1 공통, 라벨 간격만 차이 — 화면 작업 때 재확인 | |
| 필 `history` 상태 | v4 상세보기는 선택된 답을 **활성(분홍)과 같은 색**으로 그린다. `#7786A8` 회청색이 없다 | `history`는 활성 색 + 눌리지 않음 | 디자인이 상태 하나를 없앴다 |
| 필 모양 (선택 컴포넌트 작업) | 전 프레임에서 쉰 상태 `surface/chip` `#F3EFFA` + `text/body`, 선택 `brand/selected` `#FAE0F3` + `text/on-pastel`, Plex SemiBold 7.33. 그라디언트 없음. 레벨(1~5)·`_White`는 폭만 다르다 | `SelectButton`의 `level`·`tone`을 없애고 `size: 'journal' \| 'signup' \| 'likert'` 하나로. 폭은 부모가 정한다 | 150여 개 전부 같은 색 |
| 필 크기 | 일지 18.05·r4.81 (54개 전부), 회원가입/2 24.82·r5.64 (28개), 회원가입/2 WHO-5 14·r5.64·글자 8.46 (30개) | `size` 3개. 회원가입/1의 16.9·17.3 흰 필(`SelectItem3_2`·`5_2` = 성별·직업)은 코드에 없다 — 백로그 13으로 뺀 항목 | 맥락마다 일관 |
| 필 쉰 상태 그림자·테두리 | 회원가입/2의 `SelectButton3_White` 4개(담배)에 그림자 4px, `NoSelect`(운동량) 4개에 그림자+0.3 테두리. 나머지 회원가입 20개·일지 54개는 없음 | 없음 | 다수결 |
| 필 줄 간격 | 일지 카드 3·4·6개 모두 간격 4.51, 좌우 9.03, 균등 폭. 회원가입/2 그룹은 179.385 폭에 가로·세로 4.513 | 카드는 flex 균등, 그룹은 열 수로 폭 계산 + 줄을 직접 나눔(flexWrap 반올림으로 줄바꿈 방지) | 전부 같음 |
| `SelectItem3_1`(근무 형태) 위치 | 175.875 폭, x 12.54 — 다른 그룹은 179.385, x 9.03 | 179.385 | 한 번만 나오는 어긋남 |
| 선택 카드 폭 | 일지 카드·`SelectFeel5`·`Select0To10_Card`·`InputTime_Card` 전부 197.44 = 화면 열 폭 (예전엔 182 고정) | 고정 폭을 없애고 부모를 채운다. 지금 일지 화면 열이 184라 184로 그려진다 — 화면 작업에서 열을 197.44로 | 전부 같음 |
| 카드 제목 | Plex SemiBold 9.59 / 13.54, `text/heading`, x 8.71 (8.51~8.85) | `CARD_TITLE`·`CARD_SURFACE`(`select-card.tsx`)를 가족이 공유 | |
| `SelectItem6_Card`(WHO-5) 반경·그림자 | 5개 모두 r10, 그림자 4px — 다른 카드는 9.615 / 3.846으로 줄었는데 이것만 옛 값 | 그린 대로 (r10, `SHADOW`) | 5개 전부 같음 |
| `SelectFeel5` | auto layout: 패딩 5.77·6.73, 제목과 줄 간격 6.73, 얼굴 칸 균등 간격 5.77 × 높이 42.87, 얼굴 16.92 @6.77. 선택된 얼굴에만 그림자 | 그대로. 카드 frame은 77.06 고정이라 auto layout 합(76.6)보다 0.46 크다 — 합을 따른다 | |
| 만족도 얼굴 그림 | v4도 같은 스프라이트 한 장. 5개를 다시 잘라 기존 `feel-*.png`와 나란히 비교 — 같은 그림 | 기존 파일 유지 | 눈으로 대조 |
| `SelectFeel5_NeedAnswer` | v4에 없다 (이름·"응답하지" 문구 0개) | 동작은 유지(빨간 테두리·틴트·문구, 스크롤). 문구만 Plex Regular 6.77로 | 오늘의 기록 동작이 기대는 상태 |
| `Select0To10` 핸들·트랙 | 핸들 9.615 원, 흰 바탕 + 1.923 링 `brand/violet`(기록 보기는 `#7C85A5`), 그림자 없음. 채움 4.81 파스텔(CSS 176.37°), 나머지 2.885 `surface/track`, 둘 다 그림자 | 그대로. 파스텔은 `cssGradientPoints`에 실제 채움 폭을 넣는다 | |
| `Select0To10` 배지 | `_Card`는 배경 33.65 폭인데 글자 38.6이 넘친다. `_History`는 38.6 폭에 맞음. 글자색 카드 `brand/violet-text`, 기록 보기 `text/strong` | 글자에 맞춰 늘어나는 칩(좌우 1). 색은 그대로 | `_Card`의 넘침은 실수로 본다 |
| `InputTime_Card` 필드 라벨 | "취침"은 필드 왼쪽 −0.27, "기상"은 +2.82 | 둘 다 필드 왼쪽에 맞춘다 | 한 번만 나오는 어긋남 |
| `InputTime_Card` 배지 | 제목 중심보다 0.7 아래, 오른쪽 9.02 | 절대 위치로 재현 (규칙 14) | |
| 필·얼굴 라벨의 글꼴 배율 | 18.1 필과 29.9 얼굴 칸에 7.33 글자. 폰 `font_scale` 1.1에서 "매우나…", "오후 (~5…"로 잘렸다 (AGENTS 규칙 14) | `SelectButton`·`FeelSelect` 라벨에 `adjustsFontSizeToFit` + `minimumFontScale 0.85`. 1.0에서는 Figma 크기 그대로, 1.1에서는 잘리는 대신 줄어든다. 글꼴 배율을 끄는 전역 결정(AGENTS 결정 대기)은 건드리지 않는다 | 리뷰 지적 |
| 필 크기 | 회원가입 24.8 높이·반경 5.6, 일지 18.1 높이·반경 4.8, 회원가입/1은 흰 배경+그림자 | 맥락별 차이로 본다 (불일치 아님) | 화면마다 일관 |
| `ButtonBack` 크기 | `←` 글자로 전 프레임에서 15개를 모았다(이름 있는 것 5). 13.46×12.5 반경 2.885 ×9 (회원가입/1, 개선책 4, 마이 4) · 14×13 반경 5.64 ×2 (회원가입/2·3, 그림자 4.0 — 줄이기 전 값) · 일지 4화면은 높이·반경은 같고 폭만 13.84/13.97/15.79/16.79 | **13.46×12.5, 반경 2.885**, 흰색, `SHADOW_V4` | 폭 9/15, 높이·반경 13/15. 일지의 폭은 화면마다 달라 의도로 보기 어렵다 |
| `ButtonBack` 화살표 | 15개 모두 Pretendard SemiBold 7.333 / 줄 10.476, `text/body`, 가운데 정렬 (칩 중심보다 약 0.35pt 위 — 재현 안 함) | 그대로 | 전부 같음 |
| `ButtonBack` 위치 | x 11.28이 14/15 (회원가입/2만 11.84)이고 y는 화면마다 다르다 | 컴포넌트는 크기만 갖고 위치는 화면 작업에서 | 위치는 헤더(제목 줄)에 따라 다르다 |
| 그라디언트 글자 | v4 텍스트 731개 중 그라디언트 채움 0, 마스크 0. 예전에 `GradientText`였던 자리는 전부 단색 `brand/violet-text` `#7A55D8` | `GradientText`는 바꾸지도 지우지도 않는다. 각 화면 작업에서 호출부를 `COLOR.brand.violetText` 단색 `Text`로 바꾸고, 마지막 호출부가 사라지면 파일을 지운다 | 아래 표 |

### `GradientText` 호출부 — 화면 작업에서 바꿀 것

v4에는 그라디언트 글자가 없다. 아래는 지금 `GradientText`를 쓰는 자리와 v4에서 그
자리 글자의 모양이다 (굵기·크기는 화면 작업 때 `get_design_context`로 다시 확인).

| 코드 | 글자 | v4 |
|---|---|---|
| `home/home-screen` | 인사말의 닉네임 | `brand/violet-text` Bold 13.54 (앞뒤 "안녕하세요,"·"님!"은 `text/strong` Bold) |
| `journal/components/week-card` | "월간 보기 →", "오늘" | `brand/violet-text` SemiBold 7.33 |
| `journal/today-screen` | "항목별로 오늘의 기록을 채워주세요!" | `brand/violet-text` SemiBold 9.59 |
| `journal/calendar-screen` | "N월 기록 N일 · 평균 …" | `brand/violet-text` SemiBold 9.59 |
| `plan/main-screen` | "70%" | `brand/violet-text` Bold 11.28 |
| `plan/supplements-screen` | "‘올빼미 - 고민감 - 누적형’" | `brand/violet-text` SemiBold 7.33 |
| `plan/components/supplement-card` | 추천 이유 ("스트레스 누적형 · 수면 질 ↓" 등) | `brand/violet-text` SemiBold 7.33 |
| `plan/forecast-screen` | 강조된 제안 ("조금 더 열심히") | `brand/violet-text` SemiBold 7.33 |
| `my/subscription-screen` | "더 깊은 나" | `brand/violet-text` Bold 11.28 (v4는 "를"부터 `text/strong`) |
| `my/components/stat-strip` | "31일"·"13축"·"암호화" | `brand/violet-text` SemiBold 9.59 |
| `ui/daily-summary-card`, `ui/weekly-condition-chart` | 등급·점수, 그래프 요약 | v4 프레임에 이 카드가 없다 — 그 컴포넌트 작업 때 판단 |
| `auth/sign-up-intro-screen` | 워드마크 | v4에 프레임 없음. 로그인 워드마크(`brand/violet-text` Bold)를 따르는 게 자연스럽다 |

## 화면

상태: ✅ 끝남(리뷰까지) · 🔶 작업함, 리뷰 전 · 빈칸 = 안 함

| 탭 | 화면 | v4 노드 | 코드 (`src/features/…`) | 상태 |
|---|---|---|---|---|
| auth | 로그인/메인 | `1363:1535` | `auth/sign-in-screen.tsx` | ✅ 리뷰 1 |
| auth | 회원가입/1 | `1363:1558` | `auth/personal-info-screen.tsx` | |
| auth | 회원가입/2 | `1363:1629` | `auth/survey-screen.tsx` | |
| auth | 회원가입/3 | `1363:1921` | `auth/terms-screen.tsx` | |
| home | 홈/메인 | `1363:1953` | `home/home-screen.tsx` + `home/components/` | |
| journal | 일지/메인 | `1363:2135` | `journal/main-screen.tsx` | |
| journal | 오늘의기록(생성) | `1363:2209` | `journal/today-screen.tsx` | |
| journal | 캘린더 | `1363:2507` | `journal/calendar-screen.tsx` | |
| journal | 상세보기 | `1363:2642` | `journal/detail-screen.tsx` | |
| plan | 메인 | `1363:2935` | `plan/main-screen.tsx` | |
| plan | 맞춤영양제 | `1363:3003` | `plan/supplements-screen.tsx` | |
| plan | 주간리포트 | `1363:3061` | `plan/report-screen.tsx` | |
| plan | 한달뒤내모습 | `1363:3134` | `plan/forecast-screen.tsx` | |
| my | 마이페이지/메인 | `1363:3217` | `my/main-screen.tsx` + `my/components/profile-card`·`menu-row` | ✅ 리뷰 1 (뒤로가기 칩은 `ButtonBack` 작업 때) |
| my | 구독관리 | `1363:3269` | `my/subscription-screen.tsx` | |
| my | 웨어러블연동 | `1363:3340` | `my/wearable-screen.tsx` | |
| my | 데이터개인정보 | `1363:3364` | `my/privacy-screen.tsx` | |

회원가입 인트로(`sign-up-intro-screen.tsx`)는 v4에 프레임이 없다 — 폐기된 초안에서
온 화면이라 공용 컴포넌트가 바뀌는 만큼만 따라간다.

### 화면별 결정

| 대상 | v4에서 본 것 | 결정 | 근거 |
|---|---|---|---|
| 로그인 DNA | 가운데에서 +1.94pt | 가운데 정렬 | 한 번만 나오는 어긋남 |
| 로그인 마지막 줄 | 프레임 바닥에서 54pt | 하단 safe area를 빼고 화면 바닥 기준 | Figma 프레임 바닥 = 화면 물리 바닥 |
| 마이페이지 `무료` 위치 | v4도 이용약관 행 옆 | 구독 관리 행에 둔다 | 기존 결정 유지 (main-screen 주석) |
| 마이페이지 값 문구 | "애플워치  >", "무료  >"가 행 중앙보다 3.2pt 아래 | 그대로 재현 | 두 행 모두 같음 |
| 마이페이지 로그아웃 줄 | x 113.2 (중앙에서 3.2pt) | 가운데 정렬 | 한 번만 나오는 어긋남 |

## 결정 대기 — 사람이 정할 것

작업 중에 만난, 코드가 정할 수 없는 것. 정해지기 전까지는 **지금 코드의 동작을
유지**하고 여기 적는다.

| # | 무엇 | 지금 코드 | 선택지 |
|---|---|---|---|
| 1 | 탭 루트(일지/메인, 개선책/메인, 마이페이지/메인)에 v4가 뒤로가기를 그린다 | 기존대로 그린다 (가드 있음) | 유지 / 탭 루트에서 제거 |
| 2 | 본문색 `#00352C` 결정 대기 항목(AGENTS.md) — v4는 `text/body` `#6B6680`으로 답한 것으로 보인다 | 개편한 화면은 v4 색 | AGENTS 항목을 닫을지 |
| 3 | 비활성 `Button` — v4에 비활성 모양이 없다 | 호출부가 `opacity: 0.4`. 파스텔 위라 거의 구분되지 않는다 | 지금대로 / 디자인 요청 |
| 4 | `SelectFeel5_NeedAnswer`(미응답 빨간 상태)가 v4에 없다. 오늘의 기록이 저장 시 이 상태로 표시·스크롤한다 | 옛 빨간 스타일을 v4 카드에 얹어 유지 | 유지 / v4 톤의 미응답 디자인 요청 |
| 5 | v4 회원가입/2는 `평소 운동량`(`NoSelect`)에 캡션 두 줄(위 "중강도 기준…", 아래 "중강도 = 약간 숨이 차는 활동 (WHO 기준)")을 그린다. `PillGroup`은 위 캡션만 받는다 | 아래 줄은 화면이 그린다면 화면 작업에서 | 화면 작업에서 확인 |

## Figma를 그대로 따르면 안 되는 곳

- **회원가입/3 "[필수] 마케팅 정보 수신"** — 백로그 1에서 `[선택]`으로 정했다.
  v3가 옛 문구로 돌아갔다. 문구는 `[선택]` 유지.
- **개선책/메인·마이페이지 등 탭 루트에 뒤로가기** — 탭 루트는 돌아갈 곳이 없다.
  결정 대기 1.
- **회원가입/2의 민감도 3문항이 v4에서 `Select0To10` 슬라이더다** — 백로그 6에서 4단계
  필로 정했다(API가 4단계뿐). 코드는 `PillGroup` 4열을 유지. `Slider0To10`의 bare 모양은
  쓰는 곳이 없다.
- **회원가입/2의 각 질문은 흰 카드(`카드/…`, r9.03, 그림자 `0 1.128 4.513 rgba(0,0,0,.05)`)
  안에 있다** — 카드는 화면 몫이라 `PillGroup`에 넣지 않았다. 회원가입/2 화면 작업에서.
- **한달뒤내모습의 탭 바가 MY를 켠다** — 예전부터 있던 실수. 코드는 라우트로 정한다.
- **홈의 `IconHere`** (`#FF0000` 14.3×14.3) — 자리표시 아이콘으로 보인다. 화면 작업 때 확인.

## 순서

1. 기반 ✅
2. 공용 컴포넌트 — 위 표 위에서부터 (쓰는 곳이 많은 것 먼저)
3. 화면 — 탭 단위
