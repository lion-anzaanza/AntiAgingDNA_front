/**
 * Every number that decides how alive the orb and the helix feel, gathered in
 * one place so the design can be dialled in on a device instead of argued
 * about in a diff.
 *
 * Durations are milliseconds. Amplitudes are Figma points, except where they
 * are a scale factor.
 *
 * Nothing here is from Figma — the design file carries no motion
 * (`get_motion_context` returns nothing for the orb card), so these are a
 * starting point to react to, not a spec.
 */
export const MOTION = {
  /**
   * A slow swell. 2.5% was the original guess and it was too shy to notice on a
   * device — the first review of it on hardware asked for "더 크게". 5.5% over a
   * slightly longer period keeps the same easing and still reads as breath
   * rather than a pulse: the extra travel is paid for with extra time, which is
   * what separates the two.
   */
  breathe: { period: 4600, amplitude: 0.055 },

  /**
   * The two axes deliberately have no short common multiple, so the path never
   * visibly repeats. That is most of what separates "alive" from "looping GIF".
   */
  drift: { periodX: 7000, periodY: 5300, amplitude: 1.5 },

  /** Highlights glint on their own schedules; each dot is offset and detuned. */
  sparkle: { period: 2600, detune: 310, stagger: 700, minOpacity: 0.35, maxScale: 1.25 },

  /** The dashed rings counter-rotate — slow enough to notice only if you look. */
  rings: { outerPeriod: 45000, innerPeriod: 70000 },

  /**
   * A band of light crossing the artwork's own silhouette, then a rest, so it
   * reads as a pulse rather than a barber pole.
   */
  sheen: { sweep: 2400, rest: 4600, strength: 0.16, bandRatio: 0.7 },

  /**
   * Press feedback. The overshoot is not a number — it falls out of a lightly
   * damped spring returning to rest, which carries the scale back past 1.
   */
  poke: {
    squash: 0.94,
    inDamping: 20,
    inStiffness: 300,
    outDamping: 7,
    outStiffness: 180,
  },

  /** Helix only. A flat bitmap swung far in Y reads as a flipping card. */
  tilt: { period: 6400, degrees: 9 },

  /** How long everything takes to settle when the screen loses focus. */
  settle: 400,
} as const;
