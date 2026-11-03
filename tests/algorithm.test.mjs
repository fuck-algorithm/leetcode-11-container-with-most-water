import { describe, expect, it } from 'vitest';
import { generateBruteForceFrames, generateTwoPointerFrames } from '../src/utils/algorithmUtils.ts';

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
      expect(frame.currentArea).toBe(Math.min(
        [1, 8, 6, 2, 5, 4, 8, 3, 7][frame.candidateLeftPointer],
        [1, 8, 6, 2, 5, 4, 8, 3, 7][frame.candidateRightPointer],
      ) * (frame.candidateRightPointer - frame.candidateLeftPointer));
      expect(frame.limitingHeight).toBe(Math.min(
        [1, 8, 6, 2, 5, 4, 8, 3, 7][frame.candidateLeftPointer],
        [1, 8, 6, 2, 5, 4, 8, 3, 7][frame.candidateRightPointer],
      ));
      expect(frame.currentWidth).toBe(frame.candidateRightPointer - frame.candidateLeftPointer);
    }
  });

  it('更新帧同步呈现新纪录、面积和最优边界', () => {
    const update = generateTwoPointerFrames([1, 2]).find((frame) => frame.operation === 'update');
    expect(update.maxArea).toBe(1);
    expect(update.variables.res).toBe(1);
    expect([update.bestLeftPointer, update.bestRightPointer]).toEqual([0, 1]);
  });

  it('暴力枚举逐一生成所有唯一边界组合的计算帧', () => {
    const heights = [3, 1, 4, 2, 5];
    const compares = generateBruteForceFrames(heights).filter((frame) => frame.operation === 'compare');
    const pairs = compares.map((frame) => `${frame.leftPointer},${frame.rightPointer}`);
    expect(pairs).toHaveLength(heights.length * (heights.length - 1) / 2);
    expect(new Set(pairs).size).toBe(pairs.length);
    for (const frame of compares) {
      const width = frame.rightPointer - frame.leftPointer;
      const waterline = Math.min(heights[frame.leftPointer], heights[frame.rightPointer]);
      expect(frame).toMatchObject({ currentWidth: width, limitingHeight: waterline, currentArea: width * waterline });
    }
  });

  it('暴力枚举移动帧只移动指针，不提前计算下一组', () => {
    const frames = generateBruteForceFrames([1, 2, 3]);
    const move = frames.find((frame) => frame.operation === 'move');
    expect(move.leftPointer).toBe(0);
    expect(move.rightPointer).toBe(2);
    expect(move.candidateRightPointer).toBe(2);
    expect(move.currentArea).toBe(0);
    expect(move.currentWidth).toBeUndefined();
    expect(move.limitingHeight).toBeUndefined();
    expect(move.variables.j).toBe(2);
    expect(move.narration).toContain('下一帧才计算');
  });

  it('短数组和重复高度也得出正确结果', () => {
    for (const heights of [[1, 1], [0, 0], [5, 1, 5], [4, 3, 2, 1]]) {
      const frames = generateTwoPointerFrames(heights);
      expect(frames.at(-1).maxArea).toBe(bruteForce(heights));
      expect(frames.at(-1).operation).toBe('done');
    }
  });
});
