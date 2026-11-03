import { describe, expect, it } from 'vitest';
import { generateTwoPointerFrames } from '../src/utils/algorithmUtils.ts';

function bruteForce(heights) {
  let best = 0;
  for (let left = 0; left < heights.length; left += 1) {
    for (let right = left + 1; right < heights.length; right += 1) {
      best = Math.max(best, Math.min(heights[left], heights[right]) * (right - left));
    }
  }
  return best;
}

describe('双指针动画快照', () => {
  it('默认样例得出面积 49，且首尾指针收敛', () => {
    const frames = generateTwoPointerFrames([1, 8, 6, 2, 5, 4, 8, 3, 7]);
    expect(frames.at(-1).maxArea).toBe(49);
    expect(frames.at(-1).operation).toBe('done');
    expect(frames.at(-1).leftPointer).toBe(frames.at(-1).rightPointer);
  });

  it('每个快照有语义操作、解说和合法指针状态', () => {
    const frames = generateTwoPointerFrames([2, 3, 4, 5, 18, 17, 6]);
    expect(frames.length).toBeGreaterThan(3);
    for (const frame of frames) {
      expect(frame.operation).toBeTruthy();
      expect(frame.operationLabel).toBeTruthy();
      expect(frame.narration.length).toBeGreaterThanOrEqual(12);
      expect(frame.leftPointer).toBeLessThanOrEqual(frame.rightPointer);
    }
  });

  it('移动帧引用刚比较的固定候选边界', () => {
    const frames = generateTwoPointerFrames([1, 8, 6, 2, 5, 4, 8, 3, 7]);
    const moves = frames.filter((frame) => frame.operation === 'move');
    expect(moves.length).toBeGreaterThan(0);
    for (const frame of moves) {
      expect(frame.candidateLeftPointer).toBeDefined();
      expect(frame.candidateRightPointer).toBeGreaterThan(frame.candidateLeftPointer);
    }
  });

  it('短数组和重复高度也得出正确结果', () => {
    for (const heights of [[1, 1], [0, 0], [5, 1, 5], [4, 3, 2, 1]]) {
      const frames = generateTwoPointerFrames(heights);
      expect(frames.at(-1).maxArea).toBe(bruteForce(heights));
      expect(frames.at(-1).operation).toBe('done');
    }
  });
});
