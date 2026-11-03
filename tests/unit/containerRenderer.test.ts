import { describe, expect, it } from 'vitest';
import { createQueue } from '../../src/features/animation/structures';
import { renderContainers } from '../../src/features/animation/render/containers';

describe('容器 D3 渲染器', () => {
  it('显示固定槽位、容量计数及空状态', () => {
    const layer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    renderContainers(layer, [createQueue('q', '待处理队列', 10, 20, 4)]);
    expect(layer.querySelectorAll('.container-slot')).toHaveLength(4);
    expect(layer.querySelector('.container-count')?.textContent).toBe('0/4');
    expect(layer.querySelector('.container-empty')?.textContent).toBe('空队列');
    expect(layer.querySelector('[data-container-kind="queue"]')).not.toBeNull();
  });
});
