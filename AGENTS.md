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
  onto the canvas grey `#EAEAEA`. If the icon only ever sits on white — the 홈
  stat icons do — mapping that flat grey to white is exact for every opaque
  pixel and leaves only a sub-pixel fringe on the anti-aliased edge. A
  difference matte is *not* an option: parts of the artwork are themselves near
  the background colour and would come out semi-transparent.

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

- **No input validation anywhere.** Password mismatch, malformed email and
  impossible dates all pass. None of the form state is lifted or persisted
  either, so 약관 동의 submits nothing — validation should land together with
  whatever form/state design comes next, not before it.
- **`scale()` is fixed at module-eval width** (see rule 1). Fine while the app is
  portrait-locked; Android split-screen and foldables would need
  `useWindowDimensions`, which touches every component.
- `NoSelect` — the red "아직 응답하지 않았어요" state — is designed but not built.
- `SelectItem5_2` carries a stray `"2002"` text node (left over from a year
  picker) behind the pills; intentionally not reproduced.
### 일지 — built, and what is still missing

`journal/today.tsx` is the 오늘의 기록 screen (`480:1269`), built to prove the new
components render. It is **not linked from anywhere** — open `/journal/today`
directly — and it carries no bottom tab bar.

Still to port from 04_일지:

- **`BottomBar0`–`BottomBar4`** (`496:1958`–`496:1962`). Deliberately skipped:
  it is the tab shell, not a leaf component, so building it means restructuring
  `(tabs)` — and the icons need the `rawImages` treatment (rule 7) plus an
  active/inactive pair per tab that only `BottomBar0`–`4` together supply.
- **`Select0To10_History`** (`603:1849`) — the read-only slider for 상세보기.
- **`Date`** (`603:1881`, four heat levels) for 일지/캘린더.
- **`LifeDNA_WeeklyInfo_Card`** and its `ScoreBar`/`Word`/`ProgressBar` parts
  (`603:1884`) — mostly a 홈 concern.
- The three remaining screens: 일지/메인 (`480:1268`), 캘린더 (`480:1274`),
  상세보기 (`480:1275`).

`PillGroup`/`SelectCard`/`LikertCard`/`FeelSelect` already accept `history`, but
nothing renders it yet — 상세보기 will be the first. The assumed semantic is
"the chosen pill turns slate, the rest stay inactive"; confirm against
`667:891` and friends before building that screen.

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
- Two 1×1 glow dots on the CTA card are skipped; they are not legible at device
  size. The orb's six highlights **are** all drawn — see rule 9 for why the
  stacking order matters.
- **Figma writes the product name three ways** — LifeDNA, Life DAN, LifeDAN.
  All are reproduced verbatim where they appear (홈 orb card says "Life DAN",
  the 일지 banner says "LifeDAN", the 홈 CTA says "LifeDNA"). Worth a decision.

Next planned work: the remaining 일지 screens (메인 · 캘린더 · 상세보기), then
05_개선책 and 06_마이페이지 — which are also what the two dead tabs are waiting on.
