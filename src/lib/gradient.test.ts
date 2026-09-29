import { describe, expect, it } from '@jest/globals';

import { cssGradientPoints } from './gradient';

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
