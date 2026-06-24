import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import * as d3 from 'd3';
import { Navbar } from './components/layout/Navbar';
import { Hero } from './components/layout/Hero';
import { OneSection } from './components/layout/OneSection';
import { TwoSection } from './components/layout/TwoSection';
import { StickyChartStage } from './components/layout/StickyChartStage';
import { LinkCards } from './components/layout/LinkCards';
import { Footer } from './components/layout/Footer';
import { LineChart } from './components/charts/LineChart';
import { BubbleChart } from './components/charts/BubbleChart';
import { IncomeHistogram } from './components/charts/IncomeHistogram';
import { ScatterPlot } from './components/charts/ScatterPlot';
import { Map } from './components/charts/Map';
import { LazyChart } from './components/charts/LazyChart';
import archImage from './assets/arch.JPG';
import { stepParagraph } from './content/typography';
import { cityColor, countyColor } from './colors';
import { parseCensusTractRow, parsePopulationChangeRow, type CensusTract, type PopulationChange } from './types/data';
import { datasetUrl, populationChangeUrl } from './constants/dataUrls';
import { useActiveSection } from './hooks/useActiveSection';
import { useMediaQuery } from './hooks/useMediaQuery';
import {
  BUBBLE_REF,
  bubbleDimensions,
  computeBubbleLayout,
  hasBubbleLayout,
  normalizeLayoutMap,
} from './visualizations/chartLayouts';
import { categories2, categories3, colors2, colors3 } from './visualizations/constants';

const SECTION_COUNT = 8;

function useSharedBubbleLayout(data: CensusTract[]) {
  return useMemo(() => {
    if (data.length === 0 || hasBubbleLayout(data)) return undefined;

    const { innerWidth, innerHeight } = bubbleDimensions(BUBBLE_REF.width, BUBBLE_REF.height);
    const tracts = data.filter((d) => d.County === 'St. Louis City' || d.County === 'St. Louis County');
    return normalizeLayoutMap(computeBubbleLayout(tracts, innerWidth, innerHeight), innerWidth, innerHeight);
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
      dataset.length > 0 ? <Map data={dataset} /> : null,
      <img
        src={archImage}
        alt="The Gateway Arch on a sunny day in St. Louis"
        className="h-full w-full object-contain"
      />,
    ],
    [dataset, populationChange, sharedBubbleLayout],
  );

  const mobileChart = (index: number) => desktopCharts[index] ?? null;

  return (
    <>
      <Navbar />
      <Hero ref={heroRef} />
      <main className="relative bg-article-bg">
        <div className="mx-auto w-full max-w-7xl">
          <OneSection />
          <div className="lg:grid lg:grid-cols-2 lg:gap-12">
            <div className="min-w-0">
            <TwoSection
              title="One region. Two governments."
              stepIndex={0}
              sectionRef={setSectionRef(0)}
              chart={!isDesktopScrolly ? renderMobileChart(mobileChart(0), true) : undefined}
            >
              <p className={stepParagraph}>
              In 1877, St. Louis tore itself in two. City leaders, eager to stop paying taxes to support the rural areas of the region, voted to separate the City from the County. At the time, it seemed like a practical solution, perhaps even a prosperous one. <em>We will go our separate ways.</em> Instead, it became one of the most destructive acts of self-segregation in American history.
              </p>
              <p className={stepParagraph}>
                The County grew while the City shrank. Neighbors were left behind.
              </p>
              <p className="pt-5 italic">
                Hover over the chart to compare population by year.
              </p>
            </TwoSection>

            <TwoSection
              title="Over 150 years, people left for the County in droves."
              stepIndex={1}
              sectionRef={setSectionRef(1)}
              chart={!isDesktopScrolly ? renderMobileChart(mobileChart(1)) : undefined}
            >
              <p className={stepParagraph}>
              Today, more than <strong>1 million people</strong> live in St. Louis County. Fewer than <strong>300,000 people</strong> live in the City. Each bubble in this chart represents a census tract, which is a small geographic unit used by the U.S. Census to count the number of people living in a neighborhood. The County has more tracts, more residents, and more political power.
              </p>
              <p className={stepParagraph}>
              But these basic population counts don't tell us who stayed, who left, or who was pushed out. We need a closer look.
              </p>
              <p className="pt-5 italic">
                Hover over a census tract to view its population.
              </p>
            </TwoSection>

            <TwoSection
              title="It's no coincidence that the County is wealthier."
              stepIndex={2}
              sectionRef={setSectionRef(2)}
              chart={!isDesktopScrolly ? renderMobileChart(mobileChart(2)) : undefined}
            >
              <p className={stepParagraph}>
              If we arrange those same census tracts by median household income, we see a clear pattern. County tracts cluster toward the high end. City tracks cluster toward the low end. Select any tract in the City, and the median income is below <strong>$50,000</strong>.
              </p>
              <p className={stepParagraph}>
              We spent decades building our economy outward, leaving the City to manage its own decline and shrinking tax base. We moved the wealth. It didn't just walk out on its own.
              </p>
              <p className="pt-5 italic">
                Hover over a census tract to view its median income.
              </p>
            </TwoSection>

            <TwoSection
              title="So then, who lives in the City?"
              stepIndex={3}
              sectionRef={setSectionRef(3)}
              chart={!isDesktopScrolly ? renderMobileChart(mobileChart(3)) : undefined}
            >
              <p className={stepParagraph}>
              Color the census tracts by race of the people who live there and a sharper picture comes into focus. Nationally, about 40% of Americans identify as people of color. In St. Louis City, that share is well above that average at <strong>53%</strong>. In the County, it's <strong>31%</strong>, which is well below.
              </p>
              <p className={stepParagraph}>
              This is not a coincidence. Decades of racial convenants and discriminatory lending practices drew real, physical borders around where Black and Brown families could live and own property. Those lines are etched into the fabric of our region to this day.
              </p>
              <ul className="font-sans text-sm text-article-text space-y-2 list-none p-0 m-0">
                {categories2.map((label, i) => (
                  <li key={label} className="flex items-center gap-2">
                    <span
                      className="inline-block w-3 h-3 rounded-full"
                      style={{ backgroundColor: colors2[i] }}
                      aria-hidden="true"
                    />
                    {label}
                  </li>
                ))}
              </ul>
            </TwoSection>

            <TwoSection
              title="Nearly half of City residents are Black."
              stepIndex={4}
              sectionRef={setSectionRef(4)}
              chart={!isDesktopScrolly ? renderMobileChart(mobileChart(4)) : undefined}
            >
              <p className={stepParagraph}>
              Division is even more pronounced when you consider Black St. Louisans. Almost <strong>half of all City residents (46%) are Black.</strong> In the County, that figure is 24%. Nationally, 13% of Americans are Black.
              </p>
              <p className={stepParagraph}>
                St. Louis was one of the most aggressively redlined cities in the country. The Federal Home Owners' Loan Corporation graded Black neighborhoods as financial risks in the 1930s, which cut off home financing and trapped residents in disinvested communities. The City-County divorce made it easy for White families to cleanly exit to the suburbs, where wealth consolidated. These effects compounded with each new generation.
              </p>
              <ul className="font-sans text-sm text-article-text space-y-2 list-none p-0 m-0">
                {categories3.map((label, i) => (
                  <li key={label} className="flex items-center gap-2">
                    <span
                      className="inline-block w-3 h-3 rounded-full"
                      style={{ backgroundColor: colors3[i] }}
                      aria-hidden="true"
                    />
                    {label}
                  </li>
                ))}
              </ul>
            </TwoSection>

            <TwoSection
              title="In St. Louis, race predicts income."
              stepIndex={5}
              sectionRef={setSectionRef(5)}
              chart={!isDesktopScrolly ? renderMobileChart(mobileChart(5)) : undefined}
            >
              <p className={stepParagraph}>
              Inequities follow this level of political and physical division. If we plot race against income, we see that as the share of Black residents in a tract increases, median income falls. Every dot on this chart represents a real neighborhood. The downward slope of this pattern is the legacy of racism that we grapple with in St. Louis.
              </p>
              <p className={stepParagraph}>
              This is not a story about personal preference. Research consistently links this pattern to the long tail of discriminatory housing practices that were legal in this country until 1968. Even today, they persist unofficially through our norms and culture.
              </p>
              <ul className="font-sans text-sm text-article-text space-y-2 list-none p-0 m-0">
                {categories3.map((label, i) => (
                  <li key={label} className="flex items-center gap-2">
                    <span
                      className="inline-block w-3 h-3 rounded-full"
                      style={{ backgroundColor: colors3[i] }}
                      aria-hidden="true"
                    />
                    {label}
                  </li>
                ))}
              </ul>
            </TwoSection>

            <TwoSection
              title="Poverty created by policy."
              stepIndex={6}
              sectionRef={setSectionRef(6)}
              chart={!isDesktopScrolly ? renderMobileChart(mobileChart(6)) : undefined}
            >
              <p className={stepParagraph}>
              St. Louis City's poverty rate is among the highest of any major American city. The City cannot raise its tax base without residents. It cannot attract residents without investment. And it cannot generate investment while managing the compound interest of blight and poverty. This is a vicious cycle. So, what will we do about it?
              </p>
            </TwoSection>

            <TwoSection
              title="Where do we go from here?"
              stepIndex={7}
              sectionRef={setSectionRef(7)}
              chart={!isDesktopScrolly ? renderMobileChart(mobileChart(7)) : undefined}
            >
              <p className={stepParagraph}>
              The charts in this article show a region shaped by choice, not fate. Redlining, highway construction, zoning, and municipal fragmentation didn't just happen to St. Louis. They were decisions made by us. By our governments, banks, developers, and neighbors. They can be unmade by us all the same.
              </p>
              <p className={stepParagraph}>
              Our work is already underway. Organizations across the region are pushing for change, from police reform to public school funding to housing policy. If you live here, this is your city, too. This is our moment to stand together as one region.
              </p>
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
