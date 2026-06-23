import * as d3 from 'd3';
// @ts-expect-error d3-svg-legend has no types
import { legendColor } from 'd3-svg-legend';

export function renderCategoryLegend(
  containerId: string,
  className: string,
  scale: d3.ScaleOrdinal<string, string>,
  x: number,
  y: number,
): void {
  const svg = d3.select(`#${containerId}`);
  svg.selectAll('*').remove();

  const legend = legendColor()
    .shape('path', d3.symbol().type(d3.symbolCircle).size(200)())
    .shapePadding(10)
    .scale(scale);

  svg
    .append('g')
    .attr('class', className)
    .attr('transform', `translate(${x},${y})`)
    .call(legend);
}
