# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

# lifeDNA — working notes

React Native / Expo SDK 57, Expo Router, TypeScript, NativeWind v4.

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

Six Pretendard weights are loaded in `src/app/_layout.tsx` and registered in
`tailwind.config.js`: Regular / Medium / SemiBold / Bold / ExtraBold / Black.
Figma weight names map straight onto the `font-pretendard-*` classes. If Figma
introduces a weight that is missing, add the `.otf` (Pretendard is SIL OFL, on
jsDelivr under `orioncactus/pretendard`) rather than approximating with a
neighbouring weight.

### 7. Figma node exports come back **without alpha**

`download_assets` flattens the node onto the canvas colour — every pixel returns
alpha 255, so the artwork arrives with a grey box behind it.

To get a transparent asset, take the entry from `rawImages` (those do carry alpha)
and reapply the component's own transform yourself. `NiceDNA` on the login screen
was rebuilt this way; the transform values come straight out of the
`get_design_context` output for the instance. Always verify the result
side-by-side against Figma's own export before committing it.

## Verifying on the Android emulator

Type-checking is not verification. Every UI change gets looked at on the emulator.

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

- Route-group folders are omitted from deep links: `(auth)/sign-up/survey`
  is `--/sign-up/survey`.
- Force-stop before testing a route — Fast Refresh keeps the previous screen.
- Changing `tailwind.config.js` or adding a font needs a Metro restart with
  `--clear`, not just a reload.
- To tell a fresh error from a stale one, record `wc -l` on the log first and diff
  from there; the log accumulates and old entries read as current.
- Screenshots are reported at a scaled-down size. Multiply the reported
  coordinates by the stated factor before passing them to `adb shell input tap`.
- Keep scratch screenshots out of the repo.

## Open items

- **Sign-up intro** (`src/app/(auth)/sign-up/index.tsx`) is built from Figma frame
  `457:738`, which is `hidden` — a deprecated draft. It still uses the old upright
  `dna-icon.png` while the live login screen uses the tilted `NiceDNA`. Confirm the
  intended treatment before touching it.
- `SelectItem5_2` contains a stray `"2002"` text node (left over from a year
  picker) that sits behind the pills. Deliberately not implemented.
- `SelectButton4_History` (`#7786A8` / `#F7F8FA`) exists in Figma but is unused in
  the auth flow.
- `NoSelect` — the red "아직 응답하지 않았어요" validation state — is designed but
  not implemented; unanswered groups currently render as normal white pills.
- Next planned work: componentising the remaining sections.
