import { useEffect, useRef } from 'react';
import type { CensusTract, PopulationChange } from '../../types/data';
import { drawInitial } from '../../visualizations/drawInitial';
import { activationFunctions } from '../../visualizations';
import { createScales } from '../../visualizations/scales';

interface SectionChartProps {
  stepIndex: number;
  dataset: CensusTract[];
  populationChange: PopulationChange[];
  tooltipEl: HTMLElement | null;
  legendId?: string;
}

export function SectionChart({
  stepIndex,
  dataset,
  populationChange,
  tooltipEl,
  legendId,
}: SectionChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scales = createScales(dataset, populationChange);
    const state = drawInitial(container, dataset, populationChange, scales, tooltipEl);

    activationFunctions[stepIndex]({
      ...state,
      dataset,
      populationChange,
      scales,
      tooltipEl,
      legendId,
    });

    return () => {
      container.innerHTML = '';
    };
  }, [stepIndex, dataset, populationChange, tooltipEl, legendId]);

  return (
    <div
      ref={containerRef}
      className="w-full h-[min(55vh,520px)] lg:h-[min(70vh,560px)] bg-white rounded-sm [&>svg]:w-full [&>svg]:h-full"
      aria-label={`Chart for step ${stepIndex + 1}`}
    />
  );
}
