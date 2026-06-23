import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { CensusTract } from '../../types/data';

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

function drawChart(
  container: HTMLDivElement,
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

  const histYScale = d3
    .scaleLinear()
    .domain(d3.extent(tracts, (d) => d.HistCol) as [number, number])
    .range([innerHeight, 0]);

  const colorScale = d3.scaleOrdinal<string, string>([CITY, COUNTY], [cityColor, countyColor]);
  const bubbleRadius = 4;

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

  chart
    .selectAll<SVGCircleElement, CensusTract>('circle')
    .data(tracts)
    .enter()
    .append('circle')
    .attr('r', bubbleRadius)
    .attr('cx', (d) => (histXScale(d.Midpoint) ?? 0) + (countyXOffset[d.County] ?? 0) * xOffsetScale)
    .attr('cy', (d) => histYScale(d.HistCol) ?? 0)
    .attr('fill', (d) => colorScale(d.County) ?? cityColor);

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

  useEffect(() => {
    const container = containerRef.current;
    if (!container || data.length === 0) return;

    const render = () => drawChart(container, data, cityColor, countyColor);

    render();

    const resizeObserver = new ResizeObserver(render);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, [data, cityColor, countyColor]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full bg-article-bg"
      aria-hidden={data.length === 0}
    />
  );
}
