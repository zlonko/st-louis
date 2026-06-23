import type * as d3 from 'd3';
import type { CensusTract, PopulationChange } from '../types/data';
import type { ScaleSet } from './scales';

export interface VizState {
  svg: d3.Selection<SVGElement, unknown, null, undefined>;
  simulation: d3.Simulation<CensusTract, undefined>;
  nodes: d3.Selection<SVGCircleElement, CensusTract, SVGGElement, unknown>;
}

export interface VizContext extends VizState {
  dataset: CensusTract[];
  populationChange: PopulationChange[];
  scales: ScaleSet;
  tooltipEl: HTMLElement | null;
  legendId?: string;
}

export type ActivationFn = (ctx: VizContext) => void;
