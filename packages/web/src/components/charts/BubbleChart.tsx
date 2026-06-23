import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { CensusTract } from '../../types/data';
import { colorByPctBlackFill, colorByPctNWFill } from '../../visualizations/colors';
import {
  bindBubbleHover,
  getBubbleChartTooltipContent,
  hideBubbleTooltip,
} from './bubbleTooltip';
import {
  computeBubbleLayout,
  hasBubbleLayout,
  scaleBubblePosition,
} from '../../visualizations/chartLayouts';

export type BubbleChartColorMode = 'county' | 'pctNotWhite' | 'pctBlack';

interface BubbleChartProps {
  data: CensusTract[];
  colorMode?: BubbleChartColorMode;
  cityColor?: string;
  countyColor?: string;
  cityLabel?: string;
  countyLabel?: string;
  showLegend?: boolean;
  /** Shared fallback layout when precomputed positions are unavailable. */
  sharedLayout?: Map<string, { x: number; y: number }>;
}

const CITY = 'St. Louis City';
const COUNTY = 'St. Louis County';
const fontFamily = '"IBM Plex Sans", sans-serif';

const legendItems = [
  { label: '< 30% People of Color', color: '#b8c4d6' },
  { label: '> 30% People of Color', color: '#52719e' },
  { label: '> 50% People of Color', color: '#07254f' },
] as const;

function drawClusterLabel(chart: d3.Selection<SVGGElement, unknown, null, undefined>, x: number, y: number, text: string) {
  const group = chart.append('g').attr('transform', `translate(${x},${y})`);

  const labelText = group
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('y', 14)
    .style('font-family', fontFamily)
    .style('font-size', '14px')
    .style('fill', '#4c4d4f')
    .text(text);

  const bbox = labelText.node()!.getBBox();
  group
    .insert('rect', 'text')
    .attr('x', bbox.x - 10)
    .attr('y', bbox.y - 5)
    .attr('width', bbox.width + 20)
    .attr('height', bbox.height + 10)
    .attr('fill', '#e4e7f0')
    .attr('rx', 2);
}

function drawLegend(chart: d3.Selection<SVGGElement, unknown, null, undefined>, innerHeight: number) {
  const legend = chart.append('g').attr('transform', `translate(0,${innerHeight - 8})`);

  legendItems.forEach((item, i) => {
    const row = legend.append('g').attr('transform', `translate(0,${i * 22})`);

    row.append('circle').attr('cx', 6).attr('cy', 0).attr('r', 6).attr('fill', item.color);

    row
      .append('text')
      .attr('x', 18)
      .attr('y', 4)
      .style('font-family', fontFamily)
      .style('font-size', '12px')
      .style('fill', '#4c4d4f')
      .text(item.label);
  });
}

function getBubblePosition(
  d: CensusTract,
  innerWidth: number,
  innerHeight: number,
  usePrecomputed: boolean,
  sharedLayout?: Map<string, { x: number; y: number }>,
): { x: number; y: number } {
  if (usePrecomputed) {
    return scaleBubblePosition(d, innerWidth, innerHeight);
  }
  const fallback = sharedLayout?.get(d.Tract);
  if (fallback) {
    return { x: fallback.x * innerWidth, y: fallback.y * innerHeight };
  }
  return { x: innerWidth / 2, y: innerHeight / 2 };
}

function drawChart(
  container: HTMLDivElement,
  tooltip: HTMLDivElement,
  data: CensusTract[],
  colorMode: BubbleChartColorMode,
  cityColor: string,
  countyColor: string,
  cityLabel: string,
  countyLabel: string,
  showLegend: boolean,
  sharedLayout?: Map<string, { x: number; y: number }>,
) {
  const width = container.clientWidth;
  const height = container.clientHeight;
  if (width < 80 || height < 80) return;

  container.innerHTML = '';

  const margin = { top: 16, right: 16, bottom: 56, left: 16 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const cityCenterX = innerWidth * 0.2;
  const countyCenterX = innerWidth * 0.75;

  const tracts = data.filter((d) => d.County === CITY || d.County === COUNTY);
  const usePrecomputed = hasBubbleLayout(tracts);
  const layout = usePrecomputed
    ? undefined
    : (sharedLayout ?? computeBubbleLayout(tracts, innerWidth, innerHeight));

  const maxRadius = Math.min(12, Math.min(innerWidth, innerHeight) * 0.026);
  const popSizeScale = d3
    .scaleSqrt()
    .domain(d3.extent(tracts, (d) => d.Population) as [number, number])
    .range([2, maxRadius]);

  const countyColorScale = d3.scaleOrdinal<string, string>([CITY, COUNTY], [cityColor, countyColor]);
  const fill = (d: CensusTract) => {
    if (colorMode === 'pctNotWhite') return colorByPctNWFill(d);
    if (colorMode === 'pctBlack') return colorByPctBlackFill(d);
    return countyColorScale(d.County) ?? cityColor;
  };

  const ariaLabel =
    colorMode === 'pctNotWhite'
      ? 'Bubble chart of census tracts colored by share of people of color in St. Louis City and County'
      : colorMode === 'pctBlack'
        ? 'Bubble chart of census tracts colored by share of Black residents in St. Louis City and County'
        : 'Bubble chart of census tracts grouped by St. Louis City and St. Louis County population';

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

  const bubbles = chart
    .selectAll<SVGCircleElement, CensusTract>('circle')
    .data(tracts)
    .enter()
    .append('circle')
    .attr('r', (d) => popSizeScale(d.Population) ?? 2)
    .attr('fill', fill)
    .attr('cx', (d) => getBubblePosition(d, innerWidth, innerHeight, usePrecomputed, layout).x)
    .attr('cy', (d) => getBubblePosition(d, innerWidth, innerHeight, usePrecomputed, layout).y);

  bindBubbleHover(bubbles, tooltip, { left: margin.left, top: margin.top }, width, (tract) =>
    getBubbleChartTooltipContent(tract, colorMode),
  );

  drawClusterLabel(chart, cityCenterX, innerHeight + 8, cityLabel);
  drawClusterLabel(chart, countyCenterX, innerHeight + 8, countyLabel);

  if (showLegend) {
    drawLegend(chart, innerHeight);
  }
}

export function BubbleChart({
  data,
  colorMode = 'county',
  cityColor = '#c44d03',
  countyColor = '#7158b7',
  cityLabel = 'City Population: 311,273',
  countyLabel = 'County Population: 998,684',
  showLegend = false,
  sharedLayout,
}: BubbleChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const tooltip = tooltipRef.current;
    if (!container || !tooltip || data.length === 0) return;

    const render = () => {
      hideBubbleTooltip(tooltip);
      drawChart(
        container,
        tooltip,
        data,
        colorMode,
        cityColor,
        countyColor,
        cityLabel,
        countyLabel,
        showLegend,
        sharedLayout,
      );
    };

    render();

    const resizeObserver = new ResizeObserver(render);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      hideBubbleTooltip(tooltip);
    };
  }, [data, colorMode, cityColor, countyColor, cityLabel, countyLabel, showLegend, sharedLayout]);

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
