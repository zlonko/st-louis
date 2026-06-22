import { activatePopulationTrend } from './populationTrend';
import { activateTotalPopulation } from './totalPopulation';
import { activateIncomeHistogram } from './incomeHistogram';
import { activateNWPopulation } from './nwPopulation';
import { activateBlackPopulation } from './blackPopulation';
import { activateRaceIncomeScatter } from './raceIncomeScatter';
import { activatePovertyScatter } from './povertyScatter';
import { activatePovertyScatter2 } from './povertyScatter2';
import type { ActivationFn } from './types';

export const activationFunctions: ActivationFn[] = [
  activatePopulationTrend,
  activateTotalPopulation,
  activateIncomeHistogram,
  activateNWPopulation,
  activateBlackPopulation,
  activateRaceIncomeScatter,
  activatePovertyScatter,
  activatePovertyScatter2,
];
