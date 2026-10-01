/**
 * `get_design_context` writes gradients as CSS — `linear-gradient(166deg, …)` —
 * while expo-linear-gradient wants a start and end point in the box's own unit
 * coordinates. The two are not interchangeable: a CSS angle is measured in real
 * pixels, so the same 166° runs almost corner to corner on a square but nearly
 * straight down a wide, short button.
 *
 * This reproduces CSS's rule: the gradient line passes through the centre at
 * `angle` (0 = up, clockwise), and is just long enough that the stops at 0 and 1
 * touch the box's corners. The points may land outside 0..1, which is correct.
 */
export function cssGradientPoints(angleDeg: number, width: number, height: number) {
  // An empty box (a progress fill at 0%) has no direction to resolve, and the
  // division below turns it into NaN — which expo-linear-gradient hands to
  // Android's `LinearGradient`, and that throws natively and kills the app.
  // Found when 홈's weekly card met a week with no data (2026-10-02).
  if (!(width > 0) || !(height > 0)) {
    return { start: { x: 0, y: 0.5 }, end: { x: 1, y: 0.5 } };
  }
  const a = (angleDeg * Math.PI) / 180;
  const dx = Math.sin(a);
  const dy = -Math.cos(a);
  const half = (Math.abs(width * dx) + Math.abs(height * dy)) / 2;
  return {
    start: { x: 0.5 - (dx * half) / width, y: 0.5 - (dy * half) / height },
    end: { x: 0.5 + (dx * half) / width, y: 0.5 + (dy * half) / height },
  };
}

/**
 * v4 fills every pastel surface (`GRADIENT_PASTEL`) with **one** gradient laid
 * down in the box's own unit square, so its CSS angle depends only on the box's
 * aspect: `90° + atan(0.56338 · w/h)`. Fitted against six v4 nodes on 홈 — the
 * journal banner (142.29°), a page dot (144.63°), score bars at two heights
 * (96.03°, 112.91°) and two progress fills (177.33°, 176.00°) — all agree to
 * 0.0001. Use it where the width is data-driven and Figma cannot say.
 */
export function pastelAngle(width: number, height: number) {
  return 90 + (Math.atan((0.56338 * width) / height) * 180) / Math.PI;
}
