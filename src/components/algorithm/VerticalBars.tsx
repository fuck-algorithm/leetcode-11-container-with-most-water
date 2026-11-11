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

const VerticalBars: React.FC<VerticalBarsProps> = ({ heights, leftPointer, rightPointer, candidateLeftPointer, candidateRightPointer, bestLeftPointer, bestRightPointer, currentArea, limitingHeight, currentWidth, eliminatedRange, maxArea, dwellMs, isDone, showCandidate }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const viewBoxSizeRef = useRef({ width: 0, height: 0 });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [hoveredBar, setHoveredBar] = useState<{ index: number; value: number; x: number; y: number } | null>(null);
  const [showDataTable, setShowDataTable] = useState(false);

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
    const tinyViewport = element.closest('.canvas-stage')?.classList.contains('tiny-canvas') ?? false;
    const height = Math.max(1, size.height);
    const compact = size.width <= 760 || size.height < 360;
    const tinyShortPlot = tinyViewport && height < 90;
    const shortPlot = (compact && height < 200 && !tinyViewport) || tinyShortPlot;
    const hidePointers = tinyViewport || (size.width <= 760 && size.height < 660);
    const viewBoxHeight = tinyViewport && !tinyShortPlot ? 220 : shortPlot ? 220 : Math.max(220, height);
    const previousSize = viewBoxSizeRef.current;
    const headerBand = tinyViewport ? (tinyShortPlot ? 16 : 24) : compact ? (shortPlot ? 14 : 78) : 130;
    const footerBand = tinyViewport ? (tinyShortPlot ? 8 : 14) : compact ? (shortPlot ? 14 : 32) : 70;
    const effectiveHeight = shortPlot ? viewBoxHeight : height;
    const margin = { top: headerBand, right: 36, bottom: footerBand, left: 36 };
    const plotWidth = Math.max(1, width - margin.left - margin.right);
    const plotHeight = Math.max(1, effectiveHeight - margin.top - margin.bottom);
    const maxHeight = Math.max(1, ...heights);
    const drawChartLabels = !compact;
    const retired = eliminatedRange ?? [0, -1];
    const slot = plotWidth / heights.length;
    const gap = Math.min(2, slot * 0.16);
    const barWidth = Math.max(1.5, Math.min(24, slot - gap));
    const showBarValues = barWidth >= 18;
    const showBarIndices = barWidth >= 14;
    const startX = margin.left + (plotWidth - slot * heights.length) / 2;
    const plotBottom = margin.top + plotHeight;
    const y = d3.scaleLinear().domain([0, maxHeight]).range([plotBottom, margin.top + Math.min(4, plotHeight * 0.1)]);
    const visualLeft = candidateLeftPointer ?? leftPointer;
    const visualRight = candidateRightPointer ?? rightPointer;
    const leftX = startX + visualLeft * slot + barWidth / 2;
    const rightX = startX + visualRight * slot + barWidth / 2;
    const waterLeft = leftX + barWidth / 2;
    const waterRight = rightX - barWidth / 2;
    const currentHeight = Math.min(heights[visualLeft] ?? 0, heights[visualRight] ?? 0);
    const waterTop = y(limitingHeight ?? currentHeight);

    svg.attr('viewBox', `0 0 ${width} ${viewBoxHeight}`).attr('preserveAspectRatio', 'none');
    const scene = svg.selectAll<SVGGElement, number>('g.scene').data([0]).join('g').attr('class', 'scene');
    scene.attr('data-viewbox-width', width).attr('data-viewbox-height', height);
    const containerLayer = scene.selectAll<SVGGElement, number>('.layer-containers').data([0]).join('g').attr('class', 'layer-containers');
    const nodeLayer = scene.selectAll<SVGGElement, number>('.layer-nodes').data([0]).join('g').attr('class', 'layer-nodes');
    const fadeOutAndRemove = <GElement extends d3.BaseType, Datum, PElement extends d3.BaseType, PDatum>(selection: d3.Selection<GElement, Datum, PElement, PDatum>) => selection.transition('exit').duration(duration).attr('opacity', 0).on('end.cleanup', function () { d3.select(this).remove(); });
    const zoom = d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.65, 3]).on('zoom', (event) => {
      scene.attr('transform', event.transform.toString());
      const sceneSize = viewBoxSizeRef.current;
      element.closest('.canvas-stage')?.classList.toggle(
        'zoomed-stage',
        event.transform.k > 1.4 || Math.abs(event.transform.x) > sceneSize.width * 0.18 || Math.abs(event.transform.y) > sceneSize.height * 0.18,
      );
      setZoomLevel(event.transform.k);
    });
    zoomBehaviorRef.current = zoom;
    svg.call(zoom).on('dblclick.zoom', null);
    const previousTransform = d3.zoomTransform(element);
    const transform = previousTransform.k === 1 && previousTransform.x === 0 && previousTransform.y === 0
      ? d3.zoomIdentity.translate(width * 0.02, height * 0.02)
      : d3.zoomIdentity.translate(previousTransform.x * width / (previousSize.width || width), previousTransform.y * height / (previousSize.height || height)).scale(previousTransform.k);
    const constrainedTransform = zoom.constrain()(transform, [[0, 0], [width, height]], [[0, 0], [width, height]]);
    viewBoxSizeRef.current = { width, height };
    svg.call(zoom.transform, constrainedTransform);
    scene.attr('transform', constrainedTransform.toString());
    element.closest('.canvas-stage')?.classList.toggle(
      'zoomed-stage',
      constrainedTransform.k > 1.4 || Math.abs(constrainedTransform.x) > width * 0.18 || Math.abs(constrainedTransform.y) > height * 0.18,
    );

    const defs = scene.selectAll<SVGDefsElement, number>('defs').data([0]).join('defs');
    defs.selectAll('marker#pointer-arrow').data([0]).join('marker')
      .attr('id', 'pointer-arrow').attr('viewBox', '0 0 10 10').attr('refX', 8).attr('refY', 5)
      .attr('markerWidth', 7).attr('markerHeight', 7).attr('orient', 'auto-start-reverse')
      .selectAll('path').data([0]).join('path').attr('d', 'M 0 0 L 10 5 L 0 10 z').attr('fill', '#31554d');
    const waterGradient = defs.selectAll<SVGLinearGradientElement, number>('linearGradient#water-depth').data([0]).join('linearGradient')
      .attr('id', 'water-depth').attr('x1', '0').attr('x2', '0').attr('y1', '0').attr('y2', '1');
    waterGradient.selectAll('stop').data([
      { offset: '0%', color: '#45b9b0', opacity: 0.68 },
      { offset: '48%', color: '#4daab7', opacity: 0.48 },
      { offset: '100%', color: '#356985', opacity: 0.32 },
    ]).join('stop')
      .attr('offset', (stop) => stop.offset)
      .attr('stop-color', (stop) => stop.color)
      .attr('stop-opacity', (stop) => stop.opacity);
    const barColors: Record<string, string> = {
      idle: '#dce7e2', current: '#26866a', compare: '#d29a34', best: '#155d48', visited: '#b8c9c2',
    };
    const ticks = d3.ticks(0, maxHeight, 4);
    const grid = scene.selectAll<SVGGElement, number>('g.grid-layer').data([0]).join('g').attr('class', 'grid-layer').attr('display', tinyViewport ? 'none' : null);
    grid.selectAll<SVGLineElement, number>('line.grid-line').data(drawChartLabels ? ticks : []).join('line')
      .attr('class', 'grid-line').attr('x1', margin.left).attr('x2', width - margin.right)
      .transition('grid').duration(duration).attr('y1', (value) => y(value)).attr('y2', (value) => y(value));
    grid.selectAll<SVGTextElement, number>('text.grid-label').data(drawChartLabels ? ticks : []).join('text')
      .attr('class', 'grid-label').attr('x', margin.left - 10).attr('text-anchor', 'end')
      .attr('dominant-baseline', 'middle').text((value) => String(value))
      .transition('grid').duration(duration).attr('y', (value) => y(value));

    const showWater = showCandidate && visualRight > visualLeft && (limitingHeight ?? currentHeight) > 0;
    const retiredOverlay = containerLayer.selectAll<SVGRectElement, [number, number]>('rect.eliminated-range').data(
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
      .attr('width', Math.max(0, waterRight - waterLeft)).attr('height', Math.max(0, plotBottom - waterTop))
      .attr('fill', 'url(#water-depth)').attr('stroke', 'none').attr('opacity', 0.58);
    const waterSurface = scene.selectAll<SVGLineElement, boolean>('line.water-surface').data(showWater ? [true] : []);
    waterSurface.join('line').attr('class', 'water-surface').attr('display', tinyViewport ? 'none' : null).attr('opacity', 0)
      .transition('surface').duration(duration).attr('x1', waterLeft).attr('x2', waterRight).attr('y1', waterTop).attr('y2', waterTop).attr('opacity', 1);
    waterSurface.attr('stroke-width', Math.max(1.5, Math.min(3, slot * 0.22)));
    scene.selectAll<SVGLineElement, boolean>('line.water-ripple').data(showWater ? [true] : []).join('line')
      .attr('class', 'water-ripple').attr('display', tinyViewport ? 'none' : null).attr('x1', waterLeft + 7).attr('x2', Math.max(waterLeft + 7, waterRight - 7))
      .transition('ripple').duration(duration * 0.8).attr('y1', Math.min(plotBottom - 2, waterTop + 6)).attr('y2', Math.min(plotBottom - 2, waterTop + 6));
    const wallData = showWater ? [{ left: waterLeft, right: waterRight, top: waterTop }] : [];
    const containerWalls = containerLayer.selectAll<SVGPathElement, (typeof wallData)[number]>('path.container-walls').data(wallData);
    containerWalls.join('path').attr('class', 'container-walls')
      .attr('d', (wall) => `M${wall.left},${wall.top} V${plotBottom} M${wall.right},${wall.top} V${plotBottom} M${wall.left},${plotBottom} H${wall.right}`)
      .attr('fill', 'none').attr('stroke', '#42675b').attr('stroke-width', Math.max(2, Math.min(3, slot * 0.24))).attr('stroke-linecap', 'square');
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
        node.append('rect').attr('class', 'bar-shape').attr('rx', 0);
        node.append('text').attr('class', 'bar-value').attr('text-anchor', 'middle').attr('dominant-baseline', 'central');
        node.append('text').attr('class', 'bar-index').attr('text-anchor', 'middle');
        return node;
      },
      (update) => update,
      (exit) => fadeOutAndRemove(exit),
    );
    bars.interrupt('exit').attr('data-status', (item) => item.status)
      .attr('tabindex', 0).attr('role', 'img')
      .attr('aria-label', (item) => `索引 ${item.index}，高度 ${item.value}`)
      .on('pointerenter focus', function (event, item) {
        const bounds = element.getBoundingClientRect();
        setHoveredBar({ index: item.index, value: item.value, x: event.clientX - bounds.left, y: event.clientY - bounds.top });
      })
      .on('pointermove', function (event, item) {
        const bounds = element.getBoundingClientRect();
        setHoveredBar({ index: item.index, value: item.value, x: event.clientX - bounds.left, y: event.clientY - bounds.top });
      })
      .on('pointerleave blur', () => setHoveredBar(null))
      .transition('move').duration(duration).ease(d3.easeCubicOut)
      .attr('transform', (item) => `translate(${startX + item.index * slot}, 0)`).attr('opacity', 1);
    bars.select<SVGRectElement>('rect.bar-shape').transition('shape').duration(duration)
      .attr('x', gap / 2).attr('y', (item) => y(item.value)).attr('width', barWidth).attr('height', (item) => Math.max(0, plotBottom - y(item.value)))
      .attr('fill', (item) => barColors[item.status])
      .attr('stroke', 'none');
    bars.select<SVGTextElement>('text.bar-value').text((item) => String(item.value))
      .attr('display', showBarValues ? null : 'none')
      .attr('x', gap / 2 + barWidth / 2)
      .attr('y', (item) => y(item.value) - 8)
      .attr('fill', '#425b52');
    bars.select<SVGRectElement>('rect.bar-shape').attr('rx', (item) => Math.min(4, Math.max(0, plotBottom - y(item.value))));
    bars.select<SVGTextElement>('text.bar-index').attr('display', showBarIndices && !tinyViewport ? null : 'none').attr('x', gap / 2 + barWidth / 2).attr('y', plotBottom + 19).attr('font-size', tinyViewport ? 8 : null).text((item) => String(item.index));

    const pointerData = hidePointers || !showBarIndices ? [] : [
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
      .attr('transform', (item) => `translate(${startX + item.index * slot + barWidth / 2}, ${tinyViewport ? plotBottom + 2 : compact ? plotBottom + 8 : plotBottom + 25})`).attr('opacity', 1);
    pointers.select('text').attr('y', tinyViewport ? 5 : compact ? 15 : 22).text((item) => item.index === leftPointer && item.index === rightPointer ? 'L/R 相遇' : item.label);
    pointers.attr('data-status', (item) => item.index === leftPointer && item.index === rightPointer ? 'current' : item.id === 'pointer-left' ? 'current' : 'compare');

    const candidate = showCandidate && visualRight > visualLeft;
    const area = currentArea || currentHeight * (visualRight - visualLeft);
    const areaLabel = scene.selectAll<SVGTextElement, number>('text.area-label').data(candidate && (currentArea > 0 || currentHeight === 0) ? [area] : []);
    areaLabel.join('text').attr('class', 'area-label')
      .attr('text-anchor', width <= 760 ? 'start' : 'middle')
      .attr('x', width <= 760 ? margin.left + 6 : (leftX + rightX) / 2)
      .attr('y', width <= 760 ? margin.top - 10 : waterTop - 12)
      .text(`面积 ${limitingHeight ?? currentHeight} × ${currentWidth ?? (visualRight - visualLeft)} = ${area}`);
    scene.selectAll<SVGTextElement, number>('text.best-label').data([maxArea]).join('text').attr('class', 'best-label')
      .attr('x', width - margin.right).attr('y', margin.top <= 30 ? margin.top + 14 : 27).attr('text-anchor', 'end').text(`最大面积 ${maxArea}`);
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
        <button type="button" aria-expanded={showDataTable} aria-controls="height-data-table" onClick={() => setShowDataTable((shown) => !shown)}>数据表</button>
      </div>
      {hoveredBar && <div className="bar-tooltip" role="status" style={{ left: Math.min(hoveredBar.x + 14, Math.max(8, size.width - 126)), top: Math.max(8, hoveredBar.y - 42) }}><strong>高度 {hoveredBar.value}</strong><span>索引 {hoveredBar.index}</span></div>}
      {showDataTable && <div className="bar-data-table" id="height-data-table" role="region" aria-label="高度数组数据表"><strong>索引与高度</strong><div className="bar-data-grid">{heights.map((value, index) => <span key={index} aria-label={`索引 ${index}，高度 ${value}`}><small>{index}</small><b>{value}</b></span>)}</div></div>}
    </>
  );
};

export default VerticalBars;
