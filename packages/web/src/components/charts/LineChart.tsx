import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { PopulationChange } from '../../types/data';

interface LineChartProps {
  data: PopulationChange[];
  cityColor: string;
  countyColor: string;
}

const margin = { top: 24, right: 24, bottom: 40, left: 72 };
const yMax = 1_000_000;
const axisColor = '#8e8d8a';
const fontFamily = '"IBM Plex Sans", sans-serif';

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

  const years = data.map((d) => d.Year);
  const yearMin = Math.min(...years);
  const yearMax = Math.max(...years);

  const xScale = d3.scaleLinear().domain([yearMin, yearMax]).range([0, innerWidth]);

  const yScale = d3.scaleLinear().domain([0, yMax]).range([innerHeight, 0]);

  const svg = d3
    .select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('role', 'img')
    .attr('aria-label', 'Population change in St. Louis City and St. Louis County from 1880 to 2010');

  svg
    .append('rect')
    .attr('width', width)
    .attr('height', height)
    .attr('fill', '#f6f8ff');

  const chart = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  const xTickValues = d3.range(yearMin, yearMax + 1, 10);
  const yTickValues = d3.range(0, yMax + 1, 100_000);

  const xAxis = d3
    .axisBottom(xScale)
    .tickValues(xTickValues)
    .tickFormat(d3.format('d') as (d: d3.NumberValue) => string)
    .tickSize(6);

  const yAxis = d3
    .axisLeft(yScale)
    .tickValues(yTickValues)
    .tickFormat(d3.format(',') as (d: d3.NumberValue) => string)
    .tickSize(-innerWidth);

  chart
    .append('g')
    .attr('transform', `translate(0,${innerHeight})`)
    .call(xAxis)
    .call((g) => g.select('.domain').remove())
    .call((g) => g.selectAll('.tick text').attr('fill', axisColor).style('font-family', fontFamily).style('font-size', '14px'));

  chart
    .append('g')
    .call(yAxis)
    .call((g) => g.select('.domain').remove())
    .call((g) =>
      g
        .selectAll('.tick line')
        .attr('stroke', axisColor)
        .attr('stroke-opacity', 0.35)
        .attr('stroke-dasharray', '4'),
    )
    .call((g) => g.selectAll('.tick text').attr('fill', axisColor).style('font-family', fontFamily).style('font-size', '14px'));

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
    .attr('opacity', 0.85)
    .attr('d', lineCity);

  chart
    .append('path')
    .datum(data)
    .attr('class', 'line2')
    .attr('fill', 'none')
    .attr('stroke', countyColor)
    .attr('stroke-width', 3)
    .attr('opacity', 0.85)
    .attr('d', lineCounty);

  const countyLabelYear = 1980;
  const cityLabelYear = 1990;
  const countyPoint = data.find((d) => d.Year === countyLabelYear) ?? data[data.length - 1];
  const cityPoint = data.find((d) => d.Year === cityLabelYear) ?? data[data.length - 2];

  chart
    .append('text')
    .attr('class', 'linelabel2')
    .attr('x', (xScale(countyPoint.Year) ?? 0) + 8)
    .attr('y', (yScale(countyPoint.PopCounty) ?? 0) - 10)
    .attr('fill', countyColor)
    .style('font-family', fontFamily)
    .style('font-size', '20px')
    .style('font-weight', '600')
    .text('St. Louis County');

  chart
    .append('text')
    .attr('class', 'linelabel1')
    .attr('x', (xScale(cityPoint.Year) ?? 0) + 8)
    .attr('y', (yScale(cityPoint.PopCity) ?? 0) - 10)
    .attr('fill', cityColor)
    .style('font-family', fontFamily)
    .style('font-size', '20px')
    .style('font-weight', '600')
    .text('St. Louis City');
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
      className="h-full w-full bg-article-bg"
      aria-hidden={data.length === 0}
    />
  );
}
