import { VIEWBOX } from './constants';
import type { VizContext } from './types';
import { clean } from './utils/clean';

export function activatePopulationTrend(ctx: VizContext): void {
  const { simulation, svg } = ctx;

  simulation.stop();
  svg.attr('viewBox', VIEWBOX);

  clean(svg, 'isFirst');

  svg
    .selectAll('circle')
    .attr('fill', '#eae7dc')
    .attr('r', 1)
    .attr('cx', 1)
    .attr('cy', 1);

  svg.select('.population-x').attr('opacity', 1);
  svg.select('.population-y').attr('opacity', 1);
  svg.select('.line1').attr('opacity', 1);
  svg.select('.line2').attr('opacity', 1);
  svg.select('.linelabel1').attr('opacity', 1);
  svg.select('.linelabel2').attr('opacity', 1);
}
