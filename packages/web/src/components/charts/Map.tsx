import { useEffect, useRef, useState, type CSSProperties } from 'react';
import * as d3 from 'd3';
import { feature, merge } from 'topojson-client';
import { cityColor, countyColor } from '../../colors';
import { tractMapUrl } from '../../constants/dataUrls';
import type { CensusTract } from '../../types/data';

const CITY_FIPS = '510';
const COUNTY_FIPS_CODE = '189';
const COUNTY_FIPS: Record<string, string> = {
  'St. Louis City': CITY_FIPS,
  'St. Louis County': COUNTY_FIPS_CODE,
};
const NO_DATA_FILL = '#e8eaf0';
const fontFamily = '"IBM Plex Sans", sans-serif';
const LABEL_PAD = 10;
const COUNTY_CALLOUT_OFFSET_Y = 20;
const CITY_CALLOUT_OFFSET_X = 12;
const MAP_SHADOW_OFFSET = 2;
const CALLOUT_WIDTH = 140;
const CALLOUT_BOX_CLASS = 'rounded bg-white px-3 py-2 shadow-md';
const CALLOUT_TITLE_CLASS = 'font-header text-2xl text-heading leading-tight';
const CALLOUT_RATIO_CLASS = 'text-lg font-bold text-heading';
const CALLOUT_PERCENT_CLASS = 'text-sm text-article-text ml-1';
const CALLOUT_SUBTEXT_CLASS = 'mt-1 font-sans text-xs font-regular text-heading';

interface CalloutPosition {
  x: number;
  y: number;
}

interface CalloutPositions {
  county: CalloutPosition;
  city: CalloutPosition;
}

interface RegionCallout {
  title: string;
  ratio: string;
  percent: string;
  subtext: string;
}

const COUNTY_CALLOUT: RegionCallout = {
  title: 'County',
  ratio: '1 in 10',
  percent: '9.2%',
  subtext: 'below poverty line',
};

const CITY_CALLOUT: RegionCallout = {
  title: 'City',
  ratio: '1 in 5',
  percent: '21.8%',
  subtext: 'below poverty line',
};

interface TractProperties {
  GEOID: string;
  NAMELSAD: string;
  COUNTYFP: string;
}

interface TractFeature extends GeoJSON.Feature<GeoJSON.Geometry, TractProperties> {}

interface TractTopoGeometry {
  type: string;
  arcs: number[][] | number[][][];
  properties: TractProperties;
}

interface TractTopology {
  objects: {
    tl_2020_29_tract: {
      type: string;
      geometries: TractTopoGeometry[];
    };
  };
}

interface MapProps {
  data?: CensusTract[];
  fillColor?: string;
  showCallouts?: boolean;
  showLegend?: boolean;
}

function tractToGeoid(tract: CensusTract): string {
  const countyFp = COUNTY_FIPS[tract.County] ?? '';
  const tractCode = tract.Tract.replace(/\D/g, '').padStart(6, '0');
  return `29${countyFp}${tractCode}`;
}

function povertyByGeoid(data: CensusTract[]): globalThis.Map<string, CensusTract> {
  const lookup = new globalThis.Map<string, CensusTract>();
  for (const tract of data) {
    lookup.set(tractToGeoid(tract), tract);
  }
  return lookup;
}

function fillForCounty(countyFp: string): string {
  return countyFp === CITY_FIPS ? cityColor : countyColor;
}

function getMergedCounty(topology: TractTopology, countyFp: string): GeoJSON.Geometry | null {
  const geometries = topology.objects.tl_2020_29_tract.geometries.filter(
    (geometry) => geometry.properties.COUNTYFP === countyFp,
  );
  if (geometries.length === 0) return null;
  return merge(topology, geometries) as GeoJSON.Geometry;
}

function collectGeometryCoordinates(
  geometry: GeoJSON.Geometry,
  callback: (coord: [number, number]) => void,
) {
  if (geometry.type === 'Polygon') {
    for (const ring of geometry.coordinates) {
      for (const coord of ring) {
        callback(coord as [number, number]);
      }
    }
    return;
  }

  if (geometry.type === 'MultiPolygon') {
    for (const polygon of geometry.coordinates) {
      for (const ring of polygon) {
        for (const coord of ring) {
          callback(coord as [number, number]);
        }
      }
    }
  }
}

function southernmostProjectedPoint(
  geometry: GeoJSON.Geometry,
  projection: d3.GeoProjection,
): [number, number] {
  let point: [number, number] | null = null;

  collectGeometryCoordinates(geometry, (coord) => {
    const projected = projection(coord);
    if (!projected) return;

    const [x, y] = projected;
    if (!point || y > point[1] || (y === point[1] && x > point[0])) {
      point = [x, y];
    }
  });

  return point ?? [0, 0];
}

function computeCalloutPositions(
  path: d3.GeoPath,
  projection: d3.GeoProjection,
  cityMerged: GeoJSON.Geometry,
  countyMerged: GeoJSON.Geometry,
): CalloutPositions {
  const countyBounds = path.bounds(countyMerged);
  const cityBottom = southernmostProjectedPoint(cityMerged, projection);

  return {
    county: {
      x: countyBounds[0][0] + LABEL_PAD,
      y: countyBounds[0][1] + LABEL_PAD + COUNTY_CALLOUT_OFFSET_Y,
    },
    city: {
      x: cityBottom[0] + CITY_CALLOUT_OFFSET_X,
      y: cityBottom[1],
    },
  };
}

function RegionCalloutCard({
  callout,
  position,
}: {
  callout: RegionCallout;
  position: CalloutPosition;
}) {
  const style: CSSProperties = {
    left: position.x,
    top: position.y,
    width: CALLOUT_WIDTH,
  };

  return (
    <div
      className={`pointer-events-none absolute z-[1] ${CALLOUT_BOX_CLASS}`}
      style={style}
    >
      <div className={CALLOUT_TITLE_CLASS}>{callout.title}</div>
      <div className="mt-1 font-sans leading-none">
        <span className={CALLOUT_RATIO_CLASS}>{callout.ratio}</span>
        <span className={CALLOUT_PERCENT_CLASS}>{callout.percent}</span>
      </div>
      <div className={CALLOUT_SUBTEXT_CLASS}>{callout.subtext}</div>
    </div>
  );
}

function drawCountyLegend(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  width: number,
  height: number,
) {
  const legendWidth = 160;
  const x = width - legendWidth - 12;
  const legend = svg
    .append('g')
    .attr('class', 'map-legend')
    .attr('transform', `translate(${x}, ${height - 52})`);

  const legendItems = [
    { label: 'St. Louis City', color: cityColor },
    { label: 'St. Louis County', color: countyColor },
  ];

  legendItems.forEach((item, i) => {
    const row = legend.append('g').attr('transform', `translate(0, ${i * 20})`);
    row
      .append('rect')
      .attr('width', 12)
      .attr('height', 12)
      .attr('rx', 2)
      .attr('fill', item.color);
    row
      .append('text')
      .attr('x', 18)
      .attr('y', 10)
      .style('font-family', fontFamily)
      .style('font-size', '12px')
      .style('fill', '#4c4d4f')
      .text(item.label);
  });
}

function drawPovertyLegend(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  width: number,
  height: number,
  colorScale: d3.ScaleSequential<string>,
  domain: [number, number],
) {
  const legendWidth = 140;
  const legendHeight = 10;
  const x = width - legendWidth - 300;
  const y = height - 24;

  const gradientId = `poverty-gradient-${Math.random().toString(36).slice(2, 9)}`;
  const gradient = svg
    .append('defs')
    .append('linearGradient')
    .attr('id', gradientId)
    .attr('x1', '0%')
    .attr('x2', '100%')
    .attr('y1', '0%')
    .attr('y2', '0%');

  const stops = 10;
  for (let i = 0; i <= stops; i++) {
    const t = i / stops;
    const value = domain[0] + t * (domain[1] - domain[0]);
    gradient
      .append('stop')
      .attr('offset', `${t * 100}%`)
      .attr('stop-color', colorScale(value));
  }

  const legend = svg.append('g').attr('class', 'map-legend').attr('transform', `translate(${x}, ${y})`);

  legend
    .append('rect')
    .attr('width', legendWidth)
    .attr('height', legendHeight)
    .attr('rx', 2)
    .attr('fill', `url(#${gradientId})`);

  legend
    .append('text')
    .attr('y', -6)
    .style('font-family', fontFamily)
    .style('font-size', '12px')
    .style('fill', '#4c4d4f')
    .text('Poverty rate');

  const formatPct = d3.format('.0%');
  legend
    .append('text')
    .attr('y', legendHeight + 14)
    .style('font-family', fontFamily)
    .style('font-size', '11px')
    .style('fill', '#4c4d4f')
    .text(formatPct(domain[0]));

  legend
    .append('text')
    .attr('x', legendWidth)
    .attr('y', legendHeight + 14)
    .attr('text-anchor', 'end')
    .style('font-family', fontFamily)
    .style('font-size', '11px')
    .style('fill', '#4c4d4f')
    .text(formatPct(domain[1]));
}

function drawCountyOutlines(
  parent: d3.Selection<SVGGElement, unknown, null, undefined>,
  path: d3.GeoPath,
  cityMerged: GeoJSON.Geometry,
  countyMerged: GeoJSON.Geometry,
) {
  const outlines = parent
    .append('g')
    .attr('class', 'county-outlines')
    .attr('pointer-events', 'none');

  for (const merged of [cityMerged, countyMerged]) {
    outlines
      .append('path')
      .datum(merged)
      .attr('d', path)
      .attr('fill', 'none')
      .attr('stroke', '#000000')
      .attr('stroke-width', 1);
  }
}

function drawMap(
  container: HTMLDivElement,
  topology: TractTopology,
  features: TractFeature[],
  povertyLookup?: globalThis.Map<string, CensusTract>,
  fillColor?: string,
  showLegend = true,
): CalloutPositions | null {
  const width = container.clientWidth;
  const height = container.clientHeight;
  if (width < 80 || height < 80) return null;

  container.innerHTML = '';

  const featureCollection: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features,
  };

  const projection = d3.geoMercator().fitSize([width, height], featureCollection);
  const path = d3.geoPath().projection(projection);

  const povertyValues = povertyLookup
    ? [...povertyLookup.values()].map((d) => d.PctPoverty)
    : [];
  const povertyDomain = d3.extent(povertyValues) as [number, number];
  const povertyColorScale =
    povertyLookup && povertyDomain[0] != null && povertyDomain[1] != null
      ? d3.scaleSequential(d3.interpolate('#f6f8ff', cityColor)).domain(povertyDomain)
      : null;

  const ariaLabel = fillColor
    ? 'Map of census tracts in St. Louis'
    : povertyLookup
      ? 'Map of census tracts in St. Louis colored by poverty rate'
      : 'Map of census tracts in St. Louis City and St. Louis County';

  const cityMerged = getMergedCounty(topology, CITY_FIPS);
  const countyMerged = getMergedCounty(topology, COUNTY_FIPS_CODE);
  if (!cityMerged || !countyMerged) return null;

  const svg = d3
    .select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('role', 'img')
    .attr('aria-label', ariaLabel);

  svg
    .append('defs')
    .append('filter')
    .attr('id', 'map-drop-shadow')
    .attr('x', '-20%')
    .attr('y', '-20%')
    .attr('width', '140%')
    .attr('height', '140%')
    .append('feDropShadow')
    .attr('dx', MAP_SHADOW_OFFSET)
    .attr('dy', MAP_SHADOW_OFFSET)
    .attr('stdDeviation', 0)
    .attr('flood-color', '#000000');

  const mapLayer = svg.append('g').attr('filter', 'url(#map-drop-shadow)');

  mapLayer
    .selectAll<SVGPathElement, TractFeature>('path')
    .data(features)
    .enter()
    .append('path')
    .attr('d', path)
    .attr('fill', (d) => {
      if (fillColor) return fillColor;
      if (!povertyColorScale || !povertyLookup) {
        return fillForCounty(d.properties.COUNTYFP);
      }
      const tract = povertyLookup.get(d.properties.GEOID);
      return tract ? povertyColorScale(tract.PctPoverty) : NO_DATA_FILL;
    })
    .attr('stroke', '#ffffff')
    .attr('stroke-width', 0);

  drawCountyOutlines(mapLayer, path, cityMerged, countyMerged);

  if (showLegend) {
    if (povertyColorScale && povertyDomain[0] != null && povertyDomain[1] != null) {
      drawPovertyLegend(svg, width, height, povertyColorScale, povertyDomain);
    } else if (!fillColor) {
      drawCountyLegend(svg, width, height);
    }
  }

  return computeCalloutPositions(path, projection, cityMerged, countyMerged);
}

export function Map({ data, fillColor, showCallouts = true, showLegend = true }: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [calloutPositions, setCalloutPositions] = useState<CalloutPositions | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let features: TractFeature[] = [];
    let topology: TractTopology | null = null;
    let cancelled = false;
    const povertyLookup =
      !fillColor && data && data.length > 0 ? povertyByGeoid(data) : undefined;

    const render = () => {
      if (features.length > 0 && topology) {
        const positions = drawMap(container, topology, features, povertyLookup, fillColor, showLegend);
        setCalloutPositions(showCallouts ? positions : null);
      }
    };

    d3.json(tractMapUrl).then((loadedTopology) => {
      if (cancelled || !loadedTopology) return;

      topology = loadedTopology as TractTopology;
      const collection = feature(topology, topology.objects.tl_2020_29_tract) as GeoJSON.FeatureCollection<
        GeoJSON.Geometry,
        TractProperties
      >;
      features = collection.features as TractFeature[];
      render();
    });

    const resizeObserver = new ResizeObserver(render);
    resizeObserver.observe(container);

    return () => {
      cancelled = true;
      resizeObserver.disconnect();
      setCalloutPositions(null);
    };
  }, [data, fillColor, showCallouts, showLegend]);

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full bg-article-bg" />
      {calloutPositions ? (
        <>
          <RegionCalloutCard callout={COUNTY_CALLOUT} position={calloutPositions.county} />
          <RegionCalloutCard callout={CITY_CALLOUT} position={calloutPositions.city} />
        </>
      ) : null}
    </div>
  );
}
