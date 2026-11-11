import type { AlgorithmType, FrameSnapshot } from '../../types/algorithm';
import { generateBruteForceFrames, generateTwoPointerFrames } from '../../utils/algorithmUtils';

export interface AlgorithmSolution {
  id: AlgorithmType;
  label: string;
  shortLabel: string;
  timeComplexity: string;
  spaceComplexity: string;
  maxDemoLength?: number;
  generateFrames: (heights: number[]) => FrameSnapshot[];
}

const solutions: Record<AlgorithmType, AlgorithmSolution> = {
  twoPointer: {
    id: 'twoPointer',
    label: '双指针 O(n)',
    shortLabel: '双指针',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    generateFrames: generateTwoPointerFrames,
  },
  bruteForce: {
    id: 'bruteForce',
    label: '暴力枚举 O(n²)',
    shortLabel: '暴力枚举',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    maxDemoLength: 9,
    generateFrames: generateBruteForceFrames,
  },
};

export const solutionRegistry: readonly AlgorithmSolution[] = Object.values(solutions);

export function getSolution(id: AlgorithmType): AlgorithmSolution {
  return solutions[id];
}

export function createSolutionFrames(id: AlgorithmType, heights: number[]): FrameSnapshot[] {
  return getSolution(id).generateFrames(heights);
}

export function validateSolutionDemoInput(id: AlgorithmType, heights: number[]): { valid: boolean; error?: string } {
  const solution = getSolution(id);
  if (solution.maxDemoLength !== undefined && heights.length > solution.maxDemoLength) {
    return { valid: false, error: `${solution.shortLabel}演示最多支持 ${solution.maxDemoLength} 个高度值` };
  }
  return { valid: true };
}
