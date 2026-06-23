import * as d3 from 'd3';
import type { CensusTract } from '../../types/data';

export interface BubbleTooltipContent {
  regionLabel: 'City' | 'County';
  tractNumber: string;
  value: string;
  dataLabel: string;
}

const CITY = 'St. Louis City';

export function formatTractNumber(tract: string): string {
  const padded = tract.replace(/\D/g, '').padStart(6, '0').slice(-6);
  const base = Number(padded.slice(0, 4));
  const suffix = padded.slice(4, 6);
  if (suffix === '00') return String(base);
  return `${base}.${suffix}`;
}

export function countyToRegionLabel(county: string): 'City' | 'County' {
  return county === CITY ? 'City' : 'County';
}

export function formatPopulation(value: number): string {
  return d3.format(',')(value);
}

export function formatPercent(value: number): string {
  return d3.format('.0%')(value);
}

export function formatIncome(value: number): string {
  return d3.format('$,.0f')(value);
}

export function getBubbleChartTooltipContent(
  tract: CensusTract,
  colorMode: 'county' | 'pctNotWhite' | 'pctBlack',
): BubbleTooltipContent {
  const regionLabel = countyToRegionLabel(tract.County);

  if (colorMode === 'pctNotWhite') {
    return {
      regionLabel,
      tractNumber: formatTractNumber(tract.Tract),
      value: formatPercent(tract.PctNotWhite),
      dataLabel: 'People of Color',
    };
  }

  if (colorMode === 'pctBlack') {
    return {
      regionLabel,
      tractNumber: formatTractNumber(tract.Tract),
      value: formatPercent(tract.PctBlack),
      dataLabel: 'Black Residents',
    };
  }

  return {
    regionLabel,
    tractNumber: formatTractNumber(tract.Tract),
    value: formatPopulation(tract.Population),
    dataLabel: 'Population',
  };
}

export function getPovertyChartTooltipContent(tract: CensusTract): BubbleTooltipContent {
  return {
    regionLabel: countyToRegionLabel(tract.County),
    tractNumber: formatTractNumber(tract.Tract),
    value: formatPercent(tract.PctPoverty),
    dataLabel: 'Poverty Rate',
  };
}

export function getIncomeHistogramTooltipContent(tract: CensusTract): BubbleTooltipContent {
  return {
    regionLabel: countyToRegionLabel(tract.County),
    tractNumber: formatTractNumber(tract.Tract),
    value: formatIncome(tract.Income),
    dataLabel: 'Median Income',
  };
}

export function getScatterPlotTooltipContent(tract: CensusTract): BubbleTooltipContent {
  return {
    regionLabel: countyToRegionLabel(tract.County),
    tractNumber: formatTractNumber(tract.Tract),
    value: formatIncome(tract.Income),
    dataLabel: 'Median Income',
  };
}

export function showBubbleTooltip(
  tooltip: HTMLDivElement,
  content: BubbleTooltipContent,
  pointerX: number,
  pointerY: number,
  containerWidth: number,
) {
  const regionEl = tooltip.querySelector('[data-bubble="region"]');
  const tractEl = tooltip.querySelector('[data-bubble="tract"]');
  const valueEl = tooltip.querySelector('[data-bubble="value"]');
  const labelEl = tooltip.querySelector('[data-bubble="label"]');
  if (!regionEl || !tractEl || !valueEl || !labelEl) return;

  regionEl.textContent = content.regionLabel;
  tractEl.textContent = `Tract #${content.tractNumber}`;
  valueEl.textContent = content.value;
  labelEl.textContent = content.dataLabel;

  tooltip.classList.remove('hidden');

  const tooltipWidth = tooltip.offsetWidth || 120;
  const tooltipHeight = tooltip.offsetHeight || 88;
  const offset = 12;
  const edgePadding = 8;
  let left = pointerX + offset;
  let top = pointerY - tooltipHeight - offset;

  if (left + tooltipWidth > containerWidth - edgePadding) {
    left = pointerX - tooltipWidth - offset;
  }
  if (top < edgePadding) {
    top = pointerY + offset;
  }

  tooltip.style.left = `${Math.max(edgePadding, left)}px`;
  tooltip.style.top = `${Math.max(edgePadding, top)}px`;
}

export function hideBubbleTooltip(tooltip: HTMLDivElement) {
  tooltip.classList.add('hidden');
}

export function bindBubbleHover<T extends d3.BaseType>(
  selection: d3.Selection<SVGCircleElement, CensusTract, T, unknown>,
  tooltip: HTMLDivElement,
  chartOffset: { left: number; top: number },
  containerWidth: number,
  getContent: (tract: CensusTract) => BubbleTooltipContent,
) {
  selection
    .style('cursor', 'pointer')
    .on('mouseenter', function () {
      const tract = d3.select(this).datum() as CensusTract;
      d3.select(this).attr('stroke', '#000000').attr('stroke-width', 2);
      const cx = Number(d3.select(this).attr('cx'));
      const cy = Number(d3.select(this).attr('cy'));
      showBubbleTooltip(
        tooltip,
        getContent(tract),
        chartOffset.left + cx,
        chartOffset.top + cy,
        containerWidth,
      );
    })
    .on('mouseleave', function () {
      d3.select(this).attr('stroke', null).attr('stroke-width', null);
      hideBubbleTooltip(tooltip);
    });
}
