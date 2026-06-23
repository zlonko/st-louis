import { useState } from 'react';
import type { CensusTract, PopulationChange } from '../../types/data';
import { steps } from '../../content/steps';
import { SectionChart } from './SectionChart';

interface ScrollytellingProps {
  dataset: CensusTract[];
  populationChange: PopulationChange[];
}

export function Scrollytelling({ dataset, populationChange }: ScrollytellingProps) {
  const [tooltipEl, setTooltipEl] = useState<HTMLDivElement | null>(null);

  return (
    <div className="relative bg-article-bg">
      <div
        id="tooltip"
        ref={setTooltipEl}
        className="fixed z-[200] max-w-[min(400px,calc(100vw-2rem))] rounded bg-black/70 px-2 py-1.5 font-sans text-sm text-white shadow-md pointer-events-none"
      />

      <div className="mx-auto w-full max-w-7xl">
        {steps.map((step, index) => (
          <section
            key={step.id}
            className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start lg:items-center px-5 lg:px-10 py-12 lg:py-20 border-b border-gray-200/70 last:border-b-0"
          >
            <div className="w-full lg:w-1/2 font-sans text-base leading-relaxed text-article-text">
              {step.content}
              {step.legendId && (
                <svg
                  id={`${step.legendId}-${index}`}
                  className="w-full max-w-xs h-auto mt-4"
                  aria-hidden="true"
                />
              )}
            </div>

            <div className="w-full lg:w-1/2 shrink-0">
              <SectionChart
                stepIndex={index}
                dataset={dataset}
                populationChange={populationChange}
                tooltipEl={tooltipEl}
                legendId={step.legendId ? `${step.legendId}-${index}` : undefined}
              />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
