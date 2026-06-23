import * as d3 from 'd3';
import { categoriesXY, VIEWBOX } from './constants';
import { colorByPctNWFill } from './colors';
import type { VizContext } from './types';
import { clean } from './utils/clean';
import { renderCategoryLegend } from './utils/legends';
import { settleSimulation } from './utils/simulation';

export function activateNWPopulation(ctx: VizContext): void {
  const { simulation, svg, scales, legendId } = ctx;
  const { popSizeScale, categoryColorScale2 } = scales;

  svg.attr('viewBox', VIEWBOX);
  clean(svg, 'isMultiples');

  svg
    .selectAll('.lab-text')
    .text((d: string) => `People of Color: ${d3.format(',.2r')(categoriesXY[d][4])}%`)
    .attr('x', (d: string) => categoriesXY[d][0] + 230)
    .attr('y', (d: string) => categoriesXY[d][1] + 265)
    .attr('opacity', 1);

  svg
    .selectAll('.lab-text')
    .on('mouseover', function (d: string) {
      d3.select(this).text(d);
    })
    .on('mouseout', function (d: string) {
      d3.select(this).text(`People of Color: ${d3.format(',.2r')(categoriesXY[d][4])}%`);
    });

  svg
    .selectAll('.cat-rect')
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
    .attr('r', (d) => popSizeScale(d.Population))
    .attr('fill', colorByPctNWFill);

  settleSimulation(simulation);

  if (legendId) {
    renderCategoryLegend(legendId, 'categoryLegend2', categoryColorScale2, 20, 50);
  }
}
