import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { CensusTract } from '../../types/data';
import { colorByPctBlackFill } from '../../visualizations/colors';
import {
  bindBubbleHover,
  getScatterPlotTooltipContent,
  hideBubbleTooltip,
} from './bubbleTooltip';

interface ScatterPlotProps {
  data: CensusTract[];
}

const fontFamily = '"IBM Plex Sans", sans-serif';
const axisColor = '#8e8d8a';
const yMax = 85_000;
const xTickValues = [0, 0.13, 0.5, 1];

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

function drawHighBlackAnnotation(
  chart: d3.Selection<SVGGElement, unknown, null, undefined>,
  data: CensusTract[],
  xScale: d3.ScaleLinear<number, number>,
  yScale: d3.ScaleLinear<number, number>,
  innerWidth: number,
) {
  const highBlackData = data.filter((d) => d.PctBlack >= 0.5);
  if (highBlackData.length === 0) return;

  const xLeft = xScale(0.5) ?? 0;
  const xRight = innerWidth;
  const centerX = (xLeft + xRight) / 2;
  const regionMaxIncome = d3.max(highBlackData, (d) => d.Income) ?? 40_000;
  const bracketIncome = Math.min(regionMaxIncome + 18_000, 70_000);
  const bracketY = yScale(bracketIncome) ?? 0;
  const stemLength = 10;

  const annotation = chart.append('g').attr('class', 'high-black-annotation').attr('pointer-events', 'none');

  annotation
    .append('path')
    .attr(
      'd',
      `M ${xLeft} ${bracketY + stemLength} L ${xLeft} ${bracketY} L ${xRight} ${bracketY} L ${xRight} ${bracketY + stemLength}`,
    )
    .attr('fill', 'none')
    .attr('stroke', '#52719e')
    .attr('stroke-width', 1.5);

  const labelGroup = annotation.append('g').attr('transform', `translate(${centerX},${bracketY - stemLength - 10})`);

  const text = labelGroup
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('y', 0)
    .style('font-family', fontFamily)
    .style('font-size', '11px')
    .style('fill', '#4c4d4f');

  text.append('tspan').attr('x', 0).attr('dy', '-1.25em').text('The highest proportion of Black residents,');
  text.append('tspan').attr('x', 0).attr('dy', '1.25em').text('the lowest median income.');

  const bbox = text.node()!.getBBox();
  const padding = { x: 10, y: 6 };

  labelGroup
    .insert('rect', 'text')
    .attr('x', bbox.x - padding.x)
    .attr('y', bbox.y - padding.y)
    .attr('width', bbox.width + padding.x * 2)
    .attr('height', bbox.height + padding.y * 2)
    .attr('fill', '#e4e7f0')
    .attr('rx', 2);
}

function drawChart(container: HTMLDivElement, tooltip: HTMLDivElement, data: CensusTract[]) {
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

  chart
    .append('g')
    .attr('class', 'x-thresholds')
    .selectAll('line')
    .data(xTickValues)
    .enter()
    .append('line')
    .attr('x1', (d) => xScale(d) ?? 0)
    .attr('x2', (d) => xScale(d) ?? 0)
    .attr('y1', 0)
    .attr('y2', innerHeight)
    .attr('stroke', axisColor)
    .attr('stroke-opacity', 0.35)
    .attr('stroke-dasharray', '4')
    .attr('pointer-events', 'none');

  const yAxis = d3
    .axisLeft(yScale)
    .tickValues(yTickValues)
    .tickFormat(d3.format('$,.0f') as (d: d3.NumberValue) => string)
    .tickSize(-innerWidth);

  const xAxis = d3
    .axisBottom(xScale)
    .tickValues(xTickValues)
    .tickFormat((d) => `${Math.round(Number(d) * 100)}%`)
    .tickSize(6);

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
    .call((g) =>
      g.selectAll('.tick line').attr('stroke', axisColor),
    )
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
    .attr('d', lineGenerator(bestFitLine) ?? '');

  const bubbles = chart
    .selectAll<SVGCircleElement, CensusTract>('circle')
    .data(data)
    .enter()
    .append('circle')
    .attr('r', 4)
    .attr('cx', (d) => xScale(d.PctBlack) ?? 0)
    .attr('cy', (d) => yScale(d.Income) ?? 0)
    .attr('fill', colorByPctBlackFill);

  bindBubbleHover(bubbles, tooltip, { left: margin.left, top: margin.top }, width, getScatterPlotTooltipContent);

  drawHighBlackAnnotation(chart, data, xScale, yScale, innerWidth);
}

export function ScatterPlot({ data }: ScatterPlotProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const tooltip = tooltipRef.current;
    if (!container || !tooltip || data.length === 0) return;

    const render = () => {
      hideBubbleTooltip(tooltip);
      drawChart(container, tooltip, data);
    };

    render();

    const resizeObserver = new ResizeObserver(render);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      hideBubbleTooltip(tooltip);
    };
  }, [data]);

  return (
    <div className="relative h-full w-full">
      <div
        ref={containerRef}
        className="h-full w-full bg-article-bg"
        aria-hidden={data.length === 0}
      />
      <div
        ref={tooltipRef}
        className="pointer-events-none absolute z-10 hidden min-w-[7rem] rounded bg-white px-3 py-2 shadow-md"
        role="tooltip"
      >
        <p
          data-bubble="region"
          className="m-0 font-sans text-[10px] font-semibold uppercase tracking-wide text-article-text"
        />
        <p data-bubble="tract" className="m-0 mt-0.5 font-sans text-[10px] text-article-text" />
        <p data-bubble="value" className="m-0 mt-1 font-sans text-base font-semibold text-heading" />
        <p data-bubble="label" className="m-0 font-sans text-base text-heading" />
      </div>
    </div>
  );
}
