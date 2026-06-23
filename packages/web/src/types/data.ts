export interface CensusTract {
  Tract: string;
  County: string;
  Population: number;
  Income: number;
  IncomePast12Mo: number;
  Black: number;
  PctBlack: number;
  NotWhite: number;
  PctNotWhite: number;
  Poverty: number;
  PctPoverty: number;
  HistCol: number;
  Midpoint: number;
  BubbleX?: number;
  BubbleY?: number;
  PovertyX?: number;
  PovertyY?: number;
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
    IncomePast12Mo: +d.ACS_MED_INCOME_PAST_12MO,
    Black: +d.N_BLACK,
    PctBlack: +d.PCT_BLACK,
    NotWhite: +d.N_NOT_WHITE,
    PctNotWhite: +d.PCT_NOT_WHITE,
    Poverty: +d.N_POVERTY_STAT,
    PctPoverty: +d.PCT_POVERTY_STAT,
    HistCol: +d.bucket_idx,
    Midpoint: +d.midpoint,
    BubbleX: d.bubble_x !== '' && d.bubble_x != null ? +d.bubble_x : undefined,
    BubbleY: d.bubble_y !== '' && d.bubble_y != null ? +d.bubble_y : undefined,
    PovertyX: d.poverty_x !== '' && d.poverty_x != null ? +d.poverty_x : undefined,
    PovertyY: d.poverty_y !== '' && d.poverty_y != null ? +d.poverty_y : undefined,
  };
}

export function parsePopulationChangeRow(d: Record<string, string>): PopulationChange {
  return {
    Year: +d.YEAR,
    PopCity: +d.ST_LOUIS_CITY,
    PopCounty: +d.ST_LOUIS_COUNTY,
  };
}
