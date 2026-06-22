import * as d3 from 'd3';
import { categoriesXY } from './constants';
import { colorByPctBlackFill } from './colors';
import type { VizContext } from './types';
import { clean } from './utils/clean';
import { renderCategoryLegend } from './utils/legends';

export function activateBlackPopulation(ctx: VizContext): void {
  const { simulation, svg, scales } = ctx;
  const { popSizeScale, categoryColorScale3 } = scales;

  svg.attr('viewBox', '-100 0 1350 1900');
  clean(svg, 'isMultiples');
  simulation.stop();
  simulation.alpha(0.9).restart();

  svg
    .selectAll('.lab-text')
    .transition()
    .duration(300)
    .delay((_d, i) => i * 30)
    .text((d: string) => `Black Residents: ${d3.format(',.2r')(categoriesXY[d][5])}%`)
    .attr('x', (d: string) => categoriesXY[d][0] + 230)
    .attr('y', (d: string) => categoriesXY[d][1] + 265)
    .attr('opacity', 1);

  svg
    .selectAll('.lab-text')
    .on('mouseover', function (d: string) {
      d3.select(this).text(d);
    })
    .on('mouseout', function (d: string) {
      d3.select(this).text(`Black Residents: ${d3.format(',.2r')(categoriesXY[d][5])}%`);
    });

  svg
    .selectAll('.cat-rect')
    .transition()
    .duration(300)
    .delay((_d, i) => i * 30)
    .attr('opacity', 0.2)
    .attr('x', (d: string) => categoriesXY[d][0] + 75)
    .attr('y', (d: string) => categoriesXY[d][1] + 230);

  simulation
    .force('charge', d3.forceManyBody().strength(3))
    .force('forceX', d3.forceX((d) => categoriesXY[d.County][0] + 220))
    .force('forceY', d3.forceY((d) => categoriesXY[d.County][1] - 50))
    .force('collide', d3.forceCollide((d) => popSizeScale(d.Population) + 3))
    .alphaDecay(0.02);

  svg
    .selectAll('circle')
    .transition()
    .duration(400)
    .delay((_d, i) => i * 4)
    .attr('r', (d) => popSizeScale(d.Population))
    .attr('fill', colorByPctBlackFill);

  renderCategoryLegend('categorylegend3', 'categoryLegend3', categoryColorScale3, 20, 50);
}
