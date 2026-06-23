import { forwardRef } from 'react';

export const Hero = forwardRef<HTMLElement>(function Hero(_props, ref) {
  return (
    <header
      ref={ref}
      className="flex flex-col lg:flex-row w-full mt-[60px] lg:min-h-[calc(100vh-60px)] bg-white"
    >
      <div className="lg:w-1/3 px-5 py-8 lg:px-10 lg:py-12 flex flex-col justify-center order-2 lg:order-1">
        <p className="font-sans text-sm font-bold text-gray-900 underline decoration-2 underline-offset-4 mb-5">
          St. Louis
        </p>
        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-gray-900 mb-5">
          St. Louis, Divided.
        </h1>
        <p className="font-sans text-[1.0625rem] leading-relaxed text-gray-600 mb-6">
          In 1877, St. Louis, Missouri separated into two distinct governments: the City and the County.
          In the time since, the County exploded in size, while the City shrank to nearly a third of its peak
          population.
        </p>
        <p className="font-sans text-sm font-bold text-gray-900 mt-0 lg:mt-0">
          by{' '}
          <a href="https://www.tims.page" className="text-gray-900 underline">
            Timothy Blaine Zielonko
          </a>{' '}
          | October 24, 2020
        </p>
      </div>
      <figure className="lg:w-2/3 m-0 flex flex-col order-1 lg:order-2 overflow-hidden">
        <img
          src="/images/hero.png"
          alt="The St. Louis skyline along the Mississippi River"
          className="block w-full h-auto max-h-[60vw] min-h-[240px] lg:min-h-0 lg:h-full object-cover flex-1"
        />
        <figcaption className="block lg:hidden font-sans text-sm leading-normal text-gray-600 px-5 pt-4 pb-2 bg-white">
          The St. Louis skyline spans the Mississippi River, where the City and County have grown apart for more
          than a century.
        </figcaption>
        <p className="block lg:hidden font-sans text-[0.6875rem] font-semibold tracking-wide text-gray-500 px-5 pb-5 bg-white m-0">
          TIMOTHY BLAINE ZIELONKO
        </p>
      </figure>
    </header>
  );
});
