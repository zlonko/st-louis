import { useEffect, useState, type ReactNode } from 'react';
import clsx from 'clsx';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

interface StickyChartStageProps {
  activeStep: number;
  charts: ReactNode[];
}

export function StickyChartStage({ activeStep, charts }: StickyChartStageProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [mountedSteps, setMountedSteps] = useState<Set<number>>(() => new Set([0, 1]));

  useEffect(() => {
    setMountedSteps((prev) => {
      const next = new Set(prev);
      next.add(activeStep);
      if (activeStep + 1 < charts.length) {
        next.add(activeStep + 1);
      }
      return next;
    });
  }, [activeStep, charts.length]);

  return (
    <div
      className="relative aspect-[4/3] w-full bg-article-bg"
      aria-live="polite"
      aria-atomic="true"
    >
      {charts.map((chart, index) => {
        if (!chart || !mountedSteps.has(index)) return null;

        const isActive = activeStep === index;
        const isLineChart = index === 0;
        // Line chart is shown immediately; only fade out when scrolling to the next chart.
        const useTransition =
          !prefersReducedMotion && !(isLineChart && isActive);

        return (
          <div
            key={index}
            className={clsx(
              'absolute inset-0 h-full w-full',
              useTransition && 'transition-opacity duration-500 ease-in-out',
              isActive ? 'z-10 opacity-100' : 'z-0 opacity-0 pointer-events-none',
            )}
            aria-hidden={!isActive}
          >
            {chart}
          </div>
        );
      })}
    </div>
  );
}
