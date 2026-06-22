import * as d3 from 'd3';
import { colorByPctBlackFill } from './colors';
import type { VizContext } from './types';
import { clean } from './utils/clean';
import { renderCategoryLegend } from './utils/legends';

export function activatePovertyScatter(ctx: VizContext): void {
  const { simulation, svg, scales } = ctx;
  const { popScale, popSizeScale, pctPovertyScale, categoryColorScale3 } = scales;

  svg.attr('viewBox', '-100 0 1350 1900');
  clean(svg, 'isBubble');

  simulation
    .force('forceX', d3.forceY((d) => pctPovertyScale(d.PctPoverty) - 50))
    .force('forceY', d3.forceX(550))
    .force('collide', d3.forceCollide((d) => popSizeScale(d.Population) + 1))
    .alpha(0.8)
    .alphaDecay(0.05)
    .restart();

  svg
    .selectAll('circle')
    .transition()
    .duration(300)
    .delay((_d, i) => i * 4)
    .attr('r', (d) => popScale(d.Population) * 0.02)
    .attr('fill', colorByPctBlackFill);

  svg.select('.poverty-y-axis').attr('opacity', 0.5).selectAll('.domain').attr('opacity', 1);

  renderCategoryLegend('categorylegend5', 'categoryLegend5', categoryColorScale3, 20, 50);
}
