import * as d3 from 'd3';
import type { CensusTract, PopulationChange } from '../types/data';
import { categories, categories2, categories3, colors, colors2, colors3, height, margin, width } from './constants';

export interface ScaleSet {
  incomeSizeScale: d3.ScaleLinear<number, number>;
  incomeXScale: d3.ScaleLinear<number, number>;
  incomeYScale: d3.ScaleLinear<number, number>;
  categoryColorScale: d3.ScaleOrdinal<string, string>;
  categoryColorScale2: d3.ScaleOrdinal<string, string>;
  categoryColorScale3: d3.ScaleOrdinal<string, string>;
  popScale: d3.ScaleLinear<number, number>;
  popSizeScale: d3.ScaleLinear<number, number>;
  pctNWScale: d3.ScaleLinear<number, number>;
  pctNWSizeScale: d3.ScaleLinear<number, number>;
  pctBlackScale: d3.ScaleLinear<number, number>;
  pctBlackXScale: d3.ScaleLinear<number, number>;
  pctBlackSizeScale: d3.ScaleLinear<number, number>;
  pctPovertyYScale: d3.ScaleLinear<number, number>;
  pctPovertyScale: d3.ScaleLinear<number, number>;
  pctPovertySizeScale: d3.ScaleLinear<number, number>;
  histXScale: d3.ScaleLinear<number, number>;
  histYScale: d3.ScaleLinear<number, number>;
  lineXScale: d3.ScaleLinear<number, number>;
  lineYScale: d3.ScaleLinear<number, number>;
}

export function createScales(
  dataset: CensusTract[],
  populationChange: PopulationChange[],
): ScaleSet {
  return {
    incomeSizeScale: d3.scaleLinear(d3.extent(dataset, (d) => d.Income) as [number, number], [3, 22]),
    incomeXScale: d3.scaleLinear(d3.extent(dataset, (d) => d.Income) as [number, number], [
      margin.left,
      margin.left + width + 250,
    ]),
    incomeYScale: d3.scaleLinear([0, 85000], [margin.top + height, margin.top]),
    categoryColorScale: d3.scaleOrdinal(categories as unknown as string[], colors),
    categoryColorScale2: d3.scaleOrdinal(categories2 as unknown as string[], colors2),
    categoryColorScale3: d3.scaleOrdinal(categories3 as unknown as string[], colors3),
    popScale: d3.scaleLinear(d3.extent(dataset, (d) => d.Population) as [number, number], [
      margin.left + 120,
      margin.left + width - 50,
    ]),
    popSizeScale: d3.scaleLinear(d3.extent(dataset, (d) => d.Population) as [number, number], [3, 22]),
    pctNWScale: d3.scaleLinear(d3.extent(dataset, (d) => d.PctNotWhite) as [number, number], [
      margin.left + 120,
      margin.left + width - 50,
    ]),
    pctNWSizeScale: d3.scaleLinear(d3.extent(dataset, (d) => d.PctNotWhite) as [number, number], [3, 22]),
    pctBlackScale: d3.scaleLinear(d3.extent(dataset, (d) => d.PctBlack) as [number, number], [
      margin.left + 120,
      margin.left + width - 50,
    ]),
    pctBlackXScale: d3.scaleLinear(d3.extent(dataset, (d) => d.PctBlack) as [number, number], [
      margin.left,
      margin.left + width,
    ]),
    pctBlackSizeScale: d3.scaleLinear(d3.extent(dataset, (d) => d.PctBlack) as [number, number], [3, 22]),
    pctPovertyYScale: d3.scaleLinear([0, 1], [margin.top + height, margin.top]),
    pctPovertyScale: d3.scaleLinear(d3.extent(dataset, (d) => d.PctPoverty) as [number, number], [
      margin.left + 120,
      margin.left + width - 50,
    ]),
    pctPovertySizeScale: d3.scaleLinear(d3.extent(dataset, (d) => d.PctPoverty) as [number, number], [3, 22]),
    histXScale: d3.scaleLinear(d3.extent(dataset, (d) => d.Midpoint) as [number, number], [
      margin.left,
      margin.left + width,
    ]),
    histYScale: d3.scaleLinear(d3.extent(dataset, (d) => d.HistCol) as [number, number], [
      margin.top + height,
      margin.top,
    ]),
    lineXScale: d3.scaleLinear(d3.extent(populationChange, (p) => p.Year) as [number, number], [
      margin.left,
      margin.left + width,
    ]),
    lineYScale: d3.scaleLinear([0, 1000000], [margin.top + height, margin.top]),
  };
}
