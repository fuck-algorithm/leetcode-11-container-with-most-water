import { describe, expect, it } from 'vitest';
import { MOTION, motionDuration, normalizeNodeStatus, resolveLegend } from '../../src/features/animation/motion';

describe('animation motion helpers', () => {
  it('uses motion tokens that fit dwell time', () => {
    expect(MOTION.move).toBe(360);
    expect(motionDuration(MOTION.move, 800, false)).toBeLessThanOrEqual(800 * 0.45);
    expect(motionDuration(MOTION.move, 400, false)).toBe(160);
    expect(motionDuration(MOTION.move, 800, true)).toBe(0);
  });
  it('normalizes statuses and returns fixed legend states', () => {
    expect(normalizeNodeStatus('current')).toBe('current');
    expect(resolveLegend().map((item) => item.status)).toEqual(['current', 'compare', 'visited', 'done']);
  });
});
