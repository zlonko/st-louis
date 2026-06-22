import type { ReactNode } from 'react';

export interface StepConfig {
  id: string;
  content: ReactNode;
  legendId?: string;
}

export const steps: StepConfig[] = [
  {
    id: 'intro',
    content: (
      <>
        <p>
          Although the chart on the right illustrates this dramatic history, it leaves out important details about
          the people living in the City and the County. This is especially true for differences in race and income.
        </p>
        <p>Charts can help us understand the state of present day St. Louis. Scroll down for a closer look.</p>
        <p>
          Source:{' '}
          <a href="https://www.census.gov/programs-surveys/acs" target="_blank" rel="noreferrer">
            American Community Survey 2018
          </a>
        </p>
        <div style={{ height: '100px', width: '20px' }} />
      </>
    ),
  },
  {
    id: 'population',
    legendId: 'categorylegend',
    content: (
      <>
        <h2>How many people live in St. Louis?</h2>
        <p>
          Let&apos;s start by elaborating on how many people live in the City and the County. Each bubble represents a
          tract, which is a standard unit of measurement used by the U.S. Census. The size of a bubble represents the
          total population of that tract.
        </p>
        <p>
          As shown in the previous chart, the County has more than{' '}
          <span className="highlighter">three times the number of residents</span> than the City. Hover over a census
          tract to learn more about the people who live there.
        </p>
      </>
    ),
  },
  {
    id: 'income',
    legendId: 'categorylegenda',
    content: (
      <>
        <h2>How much do residents make?</h2>
        <p>
          With this in mind, let&apos;s use a histogram to arrange our census tracts by median income. Notice how blue
          bubbles are located further left than pink bubbles.{' '}
          <span className="highlighter">Median income tends to be higher in the County</span> than in the City.
        </p>
        <p>
          Let&apos;s review what we&apos;ve seen so far. The City is less populous than the County following more than a
          century of residents moving away. Also, City residents tend to make less money than County residents.
        </p>
        <p>So, what do we know about the residents themselves?</p>
      </>
    ),
  },
  {
    id: 'diversity',
    legendId: 'categorylegend2',
    content: (
      <>
        <h2>Who lives in St. Louis?</h2>
        <p>
          To answer this question, let&apos;s return to our first chart and make one adjustment. The size of each bubble
          still represents the number of residents in a census tract, but{' '}
          <span className="highlighter">color now represents the racial diversity</span> of those residents.
          Approximately 30% of all Americans are people of color, so blue bubbles signify census tracts that meet or
          exceed that national average.
        </p>
        <p>
          When we count all of the people of color in the St. Louis region, we learn that they make up a higher
          proportion of City residents (53%) than County residents (31%). While the City has fewer residents than the
          County, City residents are more racially diverse than those in the County.
        </p>
      </>
    ),
  },
  {
    id: 'black',
    legendId: 'categorylegend3',
    content: (
      <>
        <h2>What about Black St. Louisians?</h2>
        <p>
          This difference is more pronounced when we compare Black communities. In fact,{' '}
          <span className="highlighter">Black residents make up almost half of the City population</span> (46%), while
          they are roughly a quarter of the County population (24%).
        </p>
        <p>
          Again, we set the threshold to the national average. Therefore, blue bubbles indicate census tracts where at
          least 13% of residents identify as Black.
        </p>
      </>
    ),
  },
  {
    id: 'scatter',
    legendId: 'categorylegend4',
    content: (
      <>
        <h2>Do race and income interact?</h2>
        <p>
          We&apos;ve learned that median income is higher in the County and the City is more racially diverse, especially
          when it comes to the proportion of Black residents. Using the same national threshold (13%), let&apos;s examine
          the relationship between the proportion of Black residents <i>x</i> and median income <i>y</i>.
        </p>
        <p>
          Across St. Louis,{' '}
          <span className="highlighter">income decreases as the proportion of Black residents increases</span>. Also,
          notice the census tracts clustered on the ends of this distribution. This further expresses a racial division
          in wealth.
        </p>
      </>
    ),
  },
  {
    id: 'poverty',
    legendId: 'categorylegend5',
    content: (
      <>
        <h2>What about poverty?</h2>
        <p>
          Finally, we can visualize the relationship between the proportion of residents at or below the national
          poverty threshold and the proportion of Black residents in a census tract.
        </p>
        <p>
          As we may expect from our observations of median income, areas of St. Louis with a higher proportion of Black
          residents also tend to have a{' '}
          <span className="highlighter">higher proportion of residents living in poverty</span>.
        </p>
      </>
    ),
  },
  {
    id: 'resources',
    content: (
      <>
        <h2>Where do we go from here?</h2>
        <p>
          We&apos;ve only scratched the surface of this complex issue, but hopefully this overview has caught your
          interest.
        </p>
        <p>
          As you read this, initiatives are underway to repair racial disparities in the City and County. Policy reform,
          business incentives, and community programs are just a few of the important steps being taken towards a more
          equitable St. Louis.
        </p>
        <h2>Resources</h2>
        <p>To learn more about getting involved, visit these links:</p>
        <ul>
          <li>
            <a
              href="https://forwardthroughferguson.org/report/signature-priorities/racial-equity/"
              target="_blank"
              rel="noreferrer"
            >
              Forward Through Ferguson
            </a>
          </li>
          <li>
            <a href="https://stlequity.org/" target="_blank" rel="noreferrer">
              St. Louis Equity Indicators Project
            </a>
          </li>
          <li>
            <a href="https://helpingpeople.org/our-impact/racial-equity/" target="_blank" rel="noreferrer">
              United Way of Greater St. Louis
            </a>
          </li>
        </ul>
        <p>
          You can view the code for this project on{' '}
          <a href="https://www.github.com/tblainek/st-louis" target="_blank" rel="noreferrer">
            GitHub
          </a>
          .
        </p>
        <div style={{ height: '100px', width: '20px' }} />
      </>
    ),
  },
];
