import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Navbar } from './components/layout/Navbar';
import { Hero } from './components/layout/Hero';
import { TwoSection } from './components/layout/TwoSection';
import { LineChart } from './components/charts/LineChart';
import { stepParagraph } from './content/typography';
import { cityColor, countyColor } from './colors';
import { parsePopulationChangeRow, type PopulationChange } from './types/data';

export default function App() {
  const heroRef = useRef<HTMLElement>(null);
  const [populationChange, setPopulationChange] = useState<PopulationChange[]>([]);

  useEffect(() => {
    d3.csv('/data/populationchange.csv', parsePopulationChangeRow).then(setPopulationChange);
  }, []);

  return (
    <>
      <Navbar />
      <Hero ref={heroRef} />
      <main className="relative bg-article-bg">
        <div className="mx-auto w-full max-w-7xl">
          <TwoSection
            title="Section One"
            chart={
              populationChange.length > 0 ? (
                <LineChart data={populationChange} cityColor={cityColor} countyColor={countyColor} />
              ) : undefined
            }
          >
            <p className={stepParagraph}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
              dolore magna aliqua.
            </p>
            <p className={stepParagraph}>
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
              consequat.
            </p>
          </TwoSection>

          <TwoSection title="Section Two">
            <p className={stepParagraph}>
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
            </p>
            <p className={stepParagraph}>
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est
              laborum.
            </p>
          </TwoSection>

          <TwoSection title="Section Three">
            <p className={stepParagraph}>
              Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra,
              est eros bibendum elit.
            </p>
          </TwoSection>

          <TwoSection title="Section Four">
            <p className={stepParagraph}>
              Nam nec ante. Sed lacinia, urna non tincidunt mattis, tortor neque adipiscing diam, a cursus ipsum ante
              quis turpis.
            </p>
            <p className={stepParagraph}>
              Nulla facilisi. Ut fringilla. Suspendisse potenti. Nunc feugiat mi a tellus consequat imperdiet.
            </p>
          </TwoSection>

          <TwoSection title="Section Five">
            <p className={stepParagraph}>
              Vestibulum sapien proin quam etiam ultrices suspendisse in justo eu magna luctus suscipit sed lectus.
            </p>
            <p className={stepParagraph}>
              Integer euismod lacus luctus magna. Quisque cursus, metus vitae pharetra auctor, sem massa mattis sem.
            </p>
          </TwoSection>

          <TwoSection title="Section Six">
            <p className={stepParagraph}>
              Interdum et malesuada fames ac ante ipsum primis in faucibus. Etiam sit amet orci eget eros faucibus
              tincidunt.
            </p>
          </TwoSection>

          <TwoSection title="Section Seven">
            <p className={stepParagraph}>
              Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim.
            </p>
            <p className={stepParagraph}>
              Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet
              a, venenatis vitae, justo.
            </p>
          </TwoSection>

          <TwoSection>
            <p className={stepParagraph}>
              Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper
              nisi.
            </p>
            <p className={stepParagraph}>
              Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim.
            </p>
          </TwoSection>
        </div>
      </main>
    </>
  );
}
