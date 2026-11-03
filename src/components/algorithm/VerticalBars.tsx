import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import './VerticalBars.css';
import { MOTION, motionDuration } from '../../features/animation/motion';

interface VerticalBarsProps {
  heights: number[];
  leftPointer: number;
  rightPointer: number;
  candidateLeftPointer?: number;
  candidateRightPointer?: number;
  bestLeftPointer?: number;
  bestRightPointer?: number;
  currentArea: number;
  limitingHeight?: number;
  currentWidth?: number;
  eliminatedRange?: [number, number];
  maxArea: number;
  dwellMs: number;
  isDone: boolean;
  showCandidate: boolean;
}

const palette = { idle: '#dce7e4', compare: '#e5a93d', visited: '#a9c9bf', best: '#27845e' };

const VerticalBars: React.FC<VerticalBarsProps> = ({ heights, leftPointer, rightPointer, candidateLeftPointer, candidateRightPointer, bestLeftPointer, bestRightPointer, currentArea, limitingHeight, currentWidth, eliminatedRange, maxArea, dwellMs, isDone, showCandidate }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const observer = new ResizeObserver(([entry]) => {
      setSize({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(svg);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current || heights.length === 0 || size.width === 0 || size.height === 0) return;
    const svg = d3.select(svgRef.current);
    const element = svgRef.current;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = motionDuration(MOTION.move, dwellMs, reducedMotion);
    const width = Math.max(320, size.width);
    const height = Math.max(220, size.height);
    const compact = size.width <= 760 && size.height < 220;
    const margin = { top: compact ? 24 : width <= 760 ? 178 : 165, right: 36, bottom: compact ? 45 : 70, left: 36 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;
    const maxHeight = Math.max(1, ...heights);
    const retired = eliminatedRange ?? [0, -1];
    const gap = Math.min(20, plotWidth / heights.length * 0.2);
    const barWidth = Math.max(8, (plotWidth - gap * (heights.length - 1)) / heights.length);
    const slot = barWidth + gap;
    const startX = margin.left + (plotWidth - (barWidth * heights.length + gap * (heights.length - 1))) / 2;
    const plotBottom = margin.top + plotHeight;
    const y = d3.scaleLinear().domain([0, maxHeight]).range([plotBottom, margin.top + 4]);
    const visualLeft = candidateLeftPointer ?? leftPointer;
    const visualRight = candidateRightPointer ?? rightPointer;
    const leftX = startX + visualLeft * slot + barWidth / 2;
    const rightX = startX + visualRight * slot + barWidth / 2;
    const waterLeft = leftX + barWidth / 2;
    const waterRight = rightX - barWidth / 2;
    const currentHeight = Math.min(heights[visualLeft] ?? 0, heights[visualRight] ?? 0);
    const waterTop = y(limitingHeight ?? currentHeight);

    svg.attr('viewBox', `0 0 ${width} ${height}`).attr('preserveAspectRatio', 'none');
    const scene = svg.selectAll<SVGGElement, number>('g.scene').data([0]).join('g').attr('class', 'scene');
    scene.selectAll<SVGGElement, number>('.layer-containers').data([0]).join('g').attr('class', 'layer-containers');
    scene.selectAll<SVGGElement, number>('.layer-nodes').data([0]).join('g').attr('class', 'layer-nodes');
    const fadeOutAndRemove = <GElement extends d3.BaseType, Datum, PElement extends d3.BaseType, PDatum>(selection: d3.Selection<GElement, Datum, PElement, PDatum>) => selection.transition('exit').duration(duration).attr('opacity', 0).on('end.cleanup', function () { d3.select(this).remove(); });
    const zoom = d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.65, 3]).on('zoom', (event) => {
      scene.attr('transform', event.transform.toString());
      setZoomLevel(event.transform.k);
    });
    zoomBehaviorRef.current = zoom;
    svg.call(zoom).on('dblclick.zoom', null);
    scene.attr('transform', d3.zoomTransform(element).toString());

    const nodeLayer = scene.select<SVGGElement>('.layer-nodes');
    const defs = scene.selectAll<SVGDefsElement, number>('defs').data([0]).join('defs');
    defs.selectAll('marker#pointer-arrow').data([0]).join('marker')
      .attr('id', 'pointer-arrow').attr('viewBox', '0 0 10 10').attr('refX', 8).attr('refY', 5)
      .attr('markerWidth', 7).attr('markerHeight', 7).attr('orient', 'auto-start-reverse')
      .selectAll('path').data([0]).join('path').attr('d', 'M 0 0 L 10 5 L 0 10 z').attr('fill', '#31554d');

    const ticks = d3.ticks(0, maxHeight, 4);
    const grid = scene.selectAll<SVGGElement, number>('g.grid-layer').data([0]).join('g').attr('class', 'grid-layer');
    grid.selectAll<SVGLineElement, number>('line.grid-line').data(ticks).join('line')
      .attr('class', 'grid-line').attr('x1', margin.left).attr('x2', width - margin.right)
      .transition('grid').duration(duration).attr('y1', (value) => y(value)).attr('y2', (value) => y(value));
    grid.selectAll<SVGTextElement, number>('text.grid-label').data(ticks).join('text')
      .attr('class', 'grid-label').attr('x', margin.left - 10).attr('text-anchor', 'end')
      .attr('dominant-baseline', 'middle').text((value) => String(value))
      .transition('grid').duration(duration).attr('y', (value) => y(value));

    const showWater = showCandidate && visualRight > visualLeft && (limitingHeight ?? currentHeight) > 0;
    const retiredOverlay = scene.selectAll<SVGRectElement, [number, number]>('rect.eliminated-range').data(
      eliminatedRange && eliminatedRange[1] - eliminatedRange[0] >= 0 ? [eliminatedRange] : [],
    );
    retiredOverlay.join('rect')
      .attr('class', 'eliminated-range')
      .attr('x', (range) => startX + range[0] * slot)
      .attr('y', margin.top)
      .attr('width', (range) => (range[1] - range[0] + 1) * slot - gap)
      .attr('height', plotBottom - margin.top)
      .attr('data-range', (range) => `${range[0]}-${range[1]}`);
    const water = scene.selectAll<SVGRectElement, number>('rect.water-area').data(showWater ? [currentHeight] : []);
    water.join(
      (enter) => enter.append('rect').attr('class', 'water-area').attr('opacity', 0),
      (update) => update,
      (exit) => fadeOutAndRemove(exit),
    ).interrupt('exit').transition('water').duration(duration).attr('x', waterLeft).attr('y', waterTop)
      .attr('width', Math.max(0, waterRight - waterLeft)).attr('height', Math.max(0, plotBottom - waterTop)).attr('opacity', 1);

    const data = heights.map((value, index) => {
      const isLeft = index === leftPointer;
      const isRight = index === rightPointer;
      const isBest = index === bestLeftPointer || index === bestRightPointer;
      const isEliminated = index >= retired[0] && index <= retired[1];
      const status = isDone && isBest ? 'best' : isLeft ? 'current' : isRight ? 'compare' : isBest ? 'best' : isEliminated || index < leftPointer || index > rightPointer ? 'visited' : 'idle';
      return { id: `bar-${index}`, index, value, status };
    });
    const bars = nodeLayer.selectAll<SVGGElement, (typeof data)[number]>('g.bar-node').data(data, (item) => item.id).join(
      (enter) => {
        const node = enter.append('g').attr('class', 'bar-node').attr('data-node-id', (item) => item.id).attr('opacity', 0);
        node.append('rect').attr('class', 'bar-shape').attr('rx', 7);
        node.append('text').attr('class', 'bar-value').attr('text-anchor', 'middle').attr('dominant-baseline', 'central');
        node.append('text').attr('class', 'bar-index').attr('text-anchor', 'middle');
        return node;
      },
      (update) => update,
      (exit) => fadeOutAndRemove(exit),
    );
    bars.interrupt('exit').attr('data-status', (item) => item.status)
      .transition('move').duration(duration).ease(d3.easeCubicOut)
      .attr('transform', (item) => `translate(${startX + item.index * slot}, 0)`).attr('opacity', 1);
    bars.select<SVGRectElement>('rect.bar-shape').transition('shape').duration(duration)
      .attr('y', (item) => y(item.value)).attr('width', barWidth).attr('height', (item) => Math.max(0, plotBottom - y(item.value)))
      .attr('fill', (item) => item.status === 'compare' ? palette.compare : item.status === 'current' ? '#16856b' : item.status === 'visited' ? palette.visited : item.status === 'best' ? palette.best : palette.idle)
      .attr('stroke', (item) => item.status === 'compare' ? '#a66e0b' : item.status === 'current' ? '#0f6f58' : item.status === 'best' ? '#155d43' : '#4d7168')
      .attr('stroke-width', (item) => item.status === 'compare' || item.status === 'current' || item.status === 'best' ? 2.5 : 1);
    bars.select<SVGTextElement>('text.bar-value').text((item) => String(item.value))
      .attr('y', (item) => item.value > maxHeight * 0.2 ? y(item.value) + Math.min(20, (plotBottom - y(item.value)) / 2) : y(item.value) - 13)
      .attr('fill', (item) => item.status === 'current' || item.status === 'best' ? '#fff' : '#24443b');
    bars.select<SVGTextElement>('text.bar-index').attr('y', plotBottom + 19).text((item) => String(item.index));

    const pointerData = [
      { id: 'pointer-left', label: 'L  左端', index: leftPointer },
      { id: 'pointer-right', label: 'R  右端', index: rightPointer },
    ];
    const pointers = scene.selectAll<SVGGElement, (typeof pointerData)[number]>('g.pointer').data(pointerData, (item) => item.id).join(
      (enter) => {
        const group = enter.append('g').attr('class', 'pointer').attr('opacity', 0);
        group.append('path').attr('d', 'M -7 0 L 7 0 L 0 9 Z');
        group.append('text').attr('text-anchor', 'middle');
        return group;
      },
      (update) => update,
    );
    pointers.transition('move').duration(duration).ease(d3.easeCubicOut)
      .attr('transform', (item) => `translate(${startX + item.index * slot + barWidth / 2}, ${plotBottom + 25})`).attr('opacity', 1);
    pointers.select('text').attr('y', 22).text((item) => item.index === leftPointer && item.index === rightPointer ? 'L/R 相遇' : item.label);
    pointers.attr('data-status', (item) => item.index === leftPointer && item.index === rightPointer ? 'current' : item.id === 'pointer-left' ? 'current' : 'compare');

    const candidate = showCandidate && visualRight > visualLeft;
    const area = currentArea || currentHeight * (visualRight - visualLeft);
    const areaLabel = scene.selectAll<SVGTextElement, number>('text.area-label').data(candidate ? [area] : []);
    areaLabel.join('text').attr('class', 'area-label')
      .attr('text-anchor', width <= 760 ? 'start' : 'middle')
      .attr('x', width <= 760 ? margin.left + 6 : (leftX + rightX) / 2)
      .attr('y', width <= 760 ? margin.top - 10 : waterTop - 12)
      .text(`面积 ${limitingHeight ?? currentHeight} × ${currentWidth ?? (visualRight - visualLeft)} = ${area}`);
    scene.selectAll<SVGTextElement, number>('text.best-label').data([maxArea]).join('text').attr('class', 'best-label')
      .attr('x', width - margin.right).attr('y', 27).attr('text-anchor', 'end').text(`最大面积 ${maxArea}`);
    scene.selectAll<SVGLineElement, number>('line.baseline').data([0]).join('line').attr('class', 'baseline')
      .attr('x1', margin.left).attr('x2', width - margin.right).attr('y1', plotBottom).attr('y2', plotBottom);
  }, [heights, leftPointer, rightPointer, candidateLeftPointer, candidateRightPointer, currentArea, limitingHeight, currentWidth, eliminatedRange, maxArea, bestLeftPointer, bestRightPointer, dwellMs, isDone, showCandidate, size]);

  return (
    <>
      <svg ref={svgRef} className="bars-svg" role="img" aria-label="高度数组与当前双指针容器可视化" />
      <div className="canvas-tools" aria-label="画布工具">
        <span>{Math.round(zoomLevel * 100)}%</span>
        <button type="button" aria-label="放大画布" onClick={() => { if (svgRef.current && zoomBehaviorRef.current) d3.select(svgRef.current).transition().call(zoomBehaviorRef.current.scaleBy, 1.2); }}>+</button>
        <button type="button" aria-label="缩小画布" onClick={() => { if (svgRef.current && zoomBehaviorRef.current) d3.select(svgRef.current).transition().call(zoomBehaviorRef.current.scaleBy, 1 / 1.2); }}>−</button>
        <button type="button" aria-label="重置画布视图" onClick={() => { if (svgRef.current && zoomBehaviorRef.current) d3.select(svgRef.current).transition().call(zoomBehaviorRef.current.transform, d3.zoomIdentity); }}>居中</button>
      </div>
    </>
  );
};

export default VerticalBars;
