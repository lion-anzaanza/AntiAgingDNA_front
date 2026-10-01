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
- `npx tsc --noEmit`, `npx expo lint` and `npm test` all pass today. Keep them
  passing. The tests cover `src/lib`'s pure logic — that is where both of the
  worst bugs so far lived (the UTC date drift and the diary round trip).
- Do not resolve anything under "waiting on a decision" in AGENTS.md on your own.

## Where to look

| Need | Go to |
|---|---|
| What exists, what is still template, what has no logic | README below |
| How to work here, traps, open items | AGENTS below |
| Figma node IDs and measurements | `docs/figma-reference.md` |
| API endpoints, schemas, enum ↔ UI mapping | `docs/backend-api.md` |
| Open requests to the backend team | `docs/backend-backlog.md` |
| What we still have to wire or wait on (🟡 / 🟣), per-screen coverage | `docs/frontend-status.md` |
| How the app reaches teammates | `docs/deploy.md` |

**Keep `docs/backend-backlog.md` current.** Anything the design needs and the
API cannot do belongs there the moment you notice it — that document is how the
backend team hears about it. It is handed over one way and replies come back
verbally: record each as one dated line (`구두:` for what they said, `확인:` for
what we checked on the server), never as pasted prose, and close nothing without
a `확인:` line.

The status that matters most is 🟡 프론트: the backend answered *and the answer
requires a screen change*. Closing those in the backlog is how the work
disappears — four of them sat unnoticed until a re-read. When a reply leaves the
ball with us, close it in the backlog **and** move it under the same number to
`docs/frontend-status.md`.

`docs/figma-reference.md` and `docs/backend-api.md` are both **caches**, not
truth. Node IDs have already churned once; the API spec is regenerated with
`curl -s https://antiaging-dna.anzaanza.cloud/v3/api-docs`. Confirm anything you
depend on against Figma or the server itself.

@README.md

@AGENTS.md
