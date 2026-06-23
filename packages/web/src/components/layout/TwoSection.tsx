import type { ReactNode } from 'react';
import { stepHeading } from '../../content/typography';

interface TwoSectionProps {
  title?: string;
  children: ReactNode;
  chart?: ReactNode;
}

export function TwoSection({ title, children, chart }: TwoSectionProps) {
  return (
    <section className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start px-5 lg:px-10 py-12 lg:py-20 border-b border-gray-200/70 last:border-b-0">
      <div className="w-full lg:w-1/2 font-sans text-base leading-relaxed text-article-text order-1">
        {title && <h3 className={stepHeading}>{title}</h3>}
        {children}
      </div>

      <div className="w-full lg:w-1/2 shrink-0 order-2">
        {chart ?? (
          <div
            className="aspect-[4/3] w-full rounded bg-gray-200/60 flex items-center justify-center font-sans text-sm text-gray-500"
            aria-hidden="true"
          >
            Chart placeholder
          </div>
        )}
      </div>
    </section>
  );
}
