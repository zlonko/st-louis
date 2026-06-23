import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { PopulationChange } from '../../types/data';

interface LineChartProps {
  data: PopulationChange[];
  cityColor: string;
  countyColor: string;
}

const margin = { top: 20, right: 20, bottom: 44, left: 64 };

function drawChart(
  container: HTMLDivElement,
  data: PopulationChange[],
  cityColor: string,
  countyColor: string,
) {
  container.innerHTML = '';

  const width = container.clientWidth;
  const height = container.clientHeight;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const xScale = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => d.Year) as [number, number])
    .range([0, innerWidth]);

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => Math.max(d.PopCity, d.PopCounty))!])
    .nice()
    .range([innerHeight, 0]);

  const svg = d3
    .select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('role', 'img')
    .attr('aria-label', 'Population change in St. Louis City and St. Louis County from 1880 to 2010');

  const chart = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  const xAxis = d3
    .axisBottom(xScale)
    .tickFormat(d3.format('d') as (d: d3.NumberValue) => string)
    .ticks(data.length > 10 ? 8 : data.length);

  const yAxis = d3
    .axisLeft(yScale)
    .ticks(5)
    .tickFormat(d3.format('.2s') as (d: d3.NumberValue) => string);

  chart
    .append('g')
    .attr('transform', `translate(0,${innerHeight})`)
    .call(xAxis)
    .call((g) => g.select('.domain').remove())
    .call((g) => g.selectAll('.tick line').remove())
    .attr('class', 'font-sans text-xs text-gray-500');

  chart
    .append('g')
    .call(yAxis)
    .call((g) => g.select('.domain').remove())
    .call((g) =>
      g
        .selectAll('.tick line')
        .attr('x2', innerWidth)
        .attr('stroke-opacity', 0.15)
        .attr('stroke-dasharray', '4'),
    )
    .attr('class', 'font-sans text-xs text-gray-500');

  chart
    .append('text')
    .attr('x', innerWidth / 2)
    .attr('y', innerHeight + 36)
    .attr('text-anchor', 'middle')
    .attr('class', 'font-sans text-xs fill-gray-600')
    .text('Year');

  chart
    .append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', -innerHeight / 2)
    .attr('y', -48)
    .attr('text-anchor', 'middle')
    .attr('class', 'font-sans text-xs fill-gray-600')
    .text('Population');

  const lineCity = d3
    .line<PopulationChange>()
    .x((d) => xScale(d.Year) ?? 0)
    .y((d) => yScale(d.PopCity) ?? 0);

  const lineCounty = d3
    .line<PopulationChange>()
    .x((d) => xScale(d.Year) ?? 0)
    .y((d) => yScale(d.PopCounty) ?? 0);

  chart
    .append('path')
    .datum(data)
    .attr('class', 'line1')
    .attr('fill', 'none')
    .attr('stroke', cityColor)
    .attr('stroke-width', 3)
    .attr('d', lineCity);

  chart
    .append('path')
    .datum(data)
    .attr('class', 'line2')
    .attr('fill', 'none')
    .attr('stroke', countyColor)
    .attr('stroke-width', 3)
    .attr('d', lineCounty);

  const legend = chart
    .append('g')
    .attr('transform', `translate(${innerWidth - 160}, 0)`);

  const legendItems = [
    { label: 'St. Louis City', color: cityColor },
    { label: 'St. Louis County', color: countyColor },
  ];

  legendItems.forEach((item, i) => {
    const row = legend.append('g').attr('transform', `translate(0, ${i * 22})`);

    row
      .append('line')
      .attr('x1', 0)
      .attr('x2', 20)
      .attr('y1', 8)
      .attr('y2', 8)
      .attr('stroke', item.color)
      .attr('stroke-width', 3);

    row
      .append('text')
      .attr('x', 28)
      .attr('y', 12)
      .attr('class', 'font-sans text-xs fill-gray-700')
      .text(item.label);
  });
}

export function LineChart({ data, cityColor, countyColor }: LineChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || data.length === 0) return;

    const render = () => drawChart(container, data, cityColor, countyColor);

    render();

    const observer = new ResizeObserver(render);
    observer.observe(container);

    return () => observer.disconnect();
  }, [data, cityColor, countyColor]);

  return (
    <div
      ref={containerRef}
      className="aspect-[4/3] w-full rounded bg-white"
      aria-hidden={data.length === 0}
    />
  );
}
