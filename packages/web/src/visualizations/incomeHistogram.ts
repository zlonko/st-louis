import * as d3 from 'd3';
import type { VizContext } from './types';
import { categoriesXY } from './constants';
import { clean } from './utils/clean';
import { renderCategoryLegend } from './utils/legends';

export function activateIncomeHistogram(ctx: VizContext): void {
  const { simulation, svg, scales } = ctx;
  const { categoryColorScale, histXScale, histYScale } = scales;

  svg.attr('viewBox', '-100 0 1350 1900');
  clean(svg, 'isHist');
  simulation.stop();

  svg
    .selectAll('circle')
    .transition()
    .duration(600)
    .delay((_d, i) => i * 2)
    .ease(d3.easeBack)
    .attr('r', 5)
    .attr('cx', (d) => histXScale(d.Midpoint) + categoriesXY[d.County][8])
    .attr('cy', (d) => histYScale(d.HistCol))
    .attr('fill', (d) => categoryColorScale(d.County));

  svg.selectAll('.hist-axis').transition().attr('opacity', 0.7).selectAll('.domain');

  renderCategoryLegend('categorylegenda', 'categoryLegenda', categoryColorScale, 20, 50);
}
