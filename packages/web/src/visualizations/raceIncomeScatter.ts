import { VIEWBOX } from './constants';
import { colorByPctBlackFill } from './colors';
import type { VizContext } from './types';
import { clean } from './utils/clean';
import { renderCategoryLegend } from './utils/legends';

export function activateRaceIncomeScatter(ctx: VizContext): void {
  const { simulation, svg, scales, legendId } = ctx;
  const { pctBlackXScale, incomeYScale, categoryColorScale3 } = scales;

  simulation.stop();
  svg.attr('viewBox', VIEWBOX);
  clean(svg, 'isScatter');

  svg.selectAll('.scatter-x').attr('opacity', 0.7);
  svg.selectAll('.scatter-y').attr('opacity', 0.7);

  svg
    .selectAll('circle')
    .attr('cx', (d) => pctBlackXScale(d.PctBlack))
    .attr('cy', (d) => incomeYScale(d.Income))
    .attr('fill', colorByPctBlackFill)
    .attr('r', 4);

  svg.select('.best-fit').attr('opacity', 0.5);

  if (legendId) {
    renderCategoryLegend(legendId, 'categoryLegend4', categoryColorScale3, 20, 50);
  }
}
