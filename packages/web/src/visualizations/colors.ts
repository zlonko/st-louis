import type { CensusTract } from '../types/data';
import { colors2, NATIONAL_POC_THRESHOLD } from './constants';

export function colorByPctNWFill(d: CensusTract): string {
  if (d.PctNotWhite >= NATIONAL_POC_THRESHOLD) return colors2[1]!;
  return colors2[0]!;
}

export function colorByPctBlackFill(d: CensusTract): string {
  if (d.PctBlack > 0.5) return '#07254f';
  if (d.PctBlack > 0.13) return '#52719e';
  return '#b8c4d6';
}
