import { useEffect, useState } from 'react';
import * as d3 from 'd3';
import {
  parseCensusTractRow,
  parsePopulationChangeRow,
  type CensusTract,
  type PopulationChange,
} from '../types/data';

interface DataState {
  dataset: CensusTract[];
  populationChange: PopulationChange[];
  loading: boolean;
  error: Error | null;
}

export function useData(): DataState {
  const [dataset, setDataset] = useState<CensusTract[]>([]);
  const [populationChange, setPopulationChange] = useState<PopulationChange[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    Promise.all([
      d3.csv('/data/dataset.csv', parseCensusTractRow),
      d3.csv('/data/populationchange.csv', parsePopulationChangeRow),
    ])
      .then(([tracts, pop]) => {
        setDataset(tracts);
        setPopulationChange(pop);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err);
        setLoading(false);
      });
  }, []);

  return { dataset, populationChange, loading, error };
}
