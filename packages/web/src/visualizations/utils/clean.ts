import * as d3 from 'd3';

export type ChartType = 'isFirst' | 'isScatter' | 'isMultiples' | 'isHist' | 'isBubble';

export function clean(svg: d3.Selection<SVGElement, unknown, null, undefined>, chartType: ChartType): void {
  if (chartType !== 'isFirst') {
    svg.select('.linelabel1').attr('opacity', 0);
    svg.select('.linelabel2').attr('opacity', 0);
    svg.select('.line1').attr('opacity', 0);
    svg.select('.line2').attr('opacity', 0);
    svg.select('.population-x').attr('opacity', 0);
    svg.select('.population-y').attr('opacity', 0);
  }
  if (chartType !== 'isScatter') {
    svg.select('.scatter-x').attr('opacity', 0);
    svg.select('.scatter-y').attr('opacity', 0);
    svg.select('.best-fit').attr('opacity', 0);
  }
  if (chartType !== 'isMultiples') {
    svg.selectAll('.lab-text').attr('opacity', 0).attr('x', 1800);
    svg.selectAll('.cat-rect').attr('opacity', 0).attr('x', 1800);
  }
  if (chartType !== 'isHist') {
    svg.selectAll('.hist-axis').attr('opacity', 0);
  }
  if (chartType !== 'isBubble') {
    svg.select('.population-axis').attr('opacity', 0);
    svg.select('.poverty-axis').attr('opacity', 0);
    svg.select('.poverty-y-axis').attr('opacity', 0);
  }
}
