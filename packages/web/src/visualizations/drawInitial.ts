import * as d3 from 'd3';
import type { CensusTract, PopulationChange } from '../types/data';
import { categories, categoriesXY, height, margin, VIEWBOX, width } from './constants';
import type { ScaleSet } from './scales';
import type { VizState } from './types';

export function drawInitial(
  container: HTMLElement,
  dataset: CensusTract[],
  populationChange: PopulationChange[],
  scales: ScaleSet,
  tooltipEl: HTMLElement | null,
): VizState {
  const {
    histXScale,
    histYScale,
    incomeYScale,
    lineXScale,
    lineYScale,
    pctBlackXScale,
    pctPovertyScale,
  } = scales;

  const svg = d3
    .select(container)
    .append('svg')
    .attr('viewBox', VIEWBOX)
    .attr('width', '100%')
    .attr('height', '100%')
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .attr('opacity', 1);

  function showTooltip(d: CensusTract, pageX: number, pageY: number) {
    if (!tooltipEl) return;
    const left = Math.min(pageX + 10, window.innerWidth - 220);
    const top = Math.max(70, pageY - 25);
    d3.select(tooltipEl)
      .style('left', left + 'px')
      .style('top', top + 'px')
      .style('display', 'block')
      .html(
        `<strong>Tract:</strong> ${d.Tract} 
                <br> <strong>Area:</strong> ${d.County}
                <br> <strong>Population:</strong> ${d3.format(',.2r')(d.Population)}
                <br> <strong>People of Color:</strong> ${Math.round(d.PctNotWhite * 100)}%
                <br> <strong>Black:</strong> ${Math.round(d.PctBlack * 100)}%
                <br> <strong>Median Income:</strong> $${d3.format(',.2r')(d.Income)}
                <br> <strong>Poverty Rate:</strong> ${Math.round(d.PctPoverty * 100)}%`,
      );
  }

  function hideTooltip() {
    if (tooltipEl) {
      d3.select(tooltipEl).style('display', 'none');
    }
  }

  function pointerOver(d: CensusTract) {
    d3.select(this)
      .attr('opacity', 1)
      .attr('stroke-width', 5)
      .attr('stroke', 'black');

    const event = d3.event as MouseEvent & { changedTouches?: TouchList };
    const pageX = event.changedTouches?.[0]?.pageX ?? event.pageX;
    const pageY = event.changedTouches?.[0]?.pageY ?? event.pageY;
    showTooltip(d, pageX, pageY);
  }

  function pointerOut() {
    hideTooltip();

    d3.select(this).attr('opacity', 1).attr('stroke-width', 0);
  }

  const simulation = d3.forceSimulation(dataset);

  let nodes: d3.Selection<SVGCircleElement, CensusTract, SVGGElement, unknown>;

  simulation.on('tick', () => {
    nodes.attr('cx', (d) => d.x!).attr('cy', (d) => d.y!);
  });

  simulation.stop();

  nodes = svg
    .selectAll<SVGCircleElement, CensusTract>('circle')
    .data(dataset)
    .enter()
    .append('circle')
    .attr('fill', '#919191')
    .attr('r', 1)
    .attr('cx', 550)
    .attr('cy', 500)
    .attr('opacity', 1);

  function mouseOver(d: CensusTract) {
    pointerOver.call(this, d);
  }

  function mouseOut() {
    pointerOut.call(this);
  }

  function touchStart(d: CensusTract) {
    d3.event.preventDefault();
    pointerOver.call(this, d);
  }

  function touchEnd() {
    pointerOut.call(this);
  }

  svg
    .selectAll<SVGCircleElement, CensusTract>('circle')
    .on('mouseover', mouseOver)
    .on('mouseout', mouseOut)
    .on('touchstart', touchStart)
    .on('touchend', touchEnd);

  svg
    .selectAll('.cat-rect')
    .data(categories)
    .enter()
    .append('rect')
    .attr('class', 'cat-rect')
    .attr('x', (d) => categoriesXY[d][0] + 1000)
    .attr('y', (d) => categoriesXY[d][1] + 0)
    .attr('width', 310)
    .attr('height', 50)
    .attr('opacity', 0)
    .attr('fill', '#a5a8c2');

  svg
    .selectAll('.lab-text')
    .data(categories)
    .enter()
    .append('text')
    .attr('class', 'lab-text')
    .attr('opacity', 0)
    .raise()
    .text((d) => `Average: $${d3.format(',.2r')(categoriesXY[d][2])}`)
    .attr('x', (d) => categoriesXY[d][0] + 200 + 1000)
    .attr('y', (d) => categoriesXY[d][1] - 500)
    .attr('font-family', 'Instrument Serif')
    .attr('font-size', '28px')
    .attr('font-weight', 700)
    .attr('fill', 'black')
    .attr('text-anchor', 'middle')
    .on('mouseover', function (d: string) {
      d3.select(this).text(d);
    })
    .on('mouseout', function (d: string) {
      d3.select(this).text(`Average: $${d3.format(',.2r')(categoriesXY[d][2])}`);
    });

  const bestFitLine = [
    { x: 0, y: 43238 },
    { x: 1, y: 17543 },
  ];
  const lineFunction = d3
    .line<{ x: number; y: number }>()
    .x((d) => pctBlackXScale(d.x))
    .y((d) => incomeYScale(d.y));

  svg
    .append('path')
    .attr('class', 'best-fit')
    .attr('d', lineFunction(bestFitLine))
    .attr('stroke', 'blue')
    .attr('opacity', 0)
    .attr('stroke-width', 3);

  const scatterxAxis = d3.axisBottom(pctBlackXScale).tickFormat(d3.format('.0%'));
  const scatteryAxis = d3.axisLeft(incomeYScale).tickSize(width).tickFormat(d3.format('$,' as never));

  svg
    .append('g')
    .call(scatterxAxis)
    .attr('class', 'scatter-x')
    .attr('opacity', 0)
    .attr('transform', `translate(0, ${height + margin.top})`)
    .style('font-size', '18px')
    .style('font-family', 'IBM Plex Sans')
    .style('color', '#333')
    .call((g) => g.select('.domain').remove());

  svg
    .append('g')
    .call(scatteryAxis)
    .attr('class', 'scatter-y')
    .attr('opacity', 0)
    .attr('transform', `translate(${margin.left + width}, 0)`)
    .style('font-size', '18px')
    .style('font-family', 'IBM Plex Sans')
    .style('color', '#333')
    .call((g) => g.select('.domain').remove())
    .call((g) =>
      g
        .selectAll('.tick line')
        .attr('stroke-opacity', 0.8)
        .attr('stroke-dasharray', 4),
    );

  const histXAxis = d3.axisBottom(histXScale).tickFormat(d3.format('$,' as never));
  svg
    .append('g')
    .attr('class', 'hist-axis')
    .attr('transform', `translate(0, ${height + margin.top + 10})`)
    .style('font-size', '18px')
    .style('font-family', 'IBM Plex Sans')
    .style('color', '#333')
    .attr('opacity', 0)
    .call(histXAxis);

  const povertyXAxis = d3.axisBottom(pctPovertyScale);
  svg
    .append('g')
    .attr('class', 'poverty-axis')
    .attr('transform', 'translate(0, 700)')
    .attr('opacity', 0)
    .call(povertyXAxis);

  const povertyYAxis = d3.axisLeft(pctPovertyScale).tickSize(width).tickFormat(d3.format('.0%' as never));
  svg
    .append('g')
    .call(povertyYAxis)
    .attr('class', 'poverty-y-axis')
    .attr('opacity', 0)
    .attr('transform', `translate(${margin.left - 20 + width}, -100)`)
    .style('font-size', '18px')
    .style('font-family', 'IBM Plex Sans')
    .style('color', '#333')
    .call((g) => g.select('.domain').remove())
    .call((g) =>
      g
        .selectAll('.tick line')
        .attr('stroke-opacity', 1)
        .attr('stroke-dasharray', 4),
    );

  const populationXAxis = d3.axisBottom().scale(lineXScale).tickFormat(d3.format('.4' as never));
  const populationYAxis = d3.axisLeft().scale(lineYScale).tickSize(width);

  svg
    .append('g')
    .call(populationXAxis)
    .attr('class', 'population-x')
    .attr('transform', `translate(0, ${height + margin.top})`)
    .style('font-size', '18px')
    .style('font-family', 'IBM Plex Sans')
    .style('color', 'grey')
    .call((g) => g.select('.domain').remove());

  svg
    .append('g')
    .call(populationYAxis)
    .attr('class', 'population-y')
    .attr('transform', `translate(${margin.left + width}, 0)`)
    .style('font-size', '18px')
    .style('font-family', 'IBM Plex Sans')
    .style('color', 'grey')
    .call((g) => g.select('.domain').remove())
    .call((g) =>
      g
        .selectAll('.tick line')
        .attr('stroke-opacity', 0.8)
        .attr('stroke-dasharray', 4),
    );

  const lineCity = d3
    .line<PopulationChange>()
    .x((d) => lineXScale(d.Year))
    .y((d) => lineYScale(d.PopCity));

  const lineCounty = d3
    .line<PopulationChange>()
    .x((d) => lineXScale(d.Year))
    .y((d) => lineYScale(d.PopCounty));

  lineXScale.domain(d3.extent(populationChange, (d) => d.Year) as [number, number]);
  lineYScale.domain([
    0,
    d3.max(populationChange, (d) => Math.max(d.PopCity, d.PopCounty))!,
  ]);

  svg
    .append('path')
    .datum(populationChange)
    .attr('class', 'line1')
    .attr('stroke', '#7158b7')
    .attr('opacity', 0.7)
    .attr('d', lineCity);

  svg
    .append('path')
    .datum(populationChange)
    .attr('class', 'line2')
    .style('stroke', '#ba3f82')
    .attr('opacity', 0.7)
    .attr('d', lineCounty);

  svg
    .append('text')
    .attr('font-family', 'IBM Plex Sans')
    .attr('font-size', '24px')
    .attr('font-weight', 700)
    .attr('x', 805)
    .attr('y', 520)
    .style('fill', '#7158b7')
    .text('St. Louis City')
    .attr('class', 'linelabel1');

  svg
    .append('text')
    .attr('font-family', 'IBM Plex Sans')
    .attr('font-size', '24px')
    .attr('font-weight', 700)
    .attr('x', 770)
    .attr('y', 155)
    .style('fill', '#ba3f82')
    .text('St. Louis County')
    .attr('class', 'linelabel2');

  return { svg, simulation, nodes };
}
