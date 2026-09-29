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
  const a = (angleDeg * Math.PI) / 180;
  const dx = Math.sin(a);
  const dy = -Math.cos(a);
  const half = (Math.abs(width * dx) + Math.abs(height * dy)) / 2;
  return {
    start: { x: 0.5 - (dx * half) / width, y: 0.5 - (dy * half) / height },
    end: { x: 0.5 + (dx * half) / width, y: 0.5 + (dy * half) / height },
  };
}
