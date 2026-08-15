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

01, 02 and one screen of 04 are implemented so far. Component library lives under
`153:290` (컴포넌트), with sub-sections 버튼 `457:700`, 입력 `480:1285`,
만족도 `457:701`, 범용 `457:820` (BottomBar), 캘린더 `603:1852` and
나의 LifeDNA 정보 `603:1884`.

## Screens

| Node | Screen | Code |
|---|---|---|
| `585:1352` | 로그인/메인 | `(auth)/sign-in.tsx` |
| `500:121` | 회원가입/1 개인정보 | `(auth)/sign-up/personal-info.tsx` |
| `457:828` | 회원가입/2 초기 진단 | `(auth)/sign-up/survey.tsx` |
| `457:829` | 회원가입/3 약관 동의 | `(auth)/sign-up/terms.tsx` |
| `457:738` | (hidden draft) 시작해보기 | `(auth)/sign-up/index.tsx` |
| `480:1269` | 일지/오늘의기록(생성) | `journal/today.tsx` |
| `480:1268` | 일지/메인 | — |
| `480:1274` | 일지/캘린더 | — |
| `480:1275` | 일지/상세보기 | — |

Frames are 220×480. The status-bar mock (`PhoneHeader`) occupies the top ~38pt and
is replaced by `SafeAreaView` in code, so screen `paddingTop` is roughly
`figmaY - 38`. Horizontal padding is `scale(17)` on the three step screens, giving a 186pt
content column; 로그인 and 회원가입 인트로 use `scale(18)`.

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

All five grey levels now carry a third variant `*_History` — `#7786A8` bg,
`#F7F8FA` text, shadow on: `603:1832` / `1828` / `1824` / `1820` / `1816` for
levels 1–5. The white tone has only active/inactive.

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

## SelectItem*_Card — the carded pill groups (일지)

Rendered by `src/components/ui/select-card.tsx`. All are 182 wide on a white
card, radius 10, with the same Bold 8 `#00352C` title on a 15pt line box. The
pill count picks the whole row geometry.

| Node | Name | H | Pills | Column gap | Side inset |
|---|---|---|---|---|---|
| `480:1754` | SelectItem3_Caption_Card | 52 | 3 × level 2 | 8 | 11 |
| `496:1920` | SelectItem4_Card | 46 | 4 × level 3 | 5 | 10 / 8.5 |
| `480:1548` | SelectItem4_Caption_Card | 52 | 4 × level 3 | 5 | 10 / 8.5 |
| `457:899` | SelectItem6_Caption_Card | 52 | 6 × level 5 | 4 | 9 |
| `457:898` | SelectItem6_Card | 47 | 6 × level 5 | 4 | 9 |

Captioned cards run `paddingTop 4.5 → title 15 → caption 8 (marginTop −1) →
pills → paddingBottom`; the caption is Regular 5 `#88877F` (except
SelectItem4_Caption_Card, which Figma drew as Medium — see AGENTS.md).
`SelectItem4_Card`, the only captionless member, is a point tighter top and
bottom, and `SelectItem6_Card` uses a 10pt title line box instead of 15.

## SelectFeel5 — the five-face 컨디션 scale

`603:1836` (182×66), plus `677:1175` `SelectFeel5_NeedAnswer` (182×76).
Implemented as `src/components/ui/feel-select.tsx`.

Card: white, radius 10, title Bold 8 `#00352C` on a 15pt line box at x 12. Five
28×33 buttons on a row inset 12 left / 8 right, evenly spread (gap ≈ 5.5).

Each face (만족도 section `457:701`) is radius 5 with a 16×16 emoji at y 5 and a
Medium 6 label whose line box sits at y 22–30:

| State | Background | Text |
|---|---|---|
| Inactive | `#F2F2F0` | `#5F5E5B` |
| Active | GRADIENT_SELECT @ 18.9% | `#FFFFFF` |
| History | `#7786A8` | `#F1F1F1` |

`_NeedAnswer` swaps the card to `#FFF9F9` with a 0.3pt pure-`red` border and
adds a Regular 5 red "아직 응답하지 않았어요" beneath, right-aligned.

The five faces come from **one spritesheet**, not five nodes. `download_assets`
on `603:1836` returns it under `rawImages` (2720×900, with alpha); the crops
live in `assets/images/journal/feel-*.png` and were derived by applying each
`<img>`'s `w`/`h`/`left`/`top` percentages against its 16×16 container. See
rule 7 in AGENTS.md — the flattened export is unusable here because an active
face sits on a gradient.

## InputTime_Card

`457:884` — 182×60. Title row (Bold 8) with a `#E9F0FF` duration badge at the
right (33×10, radius 10, Medium 5 `#4800FF`). Below it two Medium 5 `#88877F`
field labels, then two 68×19 fields (white, radius 5, 0.7pt `#F1EFE7` border,
Bold 7 `#2C2C2A`, letter-spacing 0.21) separated by a 25pt Light 10 `#B4B2A8`
arrow. Light is the only place that weight is used so far.

## Select0To10_Card

`597:1582` — 182×55. The bare `Select0To10` in a card: title drops to Bold 8 on a
15pt line box, the handle shrinks from 13×12 to 10×10, and the end labels use a
8pt line box. Same `#E9F0FF` badge. `Select0To10_History` (`603:1849`, 184×55)
is the read-only twin and is **not built yet**.

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
