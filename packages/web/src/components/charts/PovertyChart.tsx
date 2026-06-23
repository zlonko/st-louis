import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { CensusTract } from '../../types/data';
import { colorByPctBlackFill } from '../../visualizations/colors';
import {
  computePovertyLayout,
  hasPovertyLayout,
  scalePovertyPosition,
} from '../../visualizations/chartLayouts';

export type PovertyChartColorMode = 'pctBlack' | 'county';

interface PovertyChartProps {
  data: CensusTract[];
  colorMode?: PovertyChartColorMode;
  cityColor?: string;
  countyColor?: string;
  /** Shared fallback layout when precomputed positions are unavailable. */
  sharedLayout?: Map<string, { x: number; y: number }>;
}

const CITY = 'St. Louis City';
const COUNTY = 'St. Louis County';

const fontFamily = '"IBM Plex Sans", sans-serif';
const axisColor = '#8e8d8a';

function getPovertyPosition(
  d: CensusTract,
  innerWidth: number,
  innerHeight: number,
  usePrecomputed: boolean,
  sharedLayout?: Map<string, { x: number; y: number }>,
): { x: number; y: number } {
  if (usePrecomputed) {
    return scalePovertyPosition(d, innerWidth, innerHeight);
  }
  const fallback = sharedLayout?.get(d.Tract);
  if (fallback) {
    return { x: fallback.x * innerWidth, y: fallback.y * innerHeight };
  }
  return { x: innerWidth / 2, y: innerHeight / 2 };
}

function drawChart(
  container: HTMLDivElement,
  data: CensusTract[],
  colorMode: PovertyChartColorMode,
  cityColor: string,
  countyColor: string,
  sharedLayout?: Map<string, { x: number; y: number }>,
) {
  const width = container.clientWidth;
  const height = container.clientHeight;
  if (width < 80 || height < 80) return;

  container.innerHTML = '';

  const maxRadius = Math.min(12, Math.min(width, height) * 0.022);
  const bubblePad = maxRadius + 8;
  const margin = { top: bubblePad + 20, right: 24, bottom: bubblePad + 8, left: 56 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const yMin = 0.05;
  const yMax = 0.55;
  const yScale = d3.scaleLinear().domain([yMin, yMax]).range([bubblePad, innerHeight - bubblePad]);
  const yTickValues = d3.range(yMin, yMax + 0.001, 0.05);

  const usePrecomputed = hasPovertyLayout(data);
  const layout = usePrecomputed
    ? undefined
    : (sharedLayout ?? computePovertyLayout(data, innerWidth, innerHeight, maxRadius, bubblePad));

  const popSizeScale = d3
    .scaleSqrt()
    .domain(d3.extent(data, (d) => d.Population) as [number, number])
    .range([2, maxRadius]);

  const countyColorScale = d3.scaleOrdinal<string, string>([CITY, COUNTY], [cityColor, countyColor]);
  const fill = (d: CensusTract) =>
    colorMode === 'county' ? (countyColorScale(d.County) ?? cityColor) : colorByPctBlackFill(d);

  const ariaLabel =
    colorMode === 'county'
      ? 'Bubble chart of census tracts arranged by poverty rate, colored by St. Louis City and County'
      : 'Bubble chart of census tracts arranged by poverty rate and sized by population';

  const svg = d3
    .select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('role', 'img')
    .attr('aria-label', ariaLabel);

  svg.append('rect').attr('width', width).attr('height', height).attr('fill', '#f6f8ff');

  const chart = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  const yAxis = d3
    .axisLeft(yScale)
    .tickValues(yTickValues)
    .tickFormat(d3.format('.0%') as (d: d3.NumberValue) => string)
    .tickSize(-innerWidth);

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
    .selectAll<SVGCircleElement, CensusTract>('circle')
    .data(data)
    .enter()
    .append('circle')
    .attr('r', (d) => popSizeScale(d.Population) ?? 2)
    .attr('fill', fill)
    .attr('cx', (d) => getPovertyPosition(d, innerWidth, innerHeight, usePrecomputed, layout).x)
    .attr('cy', (d) => getPovertyPosition(d, innerWidth, innerHeight, usePrecomputed, layout).y);
}

export function PovertyChart({
  data,
  colorMode = 'pctBlack',
  cityColor = '#c44d03',
  countyColor = '#7158b7',
  sharedLayout,
}: PovertyChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || data.length === 0) return;

    const render = () => drawChart(container, data, colorMode, cityColor, countyColor, sharedLayout);

    render();

    const resizeObserver = new ResizeObserver(render);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, [data, colorMode, cityColor, countyColor, sharedLayout]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full bg-article-bg"
      aria-hidden={data.length === 0}
    />
  );
}
