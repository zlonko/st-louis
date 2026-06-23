import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import * as d3 from 'd3';
import { Navbar } from './components/layout/Navbar';
import { Hero } from './components/layout/Hero';
import { TwoSection } from './components/layout/TwoSection';
import { StickyChartStage } from './components/layout/StickyChartStage';
import { LinkCards } from './components/layout/LinkCards';
import { Footer } from './components/layout/Footer';
import { LineChart } from './components/charts/LineChart';
import { BubbleChart } from './components/charts/BubbleChart';
import { IncomeHistogram } from './components/charts/IncomeHistogram';
import { ScatterPlot } from './components/charts/ScatterPlot';
import { PovertyChart } from './components/charts/PovertyChart';
import { LazyChart } from './components/charts/LazyChart';
import { stepParagraph } from './content/typography';
import { cityColor, countyColor } from './colors';
import { parseCensusTractRow, parsePopulationChangeRow, type CensusTract, type PopulationChange } from './types/data';
import { datasetUrl, populationChangeUrl } from './constants/dataUrls';
import { useActiveSection } from './hooks/useActiveSection';
import { useMediaQuery } from './hooks/useMediaQuery';
import {
  BUBBLE_REF,
  POVERTY_REF,
  bubbleDimensions,
  computeBubbleLayout,
  computePovertyLayout,
  hasBubbleLayout,
  hasPovertyLayout,
  normalizeLayoutMap,
  povertyDimensions,
} from './visualizations/chartLayouts';

const SECTION_COUNT = 8;

function useSharedBubbleLayout(data: CensusTract[]) {
  return useMemo(() => {
    if (data.length === 0 || hasBubbleLayout(data)) return undefined;

    const { innerWidth, innerHeight } = bubbleDimensions(BUBBLE_REF.width, BUBBLE_REF.height);
    const tracts = data.filter((d) => d.County === 'St. Louis City' || d.County === 'St. Louis County');
    return normalizeLayoutMap(computeBubbleLayout(tracts, innerWidth, innerHeight), innerWidth, innerHeight);
  }, [data]);
}

function useSharedPovertyLayout(data: CensusTract[]) {
  return useMemo(() => {
    if (data.length === 0 || hasPovertyLayout(data)) return undefined;

    const { innerWidth, innerHeight, maxRadius, bubblePad } = povertyDimensions(
      POVERTY_REF.width,
      POVERTY_REF.height,
    );
    return normalizeLayoutMap(
      computePovertyLayout(data, innerWidth, innerHeight, maxRadius, bubblePad),
      innerWidth,
      innerHeight,
    );
  }, [data]);
}

function renderMobileChart(chart: ReactNode | null, eager = false) {
  if (!chart) return undefined;
  return <LazyChart eager={eager}>{chart}</LazyChart>;
}

export default function App() {
  const heroRef = useRef<HTMLElement>(null);
  const [populationChange, setPopulationChange] = useState<PopulationChange[]>([]);
  const [dataset, setDataset] = useState<CensusTract[]>([]);
  const sharedBubbleLayout = useSharedBubbleLayout(dataset);
  const sharedPovertyLayout = useSharedPovertyLayout(dataset);
  const isDesktopScrolly = useMediaQuery('(min-width: 1024px)');
  const { activeStep, setSectionRef } = useActiveSection(SECTION_COUNT, { enabled: isDesktopScrolly });

  useEffect(() => {
    d3.csv(populationChangeUrl, parsePopulationChangeRow).then(setPopulationChange);
    d3.csv(datasetUrl, parseCensusTractRow).then(setDataset);
  }, []);

  const desktopCharts = useMemo(
    () => [
      populationChange.length > 0 ? (
        <LineChart data={populationChange} cityColor={cityColor} countyColor={countyColor} />
      ) : null,
      dataset.length > 0 ? (
        <BubbleChart
          data={dataset}
          cityColor={cityColor}
          countyColor={countyColor}
          sharedLayout={sharedBubbleLayout}
        />
      ) : null,
      dataset.length > 0 ? (
        <IncomeHistogram data={dataset} cityColor={cityColor} countyColor={countyColor} />
      ) : null,
      dataset.length > 0 ? (
        <BubbleChart
          data={dataset}
          colorMode="pctNotWhite"
          cityLabel="People of Color: 53%"
          countyLabel="People of Color: 31%"
          sharedLayout={sharedBubbleLayout}
        />
      ) : null,
      dataset.length > 0 ? (
        <BubbleChart
          data={dataset}
          colorMode="pctBlack"
          cityLabel="Black Residents: 46%"
          countyLabel="Black Residents: 24%"
          sharedLayout={sharedBubbleLayout}
        />
      ) : null,
      dataset.length > 0 ? <ScatterPlot data={dataset} /> : null,
      dataset.length > 0 ? <PovertyChart data={dataset} sharedLayout={sharedPovertyLayout} /> : null,
      dataset.length > 0 ? (
        <PovertyChart
          data={dataset}
          colorMode="county"
          cityColor={cityColor}
          countyColor={countyColor}
          sharedLayout={sharedPovertyLayout}
        />
      ) : null,
    ],
    [dataset, populationChange, sharedBubbleLayout, sharedPovertyLayout],
  );

  const mobileChart = (index: number) => desktopCharts[index] ?? null;

  return (
    <>
      <Navbar />
      <Hero ref={heroRef} />
      <main className="relative bg-article-bg">
        <div className="mx-auto w-full max-w-7xl">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12">
            <div className="min-w-0">
            <TwoSection
              title="One people. Two governments."
              stepIndex={0}
              sectionRef={setSectionRef(0)}
              chart={!isDesktopScrolly ? renderMobileChart(mobileChart(0), true) : undefined}
            >
              <p className={stepParagraph}>
                In 1877, St. Louis made a decision that would shape everything that followed. City leaders, eager to escape the tax burden of surrounding rural areas, voted to permanently separate the City from the County. At the time, it seemed like a practical solution, perhaps even a prosperous one. Instead it became one of the most consequential&mdash;and destructive&mdash;acts of self-segregation in American history.
              </p>
              <p className={stepParagraph}>
                The County grew. The City shrank. And the people left behind were not by chance.
              </p>
            </TwoSection>

            <TwoSection
              title="Over 100 years, people left for the County in droves."
              stepIndex={1}
              sectionRef={setSectionRef(1)}
              chart={!isDesktopScrolly ? renderMobileChart(mobileChart(1)) : undefined}
            >
              <p className={stepParagraph}>
                Today, more than <strong>1 million people</strong> live in St. Louis County. Fewer than <strong>300,000 people</strong> live in the City. Each bubble here represents a census tract, which is a small geographic unit used by the U.S. Census to count the number of people living in a neighborhood. The County has more tracts, more residents, and more political power.
              </p>
              <p className={stepParagraph}>
                But raw population doesn't tell you who stayed, who left, or who was pushed out. That requires a closer look.
              </p>
            </TwoSection>

            <TwoSection
              title="It's no coincidence that the County is wealthier."
              stepIndex={2}
              sectionRef={setSectionRef(2)}
              chart={!isDesktopScrolly ? renderMobileChart(mobileChart(2)) : undefined}
            >
              <p className={stepParagraph}>
                Arrange those same census tracts by median household income and a pattern becomes harder to ignore. County tracts cluster toward the higher end. City tracks cluster toward the lower end. The gap isn't subtle.
              </p>
              <p className={stepParagraph}>
                This is the economic geography of a region that spent decades building highways outward, subsidizng suburban development, amd leaving the City to manage its own decline with a shrinking tax base. The wealth didn't just move. It <em>was</em> moved.
              </p>
            </TwoSection>

            <TwoSection
              title="So then, who lives in the City?"
              stepIndex={3}
              sectionRef={setSectionRef(3)}
              chart={!isDesktopScrolly ? renderMobileChart(mobileChart(3)) : undefined}
            >
              <p className={stepParagraph}>
                Color the census tracts by race of the people who live there and the picture comes into focus. nationally, about 40% of Americans identify as people of color. In St. Louis City, that share is <strong>53%</strong>. In the County, it's <strong>31%</strong>.
              </p>
              <p className={stepParagraph}>
                This is not a coiincidence. Decades of redlining, racially restrictive convenants, and discriminatory lending practices drew lines around where Black and Brown families could live and own property. Those lines still show up in the data today.
              </p>
              <ul className="font-sans text-sm text-article-text space-y-2 list-none p-0 m-0">
                <li className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 rounded-full bg-[#b8c4d6]" aria-hidden="true" />
                  &lt; 30% People of Color
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 rounded-full bg-[#52719e]" aria-hidden="true" />
                  &gt; 30% People of Color
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 rounded-full bg-[#07254f]" aria-hidden="true" />
                  &gt; 50% People of Color
                </li>
              </ul>
            </TwoSection>

            <TwoSection
              title="Nearly half of City residents are Black."
              stepIndex={4}
              sectionRef={setSectionRef(4)}
              chart={!isDesktopScrolly ? renderMobileChart(mobileChart(4)) : undefined}
            >
              <p className={stepParagraph}>
                The pattern is even more pronounced when you loko specifically at Black residents. Almost half of all City residents (46%) are Black. In the County, that figure is 24%.
              </p>
              <p className={stepParagraph}>
                St. Louis was one of the most aggressively redlined cities in the country. The Federal Home Owners' Loan Corporation graded Black neighborhoods as financial risks in the 1930s, effectively cutting off home loans and trapping residents in disinvested communities. The 1876 divorce between City and County made it easy for White families to exit to newly built suburbs and take the tax base with them. These policies compounded with each new generation.
              </p>
              <ul className="font-sans text-sm text-article-text space-y-2 list-none p-0 m-0">
                <li className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 rounded-full bg-[#b8c4d6]" aria-hidden="true" />
                  &lt; 13% Black
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 rounded-full bg-[#52719e]" aria-hidden="true" />
                  &gt; 13% Black
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 rounded-full bg-[#07254f]" aria-hidden="true" />
                  &gt; 50% Black
                </li>
              </ul>
            </TwoSection>

            <TwoSection
              title="In St. Louis, race predicts income."
              stepIndex={5}
              sectionRef={setSectionRef(5)}
              chart={!isDesktopScrolly ? renderMobileChart(mobileChart(5)) : undefined}
            >
              <p className={stepParagraph}>
                Plot race against income across every census tract in the region and the relationship is consistent. As the share of Black residents in a tract increases, median income falls. Every dot on this chart represents a real neighborhood. The downward slope of this pattern is the legacy of racism in St. Louis.
              </p>
              <p className={stepParagraph}>
                This is not a story about choice and preference. Research consistently links this pattern to policy, to history, and to the long tail of discriminatory housing practices that were legal in this country until 1968. And which, even today, persist.
              </p>
              <ul className="font-sans text-sm text-article-text space-y-2 list-none p-0 m-0">
                <li className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 rounded-full bg-[#b8c4d6]" aria-hidden="true" />
                  &lt; 13% Black
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 rounded-full bg-[#52719e]" aria-hidden="true" />
                  &gt; 13% Black
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 rounded-full bg-[#07254f]" aria-hidden="true" />
                  &gt; 50% Black
                </li>
              </ul>
            </TwoSection>

            <TwoSection
              title="Poverty created by policy."
              stepIndex={6}
              sectionRef={setSectionRef(6)}
              chart={!isDesktopScrolly ? renderMobileChart(mobileChart(6)) : undefined}
            >
              <p className={stepParagraph}>
                This chart tells the same story from a different angle. Census tracts with higher shares of Black residents also carry higher poverty rates. The City, already home to a larger Black population, shoulders a disproportionate share of that burden with fewer resources to reverse its course.
              </p>
              <p className={stepParagraph}>
                St. Louis City's poverty rate is among the highest of any major American city. The City cannot raise its tax base without residents. It cannot attract resdients without investment. And it cannot generate that investment while managing the compound interest of blight and poverty. This is the trap of hyper-localized, defensive development.
              </p>
              <ul className="font-sans text-sm text-article-text space-y-2 list-none p-0 m-0">
                <li className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 rounded-full bg-[#b8c4d6]" aria-hidden="true" />
                  &lt; 13% Black
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 rounded-full bg-[#52719e]" aria-hidden="true" />
                  &gt; 13% Black
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 rounded-full bg-[#07254f]" aria-hidden="true" />
                  &gt; 50% Black
                </li>
              </ul>
            </TwoSection>

            <TwoSection
              title="Where do we go from here?"
              stepIndex={7}
              sectionRef={setSectionRef(7)}
              chart={!isDesktopScrolly ? renderMobileChart(mobileChart(7)) : undefined}
            >
              <p className={stepParagraph}>
                These charts show a region shaped by choice, not fate. Redlining, highway construction, zoning, and municipal fragmentation disn't just happen to St. Louis. They were decisions made by governments, banks, developers... and neighbors. They can be unmade in the same way.
              </p>
              <p className={stepParagraph}>
                Our work is already underway. organizations across the region are pushing for change, from police reform to school funding to housing policy. If you live here, this is your city. This is our moment.
              </p>
              <ul className="font-sans text-sm text-article-text space-y-2 list-none p-0 m-0">
                <li className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 rounded-full bg-city" aria-hidden="true" />
                  St. Louis City
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 rounded-full bg-county" aria-hidden="true" />
                  St. Louis County
                </li>
              </ul>
            </TwoSection>
            </div>

            {isDesktopScrolly ? (
              <aside className="hidden w-full lg:block" aria-label="Data visualizations">
                <div className="sticky top-[72px] w-full pt-20">
                  <StickyChartStage activeStep={activeStep} charts={desktopCharts} />
                </div>
              </aside>
            ) : null}
          </div>

          <LinkCards />
        </div>
      </main>
      <Footer />
    </>
  );
}
