import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface WaterContainerProps {
  heights: number[];
  leftPointer: number;
  rightPointer: number;
  containerWidth: number;
  containerHeight: number;
  currentArea: number;
  maxArea: number;
}

const WaterContainer: React.FC<WaterContainerProps> = ({
  heights,
  leftPointer,
  rightPointer,
  containerWidth,
  containerHeight,
  currentArea,
  maxArea
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    // 清除先前的绘制
    d3.select(svgRef.current).selectAll('*').remove();
    
    // 设置画布
    const svg = d3.select(svgRef.current);
    
    // 计算比例尺和间距
    const margin = { top: 20, right: 20, bottom: 30, left: 30 };
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;
    
    // 计算柱子宽度和间距
    const barWidth = width / heights.length * 0.7;
    const barSpacing = width / heights.length * 0.3;
    
    // 创建比例尺
    const maxHeight = Math.max(...heights);
    const yScale = d3.scaleLinear()
      .domain([0, maxHeight])
      .range([height, 0]);
    
    // 绘制图表容器
    const chart = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);
    
    // 计算水容器数据
    if (leftPointer < rightPointer) {
      const containerHeight = Math.min(heights[leftPointer], heights[rightPointer]);
      const containerWidth = (rightPointer - leftPointer) * (barWidth + barSpacing);
      const containerX = leftPointer * (barWidth + barSpacing);
      const containerY = yScale(containerHeight);
      const area = containerHeight * (rightPointer - leftPointer);
      const isMaxArea = area === maxArea && maxArea > 0;
      
      // 绘制水容器
      chart.append('rect')
        .attr('x', containerX)
        .attr('y', containerY)
        .attr('width', containerWidth)
        .attr('height', height - containerY)
        .attr('fill', isMaxArea ? 'rgba(46, 204, 113, 0.5)' : 'rgba(52, 152, 219, 0.5)')
        .attr('stroke', isMaxArea ? '#27ae60' : '#2980b9')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', isMaxArea ? '5,5' : '0');
      
      // 绘制面积标签
      chart.append('text')
        .attr('x', containerX + containerWidth / 2)
        .attr('y', containerY - 10)
        .attr('text-anchor', 'middle')
        .attr('font-weight', 'bold')
        .attr('fill', isMaxArea ? '#27ae60' : '#2980b9')
        .text(`面积: ${area}${isMaxArea ? ' (最大)' : ''}`);
      
      // 绘制高度标签
      chart.append('text')
        .attr('x', containerX - 10)
        .attr('y', containerY + (height - containerY) / 2)
        .attr('text-anchor', 'end')
        .attr('dominant-baseline', 'middle')
        .text(`高度: ${containerHeight}`);
      
      // 绘制宽度标签
      chart.append('text')
        .attr('x', containerX + containerWidth / 2)
        .attr('y', height + 15)
        .attr('text-anchor', 'middle')
        .text(`宽度: ${rightPointer - leftPointer}`);
    }
    
    // 绘制说明文本
    if (maxArea > 0) {
      chart.append('text')
        .attr('x', width / 2)
        .attr('y', 0)
        .attr('text-anchor', 'middle')
        .attr('font-weight', 'bold')
        .text(`当前最大面积: ${maxArea}`);
    }
  }, [heights, leftPointer, rightPointer, containerWidth, containerHeight, currentArea, maxArea]);
  
  return (
    <svg 
      ref={svgRef} 
      width={containerWidth} 
      height={containerHeight}
      style={{ overflow: 'visible' }}
    />
  );
};

export default WaterContainer; 