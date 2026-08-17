# Backend API

Reference for the API this app talks to. Like `figma-reference.md` this is a
**cache** — the server is the source of truth. Regenerate it from the spec:

```bash
curl -s https://antiaging-dna.anzaanza.cloud/v3/api-docs | python -m json.tool
```

Human-readable version: <https://antiaging-dna.anzaanza.cloud/swagger-ui/index.html>

- Base URL: `https://antiaging-dna.anzaanza.cloud`
- OpenAPI 3.1.0, `info.version` = `v0`
- Liveness: `GET /health` → `{"status":"ok"}` (verified reachable)
- **What the app actually calls** (2026-08-17): the five auth endpoints
  (`signup`, `login`, `GET`/`DELETE /api/auth/me`, the two `check-*`) and
  `PUT /api/diaries/{date}`. Everything else in the table below is unused —
  홈, 일지 조회 and 개선책 still draw Figma's numbers. `backend-backlog.md` has
  the per-screen breakdown, split into *what the API can do* and *what we have
  wired*; the second column is the one that lists our remaining work.

## Auth

`bearerAuth` (HTTP bearer, JWT) is declared under `components.securitySchemes`
but no operation declares a `security` requirement, so the spec alone does not
say which endpoints need a token. The backend answered it directly (item 3,
closed): **everything except `/health`, `/api/auth/signup`, `/api/auth/login`
and the two `check-*` endpoints requires `Authorization: Bearer <JWT>`.**

`TokenResponse` carries `accessToken`, `tokenType`, `expiresIn` and `user`.
There is no refresh token and no logout endpoint.

## Endpoints

| Method | Path | Request | Response |
|---|---|---|---|
| POST | `/api/auth/signup` | `SignUpRequest` | 201 `TokenResponse` |
| POST | `/api/auth/login` | `LoginRequest` | 200 `TokenResponse` |
| GET | `/api/auth/me` | — | 200 `UserResponse` |
| GET | `/api/diaries` | `?from=&to=` (date) | 200 `DiaryResponse[]` |
| GET | `/api/diaries/{date}` | — | 200 `DiaryResponse` |
| PUT | `/api/diaries/{date}` | `DiaryRequest` | 200 `DiaryResponse` |
| DELETE | `/api/diaries/{date}` | — | 204 |
| GET | `/api/scores` | `?from=&to=` (date) | 200 `DailyScoreResponse[]` |
| GET | `/api/scores/{date}` | — | 200 `DailyScoreResponse` |
| GET | `/api/scores/today` | — | 200 `DailyScoreResponse` |
| GET | `/api/dna` | — | 200 `DnaInfoResponse` |
| GET | `/health` | — | 200 `{ [k: string]: string }` |

Only success responses are documented — there is no schema for 4xx/5xx, and the
declared content type is `*/*` rather than `application/json`.

## Signup

`SignUpRequest` — all required: `loginId`, `email`, `password`, `nickname`,
`birthYear` (int ≥ 1900), `diagnosis` (`DiagnosisRequest`), `agreements`.

`agreements` is `{ [enum constant]: boolean }` with `minProperties: 1`; the four
keys are `TERMS_OF_SERVICE`, `PRIVACY_SENSITIVE`, `MARKETING`, `AGE_OVER_14`
(item 1, closed — they are in the spec's own `example` now).

`LoginRequest` — `loginId`, `password`, both `minLength: 1`.

**The identifier question is closed** (items 2 and 18): login is by 아이디, the
spec has caught up, and `email` stays required as a recovery route.

## Diary — `PUT /api/diaries/{date}`

Only `conditionLevel` (1–5) is required; every other field is optional, so a
partially filled 오늘의 기록 is a legal payload.

**`PUT` replaces the entry, it does not merge into it.** Verified 2026-08-17:
writing `{"conditionLevel": 2}` over a filled day nulls every field the second
request omitted. So a screen that saves a diary must first *load* that day —
`오늘의 기록` does (`GET` on mount, 404 = 기록 없는 날), and its 저장 stays
disabled until that read finishes. Anything else built on this endpoint has to
do the same or it will silently destroy the day's earlier answers.

`sleepStartedAt` / `sleepEndedAt` carry `pattern: "HH:mm(:ss)?"` and
`example: "23:30"` (item 5, closed). `DiaryResponse` adds `id`, `logDate`,
`sleepMinutes` (int64, server-derived), `createdAt`, `updatedAt`.

**The app never sends those two.** `InputTime_Card` has no picker in Figma or in
code, so 취침·기상 시각 is not collected and `sleepMinutes` comes back `null`
every time — backlog item 29.

### Enum ↔ 일지 UI

The pill order in `(tabs)/journal.tsx` matches these one-for-one unless noted.
`src/lib/diary-request.ts` is the code that performs this mapping; the two were
verified against each other and against the live server on 2026-08-17.

| Field | Enum | UI |
|---|---|---|
| `sleepLatency` | `WITHIN_5` `WITHIN_15` `WITHIN_30` `OVER_60` | 5분 이내 · 15분 이내 · 30분 이내 · 1시간 이상 |
| `mealCount` | int 0–5 | 0끼 … 5끼 + |
| `sugarIntake` | `NONE` `ONE_TO_TWO` `THREE_OR_MORE` | 0회 · 1~2회 · 3회 이상 |
| `caffeineCups` | `NONE` `ONE_TO_TWO` `THREE_TO_FOUR` `FIVE_OR_MORE` | 0잔 · 1~2잔 · 3~4잔 · 5잔 이상 |
| `caffeineLastTime` | `NONE` `MORNING` `AFTERNOON` `EVENING` | 안 마심 · 오전 · 오후 (~5시) · 저녁 (6시 이후) |
| `waterIntake` | `UNDER_2` `THREE_TO_FIVE` `SIX_TO_SEVEN` `EIGHT_OR_MORE` | 2잔 이하 · 3~5잔 · 6~7잔 · 8잔 이상 |
| `exercised` | boolean | 네 · 아니요 |
| `exerciseDuration` | `UNDER_15` `ABOUT_30` `ABOUT_60` `OVER_60` | 15분 이하 · 30분 · 1시간 · 1시간 이상 |
| `exerciseType` | `WALKING` `AEROBIC` `STRENGTH` `STRENGTH_AND_AEROBIC` | 걷기 · 유산소 · 근력 · 근력+유산소 (8, 닫힘) |
| `walkDuration` | `UNDER_30` `THIRTY_TO_60` `ONE_TO_TWO_HOURS` `OVER_2_HOURS` | 30분 이하 · 30분~1시간 · 1~2시간 · 2시간 이상 (9, 닫힘) |
| `sittingHours` | `UNDER_4` `FOUR_TO_EIGHT` `EIGHT_TO_TEN` `OVER_10` | 4시간 이하 · 4~8시간 · 8~10시간 · 10시간 이상 |
| `screenTime` | `UNDER_2` `TWO_TO_FOUR` `FOUR_TO_SIX` `OVER_6` | 2시간 이하 · 2~4시간 · 4~6시간 · 6시간 이상 |
| `moodRecovery` | `NONE` `BRIEF` `ENOUGH` | 안 함 · 잠깐 · 충분히 |
| `socialContact` | `RARELY` `BRIEF` `FREQUENT` | 거의 안 만남 · 잠깐 · 여러 번·길게 |
| `conditionLevel` | int 1–5 | FeelSelect 매우나쁨 → 매우좋음 |
| `sleepSatisfaction` | int 1–5 | FeelSelect 수면 만족도 |
| `stressLevel` | **int 1–10** | **Slider 0–10** ⚠ |

⚠ marks a real disagreement — see `backend-backlog.md`.

`stressLevel` is the one still open (item 7). The slider starts at 0, the server
rejects 0 with a 400, and there is no "unanswered" position — so
`diary-request.ts` treats 0 as unanswered and omits the field, which means
**a user cannot record a stress level of 0.** Confirmed against the server on
2026-08-17: `{"conditionLevel":2,"stressLevel":0}` → 400 입력값 오류.

## Diagnosis — inside `SignUpRequest`

`DiagnosisRequest` is the STEP 2 초기 진단. Everything is required except
`socialContactLevel` and `who5Q1`–`who5Q5`.

| Field | Enum | UI (`survey.tsx`) |
|---|---|---|
| `sleepType` | `MORNING` `EVENING` `NORMAL` `SENSITIVE` | 아침형 · 저녁형 · 일반형 · 예민형 |
| `sleepOnsetDelayed` | boolean | 잠드는데 30분 이상 걸려요 |
| `sleepUnrefreshed` | boolean | 잠을 자도 개운하지 않아요 |
| `sleepDaytimeDrowsy` | boolean | 낮에 졸림이 잦아요 |
| `sleepNightAwakening` | boolean | 자다가 자주 깨요 |
| — | — | 해당없음 → all four false |
| `sugarSensitivity` | `NONE` `SLIGHT` `MODERATE` `HIGH` | **0–10 슬라이더** ⚠ |
| `caffeineSensitivity` | 〃 | **0–10 슬라이더** ⚠ |
| `stressSensitivity` | 〃 | **0–10 슬라이더** ⚠ |
| `exerciseLevel` | `NONE` `UNDER_150` `FROM_150_TO_300` `OVER_300` | 거의 안 함 · 주 150분 미만 · 주 150~300분 · 300분 초과 |
| `shiftWorker` | boolean | 교대·야간근무 |
| `frequentTraveler` | boolean | 잦은 출장·시차 |
| `drinkFrequency` | `NEVER` `MONTHLY_OR_LESS` `TWO_TO_FOUR_PER_MONTH` `TWO_TO_THREE_PER_WEEK` `FOUR_OR_MORE_PER_WEEK` | 전혀 안 마심 · 월 1회 이하 · 월 2~4회 · 주 2~3회 · 주 4회 이상 |
| `smokingStatus` | `NEVER` `FORMER` `CURRENT_OCCASIONAL` `CURRENT_DAILY` | 비흡연 · 과거 흡연 · 현재 가끔 · 현재 매일 |
| `lifeRhythm` | `VERY_REGULAR` `MOSTLY_REGULAR` `SOMEWHAT_IRREGULAR` `VERY_IRREGULAR` | 매우 규칙적 · 대체로 규칙적 · 다소 불규칙 · 매우 불규칙 |
| `socialContactLevel` | `RARELY` `ONE_TO_TWO_PER_WEEK` `THREE_TO_FOUR_PER_WEEK` `ALMOST_DAILY` | 거의 안 함 · 주 1~2회 · 주 3~4회 · 거의 매일 |
| `who5Q1`–`Q5` | int 0–5 | 기분·활력 리커트 5문항 |

Everything the diagnosis screen collects has a home **except the three
sensitivity sliders**, which the API models as four levels.

## Scores

`DailyScoreResponse` — `date`, `areas`, `dailyTotal`, `displayTotal`, `grade`,
`scoringVersion`.

`AreaScoreResponse` — `physical` `mental` `emotion` `social` `environment` plus
`grades` (the same five keys, `"GOOD"|"WARN"|"DANGER"|null`). This is the
5개 영역 밸런스 row on 홈 (신체 · 정신 · 감정 · 사회 · 환경).

**Do not call `GET /api/scores/{date}` or `/today`.** Reading a single date
**creates** that date's score row on the server, permanently and irreversibly
(`DELETE` → 405) — verified 2026-08-17, backlog 31. The ranged form creates
nothing, so every screen uses `?from&to`, narrowing to a one-day window when it
needs a single day.

Three behaviours the screens have to account for (all verified 2026-08-17):

- **A day with no diary still scores.** `dailyTotal` is `null` but `displayTotal`
  and `grade` are filled from the signup diagnosis baseline
  (`scoringVersion: "v1.0-coldstart"`), so `grade` reads `GOOD` on a day the
  user never touched. **`dailyTotal === null` is the only reliable "no entry"
  test**; per-day grades are derived from `dailyTotal` against 22's 70/40
  boundaries rather than read off `grade` (backlog 32).
- **The ranged response is not one row per day.** It carries only days that have
  a row — real entries plus any day previously materialised by the bug above.
  Absence means "no data", but presence does not mean "has a diary".
- **`emotion` and `environment` are `null` even on a fully filled day**, so the
  5개 영역 row can only ever draw 3 of 5 (backlog 33). `baseline` on `/api/dna`
  has the opposite hole — `emotion` is present, `social` is not.

The orb card's 100점 is `displayTotal`; 어제보다 +4 comes from a two-day ranged
query.

## DNA info

`GET /api/dna` → `DnaInfoResponse` — the diagnosis snapshot plus derived values.
Top-level keys, confirmed against the live response 2026-08-17:

```
completedAt  sleepType  sleepIssues  sensitivity  exerciseLevel  workStyle
drinkFrequency  smokingStatus  lifeRhythm  socialContactLevel  who5
baseline  sensitivityCoefficients
```

`sleepIssues`, `sensitivity` and `workStyle` are **nested objects**, not the flat
fields the enum table above lists — that table describes `SignUpRequest`'s shape,
which is not the same as the response's. `baseline` is an `AreaScoreResponse` and
`sensitivityCoefficients` is `sugar` / `caffeine` / `stress` doubles.

Note this is the *profile*, not weekly trend data. The 나의 LifeDNA 정보 cards on
홈 — 수면 시간 / 수분 섭취량 with a week of score bars, a progress bar and a
좋음/주의/위험 label — have no endpoint behind them.

## What the design needs and the API does not have

Recorded properly in `backend-backlog.md`; listed here so the gap is visible
from the reference itself.

- 홈 stat cards (수면 6.4시간 · 수분 1.6L · 스트레스 72%) — no aggregate endpoint,
  and the diary stores buckets rather than volumes
- 나의 LifeDNA 정보 weekly cards — no trend endpoint
- 날씨 자동 기록 on 일지 — no field, no endpoint
- 05_개선책 and 06_마이페이지 — nothing at all
- Token refresh, logout, 아이디·비밀번호 찾기, duplicate-identifier check
- Gender and occupation, which 회원가입 STEP 1 collects
- An 아이디 field on both signup and login (see above)
