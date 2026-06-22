export interface CensusTract {
  Tract: string;
  County: string;
  Population: number;
  Income: number;
  Black: number;
  PctBlack: number;
  NotWhite: number;
  PctNotWhite: number;
  Poverty: number;
  PctPoverty: number;
  HistCol: number;
  Midpoint: number;
  MapCoordinates: string;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface PopulationChange {
  Year: number;
  PopCity: number;
  PopCounty: number;
}

export function parseCensusTractRow(d: Record<string, string>): CensusTract {
  return {
    Tract: d.TRACT,
    County: d.COUNTY_NAME,
    Population: +d.ACS_N_TOTAL_POP,
    Income: +d.ACS_MED_INCOME,
    Black: +d.N_BLACK,
    PctBlack: +d.PCT_BLACK,
    NotWhite: +d.N_NOT_WHITE,
    PctNotWhite: +d.PCT_NOT_WHITE,
    Poverty: +d.N_POVERTY_STAT,
    PctPoverty: +d.PCT_POVERTY_STAT,
    HistCol: +d.bucket_idx,
    Midpoint: +d.midpoint,
    MapCoordinates: d.coords,
  };
}

export function parsePopulationChangeRow(d: Record<string, string>): PopulationChange {
  return {
    Year: +d.YEAR,
    PopCity: +d.ST_LOUIS_CITY,
    PopCounty: +d.ST_LOUIS_COUNTY,
  };
}
