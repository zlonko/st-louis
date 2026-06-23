import * as d3 from 'd3';
import { categoriesXY, VIEWBOX } from './constants';
import type { VizContext } from './types';
import { clean } from './utils/clean';
import { renderCategoryLegend } from './utils/legends';

export function activateIncomeHistogram(ctx: VizContext): void {
  const { simulation, svg, scales, legendId } = ctx;
  const { categoryColorScale, histXScale, histYScale } = scales;

  svg.attr('viewBox', VIEWBOX);
  clean(svg, 'isHist');
  simulation.stop();

  svg
    .selectAll('circle')
    .attr('r', 5)
    .attr('cx', (d) => histXScale(d.Midpoint) + categoriesXY[d.County][8])
    .attr('cy', (d) => histYScale(d.HistCol))
    .attr('fill', (d) => categoryColorScale(d.County));

  svg.selectAll('.hist-axis').attr('opacity', 0.7);

  if (legendId) {
    renderCategoryLegend(legendId, 'categoryLegenda', categoryColorScale, 20, 50);
  }
}
