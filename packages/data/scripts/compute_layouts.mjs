/**
 * Precompute bubble and poverty chart positions offline.
 * Must stay in sync with packages/web/src/visualizations/chartLayouts.ts
 */
import * as d3 from '../../web/node_modules/d3/index.js';
import fs from 'fs';

const CITY = 'St. Louis City';
const COUNTY = 'St. Louis County';
const PRECOMPUTE_TICKS = 400;
const BUBBLE_COLLIDE_PAD = 4;
const POVERTY_COLLIDE_PAD = 3;
const MIN_GAP = 1;

export const BUBBLE_REF = { width: 800, height: 600, margin: { top: 16, right: 16, bottom: 56, left: 16 } };
export const POVERTY_REF = { width: 800, height: 600 };

function bubbleDimensions(width, height) {
  const { margin } = BUBBLE_REF;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const maxRadius = Math.min(12, Math.min(innerWidth, innerHeight) * 0.026);
  return { innerWidth, innerHeight, maxRadius };
}

function povertyDimensions(width, height) {
  const maxRadius = Math.min(12, Math.min(width, height) * 0.022);
  const bubblePad = maxRadius + 8;
  const margin = { top: bubblePad + 20, right: 24, bottom: bubblePad + 8, left: 56 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  return { innerWidth, innerHeight, maxRadius, bubblePad, centerX: innerWidth / 2, margin };
}

function resolveOverlaps(nodes, radiusFn, maxIterations = 80) {
  for (let iter = 0; iter < maxIterations; iter += 1) {
    let moved = false;
    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        const ri = radiusFn(nodes[i]);
        const rj = radiusFn(nodes[j]);
        const dx = nodes[j].x - nodes[i].x;
        const dy = nodes[j].y - nodes[i].y;
        const dist = Math.hypot(dx, dy) || 0.01;
        const minDist = ri + rj + MIN_GAP;
        if (dist < minDist) {
          const push = (minDist - dist) / 2;
          const nx = dx / dist;
          const ny = dy / dist;
          nodes[i].x -= nx * push;
          nodes[i].y -= ny * push;
          nodes[j].x += nx * push;
          nodes[j].y += ny * push;
          moved = true;
        }
      }
    }
    if (!moved) break;
  }
}

function settleSimulation(simulation, ticks) {
  simulation.alpha(1);
  for (let i = 0; i < ticks; i += 1) {
    simulation.tick();
  }
}

function computeBubblePositions(rows) {
  const { innerWidth, innerHeight, maxRadius } = bubbleDimensions(BUBBLE_REF.width, BUBBLE_REF.height);
  const cityCenterX = innerWidth * 0.2;
  const countyCenterX = innerWidth * 0.75;
  const clusterCenterY = innerHeight * 0.46;

  const tracts = rows.filter((d) => d.COUNTY_NAME === CITY || d.COUNTY_NAME === COUNTY);
  const nodes = tracts.map((d) => ({
    tract: d.TRACT,
    county: d.COUNTY_NAME,
    population: +d.ACS_N_TOTAL_POP,
    x: d.COUNTY_NAME === CITY ? cityCenterX : countyCenterX,
    y: clusterCenterY,
  }));

  const popSizeScale = d3
    .scaleSqrt()
    .domain(d3.extent(nodes, (d) => d.population))
    .range([2, maxRadius]);
  const radius = (d) => popSizeScale(d.population);

  const simulation = d3
    .forceSimulation(nodes)
    .force('charge', d3.forceManyBody().strength((d) => (d.county === CITY ? 2 : 3)))
    .force('x', d3.forceX((d) => (d.county === CITY ? cityCenterX : countyCenterX)).strength(0.1))
    .force('y', d3.forceY(clusterCenterY).strength(0.1))
    .force(
      'collide',
      d3
        .forceCollide((d) => radius(d) + BUBBLE_COLLIDE_PAD)
        .strength(1)
        .iterations(3),
    )
    .alphaDecay(0.02)
    .stop();

  settleSimulation(simulation, PRECOMPUTE_TICKS);
  resolveOverlaps(nodes, radius);

  const positions = new Map();
  for (const node of nodes) {
    positions.set(node.tract, {
      bubble_x: node.x / innerWidth,
      bubble_y: node.y / innerHeight,
    });
  }
  return positions;
}

function beeswarmPlace(
  nodes,
  radiusFn,
  innerWidth,
  innerHeight,
  { anchorX, anchorY },
) {
  nodes.sort((a, b) => anchorY(b) - anchorY(a) || b.population - a.population);

  const placed = [];
  for (const node of nodes) {
    const r = radiusFn(node);
    const targetY = anchorY(node);
    const ax = anchorX(node);
    let placedNode = false;

    for (let ring = 0; ring < 50 && !placedNode; ring += 1) {
      const dist = ring * 3;
      const steps = Math.max(10, ring * 5);
      for (let step = 0; step < steps; step += 1) {
        const angle = (step / steps) * Math.PI * 2;
        const x = ax + dist * Math.cos(angle);
        const y = targetY + dist * Math.sin(angle);
        if (x < r || x > innerWidth - r || y < r || y > innerHeight - r) continue;

        const searchRadius = r + MIN_GAP + dist + 12;
        const overlaps = placed.some((other) => {
          if (Math.abs(other.x - x) > searchRadius || Math.abs(other.y - y) > searchRadius) {
            return false;
          }
          return Math.hypot(x - other.x, y - other.y) < r + other.r + MIN_GAP;
        });
        if (!overlaps) {
          node.x = x;
          node.y = y;
          placed.push({ x, y, r });
          placedNode = true;
          break;
        }
      }
    }

    if (!placedNode) {
      node.x = ax;
      node.y = targetY;
      placed.push({ x: ax, y: targetY, r });
    }
  }
}

function computePovertyPositions(rows) {
  const { innerWidth, innerHeight, maxRadius, bubblePad, centerX } = povertyDimensions(
    POVERTY_REF.width,
    POVERTY_REF.height,
  );
  const yMin = 0.05;
  const yMax = 0.55;
  const yScale = d3.scaleLinear().domain([yMin, yMax]).range([bubblePad, innerHeight - bubblePad]);

  const nodes = rows.map((d) => ({
    tract: d.TRACT,
    population: +d.ACS_N_TOTAL_POP,
    pctPoverty: +d.PCT_POVERTY_STAT,
    x: centerX,
    y: yScale(+d.PCT_POVERTY_STAT),
  }));

  const popSizeScale = d3
    .scaleSqrt()
    .domain(d3.extent(nodes, (d) => d.population))
    .range([2, maxRadius]);
  const radius = (d) => popSizeScale(d.population);

  beeswarmPlace(nodes, radius, innerWidth, innerHeight, {
    anchorX: () => centerX,
    anchorY: (d) => yScale(d.pctPoverty),
  });
  resolveOverlaps(nodes, radius, 200);

  const positions = new Map();
  for (const node of nodes) {
    positions.set(node.tract, {
      poverty_x: node.x / innerWidth,
      poverty_y: node.y / innerHeight,
    });
  }
  return positions;
}

function main() {
  const inputPath = process.argv[2];
  const outputPath = process.argv[3];
  if (!inputPath || !outputPath) {
    console.error('Usage: node compute_layouts.mjs <input.csv> <output.csv>');
    process.exit(1);
  }

  const rows = d3.csvParse(fs.readFileSync(inputPath, 'utf8'));
  const bubblePositions = computeBubblePositions(rows);
  const povertyPositions = computePovertyPositions(rows);

  const enriched = rows.map((row) => {
    const bubble = bubblePositions.get(row.TRACT);
    const poverty = povertyPositions.get(row.TRACT);
    return {
      ...row,
      bubble_x: bubble?.bubble_x ?? '',
      bubble_y: bubble?.bubble_y ?? '',
      poverty_x: poverty?.poverty_x ?? '',
      poverty_y: poverty?.poverty_y ?? '',
    };
  });

  fs.writeFileSync(outputPath, d3.csvFormat(enriched));
  console.log(`Wrote layout positions to ${outputPath}`);
}

main();
