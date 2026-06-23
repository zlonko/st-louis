import { VIEWBOX } from './constants';
import type { VizContext } from './types';
import { clean } from './utils/clean';

export function activatePovertyScatter2(ctx: VizContext): void {
  const { svg, scales } = ctx;
  const { popScale, categoryColorScale } = scales;

  svg.attr('viewBox', VIEWBOX);
  clean(svg, 'isBubble');

  svg
    .selectAll('circle')
    .attr('r', (d) => popScale(d.Population) * 0.02)
    .attr('fill', (d) => categoryColorScale(d.County));

  svg.select('.poverty-y-axis').attr('opacity', 0.5);
}
