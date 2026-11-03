import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { AlgorithmThoughtModal } from '../../src/components/AlgorithmThoughtModal';

afterEach(cleanup);

describe('算法思路弹窗', () => {
  it('独立展示双指针决策理由与正确性说明', () => {
    render(<AlgorithmThoughtModal />);
    fireEvent.click(screen.getByRole('button', { name: '算法思路' }));
    expect(screen.getByRole('dialog', { name: '算法思路：双指针为什么正确？' })).toBeVisible();
    expect(screen.getByText('为什么移动短边')).toBeVisible();
    expect(screen.getByText('为什么不漏掉答案')).toBeVisible();
    expect(screen.getByText(/min\(1, 7\) × 8 = 8/)).toBeVisible();
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
