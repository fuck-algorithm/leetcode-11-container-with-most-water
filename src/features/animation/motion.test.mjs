import { describe, expect, it } from 'vitest';
import { MOTION, motionDuration, normalizeNodeStatus, resolveLegend } from './motion.ts';

describe('motion tokens', () => {
  it('defines bounded semantic durations', () => {
    expect(MOTION.move).toBe(360);
    expect(MOTION.move).toBeLessThanOrEqual(800 * 0.45);
  });

  it('returns zero for reduced motion', () => {
    expect(motionDuration(MOTION.move, 800, true)).toBe(0);
  });

  it('normalizes semantic status and returns fixed legend', () => {
    expect(normalizeNodeStatus('current')).toBe('current');
    expect(resolveLegend().map((item) => item.status)).toEqual(['current', 'compare', 'visited', 'done']);
  });

  it('scales duration with playback speed and dwell budget', () => {
    expect(motionDuration(MOTION.move, 400, false)).toBe(160);
    expect(motionDuration(MOTION.move, 1600, false)).toBe(180);
    expect(motionDuration(MOTION.move, 100, false)).toBe(40);
  });
});
