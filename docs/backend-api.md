# Backend API

Reference for the API this app talks to. Like `figma-reference.md` this is a
**cache** — the server is the source of truth. Regenerate it from the spec:

```bash
curl -s https://antiaging-dna.anzaanza.cloud/v3/api-docs | python -m json.tool
```

Human-readable version: <https://antiaging-dna.anzaanza.cloud/swagger-ui/index.html>

- Base URL: `https://antiaging-dna.anzaanza.cloud`
- OpenAPI 3.1.0, `info.version` = `v0`, title `AntiAgingDNA API`
- Liveness: `GET /health` → `{"status":"ok"}`
- Last checked against the live spec: **2026-09-30**

This file holds what the API *is*. What we still need from the backend is
[backend-backlog.md](backend-backlog.md); what the screens have and have not
wired is [frontend-status.md](frontend-status.md). The `(backlog N)` tags below
point at the backlog's decision list, where each settled question keeps its
number.

## Auth

Every operation that needs a token declares `security: bearerAuth` in the spec,
so `/v3/api-docs` answers it per operation. Open without a token: `/health`,
`POST /api/auth/signup`, `POST /api/auth/login`, the two `check-*` endpoints and
the docs themselves. Everything else needs `Authorization: Bearer <JWT>`
(backlog 3).

`TokenResponse` carries `accessToken`, `tokenType`, `expiresIn` (seconds; 86400
observed) and `user`. Signup answers **201 with a token**, so a new account is
signed in immediately — no email verification step (backlog 21).

- **No refresh token, by design.** An expired token means signing in again.
- **No logout endpoint.** The JWT is stateless; deleting it on the device is the
  logout (backlog 14).
- `DELETE /api/auth/me` (204) deletes the account, agreements, diagnosis,
  diaries and scores — a hard delete, irreversible (backlog 24).

## Errors

RFC 9457 `application/problem+json` everywhere: `type`, `title`, `status`,
`detail`, `instance`, plus `errors: { field: message }` on a validation failure.
`title` is already Korean and specific, which is why `messageFor` in
`lib/api.ts` shows it as is (backlog 4).

| Case | Status |
|---|---|
| Login failed (no such id / wrong password — deliberately not distinguished) | 401 |
| 아이디 already taken (`title: "아이디 중복"`) | 409 |
| 이메일 already taken (`title: "이메일 중복"`) | 409 |
| Field validation failed (`errors` present) | 400 |
| Signup condition not met (under 14, future year) | 400 |
| No diary / no diagnosis for that key | 404 |

The spec itself documents only success responses, and declares their content
type as `*/*` rather than `application/json`.

## Endpoints

| Method | Path | Request | Response | App uses |
|---|---|---|---|---|
| POST | `/api/auth/signup` | `SignUpRequest` | 201 `TokenResponse` | ✅ |
| POST | `/api/auth/login` | `LoginRequest` | 200 `TokenResponse` | ✅ |
| GET | `/api/auth/me` | — | 200 `UserResponse` | ✅ |
| DELETE | `/api/auth/me` | — | 204 | ✅ |
| GET | `/api/auth/check-login-id` | `?loginId=` | 200 `{available}` | ✅ |
| GET | `/api/auth/check-email` | `?email=` | 200 `{available}` | ✅ |
| GET | `/api/diaries` | `?from=&to=` | 200 `DiaryResponse[]` | ✅ |
| GET | `/api/diaries/{date}` | — | 200 `DiaryResponse` / 404 | ✅ |
| PUT | `/api/diaries/{date}` | `DiaryRequest` | 200 `DiaryResponse` | ✅ |
| DELETE | `/api/diaries/{date}` | — | 204 | — |
| GET | `/api/scores` | `?from=&to=` | 200 `DailyScoreResponse[]` | ✅ |
| GET | `/api/scores/items` | `?from=&to=` (≤366 days) | 200 `ItemTrendResponse[]` | ✅ 홈 (지표 뱃지 · 신체 탭) |
| GET | `/api/scores/{date}` | — | 200 `DailyScoreResponse` | — safe since the fix (see Scores) |
| GET | `/api/scores/today` | — | 200 `DailyScoreResponse` | — |
| GET | `/api/dna` | — | 200 `DnaInfoResponse` | ✅ 홈 나선 · MY 유형 라벨 |
| GET | `/health` | — | 200 | — |

**Ranged lists do not fill empty days** — `/api/diaries`, `/api/scores` and
`/api/scores/items` return only the dates that have a row. A day missing from
the array is a day with no data; compare against the requested range to find
the gaps (backlog 23). The reverse does not hold: **a date that is present may
still have no diary.** A score row can exist without one (rows written by the
single-date read, backlog 31, and — even after its fix — today's row), so count
recorded days with `dailyTotal != null`, never with the array length.

## Signup

`SignUpRequest` — all required: `loginId`, `email`, `password`, `nickname`,
`birthYear`, `diagnosis` (`DiagnosisRequest`), `agreements`.

| Field | Rule in the spec |
|---|---|
| `loginId` | 4–32, `^[A-Za-z0-9_]+$`, case-sensitive, unique (409) — backlog 2 |
| `password` | 8–72, `^(?=.*[A-Za-z])(?=.*\d).+$` (a letter and a digit) |
| `nickname` | 2–16, `^[가-힣A-Za-z0-9]+$`, **duplicates allowed** — backlog 19 |
| `email` | `format: email`, ≤255, unique (409); kept as a recovery route |
| `birthYear` | ≥1900; the upper bound is dynamic (signup year − 14) — backlog 20 |

Login is by `loginId`, not email (backlog 2, 18). `LoginRequest` is `loginId` +
`password`.

`agreements` is `{ [enum constant]: boolean }`, `minProperties: 1`, with the
four keys `TERMS_OF_SERVICE`, `PRIVACY_SENSITIVE`, `MARKETING`, `AGE_OVER_14`.
Send booleans only — the server stamps `agreedAt` itself. `MARKETING` is not
required. `AGE_OVER_14` and `birthYear` are both checked, as a double check
(backlog 1, 20).

The backend collects **no gender, occupation or full birth date** and has no
plans to (backlog 13).

## Diary — `PUT /api/diaries/{date}`

Only `conditionLevel` (1–5) is required; every other field is optional and
`null` means unanswered, so a partially filled 오늘의 기록 is a legal payload.
Omit a field the user did not answer rather than sending a default.

**`PUT` replaces the entry, it does not merge into it.** Verified 2026-08-17:
writing `{"conditionLevel": 2}` over a filled day nulls every field the second
request omitted. So a screen that saves a diary must first *load* that day —
`오늘의 기록` does (`GET` on mount, 404 = 기록 없는 날), and its 저장 stays
disabled until that read finishes. Anything else built on this endpoint has to
do the same or it will silently destroy the day's earlier answers.

`sleepStartedAt` / `sleepEndedAt` are `"HH:mm"` or `"HH:mm:ss"` with no date. A
wake time at or before the bedtime is read as crossing midnight; there is no
flag. `sleepMinutes` in the response is derived from the two (backlog 5).
**The app never sends them** — there is no time picker — so `sleepMinutes` is
always `null` (frontend-status, 29).

### Weather

`DiaryRequest` takes `lat` (−90..90), `lon` (−180..180) and
`weatherLocationLabel` (≤64 chars, the text to display, e.g. `"서울"` — the
server never names a place from coordinates). With both coordinates present the
server looks the weather up **once, at save time**, and stores it; later reads
return that stored value. A missing coordinate or a failed lookup does not block
the save — the weather fields just come back `null`, **permanently**: a failed
lookup is not retried, so that day stays without weather.

`DiaryResponse` adds `weatherTemperature` (double), `weatherHumidity` (%, int),
`weatherLocationLabel` and `weatherCondition`, one of `CLEAR` `MOSTLY_CLOUDY`
`OVERCAST` `RAIN` `RAIN_SNOW` `SNOW` `SHOWER` `DRIZZLE` `DRIZZLE_SNOW_FLURRY`
`SNOW_FLURRY`. The icon and wording for each are ours to choose.

The app sends no coordinates yet (frontend-status, 12).

### Enum ↔ 일지 UI

`src/lib/diary-request.ts` performs this mapping; the two were verified against
each other and against the live server on 2026-08-17.

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
| `exerciseType` | `WALKING` `AEROBIC` `STRENGTH` `STRENGTH_AND_AEROBIC` | 걷기 · 유산소 · 근력 · 근력+유산소 (backlog 8) |
| `walkDuration` | `UNDER_30` `THIRTY_TO_60` `ONE_TO_TWO_HOURS` `OVER_2_HOURS` | 30분 이하 · 30분~1시간 · 1~2시간 · 2시간 이상 (backlog 9) |
| `sittingHours` | `UNDER_4` `FOUR_TO_EIGHT` `EIGHT_TO_TEN` `OVER_10` | 4시간 이하 · 4~8시간 · 8~10시간 · 10시간 이상 |
| `screenTime` | `UNDER_2` `TWO_TO_FOUR` `FOUR_TO_SIX` `OVER_6` | 2시간 이하 · 2~4시간 · 4~6시간 · 6시간 이상 |
| `moodRecovery` | `NONE` `BRIEF` `ENOUGH` | 안 함 · 잠깐 · 충분히 |
| `socialContact` | `RARELY` `BRIEF` `FREQUENT` | 거의 안 만남 · 잠깐 · 여러 번·길게 |
| `conditionLevel` | int 1–5 | FeelSelect 매우나쁨 → 매우좋음 |
| `sleepSatisfaction` | int 1–5 | FeelSelect 수면 만족도 |
| `stressLevel` | int **0–10** | Slider 0–10 |

`stressLevel` accepts 0 since 2026-08-17 (backlog 7), and its score is
`100 × (10 − x) / 10`. 0 is a real answer and is sent; a slider the user never
touched is omitted, because the control rests at 0.

The 수분 figure on screen is the bucket's own wording (`3~5잔`), never litres or
cups — the backend has no cup-to-mL factor and will not invent one (backlog 26).
The 스트레스 `%` is the raw level scaled up — high means *more* stress — and is
deliberately the opposite direction from the score formula above (backlog 26).

## Diagnosis — inside `SignUpRequest`

`DiagnosisRequest` is the STEP 2 초기 진단. Everything is required except
`socialContactLevel` and `who5Q1`–`who5Q5`.

| Field | Enum | UI (`survey-screen.tsx`) |
|---|---|---|
| `sleepType` | `MORNING` `EVENING` `NORMAL` `SENSITIVE` | 아침형 · 저녁형 · 일반형 · 예민형 |
| `sleepOnsetDelayed` | boolean | 잠드는데 30분 이상 걸려요 |
| `sleepUnrefreshed` | boolean | 잠을 자도 개운하지 않아요 |
| `sleepDaytimeDrowsy` | boolean | 낮에 졸림이 잦아요 |
| `sleepNightAwakening` | boolean | 자다가 자주 깨요 |
| — | — | 해당없음 → all four false |
| `sugarSensitivity` | `NONE` `SLIGHT` `MODERATE` `HIGH` | 전혀 아님 · 약간 · 보통 · 매우 (backlog 6) |
| `caffeineSensitivity` | 〃 | 〃 |
| `stressSensitivity` | 〃 | 〃 |
| `exerciseLevel` | `NONE` `UNDER_150` `FROM_150_TO_300` `OVER_300` | 거의 안 함 · 주 150분 미만 · 주 150~300분 · 300분 초과 |
| `shiftWorker` | boolean | 교대·야간근무 |
| `frequentTraveler` | boolean | 잦은 출장·시차 |
| `drinkFrequency` | `NEVER` `MONTHLY_OR_LESS` `TWO_TO_FOUR_PER_MONTH` `TWO_TO_THREE_PER_WEEK` `FOUR_OR_MORE_PER_WEEK` | 전혀 안 마심 · 월 1회 이하 · 월 2~4회 · 주 2~3회 · 주 4회 이상 |
| `smokingStatus` | `NEVER` `FORMER` `CURRENT_OCCASIONAL` `CURRENT_DAILY` | 비흡연 · 과거 흡연 · 현재 가끔 · 현재 매일 |
| `lifeRhythm` | `VERY_REGULAR` `MOSTLY_REGULAR` `SOMEWHAT_IRREGULAR` `VERY_IRREGULAR` | 매우 규칙적 · 대체로 규칙적 · 다소 불규칙 · 매우 불규칙 |
| `socialContactLevel` | `RARELY` `ONE_TO_TWO_PER_WEEK` `THREE_TO_FOUR_PER_WEEK` `ALMOST_DAILY` | 거의 안 함 · 주 1~2회 · 주 3~4회 · 거의 매일 |
| `who5Q1`–`Q5` | int 0–5 | 기분·활력 리커트 5문항 |

## Scores

`DailyScoreResponse` — `date`, `areas`, `dailyTotal`, `displayTotal`, `grade`,
`dailyGrade`, `orbState`, `scoringVersion`.

| Field | Meaning |
|---|---|
| `dailyTotal` | That day's own score. **`null` = no diary that day** — the only reliable "no entry" test |
| `displayTotal` | Smoothed, and includes the signup baseline. Filled even on a day with no diary (`scoringVersion: "v1.0-coldstart"` before any entry) |
| `grade` | Grade of `displayTotal` — "the user's current level", not the day |
| `dailyGrade` | Grade of `dailyTotal`; `null` with no diary. Added for backlog 32 |
| `orbState` | 7 bands of `displayTotal` — see below. Added for backlog 25 |

**Grades are three bands on 70/40** — 70 and up `GOOD`, 40–69 `WARN`, below 40
`DANGER` — shared by the total, the five areas and the item scores (backlog 22).
Pick the field by what the surface shows: 홈's orb shows the current level
(`displayTotal` / `grade` / `orbState`), while the calendar and 지난 기록 show
the day (`dailyTotal` / `dailyGrade`). Using `grade` for a day's colour paints
the worst day `GOOD` — observed 2026-08-17, `dailyTotal 16.32` with `grade GOOD`.
The app currently applies 70/40 to `dailyTotal` itself, which gives exactly
`dailyGrade` (confirmed on the `demo` account 2026-09-30).

`orbState` splits each grade into hard bands, so it can never disagree with
`grade`: `DANGER_LOW` 0–19 · `DANGER_HIGH` 20–39 · `WARN_LOW` 40–54 ·
`WARN_HIGH` 55–69 · `GOOD_LOW` 70–79 · `GOOD_MID` 80–89 · `GOOD_HIGH` 90–100.
The colour for each is ours to choose.

`AreaScoreResponse` — `physical` `mental` `emotion` `social` `environment` plus
`grades` (the same five keys). An area with no score has a `null` grade. 홈's
5개 영역 밸런스 tabs run in UI order, not the response's key order: 신체 · 정신 ·
환경 · 감정 · 사회.

- `emotion` comes from that day's `stressLevel` alone, so it is `null` on a day
  without one (backlog 33).
- **`environment` is always `null`** — it has no input yet (backend's A-1), and
  the weather is not scored.
- `/api/dna`'s `baseline` is computed from the onboarding answers instead, so its
  holes differ from a day's: `emotion` present, `social` and `environment` null.

**A single-date read no longer writes a row** — verified 2026-10-02 (backlog
31): `GET /api/scores/2024-06-14` on `demo` returned 200 and the range
`2024-06-10..20` stayed empty. Rows are stored only for days with a diary and for
today; other dates are computed and returned. Before the fix (verified
2026-08-17) every single-date read created a permanent row (`DELETE` → 405),
which is why every screen still uses `?from&to`, narrowing to a one-day window
when it needs a single day — keep it that way; it is one code path and
`score.test.ts` pins it.

Two derived values are computed on the device, with the backend's agreement
(backlog 28): 어제보다 from a two-day range (no yesterday row → no delta), and
the calendar's 기록 N일 · 평균 · 최고 from the month's range.

### Item trend — `GET /api/scores/items`

One row per recorded day: `sleepMinutes`, `sleepScore` (0–100), `sleepGrade`,
`waterIntake` (enum), `waterScore` (0–100), `waterGrade`, and since 2026-10-02
(backlog 10) `stressLevel`, `stressScore`, `stressGrade`. Grades on 70/40.
`stressScore` points the wellbeing way — `100 × (10 − stressLevel) / 10`, so high
stress is a low score and `stressGrade` `DANGER` (verified on `demo`: level 7 →
30 → `DANGER`, 3 → 70 → `GOOD`). The 홈 stat card's `%` points the other way
(backlog 26), so map the badge from the grade, not from the `%`.
Built for the 나의 LifeDNA 정보 수면 / 수분 cards. The v4 redesign
(2026-09-30) brought 신체 back to exactly those two cards, so it can now be wired;
nothing calls it yet (frontend-status, 11). The sleep fields are `null` for every day entered through the app, for the reason above; the `demo` seed carries bedtimes, so it shows `sleepMinutes` where real users will not.

**No sentences, anywhere.** Every sentence the design shows — card comments,
summaries, the orb's status chip — is the front end's to compose from these
values. The backend decided that (its B-5) and will add values on request, but
not wording (backlog 27).

## User

`UserResponse` — `id`, `loginId`, `email`, `nickname`, `birthYear`,
`streakDays`. Also inside `TokenResponse.user`.

`streakDays` counts consecutive days with a diary back from today. **Today not
yet written does not break it** — with five days up to yesterday and nothing
today it reads 5, and 6 once today is written (backlog 28).

## DNA info

`GET /api/dna` → `DnaInfoResponse` — the diagnosis snapshot plus derived values:

```
completedAt  sleepType  sleepIssues  sensitivity  exerciseLevel  workStyle
drinkFrequency  smokingStatus  lifeRhythm  socialContactLevel  who5
baseline  sensitivityCoefficients
```

`sleepIssues`, `sensitivity` and `workStyle` are **nested objects**, not the flat
fields `SignUpRequest` uses. `baseline` is an `AreaScoreResponse` and
`sensitivityCoefficients` is `sugar` / `caffeine` / `stress` doubles. There is
no combined type label (the MY tab's `올빼미 - 고민감 - 누적형`) — how to build
one is an open planning question (frontend-status, 24).

## Test account

`demo` / `Demo1234` on the production server, seeded with 14 days of diaries —
2026-08-05 to 08-18, as a ranged read returned them on 2026-09-30. There is no staging environment — `main` on the backend
deploys straight to production (backlog 17).
