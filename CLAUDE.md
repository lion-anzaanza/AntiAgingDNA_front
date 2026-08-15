# lifeDNA (AntiAgingDNA_front)

Expo / React Native app. The UI is ported from Figma.

## Never violate these

- **Figma is the source of truth and is still changing.** Re-pull the node before
  implementing or fixing any screen. Do not treat existing code as a record of
  what the design says — components have already been renamed and swapped
  mid-build.
- **Look at UI changes running on the emulator.** A passing type-check is not
  verification, and neither is a deep link alone — cold start the app plain when
  you touch anything on an entry path.
- `npx tsc --noEmit` and `npx expo lint` both pass today. Keep them passing.
- Do not resolve anything under "waiting on a decision" in AGENTS.md on your own.

## Where to look

| Need | Go to |
|---|---|
| What exists, what is still template, what has no logic | README below |
| How to work here, traps, open items | AGENTS below |
| Figma node IDs and measurements | `docs/figma-reference.md` |
| API endpoints, schemas, enum ↔ UI mapping | `docs/backend-api.md` |
| Open questions for the backend team | `docs/backend-backlog.md` |

**Keep `docs/backend-backlog.md` current.** Anything the design needs and the
API cannot do belongs there the moment you notice it — that document is how the
backend team hears about it.

`docs/figma-reference.md` and `docs/backend-api.md` are both **caches**, not
truth. Node IDs have already churned once; the API spec is regenerated with
`curl -s https://antiaging-dna.anzaanza.cloud/v3/api-docs`. Confirm anything you
depend on against Figma or the server itself.

@README.md

@AGENTS.md
