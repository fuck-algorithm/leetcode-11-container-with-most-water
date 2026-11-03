import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { ProblemDescriptionModal } from '../../src/components/ProblemDescriptionModal';

afterEach(cleanup);

describe('题目描述弹窗', () => {
  it('单独打开题目描述并显示题意、示例和约束', () => {
    render(<ProblemDescriptionModal />);
    fireEvent.click(screen.getByRole('button', { name: '题目描述' }));
    expect(screen.getByRole('dialog', { name: '题目描述：盛最多水的容器' })).toBeVisible();
    expect(screen.getByText(/返回容器最多可以装多少水/)).toBeVisible();
    expect(screen.getByText(/输出：49/)).toBeVisible();
    expect(screen.getByText(/2 ≤ n ≤ 10⁵/)).toBeVisible();
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
