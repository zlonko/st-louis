import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import * as d3 from 'd3';

interface UseScrollerOptions {
  heroRef: RefObject<HTMLElement | null>;
  stepRefs: RefObject<(HTMLElement | null)[]>;
  onActivate?: (index: number) => void;
  onInactive?: () => void;
  onProgress?: (index: number, progress: number) => void;
}

interface UseScrollerResult {
  activeIndex: number;
  progress: number;
  isScrollytellingActive: boolean;
}

export function useScroller({
  heroRef,
  stepRefs,
  onActivate,
  onInactive,
  onProgress,
}: UseScrollerOptions): UseScrollerResult {
  const [activeIndex, setActiveIndex] = useState(-1);
  const [progress, setProgress] = useState(0);
  const [isScrollytellingActive, setIsScrollytellingActive] = useState(false);

  const currentIndexRef = useRef(-1);
  const sectionPositionsRef = useRef<number[]>([]);

  const getScrollOffset = useCallback(() => {
    const hero = heroRef.current;
    return hero ? hero.offsetTop + hero.offsetHeight : 0;
  }, [heroRef]);

  const resize = useCallback(() => {
    const steps = stepRefs.current?.filter(Boolean) as HTMLElement[];
    const positions: number[] = [];
    let startPos = 0;

    steps.forEach((step, i) => {
      const top = step.getBoundingClientRect().top;
      if (i === 0) startPos = top;
      positions.push(top - startPos);
    });

    sectionPositionsRef.current = positions;
  }, [stepRefs]);

  const position = useCallback(() => {
    const scrollOffset = getScrollOffset();
    const pastHero = window.pageYOffset >= scrollOffset - 50;
    setIsScrollytellingActive(pastHero);

    if (!pastHero) {
      if (currentIndexRef.current !== -1) {
        currentIndexRef.current = -1;
        setActiveIndex(-1);
        onInactive?.();
      }
      return;
    }

    const sectionPositions = sectionPositionsRef.current;
    const pos = window.pageYOffset - 300 - scrollOffset;
    let sectionIndex = d3.bisect(sectionPositions, pos);
    sectionIndex = Math.min(sectionPositions.length - 1, sectionIndex);

    if (currentIndexRef.current !== sectionIndex) {
      currentIndexRef.current = sectionIndex;
      setActiveIndex(sectionIndex);
      onActivate?.(sectionIndex);
    }

    const prevIndex = Math.max(sectionIndex - 1, 0);
    const prevTop = sectionPositions[prevIndex];
    const nextTop = sectionPositions[sectionIndex];
    const sectionProgress =
      nextTop !== prevTop ? (pos - prevTop) / (nextTop - prevTop) : 0;

    setProgress(sectionProgress);
    onProgress?.(sectionIndex, sectionProgress);
  }, [getScrollOffset, onActivate, onInactive, onProgress]);

  useEffect(() => {
    const handleScroll = () => position();
    const handleResize = () => {
      resize();
      position();
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);

    resize();
    requestAnimationFrame(() => position());

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [position, resize]);

  return { activeIndex, progress, isScrollytellingActive };
}
