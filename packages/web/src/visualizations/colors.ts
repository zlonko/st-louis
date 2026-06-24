import type { CensusTract } from '../types/data';
import { colors2, colors3, NATIONAL_BLACK_THRESHOLD, NATIONAL_POC_THRESHOLD } from './constants';

export function colorByPctNWFill(d: CensusTract): string {
  if (d.PctNotWhite >= NATIONAL_POC_THRESHOLD) return colors2[1]!;
  return colors2[0]!;
}

export function colorByPctBlackFill(d: CensusTract): string {
  if (d.PctBlack >= NATIONAL_BLACK_THRESHOLD) return colors3[1]!;
  return colors3[0]!;
}
