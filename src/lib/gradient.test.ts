import { describe, expect, it } from '@jest/globals';

import { cssGradientPoints, pastelAngle } from './gradient';

describe('cssGradientPoints', () => {
  it('runs 90deg edge to edge, left to right', () => {
    const { start, end } = cssGradientPoints(90, 200, 30);
    expect(start.x).toBeCloseTo(0);
    expect(end.x).toBeCloseTo(1);
    expect(start.y).toBeCloseTo(0.5);
    expect(end.y).toBeCloseTo(0.5);
  });

  it('runs 180deg top to bottom', () => {
    const { start, end } = cssGradientPoints(180, 200, 30);
    expect(start.x).toBeCloseTo(0.5);
    expect(start.y).toBeCloseTo(0);
    expect(end.y).toBeCloseTo(1);
  });

  it('reaches the far corner at 45deg on a square', () => {
    const { start, end } = cssGradientPoints(45, 100, 100);
    expect(start.x).toBeCloseTo(0);
    expect(start.y).toBeCloseTo(1);
    expect(end.x).toBeCloseTo(1);
    expect(end.y).toBeCloseTo(0);
  });

  it('keeps a steep angle steep on a wide button (v4 ButtonNextUI)', () => {
    const { start, end } = cssGradientPoints(166.3, 197.4, 27.1);
    // Mostly vertical in pixels, so the points overshoot the short side.
    expect(start.y).toBeLessThan(0);
    expect(end.y).toBeGreaterThan(1);
    expect(end.x - start.x).toBeGreaterThan(0);
    expect(end.x - start.x).toBeLessThan(0.1);
  });
});

describe('pastelAngle', () => {
  it.each([
    [197.436, 86, 142.28993590487434], // 홈 journal banner
    [10, 4, 144.62503438811186], // 홈 active page dot
    [3.309, 17.65, 96.02996149941804], // full score bar
    [3.309, 4.4125, 112.90560729829481], // 2/8 score bar
    [126.0234, 3.3094, 177.3312458466857], // progress fill, high (`1363:2077`)
    [84.0156, 3.3094, 176.00048057754012], // progress fill, mid (`1363:2111`)
  ])('reproduces Figma for %p x %p', (w, h, angle) => {
    expect(pastelAngle(w, h)).toBeCloseTo(angle, 2);
  });
});
