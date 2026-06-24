import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { CensusTract } from '../../types/data';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { colorByPctBlackFill, colorByPctNWFill } from '../../visualizations/colors';
import { categories2, colors2 } from '../../visualizations/constants';
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
const headerFontFamily = '"Instrument Serif", serif';
const clusterHeadingSize = 24;

const legendItems = categories2.map((label, i) => ({
  label,
  color: colors2[i]!,
}));

function drawClusterLabel(
  chart: d3.Selection<SVGGElement, unknown, null, undefined>,
  x: number,
  y: number,
  heading: string,
  text: string,
) {
  const readoutGroup = chart.append('g').attr('transform', `translate(${x},${y})`);

  const labelText = readoutGroup
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('y', 14)
    .style('font-family', fontFamily)
    .style('font-size', '14px')
    .style('fill', '#4c4d4f')
    .text(text);

  const bbox = labelText.node()!.getBBox();
  readoutGroup
    .insert('rect', 'text')
    .attr('x', bbox.x - 10)
    .attr('y', bbox.y - 5)
    .attr('width', bbox.width + 20)
    .attr('height', bbox.height + 10)
    .attr('fill', '#e4e7f0')
    .attr('rx', 2);

  const readoutTop = y + bbox.y - 5;
  chart
    .append('text')
    .attr('x', x)
    .attr('y', readoutTop - 20)
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'auto')
    .style('font-family', headerFontFamily)
    .style('font-size', `${clusterHeadingSize}px`)
    .style('font-weight', 700)
    .style('fill', '#4c4d4f')
    .text(heading);
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

function bubbleJitterPhase(tractId: string) {
  let hash = 0;
  for (let i = 0; i < tractId.length; i += 1) {
    hash = (hash * 31 + tractId.charCodeAt(i)) | 0;
  }
  const n = Math.abs(hash);
  return {
    px: (n % 628) / 100,
    py: ((n >> 3) % 628) / 100,
    fx: 0.45 + (n % 4) * 0.1,
    fy: 0.4 + ((n >> 2) % 4) * 0.09,
    amp: 2 + (n % 5) * 0.75,
  };
}

function startBubbleJitter(
  bubbles: d3.Selection<SVGCircleElement, CensusTract, SVGGElement, unknown>,
): () => void {
  const phases = new Map(bubbles.data().map((d) => [d.Tract, bubbleJitterPhase(d.Tract)]));
  let frameId = 0;
  let cancelled = false;
  const startTime = performance.now();

  const tick = (now: number) => {
    if (cancelled) return;
    const t = (now - startTime) / 1000;
    bubbles.each(function (d) {
      const phase = phases.get(d.Tract);
      if (!phase) return;
      const baseX = Number(d3.select(this).attr('data-base-cx'));
      const baseY = Number(d3.select(this).attr('data-base-cy'));
      const dx = Math.sin(t * phase.fx + phase.px) * phase.amp;
      const dy = Math.cos(t * phase.fy + phase.py) * phase.amp;
      d3.select(this).attr('cx', baseX + dx).attr('cy', baseY + dy);
    });
    frameId = requestAnimationFrame(tick);
  };

  frameId = requestAnimationFrame(tick);

  return () => {
    cancelled = true;
    cancelAnimationFrame(frameId);
  };
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
  animate = true,
): (() => void) | undefined {
  const width = container.clientWidth;
  const height = container.clientHeight;
  if (width < 80 || height < 80) return;

  container.innerHTML = '';

  const margin = { top: 16, right: 16, bottom: 56, left: 16 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const cityCenterX = innerWidth * 0.21;
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
    .each(function (d) {
      const pos = getBubblePosition(d, innerWidth, innerHeight, usePrecomputed, layout);
      d3.select(this)
        .attr('data-base-cx', pos.x)
        .attr('data-base-cy', pos.y)
        .attr('cx', pos.x)
        .attr('cy', pos.y);
    });

  bindBubbleHover(bubbles, tooltip, { left: margin.left, top: margin.top }, width, (tract) =>
    getBubbleChartTooltipContent(tract, colorMode),
  );

  drawClusterLabel(chart, cityCenterX, innerHeight + 8, 'City', cityLabel);
  drawClusterLabel(chart, countyCenterX, innerHeight + 8, 'County', countyLabel);

  if (showLegend) {
    drawLegend(chart, innerHeight);
  }

  return animate ? startBubbleJitter(bubbles) : undefined;
}

export function BubbleChart({
  data,
  colorMode = 'county',
  cityColor = '#c44d03',
  countyColor = '#7158b7',
  cityLabel = 'Population: 311,273',
  countyLabel = 'Population: 998,684',
  showLegend = false,
  sharedLayout,
}: BubbleChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const container = containerRef.current;
    const tooltip = tooltipRef.current;
    if (!container || !tooltip || data.length === 0) return;

    let stopJitter: (() => void) | undefined;

    const render = () => {
      hideBubbleTooltip(tooltip);
      stopJitter?.();
      stopJitter = drawChart(
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
        !reducedMotion,
      );
    };

    render();

    const resizeObserver = new ResizeObserver(render);
    resizeObserver.observe(container);

    return () => {
      stopJitter?.();
      resizeObserver.disconnect();
      hideBubbleTooltip(tooltip);
    };
  }, [data, colorMode, cityColor, countyColor, cityLabel, countyLabel, showLegend, sharedLayout, reducedMotion]);

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
