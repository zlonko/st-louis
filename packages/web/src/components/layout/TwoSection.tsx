import type { ReactNode, Ref } from 'react';
import { stepHeading } from '../../content/typography';

interface TwoSectionProps {
  title?: string;
  children: ReactNode;
  chart?: ReactNode;
  sectionRef?: Ref<HTMLElement>;
  stepIndex?: number;
}

export function TwoSection({ title, children, chart, sectionRef, stepIndex }: TwoSectionProps) {
  return (
    <section
      ref={sectionRef}
      data-step-index={stepIndex}
      className="flex flex-col gap-8 items-start border-b border-gray-200/70 px-5 py-12 last:border-b-0 lg:min-h-[72vh] lg:gap-0 lg:px-10 lg:py-20"
    >
      <div className="order-1 w-full font-sans text-base leading-relaxed text-article-text lg:w-full">
        {title && <h3 className={stepHeading}>{title}</h3>}
        {children}
      </div>

      {/* Mobile: chart sits below text, always static — no crossfade */}
      <div className="order-2 w-full shrink-0 lg:hidden">
        {chart ?? (
          <div
            className="flex aspect-[4/3] w-full items-center justify-center rounded bg-gray-200/60 font-sans text-sm text-gray-500"
            aria-hidden="true"
          >
            Chart placeholder
          </div>
        )}
      </div>
    </section>
  );
}
