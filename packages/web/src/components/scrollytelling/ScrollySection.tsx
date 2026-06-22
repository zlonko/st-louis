import { forwardRef, type ReactNode } from 'react';

interface ScrollySectionProps {
  children: ReactNode;
  isActive: boolean;
  legendId?: string;
}

export const ScrollySection = forwardRef<HTMLElement, ScrollySectionProps>(
  function ScrollySection({ children, isActive, legendId }, ref) {
    return (
      <section
        className="step"
        ref={ref}
        style={{ opacity: isActive ? 1 : 0.1, transition: 'opacity 0.5s' }}
      >
        {children}
        {legendId && <svg id={legendId} width="400" height="200" />}
      </section>
    );
  },
);
