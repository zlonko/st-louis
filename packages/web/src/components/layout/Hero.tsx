import { forwardRef } from 'react';

export const Hero = forwardRef<HTMLElement>(function Hero(_props, ref) {
  return (
    <header className="hero" ref={ref}>
      <div className="hero-text">
        <p className="hero-label">St. Louis</p>
        <h1 className="hero-headline">St. Louis, Divided</h1>
        <p className="hero-deck">
          In 1877, St. Louis, Missouri separated into two distinct governments: the City and the County.
          In the time since, the County exploded in size, while the City shrank to nearly a third of its peak
          population.
        </p>
        <p className="hero-byline">
          by <a href="https://www.tims.page">Timothy Blaine Zielonko</a> | October 24, 2020
        </p>
      </div>
      <figure className="hero-image">
        <img src="/images/hero.jpg" alt="The St. Louis skyline along the Mississippi River" />
        <figcaption className="hero-caption">
          The St. Louis skyline spans the Mississippi River, where the City and County have grown apart for more
          than a century.
        </figcaption>
        <p className="hero-credit">TIMOTHY BLAINE ZIELONKO</p>
      </figure>
    </header>
  );
});
