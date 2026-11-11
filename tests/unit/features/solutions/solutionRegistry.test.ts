import { describe, expect, it } from 'vitest';
import { createSolutionFrames, solutionRegistry, validateSolutionDemoInput } from '../../../../src/features/solutions/solutionRegistry';

const heights = [1, 8, 6, 2, 5, 4, 8, 3, 7];

describe('solutionRegistry', () => {
  it('exposes independent solution metadata and frame generators', () => {
    expect(solutionRegistry.map(({ id }) => id)).toEqual(['twoPointer', 'bruteForce']);
    expect(solutionRegistry.every((solution) => solution.timeComplexity && solution.spaceComplexity)).toBe(true);
    expect(createSolutionFrames('twoPointer', heights)).not.toBe(createSolutionFrames('bruteForce', heights));
  });

  it('keeps every generated frame semantically addressable', () => {
    for (const solution of solutionRegistry) {
      const frames = solution.generateFrames(heights);
      expect(frames.at(-1)?.maxArea).toBe(49);
      expect(frames.every((frame) => frame.operation && frame.narration.length > 10 && frame.codeAnchor)).toBe(true);
      expect(new Set(frames.map((frame) => frame.codeAnchor)).size).toBeGreaterThan(1);
    }
  });

  it('validates solution-specific demo limits without limiting the algorithm input', () => {
    expect(validateSolutionDemoInput('twoPointer', Array(100).fill(1))).toEqual({ valid: true });
    expect(validateSolutionDemoInput('bruteForce', Array(9).fill(1))).toEqual({ valid: true });
    expect(validateSolutionDemoInput('bruteForce', Array(10).fill(1))).toMatchObject({ valid: false });
  });
});
