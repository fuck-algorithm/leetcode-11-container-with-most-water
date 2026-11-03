import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from '../../src/App';
import { generateTwoPointerFrames, validateInput } from '../../src/utils/algorithmUtils';

afterEach(() => { cleanup(); localStorage.clear(); vi.restoreAllMocks(); });

describe('算法演示输入与步骤注册', () => {
  it('validateInput 接受合法数组并拒绝非法边界', () => {
    expect(validateInput([1, 2])).toEqual({ valid: true });
    expect(validateInput([1])).toMatchObject({ valid: false });
    expect(validateInput([1, -2])).toMatchObject({ valid: false });
    expect(validateInput([1, 2.5])).toMatchObject({ valid: false });
  });

  it('合法输入生成稳定、有语义步骤且最终答案正确的快照', () => {
    const frames = generateTwoPointerFrames([1, 8, 6, 2, 5, 4, 8, 3, 7]);
    expect(frames.at(-1)?.maxArea).toBe(49);
    expect(new Set(frames.map((frame) => frame.operation)).size).toBeGreaterThan(2);
    for (const frame of frames) {
      expect(frame.codeAnchor).toBeTruthy();
      expect(frame.narration.length).toBeGreaterThan(10);
      expect(frame.variables).toHaveProperty('res');
    }
  });

  it('非法输入显示错误并保留当前演示数据', async () => {
    render(<App />);
    const input = screen.getByLabelText('高度数组');
    fireEvent.change(input, { target: { value: '2, nope, 4' } });
    fireEvent.click(screen.getByText('应用'));
    expect(screen.getByRole('alert')).toHaveTextContent('非负整数');
    expect(screen.getByLabelText('高度数组')).toHaveValue('2, nope, 4');
    expect(screen.getByLabelText('动画进度')).toHaveValue('0');
  });
});
