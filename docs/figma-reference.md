# Figma reference

File key `dltRYbBH0KHuBe86A6Vr2G`, page `0:1` (lifeDNA).

Everything below was read off the Figma masters. It is a **cache, not the source
of truth** — the design is still changing, so re-pull the node before relying on a
number here. Node IDs have already churned once (`SelectItem3` → `SelectItem3_1`,
login frame `549:861` → `585:1352`), so if an ID 404s, list the parent section
with `get_metadata` to find its replacement.

`get_metadata` on a **section** returns a sparse listing — you have to call
`get_design_context` on the child nodes individually to get real specs.

## Sections

| Node | Name |
|---|---|
| `457:658` | 00_디자인_시스템 |
| `457:659` | 01_로그인 |
| `153:281` | 02_회원가입 |
| `153:282` | 03_홈 |
| `153:284` | 04_일지 |
| `153:286` | 05_사용자_맞춤_개선책 |
| `153:288` | 06_마이페이지 |

Only 01 and 02 are implemented so far. Component library lives under
`153:290` (컴포넌트), with sub-sections 버튼 `457:700` and 입력 `480:1285`.

## Screens

| Node | Screen | Code |
|---|---|---|
| `585:1352` | 로그인/메인 | `(auth)/sign-in.tsx` |
| `500:121` | 회원가입/1 개인정보 | `(auth)/sign-up/personal-info.tsx` |
| `457:828` | 회원가입/2 초기 진단 | `(auth)/sign-up/survey.tsx` |
| `457:829` | 회원가입/3 약관 동의 | `(auth)/sign-up/terms.tsx` |
| `457:738` | (hidden draft) 시작해보기 | `(auth)/sign-up/index.tsx` |

Frames are 220×480. The status-bar mock (`PhoneHeader`) occupies the top ~38pt and
is replaced by `SafeAreaView` in code, so screen `paddingTop` is roughly
`figmaY - 38`. Horizontal padding is `scale(17)`, giving a 186pt content column.

The 약관 동의 screen has **no back button and no title** — `StepHeader` omits them
when `title` is not passed.

## SelectButton — the pill family

Five sizes × two tones (`gray` / `white`). Implemented as
`src/components/ui/select-button.tsx` (`level`, `tone`).

| Level | Node (pair) | H | Font | Shadow at rest | Active gradient |
|---|---|---|---|---|---|
| 1 | `463:1140` / `496:1822` | 19 | 6 | no | SELECT |
| 2 | `463:1143` / `496:1815` | 17 | 6 | no | SELECT |
| 3 | `463:1184` / `496:1808` | 16 | 6 | **yes** | SELECT |
| 4 | `463:1185` / `496:1801` | 15 | 5 | **yes** | **BRAND** |
| 5 | `463:1189` / `496:1794` | 14 | 5 | no | SELECT |

Shared: radius 5, Pretendard Medium, line-height 8, text `#5F5E5B` at rest and
white when active, shadow always present when active. Tone only changes the
resting background: `gray` = `#F2F2F0`, `white` = `#FFFFFF`.

A third variant `SelectButton4_History` (`603:1820`, `#7786A8` bg / `#F7F8FA` text)
exists but is unused in auth.

## SelectItem — labelled pill groups

Rendered by `src/components/ui/pill-group.tsx`. Pills are inset 12pt from the
item's edges; the gap is chosen so they exactly fill the remaining 162pt, which is
why the column gap varies with the column count (2 → 12, 3 → 8, 4 → 5).

| Node | Name | Size | Label | Layout |
|---|---|---|---|---|
| `480:1284` | SelectItem3_1 | 186×34 | Bold 10 `#00352C` | 3 × level 2 |
| `597:1557` | SelectItem3_2 | 172×27 | Bold 7 `#88877F` | 3 × level 2, no label gap |
| `480:1339` | SelectItem4_1 | 186×64 | Bold 10 | 2×2 × level 1 |
| `480:1354` | SelectItem4_2 | 186×34 | Bold 10 | 4 × level 3 |
| `480:1338` | SelectItem5_1 | 186×59 | Bold 10 | 3+2 × level 2 |
| `549:991` | SelectItem5_2 | 184×28 | Bold 7 `#88877F` | 5 × level 4 |
| `457:898` | SelectItem6_Card | 182×47 | Bold 8 `#00352C` | 6 × level 5 in a white card |

`labelTone` on `PillGroup` picks between the two label styles: `section`
(Bold 10 `#00352C`, 4pt gap) and `field` (Bold 7 `#88877F`, no gap — the same
label the text inputs use).

## Other components

| Node | Name | Notes |
|---|---|---|
| `457:742` | ButtonNextUI | 184×30, radius 10, SELECT gradient, ExtraBold 10 |
| `549:846` | TextInput | 184×34 — Bold 7 `#88877F` label band (10) + 23pt white field |
| `480:1293` | Select0To10 | 186×43 — see below |
| `485:35` | NoSelect | unanswered/error state, red border `#FFF9F9` bg — not implemented |
| `457:797` | PhoneHeader | status bar mock, replaced by SafeAreaView |
| `485:110` | NiceDNA | login artwork, 54×60 as placed |

### Select0To10

Filled track is 5pt tall, the remainder only 3pt — the same trick the step
progress bar uses. Handle is 13×12, white with a 2pt `#823FF6` border.

It gained a current-value badge: 35×10, radius 10, `#E9F0FF` background,
Medium 5 `#4800FF`, sitting on the label row against the right edge.

### Step progress bar

One continuous gradient whose width covers the completed steps, with the
remaining segments drawn as thinner grey (`#D3D1C6`) bars. Against the 180pt bar
the three segments sit at 0–56, 60–118 and 121–179, and the fill runs to
56 / 119 / 180 for steps 1 / 2 / 3.

## Colours seen in the design

`#00352C` Primary900 · `#5F5E5B` Gray600 · `#88877F` Gray400 · `#B4B2A8` Gray200 ·
`#D3D1C6` Gray100 · `#F2F2F0` pill grey · `#F3F3F3` page background ·
`#E3D6FF` checked checkbox · `#823FF6` slider handle border · `#4B52F6` step label ·
`#8B2AFE` inline link
