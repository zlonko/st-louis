import { useCallback, useEffect, useRef, useState } from 'react';

const NAVBAR_OFFSET = 72;
const SECTION_TOP_PADDING = 80;

interface UseActiveSectionOptions {
  enabled?: boolean;
}

function pickTopmostVisible(elements: HTMLElement[]): number {
  let bestIndex = 0;
  let bestTop = Infinity;

  for (let index = 0; index < elements.length; index += 1) {
    const rect = elements[index].getBoundingClientRect();
    if (rect.bottom <= NAVBAR_OFFSET + SECTION_TOP_PADDING) continue;
    if (rect.top >= window.innerHeight) continue;
    if (rect.top < bestTop) {
      bestTop = rect.top;
      bestIndex = index;
    }
  }

  return bestIndex;
}

export function useActiveSection(sectionCount: number, options: UseActiveSectionOptions = {}) {
  const { enabled = true } = options;
  const refs = useRef<(HTMLElement | null)[]>([]);
  const [activeStep, setActiveStep] = useState(0);

  const setSectionRef = useCallback(
    (index: number) => (element: HTMLElement | null) => {
      refs.current[index] = element;
    },
    [],
  );

  useEffect(() => {
    if (!enabled) return;

    const elements = refs.current.filter((el): el is HTMLElement => el != null);
    if (elements.length === 0) return;

    const ratios = new Map<number, number>();

    const updateActive = () => {
      let bestIndex = 0;
      let bestRatio = 0;
      for (const [index, ratio] of ratios) {
        if (ratio > bestRatio) {
          bestRatio = ratio;
          bestIndex = index;
        }
      }

      setActiveStep(bestRatio > 0 ? bestIndex : pickTopmostVisible(elements));
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const index = elements.indexOf(entry.target as HTMLElement);
          if (index < 0) continue;
          ratios.set(index, entry.isIntersecting ? entry.intersectionRatio : 0);
        }
        updateActive();
      },
      {
        threshold: [0, 0.15, 0.35, 0.5, 0.65, 0.85, 1],
        rootMargin: `-${SECTION_TOP_PADDING}px 0px -45% 0px`,
      },
    );

    for (const element of elements) {
      observer.observe(element);
    }

    updateActive();

    return () => observer.disconnect();
  }, [enabled, sectionCount]);

  return { activeStep, setSectionRef };
}
