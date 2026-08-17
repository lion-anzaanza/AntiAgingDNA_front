import { describe, expect, it } from '@jest/globals';

import { areaPath, splinePath, type Point } from './spline';

/**
 * Both charts regenerate their curve from the point values instead of tracing
 * Figma's vector, so the invariants worth pinning are structural: the path must
 * pass through every point it was given, and `flatEnds` must actually flatten
 * the first and last tangent (that is the only thing separating 예상 성장 곡선's
 * shape from the weekly chart's).
 */
const WEEK: Point[] = [
  { x: 0, y: 50 },
  { x: 10, y: 40 },
  { x: 20, y: 45 },
  { x: 30, y: 20 },
];

/** `M x y` then one `C c1x c1y c2x c2y x y` per segment. */
function endpoints(d: string): Point[] {
  const move = d.match(/^M (-?[\d.]+) (-?[\d.]+)/);
  const points: Point[] = move ? [{ x: Number(move[1]), y: Number(move[2]) }] : [];
  for (const seg of d.matchAll(/C (?:-?[\d.]+ ){4}(-?[\d.]+) (-?[\d.]+)/g)) {
    points.push({ x: Number(seg[1]), y: Number(seg[2]) });
  }
  return points;
}

describe('splinePath', () => {
  it('passes through every point, in order', () => {
    expect(endpoints(splinePath(WEEK))).toEqual(WEEK);
  });

  it('emits one cubic per gap', () => {
    expect(splinePath(WEEK).match(/ C /g)).toHaveLength(WEEK.length - 1);
  });

  it('still passes through every point with flatEnds', () => {
    expect(endpoints(splinePath(WEEK, { flatEnds: true }))).toEqual(WEEK);
  });

  it('returns an empty path when there is nothing to draw', () => {
    expect(splinePath([])).toBe('');
    expect(splinePath([{ x: 0, y: 0 }])).toBe('');
  });

  it('draws a single segment for two points', () => {
    const d = splinePath([
      { x: 0, y: 0 },
      { x: 10, y: 10 },
    ]);
    expect(d.match(/ C /g)).toHaveLength(1);
  });

  it('flattens the first and last tangent only when asked', () => {
    const three: Point[] = [
      { x: 0, y: 55 },
      { x: 75, y: 42 },
      { x: 150, y: 29 },
    ];
    const flat = splinePath(three, { flatEnds: true });
    const curved = splinePath(three);

    // First control point shares the start's y when flat, and does not otherwise.
    const firstControlY = (d: string) => Number(d.match(/C (?:-?[\d.]+) (-?[\d.]+)/)![1]);
    expect(firstControlY(flat)).toBe(three[0].y);
    expect(firstControlY(curved)).not.toBe(three[0].y);
  });

  it('produces no NaN for a flat run of equal values', () => {
    const flatLine = [0, 1, 2, 3].map((i) => ({ x: i * 10, y: 30 }));
    expect(splinePath(flatLine)).not.toMatch(/NaN/);
  });
});

describe('areaPath', () => {
  it('closes the curve down to the baseline', () => {
    const d = areaPath(WEEK, 60);
    expect(d.startsWith(splinePath(WEEK))).toBe(true);
    expect(d.endsWith('L 30 60 L 0 60 Z')).toBe(true);
  });

  it('passes flatEnds through to the curve it reuses', () => {
    expect(areaPath(WEEK, 60, { flatEnds: true })).toContain(
      splinePath(WEEK, { flatEnds: true }),
    );
  });

  it('returns an empty path when there is nothing to fill', () => {
    expect(areaPath([], 60)).toBe('');
    expect(areaPath([{ x: 0, y: 0 }], 60)).toBe('');
  });
});
