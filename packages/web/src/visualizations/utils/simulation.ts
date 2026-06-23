import * as d3 from 'd3';
import type { CensusTract } from '../../types/data';

export function settleSimulation(
  simulation: d3.Simulation<CensusTract, undefined>,
  ticks = 300,
): void {
  simulation.alpha(1);
  for (let i = 0; i < ticks; i += 1) {
    simulation.tick();
  }
  simulation.stop();
}
