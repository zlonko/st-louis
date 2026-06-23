import type { CensusTract } from '../types/data';

export function colorByPctNWFill(d: CensusTract): string {
  if (d.PctNotWhite > 0.5) return '#07254f';
  if (d.PctNotWhite > 0.3) return '#52719e';
  return '#b8c4d6';
}

export function colorByPctBlackFill(d: CensusTract): string {
  if (d.PctBlack > 0.5) return '#07254f';
  if (d.PctBlack > 0.13) return '#52719e';
  return '#b8c4d6';
}
