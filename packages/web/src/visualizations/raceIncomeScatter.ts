import * as d3 from 'd3';
import { colorByPctBlackFill } from './colors';
import type { VizContext } from './types';
import { clean } from './utils/clean';
import { renderCategoryLegend } from './utils/legends';

export function activateRaceIncomeScatter(ctx: VizContext): void {
  const { simulation, svg, scales } = ctx;
  const { pctBlackXScale, incomeYScale, categoryColorScale3 } = scales;

  simulation.stop();
  svg.attr('viewBox', '-100 0 1350 1900');
  clean(svg, 'isScatter');

  svg.selectAll('.scatter-x').transition().attr('opacity', 0.7).selectAll('.domain').attr('opacity', 1);
  svg.selectAll('.scatter-y').transition().attr('opacity', 0.7).selectAll('.domain').attr('opacity', 1);

  svg
    .selectAll('circle')
    .transition()
    .duration(800)
    .ease(d3.easeBack)
    .attr('cx', (d) => pctBlackXScale(d.PctBlack))
    .attr('cy', (d) => incomeYScale(d.Income));

  svg
    .selectAll('circle')
    .transition()
    .duration(1600)
    .attr('fill', colorByPctBlackFill)
    .attr('r', 4);

  svg.select('.best-fit').transition().duration(300).attr('opacity', 0.5);

  renderCategoryLegend('categorylegend4', 'categoryLegend4', categoryColorScale3, 20, 50);
}
