import type { VizContext } from './types';
import { clean } from './utils/clean';

export function activatePopulationTrend(ctx: VizContext): void {
  const { simulation, svg } = ctx;

  simulation.stop();
  svg.attr('viewBox', '-100 0 1350 1900');

  clean(svg, 'isFirst');

  svg
    .selectAll('circle')
    .transition()
    .duration(500)
    .delay(100)
    .attr('fill', '#eae7dc')
    .attr('r', 1)
    .attr('cx', 1)
    .attr('cy', 1);

  svg.select('.population-x').transition().attr('opacity', 1);
  svg.select('.population-y').transition().attr('opacity', 1);
  svg.select('.line1').transition().attr('opacity', 1);
  svg.select('.line2').transition().attr('opacity', 1);
  svg.select('.linelabel1').transition().attr('opacity', 1);
  svg.select('.linelabel2').transition().attr('opacity', 1);
}
