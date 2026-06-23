import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { CensusTract } from '../../types/data';
import {
  bindBubbleHover,
  getIncomeHistogramTooltipContent,
  hideBubbleTooltip,
} from './bubbleTooltip';

interface IncomeHistogramProps {
  data: CensusTract[];
  cityColor: string;
  countyColor: string;
}

const CITY = 'St. Louis City';
const COUNTY = 'St. Louis County';
const fontFamily = '"IBM Plex Sans", sans-serif';

const countyXOffset: Record<string, number> = {
  [CITY]: 0,
  [COUNTY]: 15,
};

function stackIndexByTract(tracts: CensusTract[]): Map<string, number> {
  const stacks = new Map<string, number>();
  const groups = new Map<string, CensusTract[]>();

  for (const tract of tracts) {
    const key = `${tract.Midpoint}|${tract.County}`;
    const group = groups.get(key) ?? [];
    group.push(tract);
    groups.set(key, group);
  }

  for (const group of groups.values()) {
    group.forEach((tract, index) => {
      stacks.set(tract.Tract, index);
    });
  }

  return stacks;
}

function drawChart(
  container: HTMLDivElement,
  tooltip: HTMLDivElement,
  data: CensusTract[],
  cityColor: string,
  countyColor: string,
) {
  const width = container.clientWidth;
  const height = container.clientHeight;
  if (width < 80 || height < 80) return;

  container.innerHTML = '';

  const margin = { top: 20, right: 20, bottom: 44, left: 20 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const tracts = data.filter((d) => d.County === CITY || d.County === COUNTY);
  const xOffsetScale = innerWidth / 1000;

  const histXScale = d3
    .scaleLinear()
    .domain(d3.extent(tracts, (d) => d.Midpoint) as [number, number])
    .range([0, innerWidth]);

  const colorScale = d3.scaleOrdinal<string, string>([CITY, COUNTY], [cityColor, countyColor]);
  const bubbleRadius = 4;
  const stackSpacing = bubbleRadius * 2 + 1;
  const stackIndex = stackIndexByTract(tracts);

  const svg = d3
    .select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('role', 'img')
    .attr('aria-label', 'Median household income by census tract in St. Louis City and County');

  svg.append('rect').attr('width', width).attr('height', height).attr('fill', '#f6f8ff');

  const chart = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  const bubbles = chart
    .selectAll<SVGCircleElement, CensusTract>('circle')
    .data(tracts)
    .enter()
    .append('circle')
    .attr('r', bubbleRadius)
    .attr('cx', (d) => (histXScale(d.Midpoint) ?? 0) + (countyXOffset[d.County] ?? 0) * xOffsetScale)
    .attr('cy', (d) => innerHeight - bubbleRadius - (stackIndex.get(d.Tract) ?? 0) * stackSpacing)
    .attr('fill', (d) => colorScale(d.County) ?? cityColor);

  bindBubbleHover(bubbles, tooltip, { left: margin.left, top: margin.top }, width, getIncomeHistogramTooltipContent);

  const xAxis = d3
    .axisBottom(histXScale)
    .ticks(8)
    .tickFormat(d3.format('$,.0f') as (d: d3.NumberValue) => string);

  chart
    .append('g')
    .attr('transform', `translate(0,${innerHeight})`)
    .call(xAxis)
    .call((g) => g.select('.domain').attr('stroke', '#8e8d8a'))
    .call((g) => g.selectAll('.tick line').remove())
    .call((g) =>
      g.selectAll('.tick text').attr('fill', '#8e8d8a').style('font-family', fontFamily).style('font-size', '13px'),
    );
}

export function IncomeHistogram({ data, cityColor, countyColor }: IncomeHistogramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const tooltip = tooltipRef.current;
    if (!container || !tooltip || data.length === 0) return;

    const render = () => {
      hideBubbleTooltip(tooltip);
      drawChart(container, tooltip, data, cityColor, countyColor);
    };

    render();

    const resizeObserver = new ResizeObserver(render);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      hideBubbleTooltip(tooltip);
    };
  }, [data, cityColor, countyColor]);

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
