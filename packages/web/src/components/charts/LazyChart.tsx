import { useEffect, useRef, useState, type ReactNode } from 'react';

interface LazyChartProps {
  children: ReactNode;
  /** When true, render immediately without waiting for scroll. */
  eager?: boolean;
}

export function LazyChart({ children, eager = false }: LazyChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(eager);

  useEffect(() => {
    if (eager) return;

    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px 0px' },
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [eager]);

  return (
    <div ref={containerRef} className="aspect-[4/3] w-full min-h-[280px] bg-article-bg">
      {visible ? children : null}
    </div>
  );
}
