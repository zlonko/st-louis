import * as d3 from 'd3';

export type ChartType = 'isFirst' | 'isScatter' | 'isMultiples' | 'isHist' | 'isBubble';

export function clean(svg: d3.Selection<SVGElement, unknown, null, undefined>, chartType: ChartType): void {
  if (chartType !== 'isFirst') {
    svg.select('.linelabel1').transition().attr('opacity', 0);
    svg.select('.linelabel2').transition().attr('opacity', 0);
    svg.select('.line1').transition().attr('opacity', 0);
    svg.select('.line2').transition().attr('opacity', 0);
    svg.select('.population-x').transition().attr('opacity', 0);
    svg.select('.population-y').transition().attr('opacity', 0);
  }
  if (chartType !== 'isScatter') {
    svg.select('.scatter-x').transition().attr('opacity', 0);
    svg.select('.scatter-y').transition().attr('opacity', 0);
    svg.select('.best-fit').transition().duration(200).attr('opacity', 0);
  }
  if (chartType !== 'isMultiples') {
    svg.selectAll('.lab-text').transition().attr('opacity', 0).attr('x', 1800);
    svg.selectAll('.cat-rect').transition().attr('opacity', 0).attr('x', 1800);
  }
  if (chartType !== 'isHist') {
    svg.selectAll('.hist-axis').transition().attr('opacity', 0);
  }
  if (chartType !== 'isBubble') {
    svg.select('.population-axis').transition().attr('opacity', 0);
    svg.select('.poverty-axis').transition().attr('opacity', 0);
    svg.select('.poverty-y-axis').transition().attr('opacity', 0);
  }
}
