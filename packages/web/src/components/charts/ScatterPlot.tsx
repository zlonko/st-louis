import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { CensusTract } from '../../types/data';
import { colorByPctBlackFill } from '../../visualizations/colors';

interface ScatterPlotProps {
  data: CensusTract[];
}

const fontFamily = '"IBM Plex Sans", sans-serif';
const axisColor = '#8e8d8a';
const yMax = 85_000;

function linearRegression(data: CensusTract[]) {
  const n = data.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (const d of data) {
    sumX += d.PctBlack;
    sumY += d.Income;
    sumXY += d.PctBlack * d.Income;
    sumXX += d.PctBlack * d.PctBlack;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}

function drawChart(container: HTMLDivElement, data: CensusTract[]) {
  const width = container.clientWidth;
  const height = container.clientHeight;
  if (width < 80 || height < 80) return;

  container.innerHTML = '';

  const margin = { top: 20, right: 20, bottom: 44, left: 72 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const xScale = d3.scaleLinear().domain([0, 1]).range([0, innerWidth]);
  const yScale = d3.scaleLinear().domain([0, yMax]).range([innerHeight, 0]);

  const { slope, intercept } = linearRegression(data);
  const bestFitLine = [
    { x: 0, y: intercept },
    { x: 1, y: slope + intercept },
  ];

  const lineGenerator = d3
    .line<{ x: number; y: number }>()
    .x((d) => xScale(d.x) ?? 0)
    .y((d) => yScale(d.y) ?? 0);

  const svg = d3
    .select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('role', 'img')
    .attr('aria-label', 'Scatter plot of median income versus share of Black residents by census tract');

  svg.append('rect').attr('width', width).attr('height', height).attr('fill', '#f6f8ff');

  const chart = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  const yTickValues = d3.range(0, yMax + 1, 10_000);
  const xTickValues = d3.range(0, 1.01, 0.1);

  const yAxis = d3
    .axisLeft(yScale)
    .tickValues(yTickValues)
    .tickFormat(d3.format('$,.0f') as (d: d3.NumberValue) => string)
    .tickSize(-innerWidth);

  const xAxis = d3
    .axisBottom(xScale)
    .tickValues(xTickValues)
    .tickFormat(d3.format('.0%') as (d: d3.NumberValue) => string);

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
    .call((g) =>
      g.selectAll('.tick text').attr('fill', axisColor).style('font-family', fontFamily).style('font-size', '13px'),
    );

  chart
    .append('g')
    .attr('transform', `translate(0,${innerHeight})`)
    .call(xAxis)
    .call((g) => g.select('.domain').attr('stroke', axisColor))
    .call((g) => g.selectAll('.tick line').remove())
    .call((g) =>
      g.selectAll('.tick text').attr('fill', axisColor).style('font-family', fontFamily).style('font-size', '13px'),
    );

  chart
    .append('path')
    .attr('class', 'best-fit')
    .attr('fill', 'none')
    .attr('stroke', '#52719e')
    .attr('stroke-width', 3)
    .attr('opacity', 0.55)
    .attr('d', lineGenerator(bestFitLine));

  chart
    .selectAll<SVGCircleElement, CensusTract>('circle')
    .data(data)
    .enter()
    .append('circle')
    .attr('r', 4)
    .attr('cx', (d) => xScale(d.PctBlack) ?? 0)
    .attr('cy', (d) => yScale(d.Income) ?? 0)
    .attr('fill', colorByPctBlackFill);
}

export function ScatterPlot({ data }: ScatterPlotProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || data.length === 0) return;

    const render = () => drawChart(container, data);

    render();

    const resizeObserver = new ResizeObserver(render);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, [data]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full bg-article-bg"
      aria-hidden={data.length === 0}
    />
  );
}
