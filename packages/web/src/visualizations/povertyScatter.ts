import * as d3 from 'd3';
import { VIEWBOX } from './constants';
import { colorByPctBlackFill } from './colors';
import type { VizContext } from './types';
import { clean } from './utils/clean';
import { renderCategoryLegend } from './utils/legends';
import { settleSimulation } from './utils/simulation';

export function activatePovertyScatter(ctx: VizContext): void {
  const { simulation, svg, scales, legendId } = ctx;
  const { popScale, popSizeScale, pctPovertyScale, categoryColorScale3 } = scales;

  svg.attr('viewBox', VIEWBOX);
  clean(svg, 'isBubble');

  simulation
    .force('forceX', d3.forceY((d) => pctPovertyScale(d.PctPoverty) - 50))
    .force('forceY', d3.forceX(550))
    .force('collide', d3.forceCollide((d) => popSizeScale(d.Population) + 1))
    .alphaDecay(0.05);

  svg
    .selectAll('circle')
    .attr('r', (d) => popScale(d.Population) * 0.02)
    .attr('fill', colorByPctBlackFill);

  settleSimulation(simulation);

  svg.select('.poverty-y-axis').attr('opacity', 0.5);

  if (legendId) {
    renderCategoryLegend(legendId, 'categoryLegend5', categoryColorScale3, 20, 50);
  }
}
