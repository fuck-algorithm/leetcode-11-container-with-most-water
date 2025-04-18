import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { BarData } from '../../types/algorithm';

interface VerticalBarsProps {
  heights: number[];
  leftPointer: number;
  rightPointer: number;
  containerWidth: number;
  containerHeight: number;
}

const VerticalBars: React.FC<VerticalBarsProps> = ({
  heights,
  leftPointer,
  rightPointer,
  containerWidth,
  containerHeight
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
    
    // 准备数据
    const barData: BarData[] = heights.map((h, i) => {
      let color = '#aaa'; // 默认颜色
      let isHighlighted = false;
      
      if (i === leftPointer) {
        color = '#3498db'; // 蓝色，左指针
        isHighlighted = true;
      } else if (i === rightPointer) {
        color = '#e74c3c'; // 红色，右指针
        isHighlighted = true;
      }
      
      return { height: h, index: i, color, isHighlighted };
    });
    
    // 绘制图表容器
    const chart = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);
    
    // 绘制柱子
    chart.selectAll('.bar')
      .data(barData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d) => d.index * (barWidth + barSpacing))
      .attr('y', (d) => yScale(d.height))
      .attr('width', barWidth)
      .attr('height', (d) => height - yScale(d.height))
      .attr('fill', (d) => d.color)
      .attr('stroke', (d) => d.isHighlighted ? '#000' : 'none')
      .attr('stroke-width', 2);
    
    // 绘制底部下标
    chart.selectAll('.bar-label')
      .data(barData)
      .enter()
      .append('text')
      .attr('class', 'bar-label')
      .attr('x', (d) => d.index * (barWidth + barSpacing) + barWidth / 2)
      .attr('y', height + 20)
      .attr('text-anchor', 'middle')
      .text((d) => d.index);
    
    // 绘制高度标签
    chart.selectAll('.height-label')
      .data(barData)
      .enter()
      .append('text')
      .attr('class', 'height-label')
      .attr('x', (d) => d.index * (barWidth + barSpacing) + barWidth / 2)
      .attr('y', (d) => yScale(d.height) - 5)
      .attr('text-anchor', 'middle')
      .text((d) => d.height);
    
    // 绘制指针标签
    chart.selectAll('.pointer-label')
      .data(barData.filter(d => d.isHighlighted))
      .enter()
      .append('text')
      .attr('class', 'pointer-label')
      .attr('x', (d) => d.index * (barWidth + barSpacing) + barWidth / 2)
      .attr('y', (d) => yScale(d.height) - 20)
      .attr('text-anchor', 'middle')
      .text((d) => d.index === leftPointer ? 'i' : 'j')
      .attr('font-weight', 'bold');
  }, [heights, leftPointer, rightPointer, containerWidth, containerHeight]);
  
  return (
    <svg 
      ref={svgRef} 
      width={containerWidth} 
      height={containerHeight}
      style={{ overflow: 'visible' }}
    />
  );
};

export default VerticalBars; 