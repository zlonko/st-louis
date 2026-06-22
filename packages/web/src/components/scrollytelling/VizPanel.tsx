import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { CensusTract, PopulationChange } from '../../types/data';
import { drawInitial } from '../../visualizations/drawInitial';
import { activationFunctions } from '../../visualizations';
import { createScales } from '../../visualizations/scales';
import type { VizContext, VizState } from '../../visualizations/types';

interface VizPanelProps {
  dataset: CensusTract[];
  populationChange: PopulationChange[];
  activeIndex: number;
  isActive: boolean;
  tooltipEl: HTMLElement | null;
}

export function VizPanel({
  dataset,
  populationChange,
  activeIndex,
  isActive,
  tooltipEl,
}: VizPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const vizStateRef = useRef<VizState | null>(null);
  const lastIndexRef = useRef(-1);

  useEffect(() => {
    if (!containerRef.current || vizStateRef.current) return;

    const scales = createScales(dataset, populationChange);
    vizStateRef.current = drawInitial(
      containerRef.current,
      dataset,
      populationChange,
      scales,
      tooltipEl,
    );
  }, [dataset, populationChange, tooltipEl]);

  useEffect(() => {
    if (!isActive) {
      lastIndexRef.current = -1;
      return;
    }

    if (activeIndex < 0 || !vizStateRef.current) return;

    const scales = createScales(dataset, populationChange);
    const ctx: VizContext = {
      ...vizStateRef.current,
      dataset,
      populationChange,
      scales,
      tooltipEl,
    };

    const lastIndex = lastIndexRef.current;

    if (lastIndex === -1) {
      activationFunctions[activeIndex](ctx);
    } else {
      const sign = activeIndex - lastIndex < 0 ? -1 : 1;
      const scrolledSections = d3.range(lastIndex + sign, activeIndex + sign, sign);
      scrolledSections.forEach((i) => activationFunctions[i](ctx));
    }

    lastIndexRef.current = activeIndex;
  }, [activeIndex, isActive, dataset, populationChange, tooltipEl]);

  return <div id="viz" ref={containerRef} className={isActive ? 'viz-active' : ''} />;
}
