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
- **Nothing in the app calls it yet.** There is no client, no auth storage and no
  form state; every screen is still static. See `backend-backlog.md` for what is
  blocking and what has to be asked before wiring begins.

## Auth

`bearerAuth` (HTTP bearer, JWT) is declared under `components.securitySchemes`,
but **no operation declares a `security` requirement**, so which endpoints
actually need a token is unverified. The obvious reading — everything under
`/api/**` except `/api/auth/signup` and `/api/auth/login` — is an assumption.

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

`SignUpRequest` — all required: `email`, `password`, `nickname`,
`birthYear` (int ≥ 1900), `diagnosis` (`DiagnosisRequest`), `agreements`.

`agreements` is typed only as `object`, with no properties. Its shape is unknown.

`LoginRequest` — `email`, `password`.

**The identifier is settled and the spec has not caught up.** Login is by
**아이디**, not email; email login was a discarded earlier idea (planning,
2026-08-16). So `LoginRequest.email` is due to be replaced, `SignUpRequest`
needs the same field — it currently has no way to create an 아이디 at all — and
whether `email` stays required is still open. Items 2 and 18 in
`backend-backlog.md`.

## Diary — `PUT /api/diaries/{date}`

Only `conditionLevel` (1–5) is required; every other field is optional, so a
partially filled 오늘의 기록 is a legal payload.

`sleepStartedAt` / `sleepEndedAt` are plain `string` with no `format`, so the
expected shape is unknown. `DiaryResponse` adds `id`, `logDate`, `sleepMinutes`
(int64, server-derived), `createdAt`, `updatedAt`.

### Enum ↔ 일지 UI

The pill order in `(tabs)/journal.tsx` matches these one-for-one unless noted.

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
| `exerciseType` | `WALKING` `AEROBIC` `STRENGTH` **`STRENGTH_AND_AEROBIC`** | 걷기 · 유산소 · 근력 · **기타** ⚠ |
| `walkDuration` | `UNDER_30` **`THIRTY_TO_60`** `ONE_TO_TWO_HOURS` `OVER_2_HOURS` | 30분 이하 · **1시간** · 2시간 · 2시간 이상 ⚠ |
| `sittingHours` | `UNDER_4` `FOUR_TO_EIGHT` `EIGHT_TO_TEN` `OVER_10` | 4시간 이하 · 4~8시간 · 8~10시간 · 10시간 이상 |
| `screenTime` | `UNDER_2` `TWO_TO_FOUR` `FOUR_TO_SIX` `OVER_6` | 2시간 이하 · 2~4시간 · 4~6시간 · 6시간 이상 |
| `moodRecovery` | `NONE` `BRIEF` `ENOUGH` | 안 함 · 잠깐 · 충분히 |
| `socialContact` | `RARELY` `BRIEF` `FREQUENT` | 거의 안 만남 · 잠깐 · 여러 번·길게 |
| `conditionLevel` | int 1–5 | FeelSelect 매우나쁨 → 매우좋음 |
| `sleepSatisfaction` | int 1–5 | FeelSelect 수면 만족도 |
| `stressLevel` | **int 1–10** | **Slider 0–10** ⚠ |

⚠ marks a real disagreement — see `backend-backlog.md`.

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

`DailyScoreResponse` — `date`, `areas`, `dailyTotal`, `displayTotal`,
`scoringVersion`.

`AreaScoreResponse` — `physical` `mental` `emotion` `social` `environment`,
which is the 5개 영역 밸런스 row on 홈 (신체 · 정신 · 감정 · 사회 · 환경).

The orb card's 100점 is presumably `displayTotal`; 어제보다 +4 needs the previous
day, so it means either two `/api/scores/{date}` calls or one ranged
`/api/scores?from&to`.

## DNA info

`GET /api/dna` → `DnaInfoResponse` — the diagnosis snapshot plus derived values:
`completedAt`, the diagnosis fields above, `who5` (int array), `baseline`
(`AreaScoreResponse`) and `sensitivityCoefficients` (`sugar` `caffeine` `stress`,
doubles).

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
