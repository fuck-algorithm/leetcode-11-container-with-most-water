export const MOTION = {
  enter: 220,
  move: 360,
  exit: 180,
  state: 240,
} as const;

export const MIN_FRAME_DWELL_MS = 500;

export type NodeStatus = 'idle' | 'current' | 'compare' | 'visited' | 'done' | 'path' | 'error';
export const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export function motionDuration(baseMs: number, dwellMs: number, reducedMotion: boolean): number {
  if (reducedMotion) return 0;
  const preferred = baseMs * (800 / Math.max(1, dwellMs));
  return Math.max(0, Math.min(preferred, dwellMs * 0.4));
}

export function playbackFrameDelay(dwellMs: number, transitionMs: number, reducedMotion: boolean): number {
  const visibleDwell = Math.max(dwellMs, MIN_FRAME_DWELL_MS);
  return visibleDwell + (reducedMotion ? 0 : transitionMs);
}
export function normalizeNodeStatus(status: NodeStatus): NodeStatus { return status; }
export function resolveLegend() {
  return [
    { status: 'current', label: '当前焦点' },
    { status: 'compare', label: '比较对象' },
    { status: 'visited', label: '已排除' },
    { status: 'done', label: '最优解' },
  ] as const;
}
