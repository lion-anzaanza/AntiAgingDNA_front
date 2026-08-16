/**
 * Catmull-Rom through a list of points, emitted as cubic beziers.
 *
 * Both charts in the app — 일지's `주간_컨디션_그래프` and 개선책's
 * `예상 성장 곡선` — are hand-drawn vectors in Figma. Regenerating the curve
 * from the point values rather than tracing the vector keeps them ready for
 * real data, and lands within about a point of what Figma drew.
 */
export type Point = { x: number; y: number };

/**
 * `flatEnds` levels the tangent at the first and last point. With only three
 * points a plain Catmull-Rom starts climbing immediately, where the 예상 성장
 * 곡선 Figma drew sits flat, eases into the rise and flattens again — so the
 * forecast passes it and the seven-point weekly chart does not.
 */
export function splinePath(points: Point[], { flatEnds = false } = {}) {
  if (points.length < 2) return '';
  const last = points.length - 1;
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < last; i += 1) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1 =
      flatEnds && i === 0
        ? { x: p1.x + (p2.x - p1.x) / 3, y: p1.y }
        : { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 =
      flatEnds && i === last - 1
        ? { x: p2.x - (p2.x - p1.x) / 3, y: p2.y }
        : { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += ` C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${p2.x} ${p2.y}`;
  }
  return d;
}

/** The same curve, dropped to a baseline and closed, for the area fill beneath it. */
export function areaPath(points: Point[], baseline: number, options?: { flatEnds?: boolean }) {
  if (points.length < 2) return '';
  const last = points[points.length - 1];
  return `${splinePath(points, options)} L ${last.x} ${baseline} L ${points[0].x} ${baseline} Z`;
}
