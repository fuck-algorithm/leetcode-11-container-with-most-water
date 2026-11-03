import { describe, expect, it } from 'vitest';
import { createQueue, createStack } from '../../src/features/animation/structures';

describe('动画辅助容器结构', () => {
  it('栈固定至少四个槽并保留栈顶元素', () => {
    const stack = createStack('s', '单调栈', 0, 0, 2, [{ id: 'a', label: '1' }, { id: 'b', label: '2' }, { id: 'c', label: '3' }, { id: 'd', label: '4' }, { id: 'e', label: '5' }]);
    expect(stack.capacity).toBe(4);
    expect(stack.items.map((item) => item.label)).toEqual(['2', '3', '4', '5']);
    expect(stack.kind).toBe('stack');
  });
  it('队列按队首顺序保留容量内元素', () => {
    const queue = createQueue('q', '队列', 0, 0, 4, Array.from({ length: 6 }, (_, index) => ({ id: String(index), label: String(index) })));
    expect(queue.items.map((item) => item.label)).toEqual(['0', '1', '2', '3']);
  });
});
