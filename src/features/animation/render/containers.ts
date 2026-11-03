import * as d3 from 'd3';
import type { CanvasContainer } from '../structures';

export function renderContainers(layer: SVGGElement, containers: CanvasContainer[]): void {
  const root = d3.select(layer);
  root.selectAll<SVGGElement, CanvasContainer>('g.canvas-container')
    .data(containers, (item) => item.id)
    .join('g')
    .attr('class', 'canvas-container')
    .attr('data-container-kind', (item) => item.kind)
    .attr('transform', (item) => `translate(${item.x},${item.y})`)
    .each(function (container) {
      const group = d3.select(this);
      group.selectAll<SVGTextElement, string>('text.container-title').data([container.title]).join('text')
        .attr('class', 'container-title').text((title) => title);
      group.selectAll<SVGTextElement, string>('text.container-count').data([`${container.items.length}/${container.capacity}`]).join('text')
        .attr('class', 'container-count').text((count) => count);
      group.selectAll<SVGTextElement, string>('text.container-heading').data(['容器']).join('text').attr('class', 'container-heading').text((text) => text);
      group.selectAll<SVGRectElement, number>('rect.container-slot').data(d3.range(container.capacity)).join('rect')
        .attr('class', 'container-slot').attr('x', (index) => index * 32).attr('y', 24).attr('width', 28).attr('height', 28);
      group.selectAll<SVGTextElement, string>('text.container-empty').data(container.items.length ? [] : [`空${container.kind === 'stack' ? '栈' : '队列'}`]).join('text')
        .attr('class', 'container-empty').text((text) => text);
      group.selectAll<SVGTextElement, string>('text.container-pointer').data(container.items.length ? [container.kind === 'stack' ? '栈底 → 栈顶' : '队首 → 队尾'] : []).join('text')
        .attr('class', 'container-pointer').attr('data-kind', 'container-pointer').text((text) => text);
    });
}
