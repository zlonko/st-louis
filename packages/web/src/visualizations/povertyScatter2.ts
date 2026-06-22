import type { VizContext } from './types';
import { clean } from './utils/clean';

export function activatePovertyScatter2(ctx: VizContext): void {
  const { svg, scales } = ctx;
  const { popScale, categoryColorScale } = scales;

  svg.attr('viewBox', '-100 0 1350 1900');
  clean(svg, 'isBubble');

  svg
    .selectAll('circle')
    .transition()
    .duration(300)
    .delay((_d, i) => i * 4)
    .attr('r', (d) => popScale(d.Population) * 0.02)
    .attr('fill', (d) => categoryColorScale(d.County));

  svg.select('.poverty-y-axis').attr('opacity', 0.5).selectAll('.domain').attr('opacity', 1);
}
