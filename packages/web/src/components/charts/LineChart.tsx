import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { PopulationChange } from '../../types/data';
import { useMediaQuery } from '../../hooks/useMediaQuery';

interface LineChartProps {
  data: PopulationChange[];
  cityColor: string;
  countyColor: string;
}

const margin = { top: 24, right: 24, bottom: 40, left: 72 };
const yMax = 1_000_000;
const axisColor = '#8e8d8a';
const fontFamily = '"IBM Plex Sans", sans-serif';
const xTickValues = [1880, 1900, 1950, 2000];
const yTickValues = [200_000, 400_000, 600_000, 800_000, 1_000_000];
const markerRadius = 4;
const seriesLabelFontSize = 12;

function formatYAxisTick(value: d3.NumberValue): string {
  const n = Number(value);
  if (n === 1_000_000) return '1M';
  return `${n / 1000}K`;
}

interface LineMarker {
  year: number;
  population: number;
  label: 'City' | 'County';
  color: string;
  cx: number;
  cy: number;
}

type TooltipPlacement = 'above' | 'below' | 'left' | 'right';

interface TooltipPositionOptions {
  placement?: TooltipPlacement;
  containerHeight?: number;
}

function populateTooltip(tooltip: HTMLDivElement, marker: LineMarker) {
  const labelEl = tooltip.querySelector('[data-line="label"]');
  const yearEl = tooltip.querySelector('[data-line="year"]');
  const popEl = tooltip.querySelector('[data-line="pop"]');
  if (!labelEl || !yearEl || !popEl) return;

  labelEl.textContent = marker.label;
  yearEl.textContent = String(marker.year);
  popEl.textContent = d3.format(',')(marker.population);
}

function positionTooltipBox(
  pointerX: number,
  pointerY: number,
  tooltipWidth: number,
  tooltipHeight: number,
  containerWidth: number,
  containerHeight: number,
  placement: TooltipPlacement,
) {
  const offset = 12;
  const edgePadding = 8;
  let left = pointerX + offset;
  let top = pointerY - tooltipHeight - offset;

  switch (placement) {
    case 'below':
      top = pointerY + offset;
      break;
    case 'left':
      left = pointerX - tooltipWidth - offset;
      top = pointerY - tooltipHeight / 2;
      break;
    case 'right':
      left = pointerX + offset;
      top = pointerY - tooltipHeight / 2;
      break;
    case 'above':
    default:
      break;
  }

  if (placement === 'above' || placement === 'below') {
    if (left + tooltipWidth > containerWidth - edgePadding) {
      left = pointerX - tooltipWidth - offset;
    }
    if (top < edgePadding) {
      top = pointerY + offset;
    }
    if (top + tooltipHeight > containerHeight - edgePadding) {
      top = pointerY - tooltipHeight - offset;
    }
  } else {
    if (left < edgePadding) {
      left = pointerX + offset;
    }
    if (left + tooltipWidth > containerWidth - edgePadding) {
      left = pointerX - tooltipWidth - offset;
    }
    if (top < edgePadding) {
      top = edgePadding;
    }
    if (top + tooltipHeight > containerHeight - edgePadding) {
      top = containerHeight - tooltipHeight - edgePadding;
    }
  }

  return {
    left: Math.max(edgePadding, left),
    top: Math.max(edgePadding, top),
  };
}

function showTooltip(
  tooltip: HTMLDivElement,
  marker: LineMarker,
  pointerX: number,
  pointerY: number,
  containerWidth: number,
  options: TooltipPositionOptions = {},
) {
  populateTooltip(tooltip, marker);
  tooltip.classList.remove('hidden');

  const tooltipWidth = tooltip.offsetWidth || 120;
  const tooltipHeight = tooltip.offsetHeight || 72;
  const containerHeight = options.containerHeight ?? tooltipHeight + pointerY + 24;
  const placement = options.placement ?? 'above';
  const { left, top } = positionTooltipBox(
    pointerX,
    pointerY,
    tooltipWidth,
    tooltipHeight,
    containerWidth,
    containerHeight,
    placement,
  );

  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
}

function placeStackedTooltips(
  topTooltip: HTMLDivElement,
  bottomTooltip: HTMLDivElement,
  topMarker: LineMarker,
  bottomMarker: LineMarker,
  pointerX: number,
  topPointerY: number,
  bottomPointerY: number,
  containerWidth: number,
  containerHeight: number,
) {
  populateTooltip(topTooltip, topMarker);
  populateTooltip(bottomTooltip, bottomMarker);
  topTooltip.classList.remove('hidden');
  bottomTooltip.classList.remove('hidden');

  const topHeight = topTooltip.offsetHeight || 72;
  const bottomHeight = bottomTooltip.offsetHeight || 72;
  const topWidth = topTooltip.offsetWidth || 120;
  const bottomWidth = bottomTooltip.offsetWidth || 120;
  const gap = 10;
  const offset = 12;
  const edgePadding = 8;
  const blockWidth = Math.max(topWidth, bottomWidth);
  const blockHeight = topHeight + bottomHeight + gap;
  const midY = (topPointerY + bottomPointerY) / 2;

  let left =
    pointerX + offset + blockWidth <= containerWidth - edgePadding
      ? pointerX + offset
      : pointerX - blockWidth - offset;
  left = Math.max(edgePadding, Math.min(left, containerWidth - blockWidth - edgePadding));

  let topTop = midY - blockHeight / 2;
  if (topTop < edgePadding) {
    topTop = edgePadding;
  }
  if (topTop + blockHeight > containerHeight - edgePadding) {
    topTop = containerHeight - edgePadding - blockHeight;
  }

  topTooltip.style.left = `${left}px`;
  topTooltip.style.top = `${topTop}px`;
  bottomTooltip.style.left = `${left}px`;
  bottomTooltip.style.top = `${topTop + topHeight + gap}px`;
}

function hideTooltip(tooltip: HTMLDivElement) {
  tooltip.classList.add('hidden');
}

function hideTooltips(cityTooltip: HTMLDivElement, countyTooltip: HTMLDivElement) {
  hideTooltip(cityTooltip);
  hideTooltip(countyTooltip);
}

function drawChart(
  chartContainer: HTMLDivElement,
  cityTooltip: HTMLDivElement,
  countyTooltip: HTMLDivElement,
  data: PopulationChange[],
  cityColor: string,
  countyColor: string,
  useHover: boolean,
) {
  chartContainer.innerHTML = '';

  const width = chartContainer.clientWidth;
  const height = chartContainer.clientHeight;
  if (width < 80 || height < 80) return;

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const years = data.map((d) => d.Year);
  const yearMin = Math.min(...years);
  const yearMax = Math.max(...years);

  const xScale = d3.scaleLinear().domain([yearMin, yearMax]).range([0, innerWidth]);
  const yScale = d3.scaleLinear().domain([0, yMax]).range([innerHeight, 0]);

  const svg = d3
    .select(chartContainer)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('role', 'img')
    .attr('aria-label', 'Population change in St. Louis City and St. Louis County from 1880 to 2010');

  svg.append('rect').attr('width', width).attr('height', height).attr('fill', '#f6f8ff');

  const chart = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  const xAxis = d3
    .axisBottom(xScale)
    .tickValues(xTickValues)
    .tickFormat(d3.format('d') as (d: d3.NumberValue) => string)
    .tickSize(6);

  const yAxis = d3
    .axisLeft(yScale)
    .tickValues(yTickValues)
    .tickFormat(formatYAxisTick)
    .tickSize(-innerWidth);

  chart
    .append('g')
    .attr('transform', `translate(0,${innerHeight})`)
    .call(xAxis)
    .call((g) => g.select('.domain').attr('stroke', axisColor))
    .call((g) =>
      g.selectAll('.tick text').attr('fill', axisColor).style('font-family', fontFamily).style('font-size', '14px'),
    );

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
      g.selectAll('.tick text').attr('fill', axisColor).style('font-family', fontFamily).style('font-size', '14px'),
    );

  const focusLine = chart
    .append('line')
    .attr('class', 'focus-line')
    .attr('y1', 0)
    .attr('y2', innerHeight)
    .attr('stroke', '#000000')
    .attr('stroke-width', 1)
    .attr('visibility', 'hidden')
    .attr('pointer-events', 'none');

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
    .attr('fill', 'none')
    .attr('stroke', cityColor)
    .attr('stroke-width', 3)
    .attr('opacity', 0.85)
    .attr('d', lineCity);

  chart
    .append('path')
    .datum(data)
    .attr('fill', 'none')
    .attr('stroke', countyColor)
    .attr('stroke-width', 3)
    .attr('opacity', 0.85)
    .attr('d', lineCounty);

  const markers: LineMarker[] = data.flatMap((d) => [
    {
      year: d.Year,
      population: d.PopCity,
      label: 'City' as const,
      color: cityColor,
      cx: xScale(d.Year) ?? 0,
      cy: yScale(d.PopCity) ?? 0,
    },
    {
      year: d.Year,
      population: d.PopCounty,
      label: 'County' as const,
      color: countyColor,
      cx: xScale(d.Year) ?? 0,
      cy: yScale(d.PopCounty) ?? 0,
    },
  ]);

  let activeYear: number | null = null;

  const markerLayer = chart.append('g').attr('class', 'line-markers');

  const positionPointer = (marker: LineMarker) => ({
    x: margin.left + marker.cx,
    y: margin.top + marker.cy,
    containerWidth: chartContainer.clientWidth,
  });

  const getYearMarkers = (year: number) => markers.filter((m) => m.year === year);

  const showYearTooltips = (year: number) => {
    const yearMarkers = getYearMarkers(year);
    const cityMarker = yearMarkers.find((m) => m.label === 'City');
    const countyMarker = yearMarkers.find((m) => m.label === 'County');
    const containerWidth = chartContainer.clientWidth;
    const containerHeight = chartContainer.clientHeight;
    const closeMarkers =
      cityMarker && countyMarker && Math.abs(cityMarker.cy - countyMarker.cy) < 100;

    if (!cityMarker) {
      hideTooltip(cityTooltip);
    }
    if (!countyMarker) {
      hideTooltip(countyTooltip);
    }
    if (!cityMarker && !countyMarker) return;

    if (closeMarkers && cityMarker && countyMarker) {
      const topMarker = cityMarker.cy < countyMarker.cy ? cityMarker : countyMarker;
      const bottomMarker = topMarker === cityMarker ? countyMarker : cityMarker;
      const topTooltip = topMarker === cityMarker ? cityTooltip : countyTooltip;
      const bottomTooltip = topMarker === cityMarker ? countyTooltip : cityTooltip;
      const topPos = positionPointer(topMarker);
      const bottomPos = positionPointer(bottomMarker);

      placeStackedTooltips(
        topTooltip,
        bottomTooltip,
        topMarker,
        bottomMarker,
        topPos.x,
        topPos.y,
        bottomPos.y,
        containerWidth,
        containerHeight,
      );
      return;
    }

    if (cityMarker) {
      const { x, y } = positionPointer(cityMarker);
      showTooltip(cityTooltip, cityMarker, x, y, containerWidth, { containerHeight });
    }
    if (countyMarker) {
      const { x, y } = positionPointer(countyMarker);
      showTooltip(countyTooltip, countyMarker, x, y, containerWidth, { containerHeight });
    }
  };

  const showFocusLineForYear = (year: number) => {
    const yearMarker = getYearMarkers(year)[0];
    if (!yearMarker) return;
    focusLine.attr('x1', yearMarker.cx).attr('x2', yearMarker.cx).attr('visibility', 'visible');
  };

  const hideFocusLine = () => {
    focusLine.attr('visibility', 'hidden');
  };

  const setYearMarkerRadius = (year: number | null) => {
    markerLayer
      .selectAll<SVGCircleElement, LineMarker>('circle')
      .attr('r', (d) => (year !== null && d.year === year ? markerRadius + 1 : markerRadius));
  };

  const activateYear = (year: number) => {
    showFocusLineForYear(year);
    showYearTooltips(year);
    setYearMarkerRadius(year);
  };

  const deactivateYear = () => {
    hideFocusLine();
    hideTooltips(cityTooltip, countyTooltip);
    setYearMarkerRadius(null);
  };

  const isSameYearTarget = (year: number, related: Element | null) => {
    if (!related) return false;
    const datum = d3.select(related).datum();
    if (typeof datum === 'number') return datum === year;
    if (datum && typeof datum === 'object' && 'year' in datum) {
      return (datum as LineMarker).year === year;
    }
    return false;
  };

  const bindYearActivation = <T extends d3.BaseType>(
    selection: d3.Selection<T, number, d3.BaseType, unknown>,
  ) => {
    selection
      .on('mouseenter', function () {
        activateYear(d3.select(this).datum() as number);
      })
      .on('mouseleave', function () {
        const year = d3.select(this).datum() as number;
        const related = d3.event?.relatedTarget as Element | null;
        if (isSameYearTarget(year, related)) return;
        deactivateYear();
      });
  };

  const uniqueYears = [...new Set(data.map((d) => d.Year))].sort((a, b) => a - b);

  const yearHitLayer = chart.append('g').attr('class', 'year-hit-areas');

  const yearHitSelection = yearHitLayer
    .selectAll<SVGRectElement, number>('rect')
    .data(uniqueYears)
    .enter()
    .append('rect')
    .attr('x', (year, i) => {
      const x = xScale(year) ?? 0;
      const prevX = i > 0 ? (xScale(uniqueYears[i - 1]) ?? 0) : x - 12;
      const nextX = i < uniqueYears.length - 1 ? (xScale(uniqueYears[i + 1]) ?? 0) : x + 12;
      const halfWidth = Math.min(12, (x - prevX) / 2 - 1, (nextX - x) / 2 - 1);
      return x - Math.max(halfWidth, 6);
    })
    .attr('width', (year, i) => {
      const x = xScale(year) ?? 0;
      const prevX = i > 0 ? (xScale(uniqueYears[i - 1]) ?? 0) : x - 12;
      const nextX = i < uniqueYears.length - 1 ? (xScale(uniqueYears[i + 1]) ?? 0) : x + 12;
      const halfWidth = Math.min(12, (x - prevX) / 2 - 1, (nextX - x) / 2 - 1);
      return Math.max(halfWidth, 6) * 2;
    })
    .attr('y', 0)
    .attr('height', innerHeight)
    .attr('fill', 'transparent')
    .style('cursor', 'pointer');

  const markerSelection = markerLayer
    .selectAll<SVGCircleElement, LineMarker>('circle')
    .data(markers)
    .enter()
    .append('circle')
    .attr('r', markerRadius)
    .attr('cx', (d) => d.cx)
    .attr('cy', (d) => d.cy)
    .attr('fill', '#ffffff')
    .attr('stroke', (d) => d.color)
    .attr('stroke-width', 2)
    .style('cursor', 'pointer');

  if (useHover) {
    bindYearActivation(yearHitSelection);

    markerSelection
      .on('mouseenter', function () {
        const marker = d3.select(this).datum() as LineMarker;
        activateYear(marker.year);
      })
      .on('mouseleave', function () {
        const marker = d3.select(this).datum() as LineMarker;
        const related = d3.event?.relatedTarget as Element | null;
        if (isSameYearTarget(marker.year, related)) return;
        deactivateYear();
      });
  } else {
    yearHitSelection.on('click', function () {
      d3.event?.stopPropagation();
      const year = d3.select(this).datum() as number;
      const isActive = activeYear === year;

      if (isActive) {
        activeYear = null;
        deactivateYear();
        return;
      }

      activeYear = year;
      activateYear(year);
    });

    markerSelection.on('click', function () {
      d3.event?.stopPropagation();
      const marker = d3.select(this).datum() as LineMarker;
      const isActive = activeYear === marker.year;

      if (isActive) {
        activeYear = null;
        deactivateYear();
        return;
      }

      activeYear = marker.year;
      activateYear(marker.year);
    });

    svg.on('click', () => {
      activeYear = null;
      deactivateYear();
    });
  }

  const lastPoint = data[data.length - 1];
  const labelX = innerWidth - 2;

  const labelOffset = 10;

  chart
    .append('text')
    .attr('x', labelX)
    .attr('y', (yScale(lastPoint.PopCounty) ?? 0) + labelOffset)
    .attr('text-anchor', 'end')
    .attr('dominant-baseline', 'hanging')
    .attr('fill', countyColor)
    .style('font-family', fontFamily)
    .style('font-size', `${seriesLabelFontSize}px`)
    .style('font-weight', '600')
    .text('St. Louis County');

  chart
    .append('text')
    .attr('x', labelX)
    .attr('y', (yScale(lastPoint.PopCity) ?? 0) + labelOffset)
    .attr('text-anchor', 'end')
    .attr('dominant-baseline', 'hanging')
    .attr('fill', cityColor)
    .style('font-family', fontFamily)
    .style('font-size', `${seriesLabelFontSize}px`)
    .style('font-weight', '600')
    .text('St. Louis City');
}

export function LineChart({ data, cityColor, countyColor }: LineChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const cityTooltipRef = useRef<HTMLDivElement>(null);
  const countyTooltipRef = useRef<HTMLDivElement>(null);
  const useHover = useMediaQuery('(hover: hover) and (pointer: fine)');

  useEffect(() => {
    const chartContainer = chartRef.current;
    const cityTooltip = cityTooltipRef.current;
    const countyTooltip = countyTooltipRef.current;
    if (!chartContainer || !cityTooltip || !countyTooltip || data.length === 0) return;

    const render = () => {
      hideTooltips(cityTooltip, countyTooltip);
      drawChart(chartContainer, cityTooltip, countyTooltip, data, cityColor, countyColor, useHover);
    };

    render();

    const observer = new ResizeObserver(render);
    observer.observe(chartContainer);

    return () => {
      observer.disconnect();
      hideTooltips(cityTooltip, countyTooltip);
    };
  }, [data, cityColor, countyColor, useHover]);

  const tooltipMarkup = (
    <>
      <p
        data-line="label"
        className="m-0 font-sans text-[10px] font-semibold uppercase tracking-wide text-article-text"
      />
      <p data-line="year" className="m-0 mt-1 font-sans text-base font-semibold text-heading" />
      <p data-line="pop" className="m-0 font-sans text-base text-heading" />
    </>
  );

  return (
    <div className="relative h-full min-h-[280px] w-full max-lg:aspect-[4/3]">
      <div ref={chartRef} className="h-full w-full bg-article-bg" aria-hidden={data.length === 0} />
      <div
        ref={cityTooltipRef}
        className="pointer-events-none absolute z-10 hidden min-w-[7rem] rounded bg-white px-3 py-2 shadow-md"
        role="tooltip"
      >
        {tooltipMarkup}
      </div>
      <div
        ref={countyTooltipRef}
        className="pointer-events-none absolute z-10 hidden min-w-[7rem] rounded bg-white px-3 py-2 shadow-md"
        role="tooltip"
      >
        {tooltipMarkup}
      </div>
    </div>
  );
}
