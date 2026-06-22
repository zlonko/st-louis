import { useRef, useState, type RefObject } from 'react';
import type { CensusTract, PopulationChange } from '../../types/data';
import { useScroller } from '../../hooks/useScroller';
import { steps } from '../../content/steps';
import { ScrollySection } from './ScrollySection';
import { VizPanel } from './VizPanel';

interface ScrollytellingProps {
  heroRef: RefObject<HTMLElement | null>;
  dataset: CensusTract[];
  populationChange: PopulationChange[];
}

export function Scrollytelling({ heroRef, dataset, populationChange }: ScrollytellingProps) {
  const stepRefs = useRef<(HTMLElement | null)[]>([]);
  const [tooltipEl, setTooltipEl] = useState<HTMLDivElement | null>(null);

  const { activeIndex, isScrollytellingActive } = useScroller({
    heroRef,
    stepRefs,
  });

  return (
    <div id="parent" className={isScrollytellingActive ? 'scrollytelling-active' : ''}>
      <div id="tooltip" ref={setTooltipEl} />

      <div id="sections">
        {steps.map((step, index) => (
          <ScrollySection
            key={step.id}
            ref={(el) => {
              stepRefs.current[index] = el;
            }}
            isActive={activeIndex === index}
            legendId={step.legendId}
          >
            {step.content}
          </ScrollySection>
        ))}
      </div>

      <VizPanel
        dataset={dataset}
        populationChange={populationChange}
        activeIndex={activeIndex}
        isActive={isScrollytellingActive}
        tooltipEl={tooltipEl}
      />
    </div>
  );
}
