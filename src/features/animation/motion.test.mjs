import { describe, expect, it } from 'vitest';
import { MOTION, motionDuration, normalizeNodeStatus, playbackFrameDelay, resolveLegend } from './motion.ts';

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

  it('adds a visible dwell after every frame transition', () => {
    expect(playbackFrameDelay(200, 80, false)).toBe(580);
    expect(playbackFrameDelay(400, 160, false)).toBe(660);
    expect(playbackFrameDelay(800, 320, false)).toBe(1120);
    expect(playbackFrameDelay(1200, 240, false)).toBe(1440);
    expect(playbackFrameDelay(800, 144, true)).toBe(800);
  });
});
