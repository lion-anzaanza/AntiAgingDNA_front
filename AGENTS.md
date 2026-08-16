# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

# lifeDNA — working notes

React Native / Expo SDK 57, Expo Router, TypeScript, NativeWind v4.

**Read [README.md](README.md) first** if you have not already — it covers what is
built, what is still untouched Expo template, what has no logic behind it yet,
and where things live. This file only covers rules and known traps.

The UI is a port of a Figma design. **Figma is the source of truth — re-pull it
before implementing or "fixing" any screen.** The design is still moving; several
components have already been renamed or replaced mid-build, so never trust the
existing code as a record of what the design says.

- File key: `dltRYbBH0KHuBe86A6Vr2G`
- Node IDs and per-component specs: [docs/figma-reference.md](docs/figma-reference.md)
- Load the `figma-design-to-code` skill before calling `get_design_context`.

## Rules that were learned the hard way

Each of these caused a real, visible bug. They are not style preferences.

### 1. `scale()` converts Figma units, and its basis is the device width

Every Figma frame is 220pt wide and stands in for the **full phone width**, so
`src/lib/scale.ts` divides the real window width by 220. Do not reintroduce a
fixed 375pt base — it made everything ~5% small and subtly off.

Write every dimension, font size, radius and margin as `scale(<figma value>)`.

### 2. Shadows use `boxShadow`, never `shadow-*` or `elevation`

Figma puts the same soft ambient shadow on every surface:
`0px 0px 4px rgba(169,169,169,0.25)` — exported as `SHADOW` in `src/lib/design.ts`.

RN 0.86 supports the CSS-style `boxShadow` string, which reproduces it exactly.
NativeWind's `shadow-sm` maps to Android `elevation`, which draws a hard, dark,
downward drop shadow instead. That single mistake was most of why the first
implementation looked wrong.

### 3. Never toggle a `className` on and off across renders

```tsx
// WRONG — remounts the subtree on every toggle
className={selected ? 'shadow-sm' : undefined}

// RIGHT — same element every render, only the value changes
style={{ boxShadow: selected ? SHADOW : 'none' }}
```

When a `className` appears/disappears, NativeWind swaps the underlying component
implementation. React sees a different element type in the same position and
unmounts/remounts the subtree mid-interaction, which corrupts the navigation
context and throws `Couldn't find a navigation context` from a pill's `onPress`.

The same rule applies to conditionally rendering different tree *shapes*. Selected
and unselected pills both render `Pressable → LinearGradient → Text`; only the
gradient `colors` differ (a solid fill is just two identical colors).

### 4. Guard `router.back()`

```tsx
if (router.canGoBack()) router.back();
else if (backHref) router.replace(backHref);
```

Opening a screen from a deep link leaves an empty stack, and an unguarded
`router.back()` fails with an unhandled `GO_BACK` action. Metro wraps that warning
in a `NamelessError` (`name = ''`), so it surfaces as a **blank** red toast with no
text — easy to misread as a mystery crash. `StepHeader` takes a `backHref` for this.

### 5. Two gradients, and they are not interchangeable

- `GRADIENT_SELECT` — the `ActiveButton` style, `#4356F7 → #843FF6`, first stop at
  **18.9%** (pass `locations={GRADIENT_SELECT_STOPS}`). Used by `ButtonNextUI` and
  selected SelectButton 1/2/3/5.
- `GRADIENT_BRAND` — `#4655F6 → #9423FF`, edge to edge. Now used **only** by a
  selected SelectButton4.

`ButtonNextUI` used to use the brand ramp and was changed in Figma. Re-check the
master rather than assuming.

### 6. Fonts

Seven Pretendard weights are loaded in `src/app/_layout.tsx` and registered in
`tailwind.config.js`: Light / Regular / Medium / SemiBold / Bold / ExtraBold /
Black. Figma weight names map onto the `font-pretendard-*` classes, except
Regular, which is plain `font-pretendard` with no suffix. If Figma introduces a
weight that is missing, add the `.otf` (Pretendard is SIL OFL, on jsDelivr under
`orioncactus/pretendard`) rather than approximating with a neighbouring weight.

The jsDelivr path is
`…@v1.3.9/packages/pretendard/dist/public/static/Pretendard-<Weight>.otf`.
A wrong path still writes a file — a few hundred bytes of error page saved as
`.otf` — so check the download: the sfnt tag must be `OTTO`, and the name table
should read `Pretendard <Weight>` / `Version 1.309` / SIL OFL.

### 8. `src/global.css` is imported once, from the root layout

NativeWind's stylesheet has to be imported somewhere for any `className` to
resolve. It used to be imported from `src/constants/theme.ts` — a template file
this project describes as disposable — so the auth flow was styled only as a
side effect of expo-router eagerly loading the template tab screens. Deleting
that file would have silently killed every `font-pretendard-*` class.

It now lives in `src/app/_layout.tsx`. Keep it there.

### 7. Figma node exports come back **without alpha**

`download_assets` flattens the node onto the canvas colour — every pixel returns
alpha 255, so the artwork arrives with a grey box behind it.

To get a transparent asset, take the entry from `rawImages` (those do carry alpha)
and reapply the component's own transform yourself. `NiceDNA` on the login screen
was rebuilt this way; the transform values come straight out of the
`get_design_context` output for the instance. Always verify the result
side-by-side against Figma's own export before committing it.

Three follow-ons, learned while porting 일지 and 홈:

- **`get_design_context` hands you the fill URL directly.** When a node is drawn
  from a bitmap it appears as `<img src={imgFoo}>`, and that URL is the source
  asset, alpha intact — no `download_assets` round trip. `NiceGene` on 홈 came
  from there. `download_assets` on the same node reported no `rawImages` at all.
- **One bitmap can back several nodes.** The five 만족도 faces are crops of a
  single sheet, so there is nothing per-face to export. Take the sheet and
  replay each `<img>`'s `w`/`h`/`left`/`top` percentages against its container
  box; `assets/images/journal/feel-*.png` were cut that way.
- **Vector nodes have no fill to fall back on**, and their export is flattened
  onto the canvas grey `#EAEAEA`. Key that flat grey to **transparent**, not to
  the background you happen to need: the 홈 stat icons were first keyed to white
  because they only sat on white cards, and the moment 일간_컨디션_요약 put them
  on a `#FBF4FF` tile each one showed a white box. Transparent costs nothing —
  the anti-aliased edge keeps a faint grey tint either way, invisible against a
  near-white surface. A difference matte is still *not* an option: parts of the
  artwork are themselves near the background colour and would come out
  semi-transparent.

### 9. An instance can carry children of its own, and they draw on top

`get_metadata` on a frame lists an instance as one opaque line. Whatever is
*inside* that instance is invisible to it — and it renders above everything the
frame drew before it.

The 홈 orb is the case that caught this. The card draws three violet highlight
dots, then places `NiceGene` last; `NiceGene` contains its own three near-white
dots, 1.5pt lower. So Figma's violet dots are all but buried under the artwork
and the white ones on top are what you actually see. Porting only the card-level
dots — and drawing them above the artwork — produced purple highlights where the
design has white ones, which is exactly backwards.

Two habits that would have caught it: call `get_design_context` on the instance
itself, not only on the frame; and preserve **paint order**, since an absolutely
positioned child that comes later in the tree is on top.

The comparison that settled it is worth repeating for any artwork that matters:
export the Figma node at scale 4, screenshot the emulator, crop both to the
subject's bounding box, scale to a common size, and difference them. Anything
left beyond thin edge outlines is a real difference.

### 10. `scale()` must never be called inside a worklet

`src/lib/scale.ts` is an ordinary JS function. A Reanimated worklet that reaches
for one throws *"Tried to synchronously call a non-worklet function on the UI
thread"* — and the failure mode is what makes this worth a rule:

```tsx
// WRONG — throws on the UI thread, red screen
useAnimatedStyle(() => ({ transform: [{ translateX: t.get() * scale(1.5) }] }));

// RIGHT — convert in the render body; the worklet closes over a number
const drift = scale(1.5);
useAnimatedStyle(() => ({ transform: [{ translateX: t.get() * drift }] }));
```

The same goes for anything else imported from `@/lib` — worklets may only see
numbers, strings and other worklets.

Two related notes:

- Reanimated shared values use `.get()` / `.set()` here, not `.value`. The
  `react-hooks/immutability` lint rule (React Compiler) rejects `value =`
  assignments in event handlers; `.set()` is the supported accessor.
- `useReducedMotion()` reads the system animator duration scale. If motion looks
  dead on a device or emulator, check `adb shell settings get global
  animator_duration_scale` before suspecting the code.

### 11. Diffing screenshots is not looking at them

Chasing rule 10 cost about a dozen rounds because the check was
`ImageChops.difference` on two captures, and both captures were of a **red error
screen**. Identical frames were read as "the animation is not running" when they
actually meant "the app has crashed and is showing a stack trace".

So: **open the screenshot** before measuring anything about it. Diffing is for
comparing two things you have already looked at, and comparing against a Figma
export — not for deciding whether the app is alive.

For motion specifically, `screencap` is the wrong tool anyway. A still frame
cannot show movement, and the video encoder gives you the answer for free:

```bash
adb shell screenrecord --time-limit 6 --size 540x1200 /sdcard/rec.mp4
# a static screen encodes to ~1 decoded frame; a moving one to ~100
```

Then measure **consecutive** frames, not every frame against the first — that
separates continuous motion from a one-time layout settle.

### 12. There is no shared content column — read the frame you are building

Every screen was hand-placed, so the left inset and content width differ per
frame (17/18/19 left, 180/184/186 wide, 홈 asymmetric at 18 left / 22 right).
The table is in [docs/figma-reference.md](docs/figma-reference.md), and
`get_metadata` on the frame answers it in one call.

Assuming one column caused real breakage, not just a soft edge: 회원가입/2's
수면 유형 pills are sized to fill their row, so a 186pt row in a 184pt column
overflowed and `flexWrap` dropped the 2×2 grid to one pill per row.

The same applies inside components — `SelectItem*_Card`, `SelectFeel5` and
`InputTime_Card` are 182 wide in every instance and must carry that width rather
than fill their parent.

### 13. Compare against Figma by offset consensus, not by eye

Export the frame at scale 4, screencap the emulator, then reduce both to a list
of element positions and subtract. Every element should be off by the *same*
amount — that constant is only the difference between Figma's 38pt `PhoneHeader`
mock and the device's real safe-area inset (≈13pt at 220-scale here). Elements
that disagree with their own screen's consensus are the bugs.

Two traps in the arithmetic:

- **The export is not always 880px wide.** Overflow (shadows, glows) pads it —
  홈 comes back 896 with the frame at px 0..879, and 회원가입/3 at 884. Crop to
  the frame before scaling or every measurement drifts by ~1%.
- **Figma lays out on line boxes, not ink.** A heading's ink centre sits about
  0.9pt below its line-box centre, so derive margins from `leading-[Npx]` and
  use ink only to confirm.

Expo Go wedges on "New update available, downloading…" often enough that a
capture loop needs to detect that splash and relaunch — otherwise you measure
the splash and report a broken screen.

## Verifying on the Android emulator

Type-checking is not verification. Every UI change gets looked at on the emulator.

The recipe below is Git Bash (the repo's shell is PowerShell by default, but
`nohup`, `until` and `MSYS_NO_PATHCONV` all assume bash).

```bash
# start Metro, keeping the output somewhere greppable
nohup npx expo start --android > /tmp/expo.log 2>&1 &

# the host:port to deep-link against is printed as "Opening exp://<host>:8081"
adb shell am force-stop host.exp.exponent
adb shell am start -a android.intent.action.VIEW \
  -d "exp://<host>:8081/--/sign-up/personal-info" host.exp.exponent

# screenshots (the prefix is required in Git Bash or the paths get mangled)
MSYS_NO_PATHCONV=1 adb shell screencap -p /sdcard/s.png
MSYS_NO_PATHCONV=1 adb pull /sdcard/s.png ./s.png
```

- **Deep links are not enough — cold start the app plain (`exp://<host>:8081`,
  no `/--/` path) at least once per change to a screen's entry path.** The entire
  auth flow was unreachable from app launch for a whole working session precisely
  because every check went through a deep link.
- Route-group folders are omitted from deep links: `(auth)/sign-up/survey`
  is `--/sign-up/survey`.
- Force-stop before testing a route — Fast Refresh keeps the previous screen.
- Changing `tailwind.config.js` or adding a font needs a Metro restart with
  `--clear`, not just a reload.
- To tell a fresh error from a stale one, record `wc -l` on the log first and diff
  from there; the log accumulates and old entries read as current.
- Screenshots are reported at a scaled-down size. Multiply the reported
  coordinates by the stated factor before passing them to `adb shell input tap`.
- Expo Go sometimes wedges on "New update available, downloading…" and never
  reaches the app. Metro is fine; force-stop and relaunch.
- **A wedge at "Bundling 99%…" is the LAN, not your code.** Metro logs a
  successful bundle while the device sits on the splash, and `logcat` shows
  `ProtocolException: Expected leading [0-9a-fA-F] character` from
  `BundleDownloader.processMultipartResponse` — the chunked multipart response
  breaks in transit. Route around the network instead of debugging the app:

  ```bash
  adb reverse tcp:8081 tcp:8081
  adb shell am start -a android.intent.action.VIEW \
    -d "exp://127.0.0.1:8081/--/journal" host.exp.exponent
  ```

  Adding a dependency makes this likelier, because the next start rebuilds the
  whole bundle — allow ~30s for the first one before screenshotting.
- Give the bundle time before screenshotting, or you photograph the splash and
  read it as a broken screen. Wait on the window first:
  `until adb shell dumpsys window | grep -q ExperienceActivity; do sleep 3; done`
- Keep scratch screenshots out of the repo.

## Routing

`/` is a redirect to `/(auth)/sign-in`, and the tabs home lives at `/home`
rather than `/`. Both are deliberate: the root stack anchors on whichever screen
is declared first, so with `(tabs)` first a cold start bypassed auth entirely,
and a root `index.tsx` cannot share `/` with `(tabs)/index.tsx`. The anchor is
pinned by `unstable_settings.initialRouteName` in `src/app/_layout.tsx`.

There is no auth state yet — 약관 동의 simply `replace`s to `/(tabs)/home`.
Adding real auth means gating those routes (`<Stack.Protected guard={...}>`
exists in the installed expo-router 57.x), not re-ordering screens.

Routes register themselves from the filesystem — `(auth)/_layout.tsx` declares
no `<Stack.Screen>` at all and its five routes work. The explicit list in the
root layout exists only to pin the anchor described above.

### The tab bar is the headless API, and it fights you on layout

Figma's `BottomBar` is a custom design, so `(tabs)/_layout.tsx` uses
`Tabs`/`TabSlot`/`TabList`/`TabTrigger` from **`expo-router/ui`** rather than
`NativeTabs`. Note that in 57.x `Tabs` from the root export is deprecated in
favour of `expo-router/js-tabs`, and neither is what you want here.

Unlike `<Stack>`, these routes do **not** register from the filesystem — a
`TabTrigger` inside `TabList` is what declares one. So 개선책 and MY, which have
no screens yet, are rendered as bare `BottomBarButton`s: `parseTriggersFromChildren`
ignores any child that is not a `TabTrigger`, so they cost nothing and simply do
not navigate. `(tabs)/explore.tsx` likewise has no trigger and is no longer a tab.

Two layout traps, both of which produced a visibly broken bar:

- **`<TabList asChild>` hands its child `flexDirection: 'row'`.** `BottomBar`
  therefore *is* the row. An inner wrapper `View` gets no flex, collapses to
  zero width, and stacks all four tabs on top of each other.
- **`TabTrigger` hands its child a hardcoded `{flexDirection:'row',
  justifyContent:'space-between'}`.** `BottomBarButton` composes its own layout
  *after* the incoming style — the reverse of the usual order — because letting
  that win turns the column on its side and shoves the icon to the left edge.
  Only the two triggered tabs broke, which is what pointed at the cause.

`asChild` on `TabList` is understood by trigger discovery (it unwraps exactly
one extra layer), so nesting the triggers inside `BottomBar` still registers
the routes.

## Open items

`npx tsc --noEmit` and `npx expo lint` both pass. Keep them that way.

### Figma slips found while porting 일지 — worth a designer's eye

None of these block anything; each was resolved by picking the majority reading,
and each is listed so the next person does not "fix" the code back.

- **The 만족도 faces disagree about their shadow.** `VeryBad` carries the ambient
  shadow in all three states; `Bad`/`Normal`/`Good`/`VeryGood` carry it in none.
  `VeryBad` is the one that was rebuilt most recently and it matches the rest of
  the SelectButton family, so the code gives every face the shadow.
- **`SelectFeel5` insets its pill row 12 on the left but 8 on the right.**
  Reproduced as-is; it is visible if you look for it.
- **The `_Caption_Card` captions disagree on weight** — `SelectItem4_Caption_Card`
  is Medium, `SelectItem3`/`SelectItem6` are Regular. `SelectCard` uses Regular.
- **`SelectFeel5_NeedAnswer` uses pure `red` (`#FF0000`)** for its border and
  message, not a palette colour.
- **`BottomBar2` stacks two 개선책 icons** (a dark bulb-and-gear over the plain
  grey bulb). Presumably a layering slip.
- **`일간_컨디션_요약` shows the 보통 face beside the label 좋음.** Measured, not
  guessed: the `image 1099` crop window lands at 0.413–0.593 of the 만족도 sheet,
  which is 보통 (0.420–0.580). The card derives the face from the condition
  instead, since both come from the same value.
- **Centred elements on 로그인 are each centred on a different axis** — the DNA
  icon on 112, the wordmark on 111.5, the greeting on 112, 회원가입 on 112.5 and
  아이디·비밀번호 찾기 on 110.5, while the button is dead-centre on 110. The code
  centres everything on 110; reproducing the scatter is not worth it.
- **`SelectItem3_2` on 회원가입/1 is a 172-wide instance** whose pills are flush
  to its right edge (inset 14 left, 0 right, gap 7) rather than the 12/12 the
  rest of the family uses. `PillGroup` renders 12/12, so its first pill lands
  2pt left of Figma's.
- **회원가입/2's button and Likert cards break its own column** — the frame is
  17..203 but `ButtonNextUI` sits at 22 and the `SelectItem6_Card`s at 25..207.

### The backend exists, and nothing is wired to it

`https://antiaging-dna.anzaanza.cloud` is live — `GET /health` answers. Its spec
and the enum ↔ UI mapping are in [docs/backend-api.md](docs/backend-api.md).

There is no client, no token storage and no lifted form state, so wiring cannot
begin until the questions in [docs/backend-backlog.md](docs/backend-backlog.md)
are answered — the blocking ones include the shape of
`SignUpRequest.agreements`, what an error response looks like, and the fact that
login is by 아이디 (settled) while neither the API nor the signup form has such a
field yet.

**That backlog is a living document.** When you find something the design needs
and the API cannot do, add it there rather than working around it silently. Two
disagreements are already recorded that would otherwise be papered over in code:
the diagnosis sensitivity sliders are 0–10 while the API wants four levels, and
`stressLevel` starts at 1 while the slider starts at 0.

Waiting on a decision — do not resolve these unilaterally:

- **마케팅 정보 수신 is marked `[필수]` and gates signup** (`terms.tsx`). Figma
  says 필수, but Korean 정보통신망법 requires advertising consent to be optional
  and separable from signup, so a user who declines can never finish. Needs the
  designer and whoever owns compliance; the code change is one line.
- **Sliders cannot tell 0 from unanswered.** `useState(0)` means an untouched
  slider reports the minimum. Fixing it needs a design for what an unanswered
  slider looks like — Figma specifies `NoSelect` for pill groups but nothing for
  Select0To10.
- **Web is half-configured.** `app.json` declares ios/android, yet `.web.tsx`
  variants and `react-dom` are present while `react-native-web` is not. Either
  support web or drop the leftovers; both are product calls.
- **Sign-up intro** (`(auth)/sign-up/index.tsx`) comes from Figma frame
  `457:738`, which is `hidden` — a deprecated draft still using the old upright
  `dna-icon.png` while login uses the tilted `NiceDNA`.
- **The colour scales in `tailwind.config.js` are dead and slightly wrong.**
  Nothing in `src` uses `text-primary-900` and friends — the code takes colours
  from `src/lib/design.ts` and explicit hex — and several values disagree with
  Figma (`primary.900` `#04342C` vs `#00352C`, `gray.100` `#D3D1C7` vs
  `#D3D1C6`, `gray.400` `#888780` vs `#88877F`). Reaching for those classes
  gets you a subtly wrong colour. Either correct them against Figma or drop
  them; only the `fontFamily` block is actually in use.

Known and deliberately deferred:

- **No input validation anywhere.** Password mismatch and impossible dates all
  pass. The rules cannot be written yet regardless: the API documents no
  constraint on password, nickname or the identifier (backlog 19).
- **The signup draft is lifted but not submitted.** `src/lib/sign-up-form.tsx`
  holds all three steps' answers, mounted by `(auth)/sign-up/_layout.tsx` so the
  draft dies when the user leaves the flow. It deliberately stops short of
  building a `SignUpRequest`: the sensitivity sliders' enum boundaries are the
  server's to define and the identifier field is unsettled (backlog 2, 6, 18).
  Values are stored exactly as collected — Korean labels, 0–10 positions,
  년/월/일 as separate strings.
- **Nothing can show an error.** `TextInputField` has no error prop, Figma's
  `TextInput` has only 입력 전 / 입력 후 / 비밀번호 variants, and the 로그인 screen
  has no space for a failure message. So even a well-specified error response
  has nowhere to land — which is why the signup steps *gate* rather than
  explain: `isPersonalInfoComplete` / `isDiagnosisComplete` keep 다음 disabled,
  reusing the pattern 약관 동의 already had, and invent no new UI. Telling the
  user **why** still needs a design.
- **`scale()` is fixed at module-eval width** (see rule 1). Fine while the app is
  portrait-locked; Android split-screen and foldables would need
  `useWindowDimensions`, which touches every component.
- `NoSelect` — the red "아직 응답하지 않았어요" state — is designed but not built.
- `SelectItem5_2` carries a stray `"2002"` text node (left over from a year
  picker) behind the pills; intentionally not reproduced.
### 일지 — built, and what is still missing

All four 일지 screens are built: 메인 (`480:1268`) is the tab root, with
오늘의 기록 (`480:1269`), 캘린더 (`480:1274`) and 상세보기 (`480:1275`) pushing on
top. 상세보기 is `[date].tsx`, and confirmed against Figma: the answer that was
given renders `history`, every other pill stays `inactive`.

Still to port from 04_일지:

- **`BottomBar0`–`BottomBar4`** (`496:1958`–`496:1962`). Deliberately skipped:
  it is the tab shell, not a leaf component, so building it means restructuring
  `(tabs)` — and the icons need the `rawImages` treatment (rule 7) plus an
  active/inactive pair per tab that only `BottomBar0`–`4` together supply.
- The 미응답 state of a day with no entry, which is blocked on knowing what
  `GET /api/diaries/{date}` returns for one (backlog 23).

`주간_컨디션_그래프` (`585:1436`) is **built** — `ui/weekly-condition-chart.tsx`,
and the reason `react-native-svg` is now a dependency (bundled in Expo Go, so
the dev loop is unchanged).

Where it goes was read off the canvas: Figma parks each floating card directly
beneath its parent frame at the same `x`. `일간_컨디션_요약` (`585:1377`) sits
under 캘린더 and opens when a day is tapped; `주간_컨디션_그래프` sits under
일지/메인 at x=17, is **the same 184×95 as 주간_기록**, and so shares that slot as
a horizontal swipe — exactly the arrangement 홈 already uses for its second orb
card (`457:791`, parked beside the frame). That keeps every other element on the
480pt frame in its Figma position.

Two things Figma does not answer, both left unbuilt rather than invented:

- **The swipe has no affordance.** 홈's orb card carries page dots and a
  "옆으로 밀어…" hint because Figma draws them; neither 주간_기록 nor the graph
  has any, so the second page is currently undiscoverable.
- **Two premium modals are parked under the graph** — `597:1443`
  (LifeDNA 프리미엄 기능이에요) and the loose `596:1073` group (7일 무료로 먼저
  사용해보세요), both 162×95. By the same canvas rule they belong to the graph,
  which reads as the graph being a paid feature. Not built.

Figma draws the line as three objects — a gradient area fill, a 0.5pt gradient
stroke expressed as a nearly flat path rotated -10.92°, and seven 2pt dots. The
component regenerates all three from the point scores (Catmull-Rom → cubic
bezier) rather than tracing them, so it is ready for real data. Checked against
the export: the generated curve tracks Figma's to within 1.1pt at its worst
across every column, and the mock scores round-trip to Figma's exact dots.

- `SelectButton*_History` (`#7786A8` / `#F7F8FA`) now exists on all five levels
  and is implemented as `state="history"`.

### 홈 — built, and what is still missing

`(tabs)/home.tsx` is 홈/메인 (`597:1466`), replacing the Expo template screen.
The orb card is a two-page swipe; page two is `457:791`, which Figma parks
*beside* the frame rather than inside it, and it reuses the login screen's
`dna-nice.png`.

- **The tab bar is built** (`ui/bottom-bar.tsx`) and both screens now sit inside
  it. 개선책 and MY are drawn but inert — they have no screens. The template
  `app-tabs.tsx` / `app-tabs.web.tsx` it replaced are gone.
- Everything on 홈 is drawn, including the orb's six highlights (rule 9 explains
  why their stacking order matters) and the CTA card's two blooms. Those blooms
  were skipped at first as "1×1, not legible" — wrong, because each carries a
  20pt blur and a 10pt spread, so what renders is a soft patch roughly 40pt
  across. **Judge a decoration by its shadow, not by its size.** Probing the
  card's right edge showed Figma at 162 / 152 / 160 top-to-bottom against a flat
  151 in the port; with the blooms it reads 162 / 153 / 162.
- **Figma writes the product name three ways** — LifeDNA, Life DAN, LifeDAN.
  All are reproduced verbatim where they appear (홈 orb card says "Life DAN",
  the 일지 banner says "LifeDAN", the 홈 CTA says "LifeDNA"). Worth a decision.

### Motion — phase 1 only

The orb and the helix breathe, drift, twinkle, counter-rotate their rings, carry
a sheen sweep, and squash when pressed. All Reanimated, no new dependency, all
tunable from `src/lib/motion.ts`. **Figma specifies no motion** — the numbers
there are a starting point for the designer to react to on a device, not a spec.

Not built, in the order they would matter:

- **State transitions.** Figma has seven orb states and seven DNA states, and
  the orb card already promises "컨디션이 좋아 오브가 푸른빛이에요". Wiring that
  needs the data layer; `LivingArtwork` should grow a `state` prop then.
- **Sparkles flaring on press.** The artwork reacts; the highlights do not.
- **Skia.** Deformation, real radial gradients and a continuous colour morph
  across the seven states all need it. Worth knowing: `librnskia.so` **is**
  bundled in Expo Go, so adopting it costs no change to the dev loop — only
  release binary size. `lottie-react-native` is *not* bundled and would force a
  development build.

### 개선책 — built

All four screens of 05_사용자_맞춤_개선책 are built and reachable, and the tab is
a real `TabTrigger` now, so only MY is still an inert button.

메인 (`559:1297`) is the tab root; 맞춤 영양제 (`559:1295`), 주간 리포트
(`559:1294`) and 한 달 뒤 내 모습 (`523:490`) push on top. Two pieces are shared
in `components/ui`: `PlanCard` (the icon + title + caption row, which 메인 and
리포트 draw a point or two apart) and `AreaDeltaCard` (지난 주 대비 영역별 변화,
identical on 리포트 and 한달뒤).

What is drawn but does nothing:

- **담기 and 3종 정기구독으로 담기** — there is no cart, and the API documents no
  commerce endpoints at all.
- **오늘의 실천 rows** mark themselves done locally and reset on unmount. Which
  six rows a user sees is a data question: the section carries a long note
  listing the full catalogue per 영역, meant to surface "오늘의 한 가지" against
  whichever area is lowest that day.

Slips worth a designer's eye, resolved by picking the majority reading:

- **한달뒤내모습 carries `BottomBar4`**, which lights MY rather than 개선책. The
  bar derives its active tab from the route, so it lights 개선책.
- **The 오늘의 실천 progress bar does not match its own label** — the filled and
  empty halves are 70 and 22 wide, which is 76%, beside a "70%".
- **The 예상 성장 곡선's middle point sits ~2pt below** where a straight 74→81
  scale puts it, so the drawn curve is less optimistic in the middle than the
  numbers beside it. The linear scale is used.
- **The teaser card's stated 151.2° gradient** converts, through the card's
  184×52 aspect, to a near-vertical ramp that is not what the file renders. The
  ramp is taken from the export's own corners instead.

Next planned work: 06_마이페이지, which is what the last dead tab is waiting on.
